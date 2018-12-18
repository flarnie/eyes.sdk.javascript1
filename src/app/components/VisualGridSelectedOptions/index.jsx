import React from 'react'
import PropTypes from 'prop-types'
import CloseButton from '../ActionButtons/CloseButton'

export default class VisualGridSelectedOptions extends React.Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    removeOption: PropTypes.func.isRequired,
  }
  render() {
    return (
      <div className="selected-options">
        {this.props.items.map(function(item) {
          return (
            <div className="option" key={item}>
              <div className="option-text">{item}</div>
              <CloseButton onClick={this.props.removeOption.bind(this, item)} />
            </div>
          )
        }, this)}
      </div>
    )
  }
}
