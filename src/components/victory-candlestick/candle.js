import React, { PropTypes } from "react";
// import d3Shape from "d3-shape";


export default class Candle extends React.Component {
  static propTypes = {
    index: React.PropTypes.number,
    x: PropTypes.number,
    y1: PropTypes.number,
    y2: PropTypes.number,
    candleColor: PropTypes.string,
    y: PropTypes.number,
    candleHeight: PropTypes.number,
    scale: PropTypes.object,
    // style: PropTypes.object,
    datum: PropTypes.object,
    width: PropTypes.number,
    padding: PropTypes.number,
    data: PropTypes.array
  }

  renderWick() {
    const width = this.props.width;
    const padding = this.props.padding;
    const dataLength = this.props.data.length;
    const x = this.props.x + 0.25 * (width - 2 * padding)/dataLength;
    
    return (
        <line
          x1={x}
          x2={x}
          y1={this.props.y1}
          y2={this.props.y2}
          stroke={this.props.candleColor}
          strokeWidth={1}
        />
      );
  }

  renderCandle() {
    const width = this.props.width;
    const padding = this.props.padding;
    const dataLength = this.props.data.length;
    const candleWidth = 0.5 * (width - 2 * padding) / dataLength;

    return (
      <rect
        fill={this.props.candleColor}
        x={this.props.x}
        y={this.props.y}
        stroke={this.props.candleColor}
        strokeWidth={1}
        width={candleWidth}
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
