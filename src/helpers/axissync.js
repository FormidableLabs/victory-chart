import { TextSize } from "victory-core";
import Axis from "./axis";
import VictoryAxis from "../components/victory-axis/victory-axis.js";
import AxisHelper from "../components/victory-axis/helper-methods.js";
import { defaults, range, groupBy, flatten, merge } from "lodash";
import * as d3 from "d3";

const defaultFontSize = 12;

const fallbackProps = {
  width: 450,
  height: 300,
  padding: 50
};

const getShortestString = (domain) => {
  const domainStrs = d3.scaleLinear().domain(domain).nice().domain().map((elem) => String(elem));
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
    tickInterval: d3.tickStep(domain[0], domain[1], tickCount)
  };
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

const getTicksForAxisWithSync = (isVertical, axisGroup) => {
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
  return syncTicks(
    axisGroup.map((axisObj) => {
      return Object.assign(
        getTicksAndInterval(
          axisObj.props, getLabelCount(isVertical, axisObj.props, maxMinSize)
        ), { index: axisObj.index }
      );
    })
  );
};

const getTicksWithoutSync = (isVertical, axisGroup) =>
  axisGroup.map((axisObj) => {
    const minSize = getSize(isVertical,
      TextSize.approximateTextSize(
        getShortestString(axisObj.props.domain),
        defaults(axisObj.props.style.tickLabels, { fontSize: defaultFontSize })
      )
    );
    return merge(
      getTicksAndInterval(
        axisObj.props, getLabelCount(isVertical, axisObj.props, minSize)
      ), { index: axisObj.index }
    );
  });

const sync = (axisPropsArr) => {
  const modifyPropsArray = axisPropsArr.map((props) =>
    defaults(props, VictoryAxis.defaultProps, fallbackProps)
  );
  const groupedAxis = groupBy(
    modifyPropsArray.map((props, index) => ({ index, props })),
    (obj) => Axis.isVertical(obj.props)
  );
  const result = flatten(Object.keys(groupedAxis).map((key) => {
    const isVertical = key === "true";
    const axisGroup = groupedAxis[isVertical];
    return axisGroup.length > 1
      ? getTicksForAxisWithSync(isVertical, axisGroup)
      : getTicksWithoutSync(isVertical, axisGroup);
  }));
  return result.sort((obj1, obj2) => obj1.index > obj2.index).map((obj) => obj.ticks);
};

export default sync;
