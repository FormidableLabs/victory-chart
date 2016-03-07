import defaults from "lodash/object/defaults";
import pick from "lodash/object/pick";

import React, { PropTypes } from "react";
import {
  PropTypes as CustomPropTypes,
  VictoryLabel,
  VictoryAnimation,
  Helpers
} from "victory-core";
import AxisLine from "./axis-line";
import GridLine from "./grid";
import Tick from "./tick";
import TickLabel, { addMeasurements } from "./tick-label";
import AxisHelpers from "./helper-methods";
import Axis from "../../helpers/axis";
import AutoLayout, { constrain } from "../autolayout/autolayout";

const defaultStyles = {
  axis: {
    stroke: "#756f6a",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round"
  },
  axisLabel: {
    stroke: "transparent",
    fill: "#756f6a",
    fontSize: 16,
    fontFamily: "Helvetica"
  },
  grid: {
    stroke: "none",
    fill: "none",
    strokeLinecap: "round"
  },
  ticks: {
    stroke: "#756f6a",
    fill: "none",
    padding: 5,
    strokeWidth: 2,
    strokeLinecap: "round",
    size: 4
  },
  tickLabels: {
    stroke: "transparent",
    fill: "#756f6a",
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.2,
    padding: 5
  }
};

const orientationSign = {
  top: -1,
  left: -1,
  right: 1,
  bottom: 1
};

const getStyles = (props) => {
  const style = props.style || {};
  const parentStyleProps = { height: props.height, width: props.width };
  return {
    parent: defaults(parentStyleProps, style.parent, defaultStyles.parent),
    axis: defaults({}, style.axis, defaultStyles.axis),
    axisLabel: defaults({}, style.axisLabel, defaultStyles.axisLabel),
    grid: defaults({}, style.grid, defaultStyles.grid),
    ticks: defaults({}, style.ticks, defaultStyles.ticks),
    tickLabels: defaults({}, style.tickLabels, defaultStyles.tickLabels)
  };
};

export default class VictoryAxis extends React.Component {
  static role = "axis";
  static propTypes = {
    /**
     * The animate prop specifies props for victory-animation to use. It this prop is
     * not given, the axis will not tween between changing data / style props.
     * Large datasets might animate slowly due to the inherent limits of svg rendering.
     * @examples {velocity: 0.02, onEnd: () => alert("done!")}
     */
    animate: PropTypes.object,
    /**
     * This prop specifies whether a given axis is intended to cross another axis.
     */
    crossAxis: PropTypes.bool,
    /**
     * The dependentAxis prop specifies whether the axis corresponds to the
     * dependent variable (usually y). This prop is useful when composing axis
     * with other components to form a chart.
     */
    dependentAxis: PropTypes.bool,
    /**
     * The domain prop describes the range of values your axis will include. This prop should be
     * given as a array of the minimum and maximum expected values for your axis.
     * If this value is not given it will be calculated based on the scale or tickValues.
     * @examples [-1, 1]
     */
    domain: CustomPropTypes.domain,
    /**
     * The height prop specifies the height of the chart container element in pixels.
     */
    height: CustomPropTypes.nonNegative,
    /**
     * The label prop specifies the label for your axis. This prop can be a string or
     * a label component.
     */
    label: PropTypes.any,
    /**
     * The labelPadding prop specifies the padding in pixels for your axis label.
     */
    labelPadding: PropTypes.number,
    /**
     * This value describes how far from the "edge" of its permitted area each axis
     * will be set back in the x-direction.  If this prop is not given,
     * the offset is calculated based on font size, axis orientation, and label padding.
     */
    offsetX: PropTypes.number,
    /**
     * This value describes how far from the "edge" of its permitted area each axis
     * will be set back in the y-direction.  If this prop is not given,
     * the offset is calculated based on font size, axis orientation, and label padding.
     */
    offsetY: PropTypes.number,
    /**
     * The orientation prop specifies the position and orientation of your axis.
     */
    orientation: PropTypes.oneOf(["top", "bottom", "left", "right"]),
    /**
     * The padding props specifies the amount of padding in number of pixels between
     * the edge of the chart and any rendered child components. This prop can be given
     * as a number or as an object with padding specified for top, bottom, left
     * and right.
     */
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        top: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number
      })
    ]),
    /**
     * The scale prop determines which scales your axis should use. This prop can be
     * given as a `d3-scale@0.3.0` function or as a string corresponding to a supported d3-string
     * function.
     * @examples d3Scale.time(), "linear", "time", "log", "sqrt"
     */
    scale: CustomPropTypes.scale,
    /**
     * The standalone prop determines whether the component will render a standalone svg
     * or a <g> tag that will be included in an external svg. Set standalone to false to
     * compose VictoryAxis with other components within an enclosing <svg> tag.
     */
    standalone: PropTypes.bool,
    /**
     * The style prop specifies styles for your chart. Victory Axis relies on Radium,
     * so valid Radium style objects should work for this prop, however height, width, and margin
     * are used to calculate range, and need to be expressed as a number of pixels.
     * Styles for axis lines, gridlines, and ticks are scoped to separate props.
     * @examples {axis: {stroke: "#756f6a"}, grid: {stroke: "grey"}, ticks: {stroke: "grey"},
     * tickLabels: {fontSize: 10, padding: 5}, axisLabel: {fontSize: 16, padding: 20}}
     */
    style: PropTypes.shape({
      parent: PropTypes.object,
      axis: PropTypes.object,
      axisLabel: PropTypes.object,
      grid: PropTypes.object,
      ticks: PropTypes.object,
      tickLabels: PropTypes.object
    }),
    /**
     * The tickCount prop specifies how many ticks should be drawn on the axis if
     * tickValues are not explicitly provided.
     */
    tickCount: CustomPropTypes.nonNegative,
    /**
     * The tickFormat prop specifies how tick values should be expressed visually.
     * tickFormat can be given as a function to be applied to every tickValue, or as
     * an array of display values for each tickValue.
     * @examples d3.time.format("%Y"), (x) => x.toPrecision(2), ["first", "second", "third"]
     */
    tickFormat: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.homogeneousArray
    ]),
    /**
     * The tickValues prop explicitly specifies which tick values to draw on the axis.
     * @examples ["apples", "bananas", "oranges"], [2, 4, 6, 8]
     */
    tickValues: CustomPropTypes.homogeneousArray,
    /**
     * The width props specifies the width of the chart container element in pixels
     */
    width: CustomPropTypes.nonNegative
  };

  static defaultProps = {
    height: 300,
    padding: 50,
    scale: "linear",
    standalone: true,
    tickCount: 5,
    width: 450
  };

  static getDomain = AxisHelpers.getDomain.bind(AxisHelpers);
  static getAxis = AxisHelpers.getAxis.bind(AxisHelpers);
  static getScale = AxisHelpers.getScale.bind(AxisHelpers);
  static getStyles = getStyles;

  getTickProps(props) {
    const stringTicks = Axis.stringTicks(props);
    const scale = AxisHelpers.getScale(props);
    const ticks = AxisHelpers.getTicks(props, scale);
    return {scale, ticks, stringTicks};
  }

  getLayoutProps(props) {
    const style = getStyles(props);
    const padding = Helpers.getPadding(props);
    const orientation = props.orientation || (props.dependentAxis ? "left" : "bottom");
    const isVertical = Axis.isVertical(props);
    const labelPadding = AxisHelpers.getLabelPadding(props, style);
    const offset = AxisHelpers.getOffset(props, style);
    return {style, padding, orientation, isVertical, labelPadding, offset};
  }

  renderDomainFeatures(props, layoutProps, tickProps) {
    const {scale, ticks, stringTicks} = tickProps;
    const {style, orientation} = layoutProps;

    return ticks.map((tick, index) => {
      const gridName = `grid-${index}`;
      const tickName = `tick-${index}`;
      const tickLabelName = `tickLabel-${index}`;
      const position = scale(tick);
      const tickFormat = AxisHelpers.getTickFormat(props, tickProps);

      const gridLine = (
        <GridLine key={gridName}
          viewName={gridName}
          intrinsicWidth={2}
          tick={stringTicks ? props.tickValues[tick - 1] : tick}
          style={style.grid}
          constraints={[
            constrain(gridName, "top").equals(null, "top"),
            constrain(gridName, "height").equals("line", "top").withPriority(1000),
            constrain(gridName, "left").constant(position)
          ]}
        />
      );

      const tickElement = (
        <Tick key={tickName}
          viewName={tickName}
          position={position}
          intrinsicWidth={2}
          tick={stringTicks ? props.tickValues[tick - 1] : tick}
          orientation={orientation}
          label={tickFormat.call(this, tick, index)}
          style={{
            ticks: style.ticks,
            tickLabels: style.tickLabels
          }}
          constraints={[
            constrain(tickName, "top").equals("line", "bottom"),
            constrain(tickName, "bottom").lessThanOrEqualTo(null, "bottom"),
            constrain(tickName, "left").constant(position),
            constrain(tickName, "height").constant(5)
          ]}
        />
      );

      const tickLabel = addMeasurements(
        <TickLabel key={tickLabelName}
          viewName={tickLabelName}
          style={style.tickLabels}
          label={tickFormat.call(this, tick, index)}
          constraints={[
            constrain(tickLabelName, "left").equals(tickName, "left"),
            constrain(tickLabelName, "top").equals(tickName, "bottom"),
            constrain(tickLabelName, "bottom").lessThanOrEqualTo(null, "bottom")
          ]}
        />
      );

      return [gridLine, tickElement, tickLabel];
    }).reduce((prev, curr) => prev.concat(curr));
  }

  renderLine(props, layoutProps) {
    const {style, padding, isVertical} = layoutProps;

    const constraints = isVertical ?
      [
        constrain("line", "top").equals(null, "top"),
        constrain("line", "bottom").equals(null, "bottom").minus(50),
        constrain("line", "left").equals(null, "left")
          .plus(layoutProps.padding.left),
        constrain("line", "right").equals(null, "left")
          .plus(layoutProps.padding.left),
        //constrain("line", "bottom").lessThanOrEqualTo(null, "bottom").minus(50),
        //constrain("line", "centerX").equals(null, "centerX")
      ] :
      [
        constrain("line", "left").equals(null, "left")
          .plus(layoutProps.padding.left),
        constrain("line", "right").equals(null, "right")
          .minus(layoutProps.padding.right),
        constrain("line", "bottom").lessThanOrEqualTo(null, "bottom").minus(50),
        constrain("line", "centerX").equals(null, "centerX")
      ];

    return (
      <AxisLine key="line"
        viewName="line"
        style={style.axis}
        x1={isVertical ? null : padding.left}
        x2={isVertical ? null : props.width - padding.right}
        y1={isVertical ? padding.top : null}
        y2={isVertical ? props.height - padding.bottom : null}
        constraints={constraints}
      />
    );
  }

  renderLabel(props, layoutProps) {
    if (!props.label) {
      return undefined;
    }
    const newProps = this.getLabelProps(props, layoutProps);
    return addMeasurements(props.label.props
      ? React.cloneElement(props.label, newProps)
      : React.createElement(VictoryLabel, newProps, props.label)
    );
  }

  getLabelProps(props, layoutProps) {
    const componentProps = props.label.props || {};
    const {style, orientation, padding, labelPadding, isVertical} = layoutProps;
    const sign = orientationSign[orientation];
    const hPadding = padding.left + padding.right;
    const vPadding = padding.top + padding.bottom;
    const x = isVertical ?
      -((props.height - vPadding) / 2) - padding.top :
      ((props.width - hPadding) / 2) + padding.left;
    const y = sign * labelPadding;
    const verticalAnchor = sign < 0 ? "end" : "start";
    const transform = isVertical ? "rotate(-90)" : "";
    return {
      key: "label",
      viewName: "label",
      mapLayoutToProps: {
        x: "left",
        y: "top"
      },
      //x: componentProps.x || x,
      //y: componentProps.y || y,
      textAnchor: componentProps.textAnchor || "middle",
      verticalAnchor: componentProps.verticalAnchor || verticalAnchor,
      style: defaults({}, style.axisLabel, componentProps.style),
      constraints: [
        constrain("label", "bottom").equals(null, "bottom"),
        constrain("label", "top").lessThanOrEqualTo("tick-0", "top"),
        constrain("label", "left").equals("line", "centerX")
      ]
      //transform: componentProps.transform || transform
    };
  }

  render() {
    // If animating, return a `VictoryAnimation` element that will create
    // a new `VictoryAxis` with nearly identical props, except (1) tweened
    // and (2) `animate` set to null so we don"t recurse forever.
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const whitelist = [
        "style", "domain", "range", "tickCount", "tickValues",
        "labelPadding", "offsetX", "offsetY", "padding", "width", "height"
      ];
      const animateData = pick(this.props, whitelist);
      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {(props) => <VictoryAxis {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    }
    const layoutProps = this.getLayoutProps(this.props);
    const tickProps = this.getTickProps(this.props);
    const {style} = layoutProps;
    const group = (
      <AutoLayout width={this.props.width} height={this.props.height} container="g">
        {this.renderLine(this.props, layoutProps)}
        {this.renderDomainFeatures(this.props, layoutProps, tickProps)}
        {this.renderLabel(this.props, layoutProps)}
      </AutoLayout>
    );

    return this.props.standalone ? (
      <svg style={style.parent}>
        {group}
      </svg>
    ) : group;
  }
}
