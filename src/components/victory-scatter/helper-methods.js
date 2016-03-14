import values from "lodash/object/values";
import pathHelpers from "./path-helpers";
import { Helpers } from "victory-core";

export default {
  getSymbol(data, props) {
    if (props.bubbleProperty) {
      return "circle";
    }
    return data.symbol || props.symbol;
  },

  getBubbleSize(datum, props, calculatedProps) {
    const {data, z} = calculatedProps;
    const getMaxRadius = () => {
      const minPadding = Math.min(...values(Helpers.getPadding(props)));
      return Math.max(minPadding, 5);
    };
    const zData = data.map((point) => point.z);
    const zMin = Math.min(...zData);
    const zMax = Math.max(...zData);
    const maxRadius = props.maxBubbleSize || getMaxRadius();
    const maxArea = Math.PI * Math.pow(maxRadius, 2);
    const area = ((datum[z] - zMin) / (zMax - zMin)) * maxArea;
    const radius = Math.sqrt(area / Math.PI);
    return Math.max(radius, 1);
  },

  getSize(data, props, calculatedProps) {
    if (data.size) {
      return typeof data.size === "function" ? data.size : Math.max(data.size, 1);
    } else if (typeof props.size === "function") {
      return props.size;
    } else if (data[calculatedProps.z]) {
      return this.getBubbleSize(data, props, calculatedProps);
    } else {
      return Math.max(props.size, 1);
    }
  },

  getPath({x, y, symbol, size, data}) {
    const pathFunctions = {
      circle: pathHelpers.circle,
      square: pathHelpers.square,
      diamond: pathHelpers.diamond,
      triangleDown: pathHelpers.triangleDown,
      triangleUp: pathHelpers.triangleUp,
      plus: pathHelpers.plus,
      star: pathHelpers.star
    };
    const evaluatedSize = Helpers.evaluateProp(size, data);
    const evaluatedSymbol = Helpers.evaluateProp(symbol, data);
    return pathFunctions[evaluatedSymbol].call(null, x, y, evaluatedSize);
  }
};
