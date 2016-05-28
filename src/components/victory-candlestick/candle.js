import React, { PropTypes } from "react";
import d3Shape from "d3-shape";


export default class Candle extends React.Component {
  render() {
    return (
      <g>
        <Wick
          x1={this.props.wickX1}
          x2={this.props.wickX2}
          y1={this.props.wickY1}
          y2={this.props.wickY2}
        />

        <CandleBody
          fill={this.props.candleFill}
          x={this.props.candleX}
          y={this.props.candleY}
          width={this.props.candleWidth}
          height={this.props.candleHeight}
        />
      </g>
    );
  }
}

class Wick extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <line
          x1={this.props.x1}
          x2={this.props.x2}
          y1={this.props.y1}
          y2={this.props.y2}
          stroke="black"
          strokeWidth={1}
        />
      );
  }
}

class CandleBody extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <rect
        fill={this.props.fill}
        x={this.props.x}
        y={this.props.y}
        stroke="black"
        strokeWidth={1}
        width={this.props.width}
        height={this.props.height}
      />
    );
  }

}
