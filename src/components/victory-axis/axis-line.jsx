import React, { PropTypes } from "react";

export default class AxisLine extends React.Component {
  static role = "line";

  static propTypes = {
    x1: PropTypes.number,
    x2: PropTypes.number,
    y1: PropTypes.number,
    y2: PropTypes.number,
    style: PropTypes.object
  };

  render() {
    //return <line {...this.props}/>;
    return (
      <line
        {...this.props}
        x1={this.props.layout.left}
        x2={this.props.layout.left + this.props.layout.width}
        y1={this.props.layout.top}
        y2={this.props.layout.top + this.props.layout.height}
      />
    );
  }
}
