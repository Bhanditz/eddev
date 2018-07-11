import React from 'react'
import ReactModal from 'react-modal'

import CardManager from './card-manager'
import CardEditor from './card-editor'
import {cardMakerUrl} from 'lib/card-maker/url-helper'
import newImmutableCardInstance from 'lib/card-maker/immutable-card'

import styles from 'stylesheets/card_maker/card_maker'

import eolLogoHdr from 'images/card_maker/icons/eol_logo_hdr.png'

const allDecksDeck = { // unused for now
        id: -1,
        name: I18n.t('react.card_maker.all_decks'),
      }
    , allCardsDeck = {
        id: -2,
        name: I18n.t('react.card_maker.all_cards'),
      }
    , unassignedCardsDeck = {
        id: -3,
        name: I18n.t('react.card_maker.unassigned'),
      }
    , sorts = {
        commonAsc: {
          fn: (a, b) => {
            if (a.commonName <= b.commonName) {
              return -1;
            } else {
              return 1;
            }
          },
          label: I18n.t('react.card_maker.sorts.common_a_z')
        },
        commonDesc: { 
          fn: (a, b) => {
            if (a.commonName > b.commonName) {
              return -1;
            } else {
              return 1;
            }
          },
          label: I18n.t('react.card_maker.sorts.common_z_a')
        },
        sciAsc: {
          fn: (a, b) => {
            if (a.sciName <= b.sciName) {
              return -1;
            } else {
              return 1;
            }
          },
          label: I18n.t('react.card_maker.sorts.sci_a_z')
        },
        sciDesc: {
          fn: (a, b) => {
            if (a.sciName > b.sciName) {
              return -1;
            } else {
              return 1
            }
          },
          label: I18n.t('react.card_maker.sorts.sci_z_a')
        },
        recent: {
          fn: (a, b) => {
            if (a.updatedAt < b.updatedAt) {
              return 1;
            } else {
              return -1;
            }
          },
          label: I18n.t('react.card_maker.sorts.recent')
        }
      }
    , userSorts = buildSorts([
        'recent',
        'commonAsc',
        'commonDesc',
        'sciAsc',
        'sciDesc'
      ])
    , publicSorts = buildSorts([
        'commonAsc',
        'commonDesc',
        'sciAsc',
        'sciDesc'
      ])
    ;

function buildSorts(keys) {
  return keys.map((key) => {
    return {
      key: key,
      label: sorts[key].label
    };
  });
}

class CardMaker extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      userCards: [],
      userDecks: [],
      publicCards: [],
      publicDecks: [],
      selectedDeck: allCardsDeck,
      library: 'public',
      screen: 'manager',
      sort: sorts[publicSorts[0].key],
      showLoadingOverlay: false,
      userRole: null
    }
  }

  componentDidMount() {
    const that = this
      , hashParams = EolUtil.parseHashParams()
      ;

    window.addEventListener('popstate', (event) => {
      that.handleHistoryStateChange(event.state);
    });

    that.showLoadingOverlay(null, (closeFn) => {
      $.getJSON('/user_sessions/user_info', (userInfo) => {
        that.setState({
          userRole: userInfo.role
        }, () => {
          if (hashParams.deck_id) {
            // library is set to public, which is what we want
            if (that.state.userRole) {
              // user decks are needed in both libraries, for example, for copying 
              // public cards to a deck
              that.reloadResource('user', 'decks', () => {
                that.reloadCurLibResourcesSetDeck(hashParams.deck_id, closeFn);
              });
            } else {
              that.reloadCurLibResourcesSetDeck(hashParams.deck_id, closeFn);
            }
          } else {
            // If that is a page refresh, and the editor was previously open,
            // open it now.
            that.handleHistoryStateChange(history.state); 

            if (that.state.userRole) {
              that.setLibrary('user', closeFn);
            } else {
              that.reloadCurLibResources(closeFn);
            }
          }
        });
      });
    });
  }

  reloadCurLibResources = (cb) => {
    this.reloadCurLibResourcesSetDeck(null, cb);
  }

  reloadCurLibResourcesSetDeck = (deckOverrideId, cb) => {
    const that = this;

    that.reloadResource(that.state.library, 'cards', () => {
      that.reloadResource(that.state.library, 'decks', (decks) => {
        let selectedDeck = decks.find((deck) => {
          return deck.id === (deckOverrideId || that.state.selectedDeck.id);
        });

        if (!selectedDeck) {
          selectedDeck = allCardsDeck;
        }

        that.setState({
          selectedDeck: selectedDeck
        }, () => {
          if (cb) {
            cb();
          }
        });
      });
    });
  }

  reloadResource = (lib, type, cb) => {
    const that = this;
    let keyExt
      , path
      ;
    
    if (type === 'cards') {
      keyExt = 'Cards';
    } else if (type === 'decks') {
      keyExt = 'Decks';
    } else {
      throw new TypeError('invalid type: ' + type);
    }

    if (lib === 'user') {
      path = type;
    } else if (lib === 'public') {
      path = 'public/' + type;
    } else {
      throw new TypeError('Invalid lib: ' + lib);
    }

    $.ajax({
      url: cardMakerUrl(path),
      method: 'GET',
      success: (resources) =>  {
        that.setState({
          [lib + keyExt]: resources
        }, () => cb(resources));
      }
    });
  }

  handleHistoryStateChange = (state) => {
    if (state && state.editorCardId) {
      this.loadCard(state.editorCardId, (err, card) => {
        if (err) throw err; // TODO: graceful handling
        this.setState({
          screen: 'editor',
          editorCard: card,
        });
      });
    } else if (this.state.screen === 'editor') {
      this.closeIfSafe(state);
    }
  }

  closeIfSafe = (state) => {
    let proceed = true;

    if (this.state.editorCard && this.state.editorCard.isDirty()) {
      proceed = confirm(I18n.t('react.card_maker.are_you_sure_unsaved'));
    }

    if (proceed) {
      this.setState({
        screen: 'manager'
      });
    } else {
      window.history.pushState(state, '');
    }
  }

  loadCard(cardId, cb) {
    const cardUrl = cardMakerUrl('cards/' + cardId + '.json')
        , that = this
        ;

    $.ajax(cardUrl, {
      method: 'GET',
      success: (card) => {
        newImmutableCardInstance(card, cb)
      },
      error: cb
    });
  }

  handleEditCard = (cardId) => {
    const state = {
      editorCardId: cardId,
    }

    window.history.pushState(state, '');
    this.handleHistoryStateChange(state);
  }

  updateEditorCard = (mapFn, cb) => {
    this.setState((prevState) => {
      return {
        editorCard: mapFn(prevState.editorCard),
      }
    }, cb);
  }

  handleEditorCloseRequest = () => {
    window.history.back();
  }

  setSelectedDeck = (deck, cb) => {
    this.setState({
      selectedDeck: deck
    }, cb);
  }

  setLibrary = (newLib, cb) => {
    const that = this;

    if (that.state.library !== newLib) {
      that.setState((prevState) => {
        return {
          library: newLib,
          selectedDeck: allCardsDeck,
          sort: sorts[that.sortsForLib(newLib)[0].key]
        };
      }, () => {
        that.reloadCurLibResources(); 
        if (cb) {
          cb();
        }
      });
    } else if (cb) {
      cb();
    }
  }

  setSort = (key) => {
    this.setState({
      sort: sorts[key]
    });
  }

  sortsForLib = (lib) => {
    return lib === 'user' ? userSorts : publicSorts;
  }

  screenComponent = () => {
    const commonProps = {
      showLoadingOverlay: this.showLoadingOverlay,
      hideLoadingOverlay: this.hideLoadingOverlay,
    }

    let component;

    if (this.state.screen === 'manager') {
      component = (
        <CardManager
          allCardsDeck={allCardsDeck}
          cards={this.state.library === 'user' ? this.state.userCards : this.state.publicCards}
          decks={this.state.library === 'user' ? this.state.userDecks : this.state.publicDecks}
          userDecks={this.state.userDecks}
          unassignedCardsDeck={unassignedCardsDeck}
          handleEditCard={this.handleEditCard}
          userRole={this.state.userRole}
          library={this.state.library}
          reloadCurLibResources={this.reloadCurLibResources}
          setLibrary={this.setLibrary}
          selectedDeck={this.state.selectedDeck}
          setSelectedDeck={this.setSelectedDeck}
          setSort={this.setSort}
          sort={this.state.sort}
          sorts={this.sortsForLib(this.state.library)}
          {...commonProps}
        />
      )
    } else if (this.state.screen === 'editor') {
      component = (
        <CardEditor
          card={this.state.editorCard}
          updateCard={this.updateEditorCard}
          handleRequestClose={this.handleEditorCloseRequest}
          {...commonProps}
        />
      )
    }

    return component;
  }

  showLoadingOverlay = (text, cb) => {
    const that = this;

    this.setState({
      showLoadingOverlay: true,
      loadingOverlayText: text
    }, () => {
      cb(this.hideLoadingOverlay);
    });
  }

  hideLoadingOverlay = () => {
    this.setState({
      showLoadingOverlay: false,
      loadingOverlayText: null
    });
  }

  render() {
    return (
      <div className='card-maker'>
        <ReactModal
          isOpen={this.state.showLoadingOverlay}
          parentSelector={() => {return document.getElementById('Page')}}
          contentLabel='Loading spinner'
          className='global-loading lightbox'
          overlayClassName='fixed-center-wrap disable-overlay'
          bodyOpenClassName='noscroll'
        >
          <i className='fa fa-spin fa-spinner fa-4x' />
          {
            this.state.loadingOverlayText &&
            <div>{this.state.loadingOverlayText}</div>
          }
        </ReactModal>

        <div className={styles.lPage}>
          <div className={styles.lMainCol}>
            {this.screenComponent()}
          </div>
        </div>
      </div>
    )
  }
}

export default CardMaker
