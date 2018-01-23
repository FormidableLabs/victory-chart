/* eslint-disable no-unused-expressions,react/no-multi-comp */
import ContainerHelpers from "src/components/containers/container-helpers";

describe("containers/container-helpers", () => {

  describe("withinBounds", () => {

    it("returns true when within bounds", () => {
      const point = { x: 1, y: 1 };
      const bounds = { x1: 0, x2: 2, y1: 0, y2: 2 };
      const isWithinBoundsResults = ContainerHelpers.withinBounds(point, bounds);
      expect(isWithinBoundsResults).to.eql(true);
    });

    it("returns false when not within bounds", () => {
      const point = { x: 10, y: 1 };
      const bounds = { x1: 0, x2: 2, y1: 0, y2: 2 };
      const isWithinBoundsResults = ContainerHelpers.withinBounds(point, bounds);
      expect(isWithinBoundsResults).to.eql(false);
    });

    it("returns true when within bounds using dates", () => {
      const point = { x: new Date("1/2/2017"), y: 1 };
      const bounds = { x1: new Date("1/1/2017"), x2: new Date("2/1/2017"), y1: 0, y2: 2 };
      const isWithinBoundsResults = ContainerHelpers.withinBounds(point, bounds);
      expect(isWithinBoundsResults).to.eql(true);
    });

    it("returns false when not within bounds using dates", () => {
      const point = { x: new Date("3/2/2017"), y: 1 };
      const bounds = { x1: new Date("1/1/2017"), x2: new Date("2/1/2017"), y1: 0, y2: 2 };
      const isWithinBoundsResults = ContainerHelpers.withinBounds(point, bounds);
      expect(isWithinBoundsResults).to.eql(false);
    });
  });
});
