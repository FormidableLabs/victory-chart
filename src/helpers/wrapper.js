import { defaults, flatten, isFunction, partialRight, uniq } from "lodash";
import React from "react";
import Axis from "./axis";
import Data from "./data";
import Domain from "./domain";
import {
  Style,
  ContinuousTransitions,
  Transitions,
  TransitionHelpers,
  Helpers,
  Collection
} from "victory-core";


export default {
  getData(props, childComponents) {
    childComponents = childComponents || React.Children.toArray(props.children);
    return this.getDataFromChildren(childComponents);
  },

  getDomain(props, axis, childComponents) {
    const propsDomain = Domain.getDomainFromProps(props, axis);
    if (propsDomain) {
      return Domain.padDomain(propsDomain, props, axis);
    }
    childComponents = childComponents || React.Children.toArray(props.children);
    const domain = this.getDomainFromChildren(props, axis, childComponents);
    return Domain.padDomain(domain, props, axis);
  },

  setAnimationState(nextProps) {
    if (!this.props.animate) {
      return;
    }

    if (this.props.animate.parentState) {
      const oldProps = this.props.animate.parentState.nodesWillEnter
        || this.props.animate.parentState.nodesWillExit
        ? this.props : null;
      this.setState(defaults({oldProps}, this.props.animate.parentState));
    } else {
      const oldChildren = React.Children.toArray(this.props.children);
      const nextChildren = React.Children.toArray(nextProps.children);
      const {
        nodesWillExit,
        nodesWillEnter,
        childrenTransitions,
        nodesShouldEnter,
        nodesShouldExit
      } = TransitionHelpers.getInitialTransitionState(oldChildren, nextChildren);

      this.setState({
        nodesWillExit,
        nodesWillEnter,
        childrenTransitions,
        nodesShouldEnter,
        nodesShouldExit,
        oldProps: nodesWillEnter || nodesWillExit ? this.props : null
      });
    }
  },

  getAnimationProps(props, child, index) {
    if (!props.animate) {
      return child.props.animate;
    }

    let childTransitions = Transitions;
    if (TransitionHelpers.checkContinuousChartType(child)) {
      childTransitions = ContinuousTransitions;
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
      const getTransitionProps = childTransitions.getTransitionPropsFactory(
        props,
        state,
        (newState) => this.setState(newState)
      );
      getTransitions = partialRight(getTransitionProps, index);
    }
    return defaults({getTransitions, parentState}, props.animate, child.props.animate);
  },

  getDomainFromChildren(props, axis, childComponents) {
    childComponents = childComponents || React.Children.toArray(props.children);
    const horizontalChildren = childComponents.some((child) => child.props.horizontal);
    const horizontal = props && props.horizontal || horizontalChildren.length > 0;
    const currentAxis = Axis.getCurrentAxis(axis, horizontal);
    const getChildDomains = (children) => {
      return children.reduce((memo, child) => {
        if (child.type && isFunction(child.type.getDomain)) {
          const childDomain = child.props && child.type.getDomain(child.props, currentAxis);
          return childDomain ? memo.concat(childDomain) : memo;
        } else if (child.props && child.props.children) {
          return memo.concat(getChildDomains(React.Children.toArray(child.props.children)));
        }
        return memo;
      }, []);
    };

    const childDomains = getChildDomains(childComponents);
    return childDomains.length === 0 ?
      [0, 1] : [Math.min(...childDomains), Math.max(...childDomains)];
  },

  getDataFromChildren(props, childComponents) {
    const getData = (childProps) => {
      const data = Data.getData(childProps);
      return Array.isArray(data) && data.length > 0 ? data : undefined;
    };

    const getChildData = (children) => {
      return children.map((child) => {
        if (child.type && isFunction(child.type.getData)) {
          const childData = child.props && child.type.getData(child.props);
          return childData;
        } else if (child.props && child.props.children) {
          return flatten(getChildData(React.Children.toArray(child.props.children)));
        }
        return getData(child.props);
      });
    };
    childComponents = childComponents || React.Children.toArray(props.children);
    return getChildData(childComponents);
  },

  getStackedDomain(props, axis) {
    const propsDomain = Domain.getDomainFromProps(props, axis);
    if (propsDomain) {
      return Domain.padDomain(propsDomain, props, axis);
    }
    const { horizontal } = props;
    const ensureZero = (domain) => {
      const isDependent = (axis === "y" && !horizontal) || (axis === "x" && horizontal);
      return isDependent ? [Math.min(...domain, 0), Math.max(... domain, 0)] : domain;
    };
    const datasets = this.getDataFromChildren(props);
    const dataDomain = ensureZero(Domain.getDomainFromGroupedData(props, axis, datasets));
    return Domain.padDomain(dataDomain, props, axis);
  },

  getColor(calculatedProps, index) {
    // check for styles first
    const { style, colorScale } = calculatedProps;
    if (style && style.data && style.data.fill) {
      return style.data.fill;
    }
    const colors = Array.isArray(colorScale) ?
      colorScale : Style.getColorScale(colorScale);
    return colors[index % colors.length];
  },

  getChildStyle(child, index, calculatedProps) {
    const { style } = calculatedProps;
    const role = child.type && child.type.role;
    const defaultFill = role === "group-wrapper" || role === "stack-wrapper" ?
      undefined : this.getColor(calculatedProps, index);
    const childStyle = child.props.style || {};
    const dataStyle = defaults({}, childStyle.data, style.data, {fill: defaultFill});
    const labelsStyle = defaults({}, childStyle.labels, style.labels);
    return {
      parent: style.parent,
      data: dataStyle,
      labels: labelsStyle
    };
  },

  getStringsFromCategories(childComponents, axis) {
    const stringsFromCategories = (children) => {
      return children.reduce((memo, child) => {
        if (child.props && child.props.categories) {
          return memo.concat(Data.getStringsFromCategories(child.props, axis));
        } else if (child.props && child.props.children) {
          return memo.concat(stringsFromCategories(
            React.Children.toArray(child.props.children)
          ));
        }
        return memo;
      }, []);
    };

    return stringsFromCategories(childComponents);
  },

  getStringsFromData(childComponents, axis) {
    const stringsFromData = (children) => {
      return children.reduce((memo, child) => {
        if (child.props && child.props.data) {
          return memo.concat(Helpers.getStringsFromData(child.props, axis));
        } else if (child.type && isFunction(child.type.getData)) {
          const data = flatten(child.type.getData(child.props));
          const attr = axis === "x" ? "xName" : "yName";
          return memo.concat(data.reduce((prev, datum) => {
            return datum[attr] ? prev.concat(datum[attr]) : prev;
          }, []));
        } else if (child.props && child.props.children) {
          return memo.concat(stringsFromData(React.Children.toArray(child.props.children)));
        }
        return memo;
      }, []);
    };

    return stringsFromData(childComponents);
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
