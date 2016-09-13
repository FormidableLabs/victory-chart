import { TextSize } from "victory-core";
import Axis from "./axis";
import VictoryAxis from "../components/victory-axis/victory-axis.js";
import AxisHelper from "../components/victory-axis/helper-methods.js";
import { defaults, range, groupBy, flatten, merge } from "lodash";
import { tickStep } from "d3-array";
import { scaleLinear } from "d3-scale";

const defaultFontSize = 12;

const fallbackProps = {
  width: 450,
  height: 300,
  padding: 50
};

const getShortestString = (domain) => {
  const domainStrs = scaleLinear().domain(domain).nice().domain().map((elem) => String(elem));
  return domainStrs.reduce((short, cur) => cur.length < short.length ? cur : short, domainStrs[0]);
};

const getSize = (isVertical, sizeObj) => isVertical ? sizeObj.height : sizeObj.width;

const getLabelCount = (isVertical, props, size) =>
  Math.max(Math.floor((getSize(isVertical, props)) / size), 2);

const getTicksAndInterval = (axisProps, tickCount) => {
  const domain = AxisHelper.getDomain(axisProps);
  const scaleFunc = AxisHelper.getScale(axisProps);
  const props = merge(axisProps, { tickCount });
  return {
    ticks: AxisHelper.getTicks(props, scaleFunc),
    tickInterval: tickStep(domain[0], domain[1], tickCount)
  };
};

/**
   * @param {boolean} isVertical: Is vertical axis group
   * @param {Object[]} axisGroup: Array of axis props and axis index
   * @returns {Object[]} array of axis ticks, interval and index.
   * Preserves the order of the input array.
*/
const getMultiAxisTicksAndInterval = (isVertical, axisGroup) => {
  const maxMinSize = Math.max.apply(null,
    axisGroup.map((obj) =>
      getSize(isVertical,
        TextSize.approximateTextSize(
          getShortestString(obj.props.domain),
          defaults(obj.props.style.tickLabels, { fontSize: defaultFontSize })
        )
      )
    )
  );
  return axisGroup.map((axisObj) => {
    return Object.assign(
      getTicksAndInterval(
        axisObj.props, getLabelCount(isVertical, axisObj.props, maxMinSize)
      ), { index: axisObj.index }
    );
  });
};

const recalcTicks = (firstTick, tickInterval, index) =>
  firstTick instanceof Date
    ? new Date(firstTick.getTime() + tickInterval * (index))
    : firstTick + tickInterval * (index);

const syncTicks = (axisTicksArray) => {
  const maxLength = Math.max.apply(null, axisTicksArray.map((tickObj) => tickObj.ticks.length));
  return axisTicksArray.map((obj) =>
    ({
      index: obj.index,
      ticks: range(maxLength).map((index) => recalcTicks(obj.ticks[0], obj.tickInterval, index))
    })
  );
};
 /**
   * @param {Object[]} axisPropsArr: Array of axis props
   * @param {Function} getMultiAxisTickAndIntervalFunc: Getting ticks, intervals and indexes
   * for sorting from object with axis props and axis index.
   * @returns {Object[]} array of axis ticks. Preserves the order of the input array.
*/
const sync = (axisPropsArr, getMultiAxisTickAndIntervalFunc) => {
  const getTicksFunc = getMultiAxisTickAndIntervalFunc || getMultiAxisTicksAndInterval;
  const modifyPropsArray = axisPropsArr.map((props) =>
    defaults(props, VictoryAxis.defaultProps, fallbackProps)
  );
  const groupedAxis = groupBy(
    modifyPropsArray.map((props, index) => ({ index, props })),
    (obj) => Axis.isVertical(obj.props)
  );
  const result = flatten(Object.keys(groupedAxis).map((key) => {
    const isVertical = key === "true";
    const ticks = getTicksFunc(isVertical, groupedAxis[isVertical]);
    return syncTicks(ticks);
  }));
  return result.sort((obj1, obj2) => obj1.index > obj2.index).map((obj) => obj.ticks);
};

export default {sync, getMultiAxisTicksAndInterval};
