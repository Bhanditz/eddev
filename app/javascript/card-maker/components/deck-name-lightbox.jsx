import React from 'react'
import ReactModal from 'react-modal'

import ResourceLightbox from './resource-lightbox'

import styles from 'stylesheets/card_maker/card_manager'

class DeckNameLightbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name || '',
      nameErr: null
    }
  }

  componentWillReceiveProps(newProps) {
    if (!this.props.isOpen && newProps.isOpen) {
      this.setState({
        nameErr: null,
        name: newProps.name || '',
      });
    }
  }
  
  handleNameChange = (e) => {
    var name = e.target.value
      , err = null
      ;

    if (this.props.deckNames.has(name)) {
      err = I18n.t('react.card_maker.name_taken');
    }

    this.setState({
      name: e.target.value,
      nameErr: err
    });
  }

  handleSubmit = () => {
    var name = this.state.name.trim()
      , success = false
      ;

    if (!name.length) {
      this.setState({
        nameErr: I18n.t('react.card_maker.name_cant_be_blank')
      });
    } else if (!this.state.nameErr) {
      this.props.handleSubmit(name);
      this.props.handleRequestClose();
      success = true;
    }

    return success;
  }

  fields = () => {
    var fields = [{
      type: 'text',
      value: this.state.name,
      errMsg: this.state.nameErr,
      handleChange: this.handleNameChange,
      placeholder: I18n.t('react.card_maker.enter_deck_name')
    }];

    if (this.props.fields) {
      fields = fields.concat(this.props.fields);
    }

    return fields;
  }

  render() {
    return (
      <ResourceLightbox
        isOpen={this.props.isOpen}
        contentLabel={this.props.contentLabel}
        handleRequestClose={this.props.handleRequestClose}
        fields={this.fields()}
        handleSubmit={this.handleSubmit}
        submitLabel={this.props.submitLabel}
      />
    );
  }
}

export default DeckNameLightbox;