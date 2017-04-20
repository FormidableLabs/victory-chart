import React from "react";
import {
  VictoryChart, VictoryLine, VictoryBar, VictoryArea,
  VictoryScatter, VictoryStack, VictoryGroup, VictoryAxis,
  VictoryCandlestick, VictoryErrorBar
} from "../../src/index";
import { VictoryTooltip } from "victory-core";

class App extends React.Component {
  render() {
    const containerStyle = {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center"
    };

    const parentStyle = {border: "1px solid #ccc", margin: "2%", maxWidth: "40%"};

    return (
      <div className="demo">
        <div style={containerStyle}>
          <VictoryBar
            style={{parent: parentStyle}}
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{stroke: "red"}}
                cornerRadius={0}
                pointerLength={20}
              />
            }
            labels={(d) => `hello #${d.x}`}
            data={[
              {x: 1, y: 1},
              {x: 2, y: 2},
              {x: 3, y: 3},
              {x: 4, y: 2},
              {x: 5, y: 1}
            ]}
          />

          <VictoryScatter
            style={{parent: parentStyle}}
            labelComponent={<VictoryTooltip/>}
            labels={(d) => `hello #${d.x}`}
            size={(d, active) => active ? 5 : 3}
            data={[
              {x: 1, y: 1},
              {x: 2, y: 2},
              {x: 3, y: 3},
              {x: 4, y: 2},
              {x: 5, y: 1}
            ]}
          />

          <VictoryLine
            style={{parent: parentStyle}}
            labelComponent={<VictoryTooltip/>}
            label="hello"
            data={[
              {x: 1, y: 1},
              {x: 2, y: 2},
              {x: 3, y: 3},
              {x: 4, y: 2},
              {x: 5, y: 1}
            ]}
          />

          <VictoryArea
            style={{parent: parentStyle}}
            labelComponent={<VictoryTooltip/>}
            label="hello"
            data={[
              {x: 1, y: 1},
              {x: 2, y: 2},
              {x: 3, y: 3},
              {x: 4, y: 2},
              {x: 5, y: 1}
            ]}
          />

          <VictoryCandlestick
            style={{parent: parentStyle}}
            labelComponent={<VictoryTooltip/>}
            labels={(d) => `hello #${d.x}`}
            data={[
              {x: 1, open: 5, close: 10, high: 15, low: 0},
              {x: 2, open: 15, close: 10, high: 20, low: 5},
              {x: 3, open: 15, close: 20, high: 25, low: 10},
              {x: 4, open: 20, close: 25, high: 30, low: 15},
              {x: 5, open: 30, close: 25, high: 35, low: 20}
            ]}
          />

          <VictoryErrorBar
            style={{parent: parentStyle}}
            labelComponent={<VictoryTooltip/>}
            labels={(d) => `hello #${d.x}`}
            data={[
              {x: 1, y: 1, errorX: [1, 0.5], errorY: .1},
              {x: 2, y: 2, errorX: [1, 3], errorY: .1},
              {x: 3, y: 3, errorX: [1, 3], errorY: [.2, .3]},
              {x: 4, y: 2, errorX: [1, 0.5], errorY: .1},
              {x: 5, y: 1, errorX: [1, 0.5], errorY: .2}
            ]}
          />

          <VictoryChart
            style={{parent: parentStyle}}
            containerComponent={<VictoryContainer />}
          >
            <VictoryGroup
              labels={["a", "b", "c"]}
              labelComponent={<VictoryTooltipInPortal/>}
              horizontal
              offset={35}
              colorScale={"qualitative"}
              style={{ data: {width: 20, pointerEvents: "all"}}}
            >
              <VictoryBar
                data={[
                  {x: 1, y: 1},
                  {x: 2, y: 2},
                  {x: 3, y: 5}
                ]}
              />
              <VictoryBar
                data={[
                  {x: 1, y: 2},
                  {x: 2, y: 1},
                  {x: 3, y: 7}
                ]}
              />
              <VictoryBar
                data={[
                  {x: 1, y: 3},
                  {x: 2, y: 4},
                  {x: 3, y: 9}
                ]}
              />
            </VictoryGroup>
         </VictoryChart>

         <VictoryChart style={{parent: parentStyle}}>
            <VictoryAxis/>
            <VictoryStack
              colorScale={"qualitative"}
              labels={["a", "b", "c"]}
              labelComponent={<VictoryTooltip/>}
              style={{ data: {width: 30, pointerEvents: "visible"}}}
            >
              <VictoryBar
                data={[
                  {x: 1, y: 1},
                  {x: 2, y: 2},
                  {x: 3, y: 5}
                ]}
              />
              <VictoryBar
                data={[
                  {x: 1, y: 2},
                  {x: 2, y: 1},
                  {x: 3, y: 7}
                ]}
              />
              <VictoryBar
                data={[
                  {x: 1, y: 3},
                  {x: 2, y: 4},
                  {x: 3, y: 9}
                ]}
              />
            </VictoryStack>
         </VictoryChart>
        </div>
      </div>
    );
  }
}

class VictoryTooltipInPortal extends VictoryTooltip {
  static contextTypes = {
    portalUpdate: React.PropTypes.func,
    portalRegister: React.PropTypes.func,
    portalDeregister: React.PropTypes.func
  }

  render() {
    this.element = super.render();
    return null;
  }

  componentDidUpdate() {
    if (!this.portalKey) {
      this.portalKey = this.context.portalRegister();
    }
    this.context.portalUpdate(this.portalKey, this.element);
  }

  componentWillUnmount() {
    this.context.portalDeregister(this.portalKey);
  }
}

class SvgPortal extends React.Component {
  componentWillMount() {
    this.map = {};
    this.index = 1;
    this.portalUpdate = this.portalUpdate.bind(this);
    this.portalRegister = this.portalRegister.bind(this);
    this.portalDeregister = this.portalDeregister.bind(this);
  }

  portalRegister() {
    return ++this.index;
  }

  portalUpdate(key, element) {
    this.map[key] = element;
    this.forceUpdate();
  }

  portalDeregister(key) {
    delete this.map[key];
  }

  render() {
    return (
      <g>
        {Object.keys(this.map).map((key) => {
          const el = this.map[key];
          return el ? React.cloneElement(el, {key}) : el;
        })}
      </g>
    );
  }
}

class VictoryContainer extends React.Component {
  static displayName = "VictoryContainer";

  static defaultProps = {
    title: "Victory Chart",
    desc: ""
  }

  static childContextTypes = {
    portalUpdate: React.PropTypes.func,
    portalRegister: React.PropTypes.func,
    portalDeregister: React.PropTypes.func
  }

  componentWillMount() {
    this.portalUpdate = (key, el) => this.refs.portal.portalUpdate(key, el);
    this.portalRegister = () => this.refs.portal.portalRegister();
    this.portalDeregister = (key) => this.refs.portal.portalDeregister(key);
  }

  getChildContext() {
    return {
      portalUpdate: this.portalUpdate,
      portalRegister: this.portalRegister,
      portalDeregister: this.portalDeregister
    };
  }

  render() {
    return (
      <svg
        style={this.props.style}
        viewBox={`0 0 ${this.props.width} ${this.props.height}`}
        role="img"
        aria-labelledby="title desc"
        {...this.props.events}
      >
        <title id="title">{this.props.title}</title>
        <desc id="desc">{this.props.desc}</desc>
        {this.props.children}
        <SvgPortal ref="portal" />
      </svg>
      );
  }
}

export default App;
