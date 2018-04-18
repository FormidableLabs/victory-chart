import PropTypes from "prop-types";
import React from "react";
import { VictoryContainer, Selection } from "victory-core";
import SelectionHelpers from "./selection-helpers";
import { assign, defaults, throttle, isFunction, includes } from "lodash";

let experimentalGlobalRef = null;

export const selectionContainerMixin = (base) => class VictorySelectionContainer extends base {
  static displayName = "VictorySelectionContainer";
  static propTypes = {
    ...VictoryContainer.propTypes,
    activateSelectedData: PropTypes.bool,
    allowSelection: PropTypes.bool,
    disable: PropTypes.bool,
    onSelection: PropTypes.func,
    onSelectionCleared: PropTypes.func,
    selectionBlacklist: PropTypes.arrayOf(PropTypes.string),
    selectionComponent: PropTypes.element,
    selectionDimension: PropTypes.oneOf(["x", "y"]),
    selectionStyle: PropTypes.object
  };
  static defaultProps = {
    ...VictoryContainer.defaultProps,
    activateSelectedData: true,
    allowSelection: true,
    selectionComponent: <rect/>,
    selectionStyle: {
      stroke: "transparent",
      fill: "black",
      fillOpacity: 0.1
    }
  };


  constructor() {
    super();
    experimentalGlobalRef = this;
    this.state = {
      selecting: false
    };
  };

  static defaultEvents = (props) => {
    return [{
      target: "parent",
      eventHandlers: {
        onMouseUp: (...params) => experimentalGlobalRef.onMouseUp(...params)
      }
    }
    ];
  };

  getRect(props) {
    const { selectionStyle, selectionComponent } = props;
    const { x1, x2, y1, y2, selecting } = this.state;

    if (!selecting) return false;

    const width = Math.abs(x2 - x1) || 1;
    const height = Math.abs(y2 - y1) || 1;
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    return React.cloneElement(selectionComponent, { x, y, width, height, style: selectionStyle });
  }

  onMouseDown = (evt) => {
    // start selection
    const { x, y } = Selection.getSVGEventCoordinates(evt);
    this.setState({ x1: x, y1: y, selecting: true });
  }

  onMouseUp = (evt, targetProps) => {
    // end selection
    this.setState({ selecting: false }); 
    
    // do child data selection
    const { activateSelectedData } = targetProps;

    const augmentedProps = { ...targetProps, ...this.state };

    const datasets = SelectionHelpers.getDatasets(targetProps);
    const bounds = Selection.getBounds(augmentedProps);
    const selectedData = SelectionHelpers.filterDatasets(augmentedProps, datasets, bounds);
    const mutatedProps = {
      selectedData, datasets, select: false, x1: null, x2: null, y1: null, y2: null
    };
    const callbackMutation = selectedData && isFunction(targetProps.onSelection) ?
      targetProps.onSelection(selectedData, bounds, defaults({}, mutatedProps, targetProps)) : {};

    const dataMutation = selectedData && activateSelectedData ?
      selectedData.map((d) => {
        return {
          childName: d.childName, eventKey: d.eventKey, target: "data",
          mutation: () => {
            return assign({ active: true }, callbackMutation);
          }
        };
      }) : [];

    return dataMutation;
  }

  onMouseMove = (evt) => {
    const { x, y } = Selection.getSVGEventCoordinates(evt);
    this.setState({ x2: x, y2: y });
  }

  // Overrides method in VictoryContainer
  getChildren(props) {
    const children = React.Children.toArray(props.children);
    return [...children, this.getRect(props)].map((component, i) => {
      return component ? React.cloneElement(component, { key: i }) : null;
    });
  }

  // Overrides method in VictoryContainer
  renderContainer(props, svgProps, style) {
    const newSvgProps = {
      ...svgProps,
      // this functions cause no mutations. it'd be nice if the could be super-efficient
      // they also *override* the event system, and that's not a good thing
      onMouseMove: this.onMouseMove,
      onMouseDown: this.onMouseDown,
    };
    return super.renderContainer(props, newSvgProps, style);
  }
};

export default selectionContainerMixin(VictoryContainer);
