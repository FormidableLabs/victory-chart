/**
 * Client tests
 */
/* global sinon */
/*eslint-disable max-nested-callbacks */
/* eslint no-unused-expressions: 0 */
import React from "react";
import { omit } from "lodash";
import { shallow, mount } from "enzyme";
import SvgTestHelper from "../../../../svg-test-helper";
import VictoryArea from "src/components/victory-area/victory-area";
import { VictoryLabel } from "victory-core";
import Area from "src/components/victory-area/area";

describe("components/victory-area", () => {
  describe("default component rendering", () => {
    it("renders an svg with the correct width and height", () => {
      const wrapper = shallow(
        <VictoryArea/>
      );
      const svg = wrapper.find("svg");
      expect(svg.prop("style").width).to.equal("100%");
      expect(svg.prop("style").height).to.equal("auto");
    });

    it("renders an svg with the correct viewbox", () => {
      const wrapper = shallow(
        <VictoryArea/>
      );
      const svg = wrapper.find("svg");
      const viewBoxValue =
        `0 0 ${VictoryArea.defaultProps.width} ${VictoryArea.defaultProps.height}`;
      expect(svg.prop("viewBox")).to.equal(viewBoxValue);
    });
  });

  describe("component rendering with data", () => {
    it("renders the correct d3 path", () => {
      const props = {
        width: 400,
        height: 300,
        padding: 50,
        scale: "linear",
        interpolation: "linear",
        data: [{x: 0, y: 0, y0: 0}, {x: 2, y: 3, y0: 0}, {x: 4, y: 1, y0: 0}]
      };
      const wrapper = shallow(
        <VictoryArea {...props}/>
      );

      const area = wrapper.find(Area);
      SvgTestHelper.expectCorrectD3Path(area, props, "area");
    });
  });

  describe("event handling", () => {
    it("attaches an event to data", () => {
      const clickHandler = sinon.spy();
      const wrapper = mount(
        <VictoryArea
          events={[{
            target: "data",
            eventHandlers: {onClick: clickHandler}
          }]}
        />
      );
      const DataComponent = wrapper.find(Area);
      DataComponent.forEach((node, index) => {
        const initialProps = DataComponent.at(index).props();
        node.childAt(0).simulate("click");
        expect(clickHandler).called;
        // the first argument is the standard evt object
        expect(omit(clickHandler.args[index][1], ["events", "key"]))
          .to.eql(omit(initialProps, ["events", "key"]));
      });
    });

    it("attaches an event to a label", () => {
      const clickHandler = sinon.spy();
      const wrapper = mount(
        <VictoryArea
          label="okay"
          events={[{
            target: "labels",
            eventHandlers: {onClick: clickHandler}
          }]}
        />
      );
      const Labels = wrapper.find(VictoryLabel);
      Labels.forEach((node, index) => {
        node.childAt(0).simulate("click");
        expect(clickHandler).called;
        // the first argument is the standard evt object
        expect(clickHandler.args[index][1]).to.contain({text: "okay"});
      });
    });
  });
});
