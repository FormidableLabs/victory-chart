import { Selection } from "victory-core";
import { throttle, isFunction } from "lodash";
import { attachId } from "../../helpers/event-handlers";
import ContainerHelpers from "./container-helpers";

const CursorHelpers = {
  onMouseMove(evt, targetProps) {
    const { onCursorChange, cursorDimension, domain } = targetProps;
    const cursorSVGPosition = Selection.getSVGEventCoordinates(evt);
    let cursorValue = Selection.getDataCoordinates(
      targetProps,
      targetProps.scale,
      cursorSVGPosition.x,
      cursorSVGPosition.y
    );

    const inBounds = ContainerHelpers.withinBounds(cursorValue, {
      x1: domain.x[0],
      x2: domain.x[1],
      y1: domain.y[0],
      y2: domain.y[1]
    });
    // console.log("//////");
    // console.log(inBounds);
    // console.log(cursorValue);
    // console.log(targetProps);

    if (!inBounds) {
      cursorValue = null;
    }

    if (isFunction(onCursorChange)) {
      if (inBounds) {
        const value = cursorDimension ? cursorValue[cursorDimension] : cursorValue;
        onCursorChange(value, targetProps);
      } else if (cursorValue !== targetProps.cursorValue) {
        onCursorChange(targetProps.defaultCursorValue || null, targetProps);
      }
    }

    return [{
      target: "parent",
      eventKey: "parent",
      mutation: () => ({ cursorValue })
    }];
  }
};

export default {
  onMouseMove: throttle(
    attachId(CursorHelpers.onMouseMove.bind(CursorHelpers)),
    32, // eslint-disable-line no-magic-numbers
    { leading: true, trailing: false })
};
