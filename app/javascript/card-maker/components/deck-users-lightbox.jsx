import React from 'react'
import CloseButtonModal from './close-button-modal'
import ReactAutocomplete from 'react-autocomplete'
import {cardMakerUrl} from 'lib/card-maker/url-helper'
import styles from 'stylesheets/card_maker/card_manager'

var noUserId = -1
  , cleanState = {
      owner: {},
      users: [],
      selectedUserId: noUserId,
      typeaheadLoading: false,
      typeaheadOptions: [],
      typeaheadValue: ''
    }
  ;

class DeckUsersLightbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = cleanState
  }

  handleAfterOpen = () => {
    this.reload();
  }

  reload = () => {
    $.getJSON(cardMakerUrl(`decks/${this.props.deck.id}/users`), (res) => {
      this.setState({
        owner: res.owner,
        users: res.users
      })
    });
  }

  handleRequestClose = () => {
    this.setState(cleanState);
    this.props.handleRequestClose();
  }

  handleSelectChange = (e) => {
    this.setState({
      selectedUserId: e.target.value
    });
  }

  addSelectedUser = () => {
    console.log('user id', this.state.selectedUserId);
    if (this.state.selectedUserId > 0) {
      $.post({
        url: cardMakerUrl(`decks/${this.props.deck.id}/users`),
        data: this.state.selectedUserId.toString(),
        dataType: 'text',
        success: this.reload
      });
    }
  }

  removeUser = (id, name) => {
    if (id && id > 0) {
      let ok = confirm(I18n.t('react.card_maker.are_you_sure_remove_user', {
        userName: name 
      }));

      if (ok) {
        $.ajax({
          url: cardMakerUrl(`decks/${this.props.deck.id}/users/${id}`),
          type: 'DELETE',
          success: this.reload
        });
      }
    }
  }

  render() {
    return (
      <CloseButtonModal
        isOpen={this.props.isOpen}
        onAfterOpen={this.handleAfterOpen}
        onRequestClose={this.handleRequestClose}
        contentLabel={I18n.t('react.card_maker.manage_deck_users')}
        parentSelector={() => {return document.getElementById('Page')}}
        bodyOpenClassName='noscroll'
        className={[styles.lNewLightbox, styles.lNewLightboxDeckUsers].join(' ')}
        overlayClassName={`fixed-center-wrap disable-overlay`}
      >
        <div className={styles.deckUsersHead}>
          <h2>Manage users for deck <strong>{this.props.deck.name}</strong></h2>
          <h2>{I18n.t('react.card_maker.owner_user', {
            userName: this.state.owner.userName 
          })}</h2>
        </div>
        <div className={styles.lNewCol}>
          <div className={styles.lightboxDeckUsersList}>
            <h3 className={styles.deckUsersTitle}>{I18n.t('react.card_maker.users')}</h3>
            <ul className={styles.deckUsers}>
              { this.state.users.map((u) => {
                return (
                  <li key={u.id} className={styles.deckUser}>
                    <span className={styles.deckUserName}>{u.userName}</span>
                    <i onClick={ () => this.removeUser(u.id, u.userName) } 
                      className={`fa fa-lg fa-minus-circle ${styles.deckUserMinus}`}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className={styles.lNewCol}>
          <ReactAutocomplete
            items={this.state.typeaheadOptions}
            getItemValue={item => item.label}
            onChange={e => {
              let query = e.target.value;
              this.setState({
                typeaheadValue: query
              });

              if (query.length) {
                $.getJSON('/users/typeahead/' + query, (data) => {
                  this.setState({
                    typeaheadOptions: data
                  });
                });
              }
            }}
            onSelect={(val, item) => {
              this.setState({
                typeaheadValue: val,
                selectedUserId: item.id
              });
            }}
            renderItem={(item, isHighlighted) =>
              <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                {item.label}
              </div>
            }
            renderInput={(props) =>
              <input type='text' className={[styles.newInput, styles.newInputTxt].join(' ')} {...props} />
            }
            renderMenu={function(items, value, style)  {
              return <div style={{ ...style, ...this.menuStyle, zIndex: 10 }} children={items}/>
            }}
            value={this.state.typeaheadValue}
            wrapperStyle={{}}
          />
          <div>
            <button className={styles.createBtn} onClick={this.addSelectedUser}>
              {I18n.t('react.card_maker.add_user')}
            </button>
          </div>
        </div>
      </CloseButtonModal>
    );
  }
}
export default DeckUsersLightbox
