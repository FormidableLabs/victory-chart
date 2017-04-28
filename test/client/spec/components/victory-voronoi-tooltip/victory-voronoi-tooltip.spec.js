/**
 * Client tests
 */
/* global sinon */
/*eslint-disable max-nested-callbacks */
/* eslint no-unused-expressions: 0 */
import React from "react";
import { range, omit } from "lodash";
import { shallow, mount } from "enzyme";
import SvgTestHelper from "../../../../svg-test-helper";
import VictoryVoronoiTooltip from "src/components/victory-voronoi-tooltip/victory-voronoi-tooltip";
import { VictoryTooltip, Voronoi } from "victory-core";

describe("components/victory-voronoi-tooltip", () => {
  describe("default component rendering", () => {
    it("renders an svg with the correct width and height", () => {
      const wrapper = mount(
        <VictoryVoronoiTooltip/>
      );
      const svg = wrapper.find("svg");
      expect(svg.prop("style").width).to.equal("100%");
      expect(svg.prop("style").height).to.equal("auto");
    });

    it("renders an svg with the correct viewbox", () => {
      const wrapper = mount(
        <VictoryVoronoiTooltip/>
      );
      const svg = wrapper.find("svg");
      const viewBoxValue =
        `0 0 ${450} ${300}`;
      expect(svg.prop("viewBox")).to.equal(viewBoxValue);
    });
  });

  describe("component rendering with data", () => {
    it("renders the correct d3 path", () => {
      const props = {
        width: 400,
        height: 300,
        padding: 50,
        domain: { x: [0, 5], y: [0, 5] },
        data: [{ x: 0, y: 0 }, { x: 2, y: 3 }, { x: 4, y: 1 }]
      };
      const wrapper = shallow(
        <VictoryVoronoiTooltip {...props}/>
      );

      const voronoi = wrapper.find(Voronoi);
      voronoi.forEach((node, index) => {
        SvgTestHelper.expectCorrectD3Path(node, props, "voronoi", index);
      });
    });

    it("sorts data by sortKey prop", () => {
      const data = range(5).map((i) => ({ x: i, y: i })).reverse();
      const wrapper = shallow(
        <VictoryVoronoiTooltip data={data} sortKey="x"/>
      );

      const xValues = wrapper.find(Voronoi).map((voronoi) => voronoi.prop("datum")._x);
      expect(xValues).to.eql([0, 1, 2, 3, 4]);
    });
  });

  describe("event handling", () => {
    it("attaches an event to the parent svg", () => {
      const clickHandler = sinon.spy();
      const wrapper = mount(
        <VictoryVoronoiTooltip
          events={[{
            target: "parent",
            eventHandlers: { onClick: clickHandler }
          }]}
        />
      );
      const svg = wrapper.find("svg");
      svg.simulate("click");
      expect(clickHandler).called;
      // the first argument is the standard evt object
      expect(clickHandler.args[0][1])
        .to.include.keys("data", "scale", "width", "height", "style");
    });

    it(" has automatic data events that show tooltips", () => {
      const wrapper = mount(
        <VictoryVoronoiTooltip
          data={[
            { x: 1, y: -5, label: "yo" },
            { x: 2, y: 4, label: "yo" },
            { x: 3, y: 2, label: "yo" }
          ]}
        />
      );
      const Data = wrapper.find(Voronoi);
      Data.forEach((node, index) => {
        const tooltip = wrapper.find(VictoryTooltip);
        expect(tooltip.at(index).props()).to.contain({ active: false });
        node.simulate("mouseOver");
        expect(tooltip.at(index).props()).to.contain({ active: true });
      });
    });

    it("attaches an event to data", () => {
      const clickHandler = sinon.spy();
      const wrapper = mount(
        <VictoryVoronoiTooltip
          events={[{
            target: "data",
            eventHandlers: { onClick: clickHandler }
          }]}
        />
      );
      const Data = wrapper.find(Voronoi);
      Data.forEach((node, index) => {
        const initialProps = Data.at(index).props();
        node.simulate("click");
        expect(clickHandler.called).to.equal(true);
        // the first argument is the standard evt object
        expect(omit(clickHandler.args[index][1], ["events", "key"]))
          .to.eql(omit(initialProps, ["events", "key"]));
        expect(`${clickHandler.args[index][2]}`).to.eql(`${index}`);
      });
    });

    it("attaches an event to a label", () => {
      const clickHandler = sinon.spy();
      const wrapper = mount(
        <VictoryVoronoiTooltip
          label="okay"
          events={[{
            target: "labels",
            eventHandlers: { onClick: clickHandler }
          }]}
        />
      );
      const Labels = wrapper.find(VictoryTooltip);
      Labels.forEach((node, index) => {
        node.childAt(0).simulate("click");
        expect(clickHandler).called;
        // the first argument is the standard evt object
        expect(clickHandler.args[index][1]).to.contain({ text: "okay" });
      });
    });
  });

  describe("accessibility", () => {
    it("adds an area role to the path area", () => {
      const wrapper = mount(<VictoryVoronoiTooltip/>);
      wrapper.find("path").nodes.forEach((p) => {
        const { attributes: attr } = p;
        const role = attr.getNamedItem("role");
        if (role) {
          const roleValue = role.value;
          expect(roleValue).to.be.a("string");
          expect(roleValue).to.equal("presentation");
        }
      });
    });
  });
});
