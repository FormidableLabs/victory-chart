import { assign, defaults } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import {
  PropTypes as CustomPropTypes, Helpers, VictorySharedEvents, VictoryContainer,
  VictoryTheme, Scale
} from "victory-core";
import Wrapper from "../../helpers/wrapper";

const fallbackProps = {
  width: 450,
  height: 300,
  padding: 50
};

export default class VictoryStack extends React.Component {
  static displayName = "VictoryStack";

  static role = "stack";

  static propTypes = {
    animate: PropTypes.object,
    categories: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.shape({
        x: PropTypes.arrayOf(PropTypes.string), y: PropTypes.arrayOf(PropTypes.string)
      })
    ]),
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node), PropTypes.node
    ]),
    colorScale: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.oneOf([
        "grayscale", "qualitative", "heatmap", "warm", "cool", "red", "green", "blue"
      ])
    ]),
    containerComponent: PropTypes.element,
    domainPadding: PropTypes.oneOfType([
      PropTypes.shape({
        x: PropTypes.oneOfType([ PropTypes.number, CustomPropTypes.domain ]),
        y: PropTypes.oneOfType([ PropTypes.number, CustomPropTypes.domain ])
      }),
      PropTypes.number
    ]),
    dataComponent: PropTypes.element,
    domain: PropTypes.oneOfType([
      CustomPropTypes.domain,
      PropTypes.shape({ x: CustomPropTypes.domain, y: CustomPropTypes.domain })
    ]),
    events: PropTypes.arrayOf(PropTypes.shape({
      childName: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
      ]),
      target: PropTypes.oneOf(["data", "labels", "parent"]),
      eventKey: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.func,
        CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
        PropTypes.string
      ]),
      eventHandlers: PropTypes.object
    })),
    eventKey: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string
    ]),
    groupComponent: PropTypes.element,
    height: CustomPropTypes.nonNegative,
    horizontal: PropTypes.bool,
    labels: PropTypes.oneOfType([ PropTypes.func, PropTypes.array ]),
    labelComponent: PropTypes.element,
    name: PropTypes.string,
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        top: PropTypes.number, bottom: PropTypes.number,
        left: PropTypes.number, right: PropTypes.number
      })
    ]),
    samples: CustomPropTypes.nonNegative,
    scale: PropTypes.oneOfType([
      CustomPropTypes.scale,
      PropTypes.shape({ x: CustomPropTypes.scale, y: CustomPropTypes.scale })
    ]),
    sharedEvents: PropTypes.shape({
      events: PropTypes.array,
      getEventState: PropTypes.func
    }),
    standalone: PropTypes.bool,
    style: PropTypes.shape({
      parent: PropTypes.object, data: PropTypes.object, labels: PropTypes.object
    }),
    theme: PropTypes.object,
    width: CustomPropTypes.nonNegative,
    xOffset: PropTypes.number
  };

  static defaultProps = {
    scale: "linear",
    standalone: true,
    containerComponent: <VictoryContainer/>,
    groupComponent: <g/>,
    theme: VictoryTheme. grayscale
  };

  static getDomain = Wrapper.getStackedDomain.bind(Wrapper);
  static getData = Wrapper.getData.bind(Wrapper);

  constructor(props) {
    super(props);
    if (props.animate) {
      this.state = {
        nodesShouldLoad: false,
        nodesDoneLoad: false,
        animating: true
      };
      this.setAnimationState = Wrapper.setAnimationState.bind(this);
      this.events = Wrapper.getAllEvents(props);
    }
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

  getCalculatedProps(props, childComponents) {
    const { role } = this.constructor;
    const style = this.getStyle(props.theme, props.style, role);
    const horizontal = props.horizontal || childComponents.every(
      (component) => component.props.horizontal
    );
    const datasets = Wrapper.getDataFromChildren(props);
    const domain = {
      x: Wrapper.getStackedDomain(props, "x", datasets),
      y: Wrapper.getStackedDomain(props, "y", datasets)
    };
    const range = {
      x: Helpers.getRange(props, "x"),
      y: Helpers.getRange(props, "y")
    };
    const baseScale = {
      x: Scale.getScaleFromProps(props, "x") || Scale.getDefaultScale(),
      y: Scale.getScaleFromProps(props, "y") || Scale.getDefaultScale()
    };
    const xScale = baseScale.x.domain(domain.x).range(range.x);
    const yScale = baseScale.y.domain(domain.y).range(range.y);
    const scale = {
      x: horizontal ? yScale : xScale,
      y: horizontal ? xScale : yScale
    };
    const categories = {
      x: Wrapper.getCategories(props, "x"),
      y: Wrapper.getCategories(props, "y")
    };
    const colorScale = props.colorScale;
    return {datasets, categories, range, domain, horizontal, scale, style, colorScale};
  }

  addLayoutData(props, calculatedProps, datasets, index) { // eslint-disable-line max-params
    const xOffset = props.xOffset || 0;
    return datasets[index].map((datum) => {
      const yOffset = Wrapper.getY0(datum, index, calculatedProps) || 0;
      return assign({}, datum, {
        _y0: datum._y instanceof Date ? yOffset && new Date(yOffset) || datum._y : yOffset,
        _y1: datum._y instanceof Date ? new Date(+datum._y + +yOffset) : datum._y + yOffset,
        _x1: datum._x instanceof Date ? new Date(+datum._x + +xOffset) : datum._x + xOffset
      });
    });
  }

  getLabels(props, datasets, index) {
    if (!props.labels) {
      return undefined;
    }
    return datasets.length === index + 1 ? props.labels : undefined;
  }

  getChildProps(props, calculatedProps) {
    const { categories, domain, scale, horizontal } = calculatedProps;
    return {
      height: props.height,
      width: props.width,
      padding: Helpers.getPadding(props),
      standalone: false,
      theme: props.theme,
      categories,
      domain,
      scale,
      horizontal
    };
  }

  getColorScale(props, child) {
    const role = child.type && child.type.role;
    const colorScaleOptions = child.props.colorScale || props.colorScale;
    if (role !== "group" && role !== "stack") {
      return undefined;
    }
    return props.theme ? colorScaleOptions || props.theme.props.colorScale
    : colorScaleOptions;
  }

  // the old ones were bad
  getNewChildren(props, childComponents, calculatedProps) {
    const { datasets } = calculatedProps;
    const childProps = this.getChildProps(props, calculatedProps);
    const getAnimationProps = Wrapper.getAnimationProps.bind(this);

    return childComponents.map((child, index) => {
      const data = this.addLayoutData(props, calculatedProps, datasets, index);
      const style = Wrapper.getChildStyle(child, index, calculatedProps);
      const labels = props.labels ? this.getLabels(props, datasets, index) : child.props.labels;

      return React.cloneElement(child, assign({
        animate: getAnimationProps(props, child, index),
        key: index,
        labels,
        domainPadding: child.props.domainPadding || props.domainPadding,
        theme: props.theme,
        labelComponent: props.labelComponent || child.props.labelComponent,
        style,
        colorScale: this.getColorScale(props, child),
        data
      }, childProps));
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

  getStyle(theme, style, role) {
    const defaultStyle = theme && theme[role] && theme[role].style ? theme[role].style : {};
    return Helpers.getStyles(style, defaultStyle, "auto", "100%");
  }

  render() {
    const { role } = this.constructor;
    const props = this.state && this.state.nodesWillExit ?
      this.state.oldProps || this.props : this.props;
    const modifiedProps = Helpers.modifyProps(props, fallbackProps, role);
    const { eventKey, containerComponent} = modifiedProps;
    const childComponents = React.Children.toArray(modifiedProps.children);
    const calculatedProps = this.getCalculatedProps(modifiedProps, childComponents);
    const newChildren = this.getNewChildren(modifiedProps, childComponents, calculatedProps);
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
