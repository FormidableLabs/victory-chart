import React, { PropTypes } from "react";
import d3Shape from "d3-shape";
import assign from "lodash/object/assign";
import { Helpers } from "victory-core";

export default class Area extends React.Component {
  static propTypes = {
    datum: PropTypes.array,
    interpolation: PropTypes.string,
    scale: PropTypes.object,
    style: PropTypes.object
  };

  toNewName(interpolation) {
    // d3 shape changed the naming scheme for interpolators from "basis" -> "curveBasis" etc.
    const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);
    return `curve${capitalize(interpolation)}`;
  }

  renderArea(style, interpolation) {
    const xScale = this.props.scale.x;
    const yScale = this.props.scale.y;
    const areaStroke = style.stroke ? "none" : style.fill;
    const areaStyle = assign({}, style, {stroke: areaStroke});
    const areaFunction = d3Shape.area()
      .curve(d3Shape[this.toNewName(interpolation)])
      .x((data) => xScale(data.x))
      .y1((data) => yScale(data.y0 + data.y))
      .y0((data) => yScale(data.y0));
    const path = areaFunction(this.props.datum);
    return <path style={areaStyle} d={path}/>;
  }

  renderLine(style, interpolation) {
    if (!style.stroke || style.stroke === "none" || style.stroke === "transparent") {
      return undefined;
    }
    const lineStyle = assign({}, style, {fill: "none"});
    const xScale = this.props.scale.x;
    const yScale = this.props.scale.y;
    const lineFunction = d3Shape.line()
      .curve(d3Shape[this.toNewName(interpolation)])
      .x((data) => xScale(data.x))
      .y((data) => yScale(data.y));
    const path = lineFunction(this.props.datum);
    return (
      <path style={lineStyle} d={path}/>
    );
  }


  render() {
    const style = Helpers.evaluateStyle(this.props.style, this.props.datum);
    const interpolation = Helpers.evaluateProp(this.props.interpolation, this.props.datum);
    return (
      <g>
        {this.renderArea(style, interpolation)}
        {this.renderLine(style, interpolation)}
      </g>
    );
  }
}
