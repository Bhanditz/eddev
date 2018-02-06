import React from 'react'

import {cardMakerUrl} from 'lib/card-maker/url-helper'
import styles from 'stylesheets/card_maker/card_manager'

class SpeciesSearchResult extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let classNames = [styles.speciesSearchResult];

    if (this.props.selected) {
      classNames.push(styles.isSpeciesSearchResultSelected);
    }

    return (
      <li
        className={classNames.join(' ')}
        onClick={this.props.handleClick}
      >
        <img
          src={this.props.thumbUrl}
        />
        <div>{this.props.commonName}</div>
        <div className={styles.speciesSearchSciName}>{this.props.sciName}</div>
      </li>
    )
  }
}

export default SpeciesSearchResult
