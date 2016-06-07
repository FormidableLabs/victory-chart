import React, { PropTypes } from "react";
// import d3Shape from "d3-shape";


export default class Candle extends React.Component {
  static propTypes = {
    index: React.PropTypes.number,
    wickX: PropTypes.number,
    candleX: PropTypes.number,
    wickY1: PropTypes.number,
    wickY2: PropTypes.number,
    candleColor: PropTypes.string,
    candleY: PropTypes.number,
    candleWidth: PropTypes.number,
    candleHeight: PropTypes.number,
    scale: PropTypes.object,
    // style: PropTypes.object,
    datum: PropTypes.object
  }

  renderWick() {
    return (
        <line
          x1={this.props.wickX}
          x2={this.props.wickX}
          y1={this.props.wickY1}
          y2={this.props.wickY2}
          stroke={this.props.candleColor}
          strokeWidth={1}
        />
      );
  }

  renderCandle() {
    return (
      <rect
        fill={this.props.candleColor}
        x={this.props.candleX}
        y={this.props.candleY}
        stroke={this.props.candleColor}
        strokeWidth={1}
        width={this.props.candleWidth}
        height={this.props.candleHeight}
      />
    );
  }

  render() {
    return (
      <g>
        {this.renderWick()}

        {this.renderCandle()}
      </g>
    );
  }
}
