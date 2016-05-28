import React, { PropTypes } from "react";
// import d3Shape from "d3-shape";


export default class Candle extends React.Component {
  static propTypes = {
    index: React.PropTypes.number,
    x: PropTypes.number,
    wickY1: PropTypes.number,
    wickY2: PropTypes.number,
    candleColor: PropTypes.string,
    candleY: PropTypes.number,
    candleWidth: PropTypes.number,
    candleHeight: PropTypes.number,
    scale: PropTypes.object,
    datum: PropTypes.object
  }

  render() {
    return (
      <g>
        <Wick
          x1={this.props.x}
          x2={this.props.x}
          y1={this.props.wickY1}
          y2={this.props.wickY2}
          stroke = {this.props.candleColor}
        />

        <CandleBody
          fill={this.props.candleColor}
          x={this.props.x}
          y={this.props.candleY}
          width={this.props.candleWidth}
          height={this.props.candleHeight}
          stroke={this.props.candleColor}
        />
      </g>
    );
  }
}

class Wick extends React.Component {
  static propTypes = {
    x1: PropTypes.number,
    x2: PropTypes.number,
    y1: PropTypes.number,
    y2: PropTypes.number,
    stroke: PropTypes.string
  }

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
          stroke={this.props.stroke}
          strokeWidth={1}
        />
      );
  }
}

class CandleBody extends React.Component {
  static propTypes = {
    fill: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    stroke: PropTypes.string
  }

  constructor() {
    super();
  }

  render() {
    return (
      <rect
        fill={this.props.fill}
        x={this.props.x}
        y={this.props.y}
        stroke={this.props.stroke}
        strokeWidth={1}
        width={this.props.width}
        height={this.props.height}
      />
    );
  }

}
