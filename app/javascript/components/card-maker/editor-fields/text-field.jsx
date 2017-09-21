import React from 'react';

import SuggestionsMenu from './suggestions-menu'
import fieldWrapper from './field-wrapper'

class TextField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fontSizeOpen: false,
      suggestBtnNode: null,
      suggestionsOpen: false,
    }
  }

  setFontSizeNode = (node) => {
    this.fontSizeNode = node;
  }

  setFontSizeSelectNode = (node) => {
    this.fontSizeSelectNode = node;
  }

  handleChange = (event) => {
    this.props.setDataAttr('text', event.target.value);
  }

  setFontSize = (sz) => {
    this.props.setDataAttrNotDirty('fontSz', sz);
    this.committed = false;
  }

  closeFontSize = () => {
    document.removeEventListener('click', this.closeFontSize)
    this.props.enableCol();

    if (!this.committed) {
      this.setFontSize(this.realFontSz);
    }

    this.setState((prevState, props) => {
      return {
        fontSizeOpen: false,
      }
    });
  }

  handleFontSizeClick = () => {
    const open = !this.state.fontSizeOpen;

    if (open) {
      this.realFontSz = this.props.value.fontSz;

      this.props.disableCol();
      document.addEventListener('click', this.closeFontSize);

      this.setState((prevState, props) => {
        return {
          fontSizeOpen: open,
        }
      });
    }
  }

  handleFontSizeSelectMouseOut = () => {
    this.setFontSize(this.realFontSz);
  }

  commitFontSize = () => {
    this.realFontSz = this.props.value.fontSz;
    this.committed = true;
    this.props.forceCardDirty();
  }

  fontSizePart = () => {
    let elmt = '';

    if (this.props.field.fontSizes) {
      let fontSizeElmts = this.props.field.fontSizes.map((sz) => {
            let className = 'font-size-option';

            if (sz === this.props.value.fontSz) {
              className += ' selected';
            }

            return (
              <div
                key={sz}
                className={className}
                onMouseEnter={() => this.setFontSize(sz)}
                onClick={() => {this.commitFontSize()}}
              >
                {sz}
              </div>
            )
          })
      , selectClass = 'font-size-select'
      , fontSizeClass = 'font-size'
      ;

      if (this.state.fontSizeOpen) {
        selectClass += ' disable-exempt';
        fontSizeClass += ' active disable-exempt';
      } else {
        selectClass += ' hidden';
      }

      elmt = (
        <div className='font-size-box'>
          <div className='font-size-label'>Font size:</div>
          <div
            className={fontSizeClass}
            onClick={this.handleFontSizeClick}
            ref={this.setFontSizeNode}
          >
            {this.props.value.fontSz}
          </div>
          <div
            className={selectClass}
            ref={this.setFontSizeSelectNode}
            onMouseOut={this.handleFontSizeSelectMouseOut}
          >
            {fontSizeElmts}
          </div>
        </div>
      )
    }

    return elmt;
  }

  setSuggestBtnNode = (node) => {
    this.setState((prevState, props) => {
      return {
        suggestBtnNode: node,
      }
    })
  }

  closeSuggestions = () => {
    this.props.enableCol();
    document.removeEventListener('click', this.closeSuggestions);

    this.setState((prevState, props) => {
      return {
        suggestionsOpen: false,
      }
    });
  }

  handleSuggestBtnClick = () => {
    if (!this.state.suggestionsOpen) {
      this.props.disableCol();
      document.addEventListener('click', this.closeSuggestions);

      this.setState((prevState, props) => {
        return {
          suggestionsOpen: true,
        }
      })
    }
  }

  handleSuggestionSelect = (value) => {
    this.props.setDataAttr('text', value);
  }

  buildInput = () => {
    const elmts = [];

    elmts.push((
      <input
        key='input'
        onChange={this.handleChange}
        className='text-input text-field-input text-entry'
        type='text'
        value={this.props.value.text}
      />
    ));

    if (this.props.choices) {
      elmts.push((
        <div
          className='text-input-btn'
          ref={this.setSuggestBtnNode}
          onClick={this.handleSuggestBtnClick}
          key='suggestBtn'
        >
          <i className='icon-drop suggestion-icon'></i>
        </div>
      ))
      elmts.push((
        <SuggestionsMenu
          key='suggestMenu'
          items={
            this.props.choices.map((choice) => {
              return choice.text
            })
          }
          anchor={this.state.suggestBtnNode}
          open={this.state.suggestionsOpen}
          handleSelect={this.handleSuggestionSelect}
        />
      ))
    }

    return elmts;
  }

  render() {
    let textInputClass = 'text-input-wrap flex-wrap';

    if (this.state.suggestionsOpen) {
      textInputClass += ' disable-exempt';
    }

    return (
      <div className='text-field-wrap'>
        <div className={textInputClass}>
          {this.buildInput()}
        </div>
        {this.fontSizePart()}
      </div>
    )
  }
}

export default fieldWrapper(TextField, false);
