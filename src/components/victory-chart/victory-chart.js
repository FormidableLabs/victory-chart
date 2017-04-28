import { defaults } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import {
  PropTypes as CustomPropTypes, Helpers, VictorySharedEvents, VictoryContainer,
  VictoryTheme, Scale
} from "victory-core";
import VictoryAxis from "../victory-axis/victory-axis";
import ChartHelpers from "./helper-methods";
import Axis from "../../helpers/axis";
import Wrapper from "../../helpers/wrapper";

const fallbackProps = {
  width: 450,
  height: 300,
  padding: 50
};

export default class VictoryChart extends React.Component {
  static displayName = "VictoryChart";

  static propTypes = {
    animate: PropTypes.object,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]),
    containerComponent: PropTypes.element,
    defaultAxes: PropTypes.shape({
      independent: PropTypes.element,
      dependent: PropTypes.element
    }),
    domain: PropTypes.oneOfType([
      CustomPropTypes.domain,
      PropTypes.shape({
        x: CustomPropTypes.domain,
        y: CustomPropTypes.domain
      })
    ]),
    domainPadding: PropTypes.oneOfType([
      PropTypes.shape({
        x: PropTypes.oneOfType([ PropTypes.number, CustomPropTypes.domain ]),
        y: PropTypes.oneOfType([ PropTypes.number, CustomPropTypes.domain ])
      }),
      PropTypes.number
    ]),
    eventKey: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string
    ]),
    events: PropTypes.arrayOf(PropTypes.shape({
      childName: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]),
      target: PropTypes.string,
      eventKey: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.func,
        CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
        PropTypes.string
      ]),
      eventHandlers: PropTypes.object
    })),
    groupComponent: PropTypes.element,
    height: CustomPropTypes.nonNegative,
    modifyChildren: PropTypes.func,
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        top: PropTypes.number, bottom: PropTypes.number,
        left: PropTypes.number, right: PropTypes.number
      })
    ]),
    scale: PropTypes.oneOfType([
      CustomPropTypes.scale,
      PropTypes.shape({ x: CustomPropTypes.scale, y: CustomPropTypes.scale })
    ]),
    sharedEvents: PropTypes.shape({
      events: PropTypes.array,
      getEventState: PropTypes.func
    }),
    standalone: PropTypes.bool,
    style: PropTypes.object,
    theme: PropTypes.object,
    width: CustomPropTypes.nonNegative
  };

  static defaultProps = {
    containerComponent: <VictoryContainer/>,
    defaultAxes: {
      independent: <VictoryAxis/>,
      dependent: <VictoryAxis dependentAxis/>
    },
    groupComponent: <g/>,
    standalone: true,
    theme: VictoryTheme.grayscale
  };

  static expectedComponents = [
    "groupComponent", "containerComponent"
  ];

  constructor(props) {
    super(props);
    this.state = {};
    if (props.animate) {
      this.state = {
        nodesShouldLoad: false,
        nodesDoneLoad: false,
        animating: true
      };
      this.setAnimationState = Wrapper.setAnimationState.bind(this);
    }
    this.events = Wrapper.getAllEvents(props);
  }

  componentWillMount() {
    this.events = Wrapper.getAllEvents(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.animate) {
      this.setAnimationState(this.props, nextProps);
    }
    this.events = Wrapper.getAllEvents(nextProps);
  }

  getStyles(props) {
    const styleProps = props.style && props.style.parent;
    return {
      parent: defaults({
        height: "auto",
        width: "100%",
        userSelect: "none"
      },
      styleProps
    ) };
  }

  getAxisProps(child, props, calculatedProps) {
    const { domain, scale, originSign } = calculatedProps;
    const axis = child.type.getAxis(child.props);
    const axisOffset = ChartHelpers.getAxisOffset(props, calculatedProps);
    const tickValues = ChartHelpers.getTicks(calculatedProps, axis, child);
    const tickFormat =
      child.props.tickFormat || ChartHelpers.getTickFormat(child, axis, calculatedProps);
    const offsetY = axis === "y" ? undefined : axisOffset.y;
    const offsetX = axis === "x" ? undefined : axisOffset.x;
    const crossAxis = child.props.crossAxis === false ? false : true;
    const orientation = Axis.getOrientation(child, axis, originSign[axis]);
    return {
      domain: domain[axis],
      scale: scale[axis],
      tickValues,
      tickFormat,
      offsetY: child.props.offsetY !== undefined ? child.props.offsetY : offsetY,
      offsetX: child.props.offsetX !== undefined ? child.props.offsetX : offsetX,
      crossAxis,
      orientation
    };

  }

  getChildProps(child, props, calculatedProps) {
    const axisChild = Axis.findAxisComponents([child]);
    if (axisChild.length > 0) {
      return this.getAxisProps(axisChild[0], props, calculatedProps);
    }
    return {
      domain: calculatedProps.domain,
      scale: calculatedProps.scale,
      categories: calculatedProps.categories
    };
  }

  getCalculatedProps(props, childComponents) {
    const style = this.getStyles(props);
    const horizontal = childComponents.some((component) => {
      return component.props && component.props.horizontal;
    });
    const axisComponents = {
      x: Axis.getAxisComponent(childComponents, "x"),
      y: Axis.getAxisComponent(childComponents, "y")
    };
    const domain = {
      x: ChartHelpers.getDomain(props, "x", childComponents),
      y: ChartHelpers.getDomain(props, "y", childComponents)
    };
    const range = {
      x: Helpers.getRange(props, "x"),
      y: Helpers.getRange(props, "y")
    };
    const baseScale = {
      x: Scale.getScaleFromProps(props, "x") ||
        axisComponents.x && axisComponents.x.type.getScale(axisComponents.x.props) ||
        Scale.getDefaultScale(),
      y: Scale.getScaleFromProps(props, "y") ||
        axisComponents.y && axisComponents.y.type.getScale(axisComponents.y.props) ||
        Scale.getDefaultScale()
    };
    const scale = {
      x: baseScale.x.domain(domain.x).range(range.x),
      y: baseScale.y.domain(domain.y).range(range.y)
    };

    const origin = {
      x: Axis.getOrigin(domain.x),
      y: Axis.getOrigin(domain.y)
    };

    const originSign = {
      x: Axis.getOriginSign(origin.x, domain.x),
      y: Axis.getOriginSign(origin.y, domain.y)
    };

    // TODO: check
    const categories = {
      x: Wrapper.getCategories(props, "x", childComponents),
      y: Wrapper.getCategories(props, "y", childComponents)
    };

    const stringMap = {
      x: ChartHelpers.createStringMap(props, "x", childComponents),
      y: ChartHelpers.createStringMap(props, "y", childComponents)
    };

    const defaultDomainPadding = ChartHelpers.getDefaultDomainPadding(childComponents, horizontal);

    return {
      axisComponents, categories, domain, horizontal, scale, stringMap,
      style, origin, originSign, defaultDomainPadding
    };
  }

  getNewChildren(props, childComponents, calculatedProps) {
    const baseStyle = calculatedProps.style.parent;
    const getAnimationProps = Wrapper.getAnimationProps.bind(this);

    return childComponents.map((child, index) => {
      const style = defaults({}, child.props.style, { parent: baseStyle });
      const childProps = this.getChildProps(child, props, calculatedProps);
      const newProps = defaults({
        animate: getAnimationProps(props, child, index),
        height: props.height,
        width: props.width,
        clipWidth: props.width,
        clipHeight: props.height,
        padding: Helpers.getPadding(props),
        key: index,
        theme: props.theme,
        standalone: false,
        style
      }, childProps);

      return React.cloneElement(child, newProps);
    });
  }

  renderContainer(containerComponent, props) {
    const containerProps = defaults({}, containerComponent.props, props);
    return React.cloneElement(containerComponent, containerProps);
  }

  getContainerProps(props, calculatedProps) {
    const { width, height, standalone, theme } = props;
    const { domain, scale, style } = calculatedProps;
    return {
      domain, scale, width, height, standalone, theme, style: style.parent
    };
  }

  render() {
    const props = this.state && this.state.nodesWillExit ?
      this.state.oldProps || this.props : this.props;
    const modifiedProps = Helpers.modifyProps(props, fallbackProps, "chart");
    const { eventKey, containerComponent } = modifiedProps;
    const childComponents = ChartHelpers.getChildComponents(modifiedProps,
      modifiedProps.defaultAxes);
    const calculatedProps = this.getCalculatedProps(modifiedProps, childComponents);
    let newChildren = this.getNewChildren(modifiedProps, childComponents, calculatedProps);
    if (this.props.modifyChildren) {
      newChildren = this.props.modifyChildren(newChildren, modifiedProps);
    }
    const containerProps = this.getContainerProps(modifiedProps, calculatedProps);
    const container = this.renderContainer(containerComponent, containerProps);
    if (this.events) {
      return (
        <VictorySharedEvents events={this.events} eventKey={eventKey} container={container}>
          {newChildren}
        </VictorySharedEvents>
      );
    }
    return React.cloneElement(container, container.props, newChildren);
  }
}
