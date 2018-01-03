/* eslint-disable no-unused-expressions,react/no-multi-comp */
import BrushHelpers from "src/components/containers/brush-helpers";

describe("containers/brush-helpers", () => {

  describe("constrainBox", () => {

    it("returns correct box", () => {
      const fullDomainBox = { x1: 0, x2: 2, y1: 0, y2: 2 };
      const box = { x1: 1, x2: 2, y1: 1, y2: 2 };
      const constrainBoxResult = BrushHelpers.constrainBox(box, fullDomainBox);
      expect(constrainBoxResult).to.eql({ x1: 1, y1: 1, x2: 2, y2: 2 });
    });

    it("returns correct box when x axis is dates", () => {
      const fullDomainBox = { x1: new Date("1/2/2017 PST"),
        x2: new Date("2/1/2017 PST"), y1: 0, y2: 2 };
      const box = { x1: new Date("1/1/2017 PST"), x2: new Date("1/10/2017 PST"), y1: 1, y2: 2 };
      const constrainBoxResult = BrushHelpers.constrainBox(box, fullDomainBox);
      expect(constrainBoxResult).to.eql({ x1: 1483344000000, y1: 1, x2: 1484121600000, y2: 2 });
    });
  });
});
