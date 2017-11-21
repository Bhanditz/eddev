import React from 'react'

import styles from 'stylesheets/card_maker/card_manager'

function resourceWrapper(WrappedComponent, additionalClassNames) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showOverlay: false,
      }
    }

    handleMouseEnter = () => {
      this.setState((prevState, props) => {
        return {
          showOverlay: true,
        }
      });
    }

    handleMouseLeave = () => {
      this.setState((prevState, props) => {
        return {
          showOverlay: false,
        }
      });
    }

    render() {
      const classNames = additionalClassNames.slice();
      classNames.push(styles.resource);

      return (
        <div className={classNames.join(' ')}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          ref={this.props.setRef}
          style={this.props.style}
        >
          <WrappedComponent
            showOverlay={this.state.showOverlay}
            {...this.props}
          />
        </div>
      )
    }
  }
}

export default resourceWrapper
