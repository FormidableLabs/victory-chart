import { assign, defaults, flatten, isFunction, partialRight, uniq } from "lodash";
import React from "react";
import Axis from "./axis";
import Data from "./data";
import Domain from "./domain";
import { Style, Transitions, Helpers, Collection } from "victory-core";


export default {
  getData(props, childComponents) {
    if (props.data) {
      return Data.getData(props);
    }
    childComponents = childComponents || React.Children.toArray(props.children);
    return this.getDataFromChildren(childComponents);
  },

  getDomain(props, axis, childComponents) {
    childComponents = childComponents || React.Children.toArray(props.children);
    const propsDomain = Domain.getDomainFromProps(props, axis);
    if (propsDomain) {
      return propsDomain;
    }
    return Domain.cleanDomain(this.getDomainFromChildren(props, axis, childComponents),
      props,
      axis);
  },

  setAnimationState(nextProps) {
    if (!this.props.animate) {
      return;
    }
    if (this.props.animate.parentState) {
      const nodesWillExit = this.props.animate.parentState.nodesWillExit;
      const oldProps = nodesWillExit ? this.props : null;
      this.setState(defaults({oldProps}, this.props.animate.parentState));
    } else {
      const oldChildren = React.Children.toArray(this.props.children);
      const nextChildren = React.Children.toArray(nextProps.children);
      const {
        nodesWillExit,
        nodesWillEnter,
        childrenTransitions,
        nodesShouldEnter,
        nodesShouldLoad,
        nodesDoneLoad,
        nodesDoneClipPathLoad,
        nodesDoneClipPathEnter,
        nodesDoneClipPathExit
      } = Transitions.getInitialTransitionState(oldChildren, nextChildren);

      this.setState({
        nodesWillExit,
        nodesWillEnter,
        childrenTransitions,
        nodesShouldEnter,
        nodesDoneClipPathEnter,
        nodesDoneClipPathExit,
        nodesShouldLoad: nodesShouldLoad || this.state.nodesShouldLoad,
        nodesDoneLoad: nodesDoneLoad || this.state.nodesDoneLoad,
        nodesDoneClipPathLoad: nodesDoneClipPathLoad || this.state.nodesDoneClipPathLoad,
        oldProps: nodesWillExit ? this.props : null
      });
    }
  },

  getAnimationProps(props, child, index) {
    if (!props.animate) {
      return child.props.animate;
    }
    const getFilteredState = () => {
      let childrenTransitions = this.state && this.state.childrenTransitions;
      childrenTransitions = Collection.isArrayOfArrays(childrenTransitions) ?
        childrenTransitions[index] : childrenTransitions;
      return defaults({childrenTransitions}, this.state);
    };

    let getTransitions = props.animate && props.animate.getTransitions;
    const state = getFilteredState();
    const parentState = props.animate && props.animate.parentState || state;
    if (!getTransitions) {
      const getTransitionProps = Transitions.getTransitionPropsFactory(
        props,
        state,
        (newState) => this.setState(newState)
      );
      getTransitions = partialRight(getTransitionProps, index);
    }
    return defaults({getTransitions, parentState}, props.animate, child.props.animate);
  },

  getDomainFromChildren(props, axis, childComponents) { // eslint-disable-line max-statements, complexity, max-len
    const childDomains = [];
    let childDomainsLength = 0;

    const children = childComponents
      ? childComponents.slice(0)
      : React.Children.toArray(props.children);
    let childrenLength = children.length;

    const horizontalChildren = childComponents.some((child) => child.props.horizontal);
    const horizontal = props && props.horizontal || horizontalChildren.length > 0;
    const currentAxis = Axis.getCurrentAxis(axis, horizontal);

    while (childrenLength > 0) {
      const child = children[--childrenLength];

      if (child.type && isFunction(child.type.getDomain)) {
        const parentData = props.data ? Data.getData(props, axis) : undefined;
        const sharedProps = parentData ?
          assign({}, child.props, {data: parentData}) : child.props;
        const childDomain = child.props && child.type.getDomain(sharedProps, currentAxis);
        if (childDomain) {
          const childDomainLength = childDomain.length;
          for (let index = 0; index < childDomainLength; index++) {
            childDomains[childDomainsLength++] = childDomain[index];
          }
        }
      } else if (child.props && child.props.children) {
        const newChildren = React.Children.toArray(child.props.children);
        const newChildrenLength = newChildren.length;
        for (let index = 0; index < newChildrenLength; index++) {
          children[childrenLength++] = newChildren[index];
        }
      }
    }

    const min = Collection.getMinValue(childDomains);
    const max = Collection.getMaxValue(childDomains);
    return childDomains.length === 0 ?
      [0, 1] : [min, max];
  },

  getDataFromChildren(props, childComponents) {
    const getData = (childProps) => {
      const data = Data.getData(childProps);
      return Array.isArray(data) && data.length > 0 ? data : undefined;
    };

    const children = childComponents
      ? childComponents.slice(0)
      : React.Children.toArray(props.children);
    let childrenLength = children.length;

    const dataArr = [];
    let dataArrLength = 0;

    while (childrenLength > 0) {
      const child = children[--childrenLength];

      if (child.type && isFunction(child.type.getData)) {
        dataArr[dataArrLength++] = child.props && child.type.getData(child.props);
      } else if (child.props && child.props.children) {
        const newChildren = React.Children.toArray(child.props.children);
        const newChildrenLength = newChildren.length;
        for (let index = 0; index < newChildrenLength; index++) {
          children[childrenLength++] = newChildren[index];
        }
      } else {
        dataArr[dataArrLength++] = getData(child.props);
      }
    }

    return dataArr;
  },

  getStackedDomain(props, axis) {
    const propsDomain = Domain.getDomainFromProps(props, axis);
    if (propsDomain) {
      return propsDomain;
    }
    const { horizontal } = props;
    const ensureZero = (domain) => {
      const isDependent = (axis === "y" && !horizontal) || (axis === "x" && horizontal);
      return isDependent ? [Math.min(...domain, 0), Math.max(... domain, 0)] : domain;
    };
    const datasets = this.getDataFromChildren(props);
    return ensureZero(Domain.getDomainFromGroupedData(props, axis, datasets));
  },

  getColor(calculatedProps, child, index) {
    // check for styles first
    const { style } = calculatedProps;
    let { colorScale } = calculatedProps;
    if (style && style.data && style.data.fill) {
      return style.data.fill;
    }
    colorScale = child.props && child.props.colorScale ? child.props.colorScale : colorScale;
    if (!colorScale) {
      return undefined;
    }
    const colors = Array.isArray(colorScale) ?
      colorScale : Style.getColorScale(colorScale);
    return colors[index % colors.length];
  },

  getChildStyle(child, index, calculatedProps) {
    const { style } = calculatedProps;
    const role = child.type && child.type.role;
    const defaultFill = role === "stack-wrapper" ?
      undefined : this.getColor(calculatedProps, child, index);
    const defaultColor = role === "line" ?
      {fill: "none", stroke: defaultFill} : {fill: defaultFill};
    const childStyle = child.props.style || {};
    const dataStyle = defaults({}, childStyle.data, assign({}, style.data, defaultColor));
    const labelsStyle = defaults({}, childStyle.labels, style.labels);
    return {
      parent: style.parent,
      data: dataStyle,
      labels: labelsStyle
    };
  },

  getStringsFromCategories(childComponents, axis) { // eslint-disable-line max-statements
    const strings = [];
    let stringsLength = 0;

    const children = childComponents.slice(0);
    let childrenLength = children.length;

    while (childrenLength > 0) {
      const child = children[--childrenLength];

      if (child.props && child.props.categories) {
        const newStrings = Data.getStringsFromCategories(child.props, axis);
        const newStringsLength = newStrings.length;
        for (let index = 0; index < newStringsLength; index++) {
          strings[stringsLength++] = newStrings[index];
        }
      } else if (child.props && child.props.children) {
        const newChildren = React.Children.toArray(child.props.children);
        const newChildrenLength = newChildren.length;
        for (let index = 0; index < newChildrenLength; index++) {
          children[childrenLength++] = newChildren[index];
        }
      }
    }

    return strings;
  },

  getStringsFromData(childComponents, axis) { // eslint-disable-line max-statements
    const strings = [];
    let stringsLength = 0;

    const children = childComponents.slice(0);
    let childrenLength = children.length;

    while (childrenLength > 0) {
      const child = children[--childrenLength];

      if (child.props && child.props.data) {
        const newStrings = Helpers.getStringsFromData(child.props, axis);
        const newStringsLength = newStrings.length;
        for (let index = 0; index < newStringsLength; index++) {
          strings[stringsLength++] = newStrings[index];
        }
      } else if (child.type && isFunction(child.type.getData)) {
        const data = flatten(child.type.getData(child.props));
        const attr = axis === "x" ? "xName" : "yName";
        for (let index = 0; index < data.length; index++) {
          const datum = data[index];
          if (datum[attr]) {
            strings[stringsLength++] = datum[attr];
          }
        }
      } else if (child.props && child.props.children) {
        const newChildren = React.Children.toArray(child.props.children);
        const newChildrenLength = newChildren.length;
        for (let index = 0; index < newChildrenLength; index++) {
          children[childrenLength++] = newChildren[index];
        }
      }
    }

    return strings;
  },

  getStringsFromChildren(props, axis, childComponents) {
    childComponents = childComponents || React.Children.toArray(props.children);
    const axisComponent = Axis.getAxisComponent(childComponents, axis);
    const axisStrings = axisComponent ? Data.getStringsFromAxes(axisComponent.props, axis) : [];
    const categoryStrings = this.getStringsFromCategories(childComponents, axis);
    const dataStrings = this.getStringsFromData(childComponents, axis);
    return uniq(flatten([...categoryStrings, ...dataStrings, ...axisStrings]));
  },

  getCategories(props, axis) {
    const categories = Data.getCategories(props, axis) ||
      this.getStringsFromChildren(props, axis);
    return categories.length > 0 ? categories : undefined;
  },

  getY0(datum, index, calculatedProps) {
    const { datasets } = calculatedProps;
    const y = datum.y;
    const previousDataSets = datasets.slice(0, index);
    const previousPoints = previousDataSets.reduce((prev, dataset) => {
      return prev.concat(dataset
        .filter((previousDatum) => datum.x instanceof Date
          ? previousDatum.x.getTime() === datum.x.getTime()
          : previousDatum.x === datum.x)
        .map((previousDatum) => previousDatum.y || 0)
      );
    }, []);
    return previousPoints.reduce((memo, value) => {
      const sameSign = (y < 0 && value < 0) || (y >= 0 && value >= 0);
      return sameSign ? memo + value : memo;
    }, 0);
  }
};
