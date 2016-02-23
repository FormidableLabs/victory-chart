import measureText from "measure-text";
import Helpers from "./helper-methods.js";

const parsePx = (string) => parseFloat(
  string.replace("px", "")
);

const textToArray = (text) => {
  return typeof text === "string"
    ? text.split("\n")
    : text.toString().split("\n");
};

const getFontWeight = (fontWeight) => {
  if (fontWeight) {
    return typeof fontWeight === "function"
      ? fontWeight() : fontWeight;
  }
  return "normal";
};

const measureTicks = (props, layoutProps, tickProps) => {
  const { fontSize, fontWeight } = props.style.tickLabels;
  const { fontFamily } = layoutProps.style.tickLabels;
  const tickFormat = Helpers.getTickFormat(props, tickProps);

  return props.tickValues.map((tick, index) => {
    const text = tickFormat(tick, index);
    const measurement = measureText({
      text: textToArray(text),
      fontFamily,
      fontSize: `${fontSize}px`,
      lineHeight: 1.2, // TODO: where do you find this?
      fontWeight: getFontWeight(fontWeight),
      canvas: props.canvas
    });
    return { text, measurement, index };
  });
};

const measurementMaximums = (props, layoutProps) => {
  if (layoutProps.isVertical) {
    const { size, padding } = layoutProps.style.ticks;
    const availableSize = layoutProps.offset.x - size - padding;
    return {
      ellipses: availableSize,
      lineDeletions: props.height
    };
  }
  return {
    ellipses: props.width,
    lineDeletions: layoutProps.offset.y
  };
};

const truncate = (label) => {
  const CHARACTERS_TO_TRUNCATE = 4;

  const lines = label.split("\n");

  // If the text is single-line, don't split it
  if (lines.length === 1) {
    return `${label.text.slice(0, -CHARACTERS_TO_TRUNCATE)}...`;
  }

  // truncate the longest line of multi-line text
  const longestLine = lines.reduce((prev, next, index) => {
    return next.length > prev.length
      ? {text: next, index}
      : {text: prev, index: index - 1};
  });
  const truncatedLine = longestLine.text.slice(
    0, -CHARACTERS_TO_TRUNCATE
  );
  const newLines = lines.slice();
  newLines[longestLine.index] = `${truncatedLine}...`;
  return newLines.join("\n");
};

const deleteOverflowingLines = (label) => {
  const lines = label.split("\n");
  return lines.slice(0, -1).join("\n"); // eslint-disable-line no-magic-numbers
};

const constrain = ({
  props,
  layoutProps,
  tickProps,
  dimension,
  maximum,
  hasNeighbors,
  resolver,
  guard,
  guardWarning,
  measureFunc
}) => {
  const measurements = measureFunc(props, layoutProps, tickProps);

  const allEqual = measurements.every((item, index, array) => {
    return item.measurement[dimension] === array[0].measurement[dimension];
  });

  if (allEqual) {
    return {props, layoutProps, tickProps};
  }

  const outlier = measurements.reduce((prev, next) => {
    const prevDim = parsePx(prev.measurement[dimension]);
    const nextDim = parsePx(next.measurement[dimension]);
    return nextDim > prevDim ? next : prev;
  });

  const outlierNumber = parsePx(outlier.measurement[dimension]);
  const outlierSize = hasNeighbors
    ? outlierNumber * measurements.length
    : outlierNumber;

  if (outlierSize <= maximum) {
    return {props, layoutProps, tickProps};
  }

  const newTickValues = props.tickValues.slice();
  const resolvedText = resolver(outlier.text);

  if (guard(resolvedText)) {
    return {
      props: {
        ...props,
        tickValues: newTickValues,
        failedConstraints: {
          ...props.failedConstraints,
          [dimension]: true,
          [`${dimension}Warning`]: guardWarning
        }
      },
      layoutProps,
      tickProps
    };
  }

  newTickValues[outlier.index] = resolvedText;
  return constrain(
    {props: {...props, tickValues: newTickValues}, layoutProps, tickProps,
    dimension, maximum, hasNeighbors, resolver, guard, guardWarning, measureFunc}
  );
};

const constrainTickLabels = ({
  props,
  layoutProps,
  tickProps,
  measureFunc = measureTicks
}) => {
  const maximums = measurementMaximums(props, layoutProps);

  const ellipsizedLabels = constrain({
    props, layoutProps, tickProps,
    dimension: "width",
    maximum: maximums.ellipses,
    hasNeighbors: !layoutProps.isVertical,
    resolver: truncate,
    guard: (text) => text.indexOf("...") === 0,
    guardWarning: `The tick label font size is too large to avoid horizontal
      label overlaps.  Try setting a smaller font size.`,
    measureFunc
  });

  const deletedLineLabels = constrain({
    props: ellipsizedLabels.props,
    layoutProps: ellipsizedLabels.layoutProps,
    tickProps: ellipsizedLabels.tickProps,
    dimension: "height",
    maximum: maximums.lineDeletions,
    hasNeighbors: layoutProps.isVertical,
    resolver: deleteOverflowingLines,
    guard: (text) => !text,
    guardWarning: `The tick label font size is too large to avoid vertical
      label overlaps. Try setting a smaller font size.`,
    measureFunc
  });

  const { tickValues, failedConstraints } = deletedLineLabels.props;
  if (failedConstraints) {
    return { tickValues, failedConstraints };
  }
  return { tickValues };
};

export default constrainTickLabels;
