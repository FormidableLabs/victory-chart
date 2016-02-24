/* eslint no-unused-expressions: 0 */
/* eslint-disable no-magic-numbers */
require("babel-polyfill");
import constrainTickLabels from "src/components/victory-axis/constrain-tick-labels";

const mockMeasureText = function * (measurements) {
  const mapper = (measurement) => (tick, index) => {
    return {
      text: tick,
      measurement: measurement[index],
      index
    };
  };
  for (const measurement of measurements) {
    const tickValues = yield;
    yield tickValues.map(mapper(measurement));
  }
};

const mockMeasureTicks = (generator) => {
  return (props) => {
    const result = generator.next(props.tickValues).value;
    generator.next();
    return result;
  };
};

const defaultProps = {
  orientation: "top",
  style: {
    axis: {
      stroke: "black"
    },
    grid: {
      strokeWidth: 2
    },
    ticks: {},
    tickLabels: {
      fontSize: 18
    }
  },
  tickValues: [
    "Mets\nNY",
    "Giants\nSF",
    "Yankees\nNY",
    "Nationals\nDC",
    "Mariners\nSEA"
  ],
  height: 300,
  padding: 50,
  scale: "linear",
  standalone: true,
  tickCount: 5,
  width: 450
};

const defaultLayoutProps = {
  style: {
    parent: {
      height: 300,
      width: 450
    },
    axis: {
      stroke: "black",
      fill: "none",
      strokeWidth: 2,
      strokeLinecap: "round"
    },
    axisLabel: {
      stroke: "transparent",
      fill: "#756f6a",
      fontSize: 16,
      fontFamily: "Helvetica"
    },
    grid: {
      fill: "none",
      strokeLinecap: "round",
      strokeWidth: 2
    },
    ticks: {
      fill: "none",
      padding: 5,
      strokeWidth: 2,
      strokeLinecap: "round",
      size: 4
    },
    tickLabels: {
      stroke: "transparent",
      fill: "#756f6a",
      fontFamily: "Helvetica",
      fontSize: 18,
      padding: 5
    }
  },
  padding: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  },
  orientation: "top",
  isVertical: false,
  labelPadding: 0,
  offset: {
    x: 50,
    y: 50
  }
};

const defaultTickProps = {
  ticks: [1, 2, 3, 4, 5],
  stringTicks: true
};

describe("constrainTickLabels", () => {
  describe("with horizontal axis", () => {
    it("uses ellipses to prevent label collision", () => {
      const normalWidth = defaultProps.width / defaultProps.tickValues.length;
      const height = defaultLayoutProps.offset.y;
      const constants = Array(4).fill({
        width: `${normalWidth}px`, height: `${height}px`
      });
      const measureTextGenerator = mockMeasureText([
        [...constants, {width: `${normalWidth + 20}px`, height: `${height}px`}],
        [...constants, {width: `${normalWidth + 10}px`, height: `${height}px`}],
        [...constants, {width: `${normalWidth}px`, height: `${height}px`}],
        [...constants, {width: `${normalWidth}px`, height: `${height}px`}]
      ]);
      measureTextGenerator.next();
      const ticks = constrainTickLabels({
        props: defaultProps,
        layoutProps: defaultLayoutProps,
        tickProps: defaultTickProps,
        measureFunc: mockMeasureTicks(measureTextGenerator)
      });

      expect(ticks).to.not.have.deep.property(
        "failedConstraints"
      );

      const { tickValues } = ticks;
      expect(JSON.stringify(tickValues)).to.equal(
        JSON.stringify([
          "Mets\nNY",
          "Giants\nSF",
          "Yankees\nNY",
          "Nationals\nDC",
          "Mar...\nSEA"
        ])
      );
    });

    it("uses line deletion to prevent vertical overflow", () => {
      const normalWidth = defaultProps.width / defaultProps.tickValues.length;
      const height = defaultLayoutProps.offset.y;
      const constants = Array(4).fill({
        width: `${normalWidth}px`, height: `${height}px`
      });
      const measureTextGenerator = mockMeasureText([
        [...constants, {width: `${normalWidth}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth}px`, height: `${height}px`}]
      ]);
      measureTextGenerator.next();
      const ticks = constrainTickLabels({
        props: defaultProps,
        layoutProps: defaultLayoutProps,
        tickProps: defaultTickProps,
        measureFunc: mockMeasureTicks(measureTextGenerator)
      });

      expect(ticks).to.not.have.deep.property(
        "failedConstraints"
      );

      const { tickValues } = ticks;
      expect(JSON.stringify(tickValues)).to.equal(
        JSON.stringify([
          "Mets\nNY",
          "Giants\nSF",
          "Yankees\nNY",
          "Nationals\nDC",
          "Mariners"
        ])
      );
    });

    it(`uses ellipses to prevent label collision and
        label deletion to prevent vertical overflow`, () => {
      const normalWidth = defaultProps.width / defaultProps.tickValues.length;
      const height = defaultLayoutProps.offset.y;
      const constants = Array(4).fill({
        width: `${normalWidth}px`, height: `${height}px`
      });
      const measureTextGenerator = mockMeasureText([
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth - 10}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth - 10}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth - 10}px`, height: `${height - 10}px`}]
      ]);
      measureTextGenerator.next();
      const ticks = constrainTickLabels({
        props: defaultProps,
        layoutProps: defaultLayoutProps,
        tickProps: defaultTickProps,
        measureFunc: mockMeasureTicks(measureTextGenerator)
      });

      expect(ticks).to.not.have.deep.property(
        "failedConstraints"
      );

      const { tickValues } = ticks;
      expect(JSON.stringify(tickValues)).to.equal(
        JSON.stringify([
          "Mets\nNY",
          "Giants\nSF",
          "Yankees\nNY",
          "Nationals\nDC",
          "Mari..."
        ])
      );
    });

    it("adds a failedConstraints prop if constraints can't be resolved", () => {
      const normalWidth = defaultProps.width / defaultProps.tickValues.length;
      const height = defaultLayoutProps.offset.y;
      const constants = Array(4).fill({
        width: `${normalWidth}px`, height: `${height}px`
      });

      const measureTextGenerator = mockMeasureText([
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}]
      ]);
      measureTextGenerator.next();

      const ticks = constrainTickLabels({
        props: defaultProps,
        layoutProps: defaultLayoutProps,
        tickProps: defaultTickProps,
        measureFunc: mockMeasureTicks(measureTextGenerator)
      });

      expect(ticks).to.have.deep.property(
        "failedConstraints.width", true
      );
      expect(ticks).to.have.deep.property(
        "failedConstraints.height", true
      );
    });
  });

  describe("with vertical axis", () => {
    it("uses ellipses to prevent label collision", () => {
      const { size, padding } = defaultLayoutProps.style.ticks;
      const normalWidth = defaultLayoutProps.offset.x - size - padding;
      const height = defaultProps.height / defaultProps.tickValues.length;
      const constants = Array(4).fill({
        width: `${normalWidth}px`, height: `${height}px`
      });
      const measureTextGenerator = mockMeasureText([
        [...constants, {width: `${normalWidth + 20}px`, height: `${height}px`}],
        [...constants, {width: `${normalWidth + 10}px`, height: `${height}px`}],
        [...constants, {width: `${normalWidth}px`, height: `${height}px`}],
        [...constants, {width: `${normalWidth}px`, height: `${height}px`}]
      ]);
      measureTextGenerator.next();
      const ticks = constrainTickLabels({
        props: defaultProps,
        layoutProps: {
          ...defaultLayoutProps,
          isVertical: true,
          orientation: "left"
        },
        tickProps: defaultTickProps,
        measureFunc: mockMeasureTicks(measureTextGenerator)
      });

      expect(ticks).to.not.have.deep.property(
        "failedConstraints"
      );

      const { tickValues } = ticks;
      expect(JSON.stringify(tickValues)).to.equal(
        JSON.stringify([
          "Mets\nNY",
          "Giants\nSF",
          "Yankees\nNY",
          "Nationals\nDC",
          "Mar...\nSEA"
        ])
      );
    });

    it("uses line deletion to prevent vertical overflow", () => {
      const { size, padding } = defaultLayoutProps.style.ticks;
      const normalWidth = defaultLayoutProps.offset.x - size - padding;
      const height = defaultProps.height / defaultProps.tickValues.length;
      const constants = Array(4).fill({
        width: `${normalWidth}px`, height: `${height}px`
      });
      const measureTextGenerator = mockMeasureText([
        [...constants, {width: `${normalWidth}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth}px`, height: `${height}px`}]
      ]);
      measureTextGenerator.next();

      const ticks = constrainTickLabels({
        props: defaultProps,
        layoutProps: {
          ...defaultLayoutProps,
          isVertical: true,
          orientation: "left"
        },
        tickProps: defaultTickProps,
        measureFunc: mockMeasureTicks(measureTextGenerator)
      });

      expect(ticks).to.not.have.deep.property(
        "failedConstraints"
      );

      const { tickValues } = ticks;
      expect(JSON.stringify(tickValues)).to.equal(
        JSON.stringify([
          "Mets\nNY",
          "Giants\nSF",
          "Yankees\nNY",
          "Nationals\nDC",
          "Mariners"
        ])
      );
    });

    it(`uses ellipses to prevent label collision and
        label deletion to prevent vertical overflow`, () => {
      const { size, padding } = defaultLayoutProps.style.ticks;
      const normalWidth = defaultLayoutProps.offset.x - size - padding;
      const height = defaultProps.height / defaultProps.tickValues.length;
      const constants = Array(4).fill({
        width: `${normalWidth}px`, height: `${height}px`
      });

      const measureTextGenerator = mockMeasureText([
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth - 10}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth - 10}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth - 10}px`, height: `${height - 10}px`}]
      ]);
      measureTextGenerator.next();

      const ticks = constrainTickLabels({
        props: defaultProps,
        layoutProps: {
          ...defaultLayoutProps,
          isVertical: true,
          orientation: "left"
        },
        tickProps: defaultTickProps,
        measureFunc: mockMeasureTicks(measureTextGenerator)
      });

      expect(ticks).to.not.have.deep.property(
        "failedConstraints"
      );

      const { tickValues } = ticks;
      expect(JSON.stringify(tickValues)).to.equal(
        JSON.stringify([
          "Mets\nNY",
          "Giants\nSF",
          "Yankees\nNY",
          "Nationals\nDC",
          "Mari..."
        ])
      );
    });

    it("adds a failedConstraints prop if constraints can't be resolved", () => {
      const { size, padding } = defaultLayoutProps.style.ticks;
      const normalWidth = defaultLayoutProps.offset.x - size - padding;
      const height = defaultProps.height / defaultProps.tickValues.length;
      const constants = Array(4).fill({
        width: `${normalWidth}px`, height: `${height}px`
      });

      const measureTextGenerator = mockMeasureText([
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}],
        [...constants, {width: `${normalWidth + 20}px`, height: `${height + 20}px`}]
      ]);
      measureTextGenerator.next();

      const ticks = constrainTickLabels({
        props: defaultProps,
        layoutProps: {
          ...defaultLayoutProps,
          isVertical: true,
          orientation: "left"
        },
        tickProps: defaultTickProps,
        measureFunc: mockMeasureTicks(measureTextGenerator)
      });

      expect(ticks).to.have.deep.property(
        "failedConstraints.width", true
      );
      expect(ticks).to.have.deep.property(
        "failedConstraints.height", true
      );
    });
  });
});

