/* eslint no-unused-expressions: 0 */
/* global sinon */
import AxisHelpers from "src/components/victory-axis/helper-methods";
import { Helpers, Domain, Scale } from "victory-core";

describe("victory-axis/helper-methods", () => {
  describe("getDomain", () => {
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(Domain, "getDomainFromTickValues");
      const fakeGetAxis = () => "x";
      sandbox.stub(AxisHelpers, "getAxis", fakeGetAxis);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("determines a domain from props", () => {
      const props = { domain: [1, 2] };
      const domainResult = AxisHelpers.getDomain(props);
      expect(Domain.getDomainFromTickValues).notCalled;
      expect(domainResult).to.eql([1, 2]);
    });

    it("calculates a domain from tickValues", () => {
      const props = { tickValues: [1, 2, 3, 4] };
      const domainResult = AxisHelpers.getDomain(props);
      expect(Domain.getDomainFromTickValues).calledWith(props)
        .and.returned([1, 4]);
      expect(domainResult).to.eql([1, 4]);
    });

    it("does not calculate a domain from too few tick values", () => {
      const props = { tickValues: [0] };
      const domainResult = AxisHelpers.getDomain(props);
      expect(Domain.getDomainFromTickValues).not.called;
      expect(domainResult).to.equal(undefined);
    });

    it("returns undefined if the given axis doesn't match this axis", () => {
      const props = { domain: [1, 3] };
      const domainResultX = AxisHelpers.getDomain(props, "x");
      expect(AxisHelpers.getAxis).calledWith(props).and.returned("x");
      expect(domainResultX).to.eql([1, 3]);
      const domainResultY = AxisHelpers.getDomain(props, "y");
      expect(AxisHelpers.getAxis).calledWith(props).and.returned("x");
      expect(domainResultY).to.be.undefined;
    });
  });

  describe("getAxis", () => {
    it("determines the axis based on orientation prop", () => {
      expect(AxisHelpers.getAxis({ orientation: "top" })).to.equal("x");
      expect(AxisHelpers.getAxis({ orientation: "bottom" })).to.equal("x");
      expect(AxisHelpers.getAxis({ orientation: "left" })).to.equal("y");
      expect(AxisHelpers.getAxis({ orientation: "right" })).to.equal("y");
    });

    it("determines the axis based on type (dependent / independent)", () => {
      expect(AxisHelpers.getAxis({ dependentAxis: true })).to.equal("y");
      expect(AxisHelpers.getAxis({})).to.equal("x");
    });

    it("determines the axis based on type when flipped", () => {
      expect(AxisHelpers.getAxis({ dependentAxis: true }, true)).to.equal("x");
      expect(AxisHelpers.getAxis({}, true)).to.equal("y");
    });
  });

  describe("getScale", () => {
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(AxisHelpers, "getDomain");
      const fakeGetAxis = () => "x";
      sandbox.stub(AxisHelpers, "getAxis", fakeGetAxis);
      sandbox.spy(Scale, "getBaseScale");
      const fakeGetRange = () => [0, 100];
      sandbox.stub(Helpers, "getRange", fakeGetRange);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("returns a scale", () => {
      const props = { domain: [0, 10] };
      const scaleResult = AxisHelpers.getScale(props);
      expect(AxisHelpers.getAxis).calledWith(props).and.returned("x");
      expect(Scale.getBaseScale).calledWith(props, "x");
      expect(AxisHelpers.getDomain).calledWith(props).and.returned([0, 10]);
      expect(Helpers.getRange).calledWith(props, "x").and.returned([0, 100]);
      expect(scaleResult.domain()).to.eql([0, 10]);
      expect(scaleResult.range()).to.eql([0, 100]);
    });
  });

  describe("getTicks", () => {
    let sandbox;
    const scale = Scale.getBaseScale({ scale: { x: "linear" } }, "x");
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(Helpers, "stringTicks");
      sandbox.spy(scale, "ticks");
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("returns tickValues from props", () => {
      const props = { tickValues: [1, 2, 3] };
      const tickResult = AxisHelpers.getTicks(props);
      expect(Helpers.stringTicks).calledWith(props).and.returned(false);
      expect(tickResult).to.eql(props.tickValues);
    });

    it("returns converts string tickValues to numbers", () => {
      const props = { tickValues: ["a", "b", "c", "d"] };
      const tickResult = AxisHelpers.getTicks(props);
      expect(Helpers.stringTicks).calledWith(props).and.returned(true);
      expect(tickResult).to.eql([1, 2, 3, 4]);
    });

    it("calculates tickValues from scale.ticks()", () => {
      const props = { tickCount: 5 };
      AxisHelpers.getTicks(props, scale);
      expect(scale.ticks).calledWith(5);
    });

    it("calculates tickValues from scale.ticks(), and removes zero if axes cross", () => {
      const props = { tickCount: 5, crossAxis: true };
      const tickResult = AxisHelpers.getTicks(props, scale);
      expect(scale.ticks).calledWith(5);
      expect(tickResult).to.be.an("array").and.not.have.members([0]);
    });
  });

  describe("getTickFormat", () => {
    let sandbox;
    const scale = Scale.getBaseScale({ scale: { x: "linear" } }, "x");
    const ticks = [1, 2, 3, 4, 5];
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(Helpers, "stringTicks");
      sandbox.stub(scale, "tickFormat");
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("returns tickFormat function from props", () => {
      const props = { tickFormat: (x) => x * 5 };
      const tickProps = { scale, ticks };
      const formatResult = AxisHelpers.getTickFormat(props, tickProps);
      expect(Helpers.stringTicks).notCalled;
      expect(scale.tickFormat).notCalled;
      expect(formatResult).to.eql(props.tickFormat);
    });

    it("converts tickFormat array from props to a function", () => {
      const props = { tickFormat: [1, 2, 3, 4, 5] };
      const tickProps = { scale, ticks };
      const formatResult = AxisHelpers.getTickFormat(props, tickProps);
      expect(Helpers.stringTicks).notCalled;
      expect(scale.tickFormat).notCalled;
      expect(formatResult).to.be.a("function");
    });

    it("converts tickFormat string array from props to a function", () => {
      const props = { tickValues: ["cats", "dogs", "birds"] };
      const tickProps = { scale, ticks };
      const formatResult = AxisHelpers.getTickFormat(props, tickProps);
      expect(Helpers.stringTicks).calledWith(props).and.returned(true);
      expect(scale.tickFormat).notCalled;
      expect(formatResult).to.be.a("function");
    });

    it("calculates a tick format from scale", () => {
      const props = {};
      const tickProps = { scale, ticks };
      const formatResult = AxisHelpers.getTickFormat(props, tickProps);
      expect(Helpers.stringTicks).calledWith(props).and.returned(false);
      expect(formatResult).to.be.a("function");
    });
  });
});
