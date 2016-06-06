/* eslint no-unused-expressions: 0 */
/* eslint-disable max-nested-callbacks */
/* global sinon */
import AreaHelpers from "src/components/victory-area/helper-methods";
import Data from "src/helpers/data";

describe("victory-area/helper-methods", () => {
  describe("getDataWithBaseline", () => {
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(Data, "getData", (props) => props.data);
    });

    afterEach(() => {
      sandbox.restore();
    });

    const data = [
      {x: 1, y: 1}, {x: 2, y: 1}
    ];
    const stackedData = [
      {x: 1, y: 1, yOffset: 1}, {x: 2, y: 1, yOffset: 1}
    ];
    const domain = {x: [0, 10], y: [0, 10]};
    const nonZeroDomain = {x: [0, 10], y: [1, 10]};
    const negativeDomain = {x: [0, 10], y: [-1, 10]};

    it("should return the minimum if yOffset is not present", () => {
      const props = {data};
      const result = AreaHelpers.getDataWithBaseline(props, domain);
      const expectedResult = [{y0: 0, y1: 1, x: 1, y: 1}, {y0: 0, y1: 1, x: 2, y: 1}];
      expect(result).to.eql(expectedResult);
    });

    it("should return the domain minimum when it is greater than zero", () => {
      const props = {data};
      const result = AreaHelpers.getDataWithBaseline(props, nonZeroDomain);
      const expectedResult = [{y0: 1, y1: 1, x: 1, y: 1}, {y0: 1, y1: 1, x: 2, y: 1}];
      expect(result).to.eql(expectedResult);
    });

    it("should return zero when the domain minimum is negative", () => {
      const props = {data};
      const result = AreaHelpers.getDataWithBaseline(props, negativeDomain);
      const expectedResult = [{y0: 0, y1: 1, x: 1, y: 1}, {y0: 0, y1: 1, x: 2, y: 1}];
      expect(result).to.eql(expectedResult);
    });

    it("should return yOffset if present", () => {
      const props = {data: stackedData};
      const result = AreaHelpers.getDataWithBaseline(props, domain);
      const expectedResult = [
        {y0: 1, y1: 2, x: 1, y: 1, yOffset: 1}, {y0: 1, y1: 2, x: 2, y: 1, yOffset: 1}
      ];
      expect(result).to.eql(expectedResult);
    });
  });
});
