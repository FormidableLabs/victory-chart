import React, { PropTypes } from "react";
import { Helpers } from "victory-core";

export default class Tick extends React.Component {
  static role = "tick";

  static propTypes = {
    position: PropTypes.number,
    tick: PropTypes.any,
    orientation: PropTypes.oneOf(["top", "bottom", "left", "right"]),
    style: PropTypes.object,
    label: PropTypes.any
  };

  getPosition(props, isVertical) {
    const orientationSign = { top: -1, left: -1, right: 1, bottom: 1 };
    const style = props.style.ticks;
    const tickSpacing = style.size + style.padding;
    const sign = orientationSign[props.orientation];
    return {
      x: isVertical ? sign * tickSpacing : 0,
      x2: isVertical ? sign * style.size : 0,
      y: isVertical ? 0 : sign * tickSpacing,
      y2: isVertical ? 0 : sign * style.size
    };
  }

  renderTick(props, position) {
    return (
      <line
        x1={this.props.layout.left}
        x2={this.props.layout.left}
        y1={this.props.layout.top}
        y2={this.props.layout.bottom}
        style={Helpers.evaluateStyle(props.style.ticks, props.ticks)}
      />
    );
  }

  render() {
    const isVertical = this.props.orientation === "left" || this.props.orientation === "right";
    const position = this.getPosition(this.props, isVertical);
    return this.renderTick(this.props, position);
  }
}
