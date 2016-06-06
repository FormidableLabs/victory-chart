/*global window:false*/
import React from "react";
import {VictoryBar, VictoryChart, VictoryGroup, VictoryStack } from "../../src/index";
import { VictorySharedEvents } from "victory-core";
import { assign, random, range, merge } from "lodash";

class Wrapper extends React.Component {
  static propTypes = {
    children: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(React.PropTypes.node),
      React.PropTypes.node
    ])
  };

  renderChildren(props) {
    const children = React.Children.toArray(props.children);
    return children.map((child) => {
      return React.cloneElement(child, assign({}, child.props, props));
    });
  }

  render() {
    return (
      <g>{this.renderChildren(this.props)}</g>
    );
  }
}

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      barData: this.getBarData(),
      barTransitionData: this.getBarTransitionData(),
      multiTransitionData: this.getMultiTransitionData(),
      numericBarData: this.getNumericBarData()
    };
  }

  getBarData() {
    return range(5).map(() => {
      return [
        {
          x: "rabbits",
          y: random(1, 5)
        },
        {
          x: "cats",
          y: random(1, 10)
        },
        {
          x: "dogs",
          y: random(0, 15)
        }
      ];
    });
  }

  getNumericBarData() {
    return range(5).map(() => {
      return [
        {
          x: random(1, 3),
          y: random(1, 5)
        },
        {
          x: random(4, 7),
          y: random(1, 10)
        },
        {
          x: random(9, 11),
          y: random(0, 15)
        }
      ];
    });
  }

  getBarTransitionData() {
    const bars = random(6, 10);
    return range(bars).map((bar) => {
      return {x: bar, y: random(2, 10)};
    });
  }

  getMultiTransitionData() {
    const bars = random(3, 5);
    return range(4).map(() => {
      return range(bars).map((bar) => {
        return {x: bar, y: random(2, 10)};
      });
    });
  }

  componentDidMount() {
    /* eslint-disable react/no-did-mount-set-state */
    this.setStateInterval = window.setInterval(() => {
      this.setState({
        barData: this.getBarData(),
        barTransitionData: this.getBarTransitionData(),
        multiTransitionData: this.getMultiTransitionData(),
        numericBarData: this.getNumericBarData()
      });
    }, 2000);
  }

  componentWillUnmount() {
    window.clearInterval(this.setStateInterval);
  }

  render() {
    const parentStyle = {border: "1px solid #ccc", margin: "2%", maxWidth: "40%"};

    return (
      <div className="demo">
        <h1>VictoryBar</h1>
        <VictoryBar
          style={{
            parent: parentStyle,
            labels: {angle: 45, verticalAnchor: "end", textAnchor: "end"}
          }}
          labels={() => "HELLO"}
          animate={{
            duration: 500,
            onExit: {
              duration: 1000
            },
            onEnter: {
              duration: 500
            }
          }}
          events={[{
            target: "data",
            eventHandlers: {
              onClick: () => {
                return [
                  {
                    mutation: (props) => {
                      return {style: merge({}, props.style, {fill: "orange"})};
                    }
                  }, {
                    target: "labels",
                    mutation: () => {
                      return {text: "hey"};
                    }
                  }
                ];
              }
            }
          }]}
          data={this.state.barTransitionData}
        />
        <VictoryStack
          style={{parent: parentStyle}}
          animate={{duration: 1000}}
          colorScale={"warm"}
        >
          {this.state.multiTransitionData.map((data, index) => {
            return <Wrapper key={index}><VictoryBar data={data}/></Wrapper>;
          })}
        </VictoryStack>

        <VictoryGroup
          offset={15}
          style={{parent: parentStyle}}
          animate={{duration: 1000}}
          colorScale={"qualitative"}
        >
          {this.state.multiTransitionData.map((data, index) => {
            return <Wrapper key={index}><VictoryBar key={index} data={data}/></Wrapper>;
          })}
        </VictoryGroup>

        <VictoryGroup
          style={{parent: parentStyle}} offset={18}
          colorScale={"qualitative"}
          animate={{duration: 2000}}
          labels={["a", "b", "c"]}
        >
          {this.getBarData().map((data, index) => {
            return <VictoryBar key={index} data={data}/>;
          })}
        </VictoryGroup>

        <VictoryGroup horizontal style={{parent: parentStyle}} offset={8}
          colorScale={"cool"} animate={{duration: 2000}}
        >
          {this.getBarData().map((data, index) => {
            return <VictoryBar key={index} data={data}/>;
          })}
        </VictoryGroup>

        <VictoryGroup style={{parent: parentStyle}} offset={15} animate={{duration: 2000}}>
          <VictoryStack colorScale={"red"}>
            {this.getBarData().map((data, index) => {
              return <VictoryBar key={index} data={data}/>;
            })}
          </VictoryStack>
          <VictoryStack colorScale={"green"}>
            {this.getBarData().map((data, index) => {
              return <VictoryBar key={index} data={data}/>;
            })}
          </VictoryStack>
          <VictoryStack colorScale={"blue"}>
            {this.getBarData().map((data, index) => {
              return <VictoryBar key={index} data={data}/>;
            })}
          </VictoryStack>
        </VictoryGroup>

        <VictoryStack
          style={{parent: parentStyle}}
          animate={{duration: 2000}}
          colorScale={"warm"}
          labels={["one", "two", "three"]}
        >
          {this.getBarData().map((data, index) => {
            return <VictoryBar key={index} data={data}/>;
          })}
        </VictoryStack>

        <ChartWrap>
          <VictoryBar
            data={[[0, 1], [2, 3], [4, 5]]}
            x={0}
            y={1}
          />
        </ChartWrap>

        <ChartWrap>
          <VictoryBar
            height={250}
            data={[["a", 1], ["b", 3], ["c", 5]]}
            x={0}
            y={1}
          />
        </ChartWrap>

        <ChartWrap>
          <VictoryBar
            height={250}
            data={[{a: {b: {c: 1, d: 1}}}, {a: {b: {c: 2, d: 3}}}]}
            x={"a.b.c"}
            y={"a.b.d"}
          />
        </ChartWrap>

          <VictoryStack colorScale="warm" style={{parent: parentStyle}}>
            <Wrapper>
              <VictoryBar
                data={[{x: "a", y: 2}, {x: "b", y: 3}, {x: "c", y: 4}]}
                events={[
                  {
                    target: "data",
                    eventHandlers: {
                      onClick: () => {
                        return [
                          {
                            mutation: (props) => {
                              return {style: merge({}, props.style, {fill: "orange"})};
                            }
                          }
                        ];
                      }
                    }
                  }
                ]}
              />
            </Wrapper>
            <VictoryBar
              data={[{x: "c", y: 2}, {x: "d", y: 3}, {x: "e", y: 4}]}
              events={[
                {
                  target: "data",
                  eventHandlers: {
                    onClick: () => {
                      return [
                        {
                          mutation: (props) => {
                            return {style: merge({}, props.style, {fill: "blue"})};
                          }
                        }
                      ];
                    }
                  }
                }
              ]}
            />
          </VictoryStack>
          <svg width={500} height={300} style={{parent: parentStyle}}>
            <VictorySharedEvents
              events={[
                {
                  childName: "firstBar",
                  target: "data",
                  eventKey: 1,
                  eventHandlers: {
                    onClick: () => {
                      return {
                        childName: "secondBar",
                        mutation: (props) => {
                          return {style: merge({}, props.style, {fill: "blue"})};
                        }
                      };
                    }
                  }
                }, {
                  childName: "secondBar",
                  target: "data",
                  eventKey: 0,
                  eventHandlers: {
                    onClick: () => {
                      return [
                        {
                          childName: "firstBar",
                          mutation: (props) => {
                            return props.style.fill === "cyan" ? null :
                              {style: merge({}, props.style, {fill: "cyan"})};
                          }
                        },
                        {
                          mutation: (props) => {
                            return {style: merge({}, props.style, {fill: "orange"})};
                          }
                        },
                        {
                          target: "labels",
                          eventKey: 1,
                          mutation: () => {
                            return {text: "CLICKED"};
                          }
                        }
                      ];
                    }
                  }
                }
              ]}
            >
              <VictoryBar
                name="firstBar"
                style={{
                  data: {width: 25, fill: "gold"}
                }}
                data={[{x: "a", y: 2}, {x: "b", y: 3}, {x: "c", y: 4}]}
              />
              <VictoryBar
                name={"secondBar"}
                data={[{x: "a", y: 2}, {x: "b", y: 3}, {x: "c", y: 4}]}
              />
          </VictorySharedEvents>
        </svg>
      </div>
    );
  }
}

class ChartWrap extends React.Component {
  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    children: React.PropTypes.any
  };
  static defaultProps = {
    width: 350,
    height: 250
  };
  // renders both a standalone chart, and a version wrapped in VictoryChart,
  // to test both cases at once
  render() {
    const parentStyle = {border: "1px solid #ccc", margin: "2%", maxWidth: "40%"};
    const props = Object.assign({}, this.props, {style: {parent: parentStyle}});
    return (
      <div>
        {React.cloneElement(this.props.children, props)}
        <VictoryChart {...props}>{this.props.children}</VictoryChart>
      </div>
    );
  }
}
