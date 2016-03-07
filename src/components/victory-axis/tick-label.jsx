import React, { Component, PropTypes } from "react";
import { VictoryLabel, Helpers } from "victory-core";
import measureText from "measure-text";

export default class TickLabel extends Component {
  static role = "tickLabel";

  static propTypes = {
    position: PropTypes.number,
    tick: PropTypes.any,
    orientation: PropTypes.oneOf(["top", "bottom", "left", "right"]),
    style: PropTypes.object,
    label: PropTypes.any
  };

  getAnchors(props, isVertical) {
    const anchorOrientation = { top: "end", left: "end", right: "start", bottom: "start" };
    const anchor = anchorOrientation[props.orientation];
    return {
      textAnchor: isVertical ? anchor : "middle",
      verticalAnchor: isVertical ? "middle" : anchor
    };
  }

  renderLabel(props, isVertical) {
    if (!props.label) {
      return undefined;
    }
    const componentProps = props.label.props ? props.label.props : {};
    const style = componentProps.style || props.style;
    const anchors = this.getAnchors(props, isVertical);
    const newProps = {
      verticalAnchor: "start",
      textAnchor: componentProps.textAnchor || anchors.textAnchor,
      //verticalAnchor: componentProps.verticalAnchor || anchors.verticalAnchor,
      x: props.layout.left,
      y: props.layout.top,
      style
      //style: Helpers.evaluateStyle(style, props.tick)
    };
    return props.label.props ?
      React.cloneElement(props.label, newProps) :
      React.createElement(VictoryLabel, newProps, props.label);
  }

  render() {
    const isVertical = this.props.orientation === "left" || this.props.orientation === "right";
    return this.renderLabel(this.props, isVertical);
  }
}

const extractText = (element) => {
  const { props } = element;

  if (props) {
    if (props.children && props.children.split) {
      return props.children.split("\n");
    }
    if (props.label && props.label.split) {
      return props.label.split("\n");
    }
    return props.label.toString();
  }
  return "";
};

export const addMeasurements = (element) => {
  const { fontSize, fontFamily, lineHeight, fontWeight, fontStyle } = element.props.style;

  const measurement = measureText({
    text: extractText(element),
    fontFamily, fontSize: `${fontSize}px`,
    lineHeight: lineHeight || 1.2,
    fontWeight: fontWeight || 400,
    fontStyle: fontStyle || "normal"
  });
  const { width, height } = measurement;
  return React.cloneElement(element, {
    intrinsicWidth: width.value,
    intrinsicHeight: height.value
  });
};

