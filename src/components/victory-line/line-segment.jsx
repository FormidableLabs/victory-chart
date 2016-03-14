import React, { PropTypes } from "react";
import d3Shape from "d3-shape";
import { Helpers } from "victory-core";

export default class LineSegment extends React.Component {
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

  render() {
    const style = Helpers.evaluateStyle(this.props.style, this.props.datum);
    const interpolation = Helpers.evaluateProp(this.props.interpolation, this.props.datum);
    const xScale = this.props.scale.x;
    const yScale = this.props.scale.y;
    const lineFunction = d3Shape.line()
      .curve(d3Shape[this.toNewName(interpolation)])
      .x((data) => xScale(data.x))
      .y((data) => yScale(data.y));
    const path = lineFunction(this.props.datum);
    return (
      <path style={style} d={path}/>
    );
  }
}
