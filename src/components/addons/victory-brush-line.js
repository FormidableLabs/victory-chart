import React from "react";
import PropTypes from "prop-types";
import { Selection, Line } from "victory-core";
import { assign, defaults, isEqual, isFunction } from "lodash";

const toRange = (props, domain) => {
  const scale = props.scale[props.dimension];
  return [scale(Math.min(...domain)), scale(Math.max(...domain))];
};

const toDomain = (props, range) => {
  const scale = props.scale[props.dimension];
  return [scale.invert(Math.min(...range), scale.invert(Math.max(...range)))]
};

const getFullRange = (props) => {
  const scale = props.scale[props.dimension];
  return scale.range();
};

const getHandles = (props, range) => {
  const min = Math.min(...range);
  const max = Math.max(...range);
  const handleWidth = props.handleWidth / 2;
  return {
    min: [min - handleWidth, min + handleWidth], max: [max - handleWidth, max + handleWidth]
  };
};

const withinBound = (value, bound) => {
  return value >= Math.min(...bound) && value <= Math.max(...bound);
};

const getMinimumDomain = () => {
  return [0, 1 / Number.MAX_SAFE_INTEGER];
};

const panBox = (props, position) => {
  const { fullRange, range, startPosition } = props;
  const size = Math.abs(range[1] - range[0]);
  const globalMin = Math.min(...fullRange);
  const globalMax = Math.max(...fullRange);
  const delta = startPosition ? startPosition - position : 0;
  const min = Math.min(...range) - delta;
  const max = Math.max(...range) - delta;
  const constrainedMin = max > globalMax ? globalMax - size : min;
  const constrainedMax = min < globalMin ? globalMin + size : max;
  return [constrainedMin, constrainedMax];
};

export default class VictoryBrushLine extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    allowDrag: PropTypes.bool,
    allowResize: PropTypes.bool,
    brushAreaComponent: PropTypes.element,
    brushComponent: PropTypes.element,
    brushDimension: PropTypes.oneOf(["x", "y"]),
    brushWidth: PropTypes.number,
    brushDomain: PropTypes.array,
    brushStyle: PropTypes.object,
    brushAreaStyle: PropTypes.object,
    dimension: PropTypes.oneOf(["x", "y"]),
    handleComponent: PropTypes.element,
    handleStyle: PropTypes.object,
    handleWidth: PropTypes.number,
    lineComponent: PropTypes.element,
    onBrushDomainChange: PropTypes.func,
    scale: PropTypes.object,
    style: PropTypes.object,
    type: PropTypes.string
  };

  static defaultProps = {
    allowDrag: true,
    allowResize: true,
    brushAreaComponent: <rect/>,
    brushAreaStyle: {
      stroke: "transparent",
      fill: "black",
      fillOpacity: 0.1
    },
    brushComponent: <rect/>,
    brushStyle: {
      stroke: "black",
      fill: "black",
      opacity: 0.15
    },
    brushWidth: 10,
    handleComponent: <rect/>,
    handleStyle: {
      stroke: "transparent",
      fill: "transparent"
    },
    handleWidth: 8,
    lineComponent: <Line/>
  };

  static defaultEvents = (props) => {
    return [{
      target: props.type,
      eventHandlers: {
        onMouseMove: (evt, targetProps) => { // eslint-disable-line max-statements, complexity
          if (!targetProps.isPanning && !targetProps.isSelecting) {
            return {};
          }
          const {
            brushDimension, scale, isPanning, isSelecting, allowResize, allowDrag, dimension,
            onBrushDomainChange
          } = targetProps;
          const fullRange = targetProps.fullRange || getFullRange(targetProps);
          const position = Selection.getSVGEventCoordinates(evt)[dimension];

          if (allowDrag && isPanning) {
            const range = panBox(targetProps, position);
            const currentDomain = toDomain(targetProps, range);
            const startPosition = Math.max(...range) >= Math.max(...fullRange) ||
              Math.min(...range) <= Math.min(...fullRange) ?
              targetProps.startPosition : position;
            const mutatedProps = {
              currentDomain, startPosition, range, fullRange, isPanning: true
            };

            if (isFunction(onBrushDomainChange)) {
              onBrushDomainChange(currentDomain, defaults({}, mutatedProps, targetProps));
            }
            return [{
              mutation: () => mutatedProps
            }];
          } else if (allowResize && isSelecting) {
            const x2 = brushDimension !== "y" ? x : targetProps.x2;
            const y2 = brushDimension !== "x" ? y : targetProps.y2;
            const currentDomain =
              Selection.getBounds({ x2, y2, x1: targetProps.x1, y1: targetProps.y1, scale });

            const mutatedProps = { x2, y2, currentDomain };
            if (isFunction(onBrushDomainChange)) {
              onBrushDomainChange(currentDomain, defaults({}, mutatedProps, targetProps));
            }
            return [{
              target: "parent",
              mutation: () => mutatedProps
            }];
          }
          return {};
        },
        onMouseDown: (evt, targetProps) => {
          evt.preventDefault();
          const {
            cachedBrushDomain, scale, allowResize, allowDrag, dimension
          } = targetProps;

          // Don't trigger events for static brushes
          if (!allowResize && !allowDrag) {
            return {};
          }

          const fullDomain = targetProps.fullDomain || scale[dimension].domain();
          const fullRange = toRange(targetProps, fullDomain);
          const brushDomain = targetProps.brushDomain || fullDomain;
          const currentDomain = isEqual(brushDomain, cachedBrushDomain) ?
            targetProps.currentDomain || brushDomain || fullDomain :
            brushDomain || fullDomain;
          const position = Selection.getSVGEventCoordinates(evt)[dimension];
          const range = toRange(targetProps, currentDomain);
          const handles = getHandles(targetProps, range);

          const activeHandles = allowResize &&
            (withinBound(position, handles.min)) || (withinBound(position, handles.max));
          // If the event occurs in any of the handle regions, start a resize
          if (activeHandles) {
            return [{
              mutation: () => {
                return {
                  isSelecting: true, range, fullRange,
                  cachedBrushDomain: brushDomain, currentDomain, fullDomain
                };
              }
            }];
          } else if (withinBound(position, range) && !isEqual(fullDomain, currentDomain)) {
            // if the event occurs within a selected region start a panning event, unless the whole
            // domain is selected
            return [{
              mutation: () => ({
                isPanning: allowDrag, startPosition: position,
                range, fullRange,
                fullDomain, currentDomain, cachedBrushDomain: brushDomain
              })
            }];
          } else {
            // if the event occurs outside the region, or if the whole domain is selected,
            // start a new selection
            return allowResize ? [{
              mutation: () => ({
                isSelecting: allowResize,
                cachedBrushDomain: brushDomain,
                currentDomain: getMinimumDomain(),
                startPosition: position,
                range, fullRange, fullDomain
              })
            }] : {};
          }
        }
      }
    }];
  };

  // onMouseDown(evt, targetProps) { // eslint-disable-line max-statements
  //   evt.preventDefault();
  //   const {
  //     brushDimension, handleWidth, cachedBrushDomain, domain, allowResize, allowDrag
  //   } = targetProps;

  //   // Don't trigger events for static brushes
  //   if (!allowResize && !allowDrag) {
  //     return {};
  //   }

  //   const fullDomainBox = targetProps.fullDomainBox || this.getDomainBox(targetProps, domain);
  //   const { x, y } = Selection.getSVGEventCoordinates(evt);

  //   // Ignore events that occur outside of the maximum domain region
  //   if (!this.withinBounds({ x, y }, fullDomainBox, handleWidth)) {
  //     return {};
  //   }

  //   const brushDomain = defaults({}, targetProps.brushDomain, domain);

  //   const currentDomain = isEqual(brushDomain, cachedBrushDomain) ?
  //     targetProps.currentDomain || brushDomain || domain :
  //     brushDomain || domain;

  //   const domainBox = this.getDomainBox(targetProps, domain, currentDomain);

  //   const activeHandles = allowResize && this.getActiveHandles({ x, y }, targetProps, domainBox);
  //   // If the event occurs in any of the handle regions, start a resize
  //   if (activeHandles) {
  //     return [{
  //       target: "parent",
  //       mutation: () => {
  //         return {
  //           isSelecting: true, domainBox, fullDomainBox,
  //           cachedBrushDomain: brushDomain, currentDomain,
  //           ...this.getResizeMutation(domainBox, activeHandles)
  //         };
  //       }
  //     }];
  //   } else if (this.withinBounds({ x, y }, domainBox) && !isEqual(domain, currentDomain)) {
  //     // if the event occurs within a selected region start a panning event, unless the whole
  //     // domain is selected
  //     return [{
  //       target: "parent",
  //       mutation: () => ({
  //         isPanning: allowDrag, startX: x, startY: y, domainBox, fullDomainBox, currentDomain,
  //         cachedBrushDomain: brushDomain,
  //         ...domainBox // set x1, x2, y1, y2
  //       })
  //     }];
  //   } else {
  //     // if the event occurs outside the region, or if the whole domain is selected,
  //     // start a new selection
  //     return allowResize ? [{
  //       target: "parent",
  //       mutation: () => ({
  //         isSelecting: allowResize, domainBox, fullDomainBox,
  //         cachedBrushDomain: brushDomain,
  //         currentDomain: this.getMinimumDomain(),
  //         ...this.getSelectionMutation({ x, y }, domainBox, brushDimension)
  //       })
  //     }] : {};
  //   }
  // },

  // onMouseMove(evt, targetProps) { // eslint-disable-line max-statements, complexity
  //   // if a panning or selection has not been started, ignore the event
  //   if (!targetProps.isPanning && !targetProps.isSelecting) {
  //     return {};
  //   }
  //   const {
  //     brushDimension, scale, isPanning, isSelecting, fullDomainBox, onBrushDomainChange,
  //     allowResize, allowDrag
  //   } = targetProps;
  //   const { x, y } = Selection.getSVGEventCoordinates(evt);
  //   // Ignore events that occur outside of the maximum domain region
  //   if ((!allowResize && !allowDrag) || !this.withinBounds({ x, y }, fullDomainBox)) {
  //     return {};
  //   }
  //   if (allowDrag && isPanning) {
  //     const { startX, startY } = targetProps;
  //     const pannedBox = this.panBox(targetProps, { x, y });
  //     const constrainedBox = this.constrainBox(pannedBox, fullDomainBox);
  //     const currentDomain = Selection.getBounds({ ...constrainedBox, scale });
  //     const mutatedProps = {
  //       currentDomain,
  //       startX: pannedBox.x2 >= fullDomainBox.x2 || pannedBox.x1 <= fullDomainBox.x1 ?
  //         startX : x,
  //       startY: pannedBox.y2 >= fullDomainBox.y2 || pannedBox.y1 <= fullDomainBox.y1 ?
  //         startY : y,
  //       ...constrainedBox
  //     };

  //     if (isFunction(onBrushDomainChange)) {
  //       onBrushDomainChange(currentDomain, defaults({}, mutatedProps, targetProps));
  //     }
  //     return [{
  //       target: "parent",
  //       mutation: () => mutatedProps
  //     }];
  //   } else if (allowResize && isSelecting) {
  //     const x2 = brushDimension !== "y" ? x : targetProps.x2;
  //     const y2 = brushDimension !== "x" ? y : targetProps.y2;
  //     const currentDomain =
  //       Selection.getBounds({ x2, y2, x1: targetProps.x1, y1: targetProps.y1, scale });

  //     const mutatedProps = { x2, y2, currentDomain };
  //     if (isFunction(onBrushDomainChange)) {
  //       onBrushDomainChange(currentDomain, defaults({}, mutatedProps, targetProps));
  //     }
  //     return [{
  //       target: "parent",
  //       mutation: () => mutatedProps
  //     }];
  //   }
  //   return {};
  // },

  // onMouseUp(evt, targetProps) {
  //   const { x1, y1, x2, y2, onBrushDomainChange, domain, allowResize } = targetProps;
  //   // if the mouse hasn't moved since a mouseDown event, select the whole domain region
  //   if (allowResize && x1 === x2 || y1 === y2) {
  //     const mutatedProps = { isPanning: false, isSelecting: false, currentDomain: domain };
  //     if (isFunction(onBrushDomainChange)) {
  //       onBrushDomainChange(domain, defaults({}, mutatedProps, targetProps));
  //     }
  //     return [{
  //       target: "parent",
  //       mutation: () => mutatedProps
  //     }];
  //   }
  //   return [{
  //     target: "parent",
  //     mutation: () => ({ isPanning: false, isSelecting: false })
  //   }];
  // },

  // onMouseLeave(evt) {
  //   if (evt.target.nodeName === "svg") {
  //     return [{
  //       target: "parent",
  //       mutation: () => ({ isPanning: false, isSelecting: false })
  //     }];
  //   }
  //   return [];
  // }

  // componentWillMount() {
  //   this.style = this.getStyle(this.props);
  // }

  // shouldComponentUpdate(nextProps) {
    // const { className, datum, x1, x2, y1, y2 } = this.props;
    // const style = this.getStyle(nextProps);
    // if (!Collection.allSetsEqual([
    //   [className, nextProps.className],
    //   [x1, nextProps.x1],
    //   [x2, nextProps.x2],
    //   [y1, nextProps.y1],
    //   [y2, nextProps.y2],
    //   [style, this.style],
    //   [datum, nextProps.datum]
    // ])) {
    //   this.style = style;
    //   return true;
    // }
    // return false;
  // }

  // getStyle(props) {
  //   const { style, datum, active } = props;
  //   return Helpers.evaluateStyle(assign({ stroke: "black" }, style), datum, active);
  // }

  // // Overridden in victory-core-native
  // renderAxisLine(props, style, events) {
  //   const { role, shapeRendering, className } = this.props;
  //   return (
  //     <line
  //       {...props}
  //       className={className}
  //       style={style}
  //       role={role || "presentation"}
  //       shapeRendering={shapeRendering || "auto"}
  //       vectorEffect="non-scaling-stroke"
  //       {...events}
  //     />
  //   );
  // }

  // render() {
  //   const { x1, x2, y1, y2, events } = this.props;
  //   return this.renderAxisLine({ x1, x2, y1, y2 }, this.style, events);
  // }

  getRectDimensions(props, currentRange) {
    const { dimension, brushWidth } = props;
    const scale = props.scale[dimension];
    const range = currentRange || scale.range();
    const coordinates = dimension === "x" ?
      { y1: props.y1, y2: props.y2, x1: Math.min(...range), x2: Math.max(...range) } :
      { x1: props.x1, x2: props.x2, y1: Math.min(...range), y2: Math.max(...range) };
    const { x1, x2, y1, y2 } = coordinates;
    const offset = {
      x: dimension === "x" ? 0 : brushWidth / 2,
      y: dimension === "y" ? 0 : brushWidth / 2
    };

    const x = Math.min(x1, x2) - offset.x;
    const y = Math.min(y1, y2) - offset.y;
    const width = Math.max(x1, x2) + offset.x - x;
    const height = Math.max(y1, y2) + offset.y - y;
    return { x, y, width, height };

  }

  renderBrush(props) {
    const { brushComponent, events, brushStyle, brushDomain } = props;
    const brushRange = brushDomain ? toRange(props, brushDomain) : undefined;
    const range = props.range || brushRange;
    const rectDimensions = this.getRectDimensions(props, range);
    const style = brushStyle;
    const brushProps = assign({ style }, rectDimensions, events);
    return React.cloneElement(brushComponent, brushProps);
  }

  renderBrushArea(props) {
    const { brushAreaComponent, events, brushAreaStyle } = props;
    const rectDimensions = this.getRectDimensions(props);
    const style = brushAreaStyle;
    const brushAreaProps = assign({ style }, rectDimensions, events);
    return React.cloneElement(brushAreaComponent, brushAreaProps);
  }

  renderLine(props) {
    return <Line {...props}/>;
  }

  render() {
    return (
      <g>
        {this.renderLine(this.props)}
        {this.renderBrushArea(this.props)}
        {this.renderBrush(this.props)}
      </g>
    );
  }
}