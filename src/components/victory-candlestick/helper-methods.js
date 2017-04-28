/*eslint no-magic-numbers: ["error", { "ignore": [0, 1] }]*/
import { assign, pick, sortBy, omit, defaults } from "lodash";
import { Helpers, Log, Scale, Domain, Data } from "victory-core";

export default {
  getBaseProps(props, fallbackProps) { // eslint-disable-line max-statements
    props = Helpers.modifyProps(props, fallbackProps, "candlestick");
    const calculatedValues = this.getCalculatedValues(props);
    const { data, style, scale, domain } = calculatedValues;
    const { groupComponent, width, height, padding, standalone, theme } = props;
    const initialChildProps = { parent: {
      domain, scale, width, height, data, standalone, theme, style: style.parent
    } };

    return data.reduce((childProps, datum, index) => {
      const eventKey = datum.eventKey || index;
      const x = scale.x(datum._x1 !== undefined ? datum._x1 : datum._x);
      const y1 = scale.y(datum._high);
      const y2 = scale.y(datum._low);
      const candleHeight = Math.abs(scale.y(datum._open) - scale.y(datum._close));
      const y = scale.y(Math.max(datum._open, datum._close));
      const dataStyle = this.getDataStyles(datum, style.data, props);
      const dataProps = {
        x, y, y1, y2, candleHeight, scale, data, datum, groupComponent,
        index, style: dataStyle, padding, width
      };

      childProps[eventKey] = {
        data: dataProps
      };
      const text = this.getLabelText(props, datum, index);
      if (text !== undefined && text !== null || props.events || props.sharedEvents) {
        childProps[eventKey].labels = this.getLabelProps(dataProps, text, style);
      }

      return childProps;
    }, initialChildProps);
  },

  getLabelProps(dataProps, text, calculatedStyle) {
    const { x, y1, index, scale, datum, data } = dataProps;
    const labelStyle = this.getLabelStyle(calculatedStyle.labels, dataProps) || {};
    return {
      style: labelStyle,
      y: y1 - (labelStyle.padding || 0),
      x,
      text,
      index,
      scale,
      datum,
      data,
      textAnchor: labelStyle.textAnchor,
      verticalAnchor: labelStyle.verticalAnchor || "end",
      angle: labelStyle.angle
    };
  },

  getCalculatedValues(props) {
    const { theme } = props;
    const defaultStyle = theme && theme.candlestick && theme.candlestick.style ?
      theme.candlestick.style : {};
    const style = Helpers.getStyles(props.style, defaultStyle, "auto", "100%");
    const data = Data.addEventKeys(props, this.getData(props));
    const range = {
      x: Helpers.getRange(props, "x"),
      y: Helpers.getRange(props, "y")
    };
    const domain = {
      x: this.getDomain(props, "x"),
      y: this.getDomain(props, "y")
    };
    const scale = {
      x: Scale.getBaseScale(props, "x").domain(domain.x).range(range.x),
      y: Scale.getBaseScale(props, "y").domain(domain.y).range(range.y)
    };
    return { domain, data, scale, style };
  },

  getData(props) {
    if (!props.data || props.data.length < 1) {
      Log.warn("This is an empty dataset.");
      return [];
    }
    const stringMap = {
      x: Data.createStringMap(props, "x")
    };

    const accessor = {
      x: Helpers.createAccessor(props.x !== undefined ? props.x : "x"),
      open: Helpers.createAccessor(props.open !== undefined ? props.open : "open"),
      close: Helpers.createAccessor(props.close !== undefined ? props.close : "close"),
      high: Helpers.createAccessor(props.high !== undefined ? props.high : "high"),
      low: Helpers.createAccessor(props.low !== undefined ? props.low : "low")
    };
    return this.sortData(props.data.map((datum, index) => {
      const evaluatedX = accessor.x(datum);
      const _x = evaluatedX !== undefined ? evaluatedX : index;
      const _open = accessor.open(datum);
      const _close = accessor.close(datum);
      const _high = accessor.high(datum);
      const _low = accessor.low(datum);
      const _y = [_open, _close, _high, _low];
      return assign(
        {},
        datum,
        { _x, _y, _open, _close, _high, _low },
        typeof _x === "string" ? { _x: stringMap.x[_x], x: _x } : {}
      );
    }), props.sortKey);
  },

  sortData(dataset, sortKey) {
    if (!sortKey) {
      return dataset;
    }

    if (sortKey === "x" || sortKey === "y") {
      sortKey = `_${sortKey}`;
    }

    return sortBy(dataset, sortKey);
  },

  getDomain(props, axis) {
    let domain;
    if (props.domain && props.domain[axis]) {
      domain = props.domain[axis];
    } else if (props.domain && Array.isArray(props.domain)) {
      domain = props.domain;
    } else {
      const dataset = this.getData(props);
      const allData = dataset.reduce((memo, datum) => {
        return Array.isArray(datum[`_${axis}`]) ?
         memo.concat(...datum[`_${axis}`]) : memo.concat(datum[`_${axis}`]);
      },
      []);

      if (allData.length < 1) {
        return Scale.getBaseScale(props, axis).domain();
      }

      const min = Math.min(...allData);
      const max = Math.max(...allData);
      if (min === max) {
        const adjustedMax = max === 0 ? 1 : max + max;
        return [0, adjustedMax];
      }
      domain = [min, max];
    }
    return Domain.cleanDomain(Domain.padDomain(domain, props, axis), props);
  },

  isTransparent(attr) {
    return attr === "none" || attr === "transparent";
  },

  getDataStyles(datum, style, props) {
    style = style || {};
    const stylesFromData = omit(datum, [
      "x", "y", "size", "name", "label", "open", "close", "high", "low"
    ]);
    const candleColor = datum.open > datum.close ?
      props.candleColors.negative : props.candleColors.positive;
    const fill = datum.fill || style.fill || candleColor;
    const strokeColor = datum.stroke || style.stroke;
    const stroke = this.isTransparent(strokeColor) ? fill : strokeColor || "black";
    return defaults({}, stylesFromData, { stroke, fill }, style);
  },

  getLabelText(props, datum, index) {
    return datum.label || (Array.isArray(props.labels) ?
      props.labels[index] : props.labels);
  },

  getLabelStyle(labelStyle, dataProps) {
    labelStyle = labelStyle || {};
    const { size, style } = dataProps;
    const matchedStyle = pick(style, ["opacity", "fill"]);
    const padding = labelStyle.padding || size * 0.25; // eslint-disable-line no-magic-numbers
    return defaults({}, labelStyle, matchedStyle, { padding });
  }
};
