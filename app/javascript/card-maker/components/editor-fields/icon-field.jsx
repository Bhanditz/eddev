import React from 'react'
import fieldWrapper from './field-wrapper'
import styles from 'stylesheets/card_maker/card_editor'

class IconField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    }
  }

  closeMenu = () => {
    document.removeEventListener('click', this.closeMenu);
    this.props.enableCol();
    this.setState({
      open: false
    });
  }

  handleMenuClick = () => {
    if (!this.state.open) {
      this.props.disableCol();
      document.addEventListener('click', this.closeMenu);

      this.setState({
        open: true
      });
    }
  }

  textSelection = () => {
    return this.props.value.label ? 
      this.props.value.label :
      "Select a biome"
  }

  render() {
    return (
      <div 
        className={[
          styles.lIconField,
          (this.state.open ? styles.isDisableExempt : '')
        ].join(' ')}
      >
        <div className={styles.iconText}>{this.textSelection()}</div>
        <div className={styles.iconSelect}>
          <div className={styles.iconSelection}
            onClick={this.handleMenuClick}>
            {
              this.props.value.url != null &&
              <img src={this.props.value.url} />
            }

            <i className='cm-icon-sug-arrow-down' /> 
          </div>
          {
            this.state.open && 
            <ul className={[styles.iconChoices].join(' ')}>
              <li
                className={[
                  styles.iconChoice,
                  (this.props.value.url ? '' : styles.isIconChoiceSelected)
                ].join(' ')}
                onClick={() => this.props.setChoiceKey(null)}
              >
                <div>---</div>
              </li>
              {this.props.choices.map((choice, i) => {
                let classes = [styles.iconChoice];

                if (this.props.value.url === choice.url) {
                  classes.push(styles.isIconChoiceSelected);
                }

                return (
                  <li 
                    className={classes.join(' ')} 
                    key={i} 
                    onClick={() => this.props.setChoiceKey(choice.choiceKey)}
                  > 
                    <div>{choice.label}</div>
                    <img src={choice.url} />
                  </li>
                );
              })}
            </ul>
          }
        </div>
      </div>
    );
  }
}

export default fieldWrapper(IconField);