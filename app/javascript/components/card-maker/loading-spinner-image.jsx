import React from 'react'

import styles from 'stylesheets/card_maker/card_manager'

class LoadingSpinnerImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.src !== nextProps.src) {
      this.setState({
        loaded: false
      });
    }
  }

  imgLoaded = () => {
    if (this.props.requestLoaded) {
      this.props.requestLoaded();
    } else {
      this.setState((prevState, props) => {
        return {
          loaded: true,
        }
      });
    }
  }

  isLoaded = () => {
    return this.props.loaded || this.state.loaded;
  }

  render() {
    var imgClass = styles.fillParent;

    if (!this.isLoaded()) {
      imgClass += ' is-hidden';
    }

    return (
      <div className={styles.loadingSpinnerImage}>
        {!this.isLoaded() &&
          <i className='fa fa-spinner fa-spin fa-2x' />
        }
        <img
          className={imgClass}
          src={this.props.src}
          onLoad={this.imgLoaded}
        />
      </div>
    )
  }
}

export default LoadingSpinnerImage