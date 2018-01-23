import { Selection, Data, Helpers } from "victory-core";
import { assign, defaults, throttle, isFunction } from "lodash";
import React from "react";
import { attachId } from "../../helpers/event-handlers";
import ContainerHelpers from "./container-helpers";

const SelectionHelpers = {
  getDatasets(props) {
    if (props.data) {
      return [{ data: props.data }];
    }

    const getData = (childProps) => {
      const data = Data.getData(childProps);
      return Array.isArray(data) && data.length > 0 ? data : undefined;
    };

    const iteratee = (child, childName, parent) => {
      if (child.type && child.type.role === "axis") {
        return null;
      } else if (child.type && isFunction(child.type.getData)) {
        child = parent ? React.cloneElement(child, parent.props) : child;
        const childData = child.props && child.type.getData(child.props);
        return childData ? { childName, data: childData } : null;
      } else {
        const childData = getData(child.props);
        return childData ? { childName, data: childData } : null;
      }
    };
    return Helpers.reduceChildren(React.Children.toArray(props.children), iteratee);
  },

  filterDatasets(props, datasets, bounds) {
    const filtered = datasets.reduce((memo, dataset) => {
      const selectedData = this.getSelectedData(props, dataset.data, bounds);
      memo = selectedData ?
        memo.concat({
          childName: dataset.childName, eventKey: selectedData.eventKey, data: selectedData.data
        }) :
        memo;
      return memo;
    }, []);
    return filtered.length ? filtered : null;
  },

  getSelectedData(props, dataset) {
    const eventKey = [];
    const data = [];
    let count = 0;
    dataset.forEach((datum, index) => {
      const scaledPoint = Helpers.scalePoint(props, datum);
      if (ContainerHelpers.withinBounds(scaledPoint, props)) {
        data[count] = datum;
        eventKey[count] = datum.eventKey === undefined ? index : datum.eventKey;
        count++;
      }
    });
    return count > 0 ? { eventKey, data } : null;
  },

  // eslint-disable-next-line complexity
  onMouseDown(evt, targetProps) {
    evt.preventDefault();
    const { allowSelection, polar } = targetProps;
    if (!allowSelection) {
      return {};
    }
    const dimension = targetProps.selectionDimension;
    const datasets = targetProps.datasets || [];
    const { x, y } = Selection.getSVGEventCoordinates(evt);
    const x1 = polar || dimension !== "y" ? x : Selection.getDomainCoordinates(targetProps).x[0];
    const y1 = polar || dimension !== "x" ? y : Selection.getDomainCoordinates(targetProps).y[0];
    const x2 = polar || dimension !== "y" ? x : Selection.getDomainCoordinates(targetProps).x[1];
    const y2 = polar || dimension !== "x" ? y : Selection.getDomainCoordinates(targetProps).y[1];

    const mutatedProps = { x1, y1, select: true, x2, y2 };
    if (isFunction(targetProps.onSelectionCleared)) {
      targetProps.onSelectionCleared(defaults({}, mutatedProps, targetProps));
    }
    return [
      {
        target: "parent",
        mutation: () => mutatedProps
      }, {
        target: "data",
        childName: targetProps.children || datasets.length ? "all" : undefined,
        eventKey: "all",
        mutation: () => null
      }
    ];
  },

  onMouseMove(evt, targetProps) {
    const { allowSelection, select, polar } = targetProps;
    const dimension = targetProps.selectionDimension;
    if (!allowSelection || !select) {
      return {};
    } else {
      const { x, y } = Selection.getSVGEventCoordinates(evt);
      const x2 = polar || dimension !== "y" ? x : Selection.getDomainCoordinates(targetProps).x[1];
      const y2 = polar || dimension !== "x" ? y : Selection.getDomainCoordinates(targetProps).y[1];
      return {
        target: "parent",
        mutation: () => {
          return { x2, y2 };
        }
      };
    }
  },

  onMouseUp(evt, targetProps) {
    const { allowSelection, x2, y2 } = targetProps;
    if (!allowSelection) {
      return {};
    }
    if (!x2 || !y2) {
      return [{
        target: "parent",
        mutation: () => {
          return { select: false, x1: null, x2: null, y1: null, y2: null };
        }
      }];
    }
    const datasets = this.getDatasets(targetProps);
    const bounds = Selection.getBounds(targetProps);
    const selectedData = this.filterDatasets(targetProps, datasets, bounds);
    const mutatedProps = { datasets, select: false, x1: null, x2: null, y1: null, y2: null };
    const callbackMutation = selectedData && isFunction(targetProps.onSelection) ?
      targetProps.onSelection(selectedData, bounds, defaults({}, mutatedProps, targetProps)) : {};
    const parentMutation = [{
      target: "parent",
      mutation: () => mutatedProps
    }];

    const dataMutation = selectedData ?
      selectedData.map((d) => {
        return {
          childName: d.childName, eventKey: d.eventKey, target: "data",
          mutation: () => {
            return assign({ active: true }, callbackMutation);
          }
        };
      }) : [];

    return parentMutation.concat(dataMutation);
  }
};

export default {
  ...SelectionHelpers,
  onMouseDown: SelectionHelpers.onMouseDown.bind(SelectionHelpers),
  onMouseUp: SelectionHelpers.onMouseUp.bind(SelectionHelpers),
  onMouseMove: throttle(
    attachId(SelectionHelpers.onMouseMove.bind(SelectionHelpers)),
    16, // eslint-disable-line no-magic-numbers
    { leading: true, trailing: false })
};
