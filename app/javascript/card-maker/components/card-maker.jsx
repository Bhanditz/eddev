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
    ;

class CardMaker extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      cards: [],
      decks: [],
      selectedDeck: 'allCardsDeck',
      library: 'public',
      screen: 'manager',
      showLoadingOverlay: false,
      userRole: null
    }
  }

  componentDidMount() {
    window.addEventListener('popstate', (event) => {
      this.handleHistoryStateChange(event.state);
    });
    // If this is a page refresh, and the editor was previously open,
    // open it now.
    this.handleHistoryStateChange(history.state); 
    $.getJSON('/user_sessions/user_info', (userInfo) => {
      this.setState({
        userRole: userInfo.role
      });
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

  setSelectedDeck = (deck) => {
    this.setState({
      selectedDeck: deck
    });
  }

  setLibrary = (newLib, cb) => {
    if (this.state.library !== newLib) {
      this.setState((prevState) => {
        return {
          library: newLib,
          selectedDeck: allCardsDeck,
          //sort: sorts[this.sortsForLib(newLib)[0]]
        };
      }, cb);
    }
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
          handleEditCard={this.handleEditCard}
          userRole={this.state.userRole}
          library={this.state.library}
          setLibrary={this.setLibrary}
          selectedDeck={this.state.selectedDeck}
          setSelectedDeck={this.setSelectedDeck}
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

  showLoadingOverlay = () => {
    this.setState({
      showLoadingOverlay: true,
    });
  }

  hideLoadingOverlay = () => {
    this.setState({
      showLoadingOverlay: false,
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
