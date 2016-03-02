import React, { PropTypes } from "react";
import { Helpers } from "victory-core";

export default class GridLine extends React.Component {
  static role = "grid";

  static propTypes = {
    tick: PropTypes.any,
    x2: PropTypes.number,
    y2: PropTypes.number,
    xTransform: PropTypes.number,
    yTransform: PropTypes.number,
    style: PropTypes.object
  };

  render() {
    return (
      <line
        x1={this.props.layout.left}
        x2={this.props.layout.left}
        y1={this.props.layout.top}
        y2={this.props.layout.bottom}
        style={Helpers.evaluateStyle(this.props.style, this.props.tick)}
      />
    );
  }
}
