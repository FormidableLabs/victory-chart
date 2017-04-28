/* global sinon */
/* eslint-disable no-unused-expressions,react/no-multi-comp */
import Wrapper from "src/helpers/wrapper";
import React from "react";
import { VictoryAxis, VictoryLine } from "src/index";


describe("helpers/wrapper", () => {
  const getVictoryLine = (props) => React.createElement(VictoryLine, props);
  const getVictoryAxis = (props) => React.createElement(VictoryAxis, props);

  describe("getY0", () => {
    const data = [
      [{ _x: 1, _y: 0 }, { _x: 2, _y: 0 }, { _x: 3, _y: 0 }],
      [{ _x: 1, _y: 1 }, { _x: 2, _y: 1 }, { _x: 3, _y: 1 }],
      [{ _x: 1, _y: 2 }, { _x: 2, _y: 2 }, { _x: 3, _y: 2 }]
    ];
    const mixedData = [
      [{ _x: 1, _y: 1 }, { _x: 2, _y: 1 }, { _x: 3, _y: 1 }],
      [{ _x: 1, _y: 3 }, { _x: 2, _y: 3 }, { _x: 3, _y: 3 }],
      [{ _x: 1, _y: -1 }, { _x: 2, _y: -1 }, { _x: 3, _y: -1 }],
      [{ _x: 1, _y: -2 }, { _x: 2, _y: -2 }, { _x: 3, _y: -2 }]
    ];
    it("returns the sum of the previous data sets", () => {
      const result = Wrapper.getY0({ _x: 2, _y: 2 }, 2, { datasets: data });
      expect(result).to.eql(1);
    });
    it("returns the sum of the previous data sets only when data is the same sign", () => {
      const result = Wrapper.getY0({ _x: 2, _y: -2 }, 3, { datasets: mixedData });
      expect(result).to.eql(-1);
    });
  });

  describe("getDomain", () => {
    const victoryLine = getVictoryLine({ domain: [0, 3] });
    const xAxis = getVictoryAxis({ dependentAxis: false });
    const yAxis = getVictoryAxis({ dependentAxis: true });
    const childComponents = [victoryLine, xAxis, yAxis];
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(Wrapper, "getDomainFromChildren");
      sandbox.spy(victoryLine.type, "getDomain");
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("calculates a domain from props", () => {
      const props = { domain: { x: [1, 2], y: [2, 3] } };
      const domainResultX = Wrapper.getDomain(props, "x", childComponents);
      expect(victoryLine.type.getDomain).notCalled;
      expect(domainResultX).to.eql([1, 2]);
    });

    it("calculates a domain from child components", () => {
      const props = { children: childComponents };
      const domainResultX = Wrapper.getDomain(props, "x", childComponents);
      expect(Wrapper.getDomainFromChildren).calledWith(props, "x", childComponents);
      expect(victoryLine.type.getDomain).calledWith(victoryLine.props);
      expect(domainResultX).to.eql(victoryLine.props.domain);
    });
  });

  describe("getStringsFromData", () => {
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(Wrapper, "getStringsFromData");
    });
    afterEach(() => {
      sandbox.restore();
    });

    it("returns an array of strings from a data prop", () => {
      const props = { data: [{ x: "one", y: 1 }, { x: "red", y: 2 }, { x: "cat", y: 3 }] };
      const childComponents = [getVictoryLine(props)];
      const dataStrings = Wrapper.getStringsFromData(childComponents, "x");
      expect(dataStrings).to.eql(["one", "red", "cat"]);
    });

    it("returns an array of strings from array-type data", () => {
      const props = { data: [["one", 1], ["red", 2], ["cat", 3]], x: 0, y: 1 };
      const childComponents = [getVictoryLine(props)];
      const dataStrings = Wrapper.getStringsFromData(childComponents, "x");
      expect(dataStrings).to.eql(["one", "red", "cat"]);
    });

    it("only returns strings, if data is mixed", () => {
      const props = { data: [{ x: 1, y: 1 }, { x: "three", y: 3 }] };
      const childComponents = [getVictoryLine(props)];
      expect(Wrapper.getStringsFromData(childComponents, "x")).to.eql(["three"]);
    });

    it("returns an empty array when no strings are present", () => {
      const props = { data: [{ x: 1, y: 1 }, { x: 3, y: 3 }] };
      const childComponents = [getVictoryLine(props)];
      expect(Wrapper.getStringsFromData(childComponents, "x")).to.eql([]);
    });

    it("returns an empty array when no children are given", () => {
      expect(Wrapper.getStringsFromData([], "x")).to.eql([]);
    });
  });

  describe("getCategories", () => {
    it.skip("returns a set of categories from a component", () => {
      // const categoryResult = Wrapper.getCategories();
    });

    it.skip("returns undefined if no categories are defined", () => {

    });
  });

});
