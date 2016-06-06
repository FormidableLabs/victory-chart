/*global window:false */
import React from "react";
import { merge, random, range, omit } from "lodash";
import {
  VictoryChart, VictoryLine, VictoryAxis, VictoryBar, VictoryArea,
  VictoryScatter, VictoryStack, VictoryGroup
} from "../../src/index";
import { VictoryLabel } from "victory-core";
import { assign } from "lodash";


const UPDATE_INTERVAL = 3000;

class Wrapper extends React.Component {
  static propTypes = {
    children: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(React.PropTypes.node),
      React.PropTypes.node
    ])
  };

  renderChildren() {
    const props = omit(this.props, ["children"]);
    const children = React.Children.toArray(this.props.children);
    return children.map((child) => {
      return React.cloneElement(child, assign({}, child.props, props));
    });
  }

  render() {
    return (
      <g>
        <VictoryLabel text={"WRAPPED"} x={50} y={50}/>
        {this.renderChildren()}
      </g>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scatterData: this.getScatterData(),
      lineData: this.getData(),
      numericBarData: this.getNumericBarData(),
      barData: this.getBarData(),
      barTransitionData: this.getBarTransitionData(),
      multiBarTransitionData: this.getMultiBarTransitionData(),
      lineStyle: this.getStyles()
    };
  }

  getData() {
    return range(20).map((i) => {
      return {
        x: i,
        y: Math.random()
      };
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
          y: random(1, 15)
        }
      ];
    });
  }

  getBarData() {
    return range(5).map(() => {
      return [
        {
          x: "apples",
          y: random(2, 5)
        },
        {
          x: "bananas",
          y: random(2, 10)
        },
        {
          x: "oranges",
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

  getMultiBarTransitionData() {
    const bars = random(6, 10);
    return range(5).map(() => {
      return range(bars).map((bar) => {
        return {x: bar, y: random(2, 10)};
      });
    });
  }

  getScatterData() {
    const colors =
      ["violet", "cornflowerblue", "gold", "orange", "turquoise", "tomato", "greenyellow"];
    const symbols = ["circle", "star", "square", "triangleUp", "triangleDown", "diamond", "plus"];
    const elementNum = random(10, 40);
    return range(elementNum).map((index) => {
      const scaledIndex = Math.floor(index % 7);
      return {
        x: random(10, 50),
        y: random(2, 100),
        size: random(8) + 3,
        symbol: symbols[scaledIndex],
        fill: colors[random(0, 6)],
        opacity: 1
      };
    });
  }

  getStyles() {
    const colors = ["red", "orange", "cyan", "green", "blue", "purple"];
    return {
      stroke: colors[random(0, 5)],
      strokeWidth: [random(1, 3)]
    };
  }

  componentDidMount() {
    /* eslint-disable react/no-did-mount-set-state */
    this.setStateInterval = window.setInterval(() => {
      this.setState({
        scatterData: this.getScatterData(),
        lineData: this.getData(),
        barData: this.getBarData(),
        barTransitionData: this.getBarTransitionData(),
        multiBarTransitionData: this.getMultiBarTransitionData(),
        numericBarData: this.getNumericBarData(),
        lineStyle: this.getStyles()
      });
    }, UPDATE_INTERVAL);
  }

  componentWillUnmount() {
    window.clearInterval(this.setStateInterval);
  }

  render() {
    const containerStyle = {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center"
    };
    const chartStyle = {parent: {border: "1px solid #ccc", margin: "2%", maxWidth: "40%"}};
    return (
      <div className="demo">
        <h1>VictoryChart</h1>
        <div style={containerStyle}>
          <VictoryChart style={chartStyle} animate={{ duration: 1500 }}>
          <Wrapper>
            <VictoryBar
              data={this.state.barTransitionData}
            />
            </Wrapper>
          </VictoryChart>

          <VictoryChart style={chartStyle} animate={{ duration: 1500 }}>
            <VictoryBar
              data={this.state.barTransitionData}
            />
          </VictoryChart>

          <VictoryChart style={chartStyle} animate={{duration: 1000}}>
            <VictoryStack colorScale={"warm"}>
              {this.state.multiBarTransitionData.map((data, index) => {
                return <VictoryBar key={index} data={data}/>;
              })}
            </VictoryStack>
          </VictoryChart>

          <VictoryChart style={chartStyle}/>

          <VictoryChart style={chartStyle}>
            <Wrapper>
              <VictoryLabel text={"WOW"} x={150} y={150}/>
              <VictoryScatter/>
            </Wrapper>
          </VictoryChart>

          <VictoryChart style={chartStyle}>
            <VictoryLine/>
          </VictoryChart>

          <VictoryChart style={chartStyle}>
            <VictoryBar/>
          </VictoryChart>

          <VictoryChart style={chartStyle} scale={"linear"}>
            <VictoryAxis/>
            <VictoryAxis dependentAxis crossAxis={false} offsetX={30}/>

              <VictoryLine
                style={{data:
                  {stroke: "red", strokeWidth: 4}
                }}
                y={(data) => Math.sin(2 * Math.PI * data.x)}
              />

            <VictoryLine
              style={{data:
                {stroke: "blue", strokeWidth: 4}
              }}
              y={(data) => Math.cos(2 * Math.PI * data.x)}
            />
          </VictoryChart>

          <VictoryChart style={chartStyle} animate={{duration: 2000}}>
            <VictoryAxis dependentAxis orientation="left" style={{grid: {strokeWidth: 1}}}/>
            <VictoryLine
              data={this.state.lineData}
              style={{data: this.state.lineStyle}}
            />
          </VictoryChart>

          <VictoryChart style={chartStyle}
            scale={{
              x: "time"
            }}
          >
            <VictoryAxis
              orientation="bottom"
              tickValues={[
                new Date(1980, 1, 1),
                new Date(1990, 1, 1),
                new Date(2000, 1, 1),
                new Date(2010, 1, 1),
                new Date(2020, 1, 1)
              ]}
              tickFormat={(x) => new Date(x).getFullYear()}
            />
            <VictoryLine
              style={{
                data: {stroke: "red", strokeWidth: 5},
                labels: {fontSize: 12}
              }}
              label={this.state.label}
              data={[
                {x: new Date(1982, 1, 1), y: 125},
                {x: new Date(1987, 1, 1), y: 257},
                {x: new Date(1993, 1, 1), y: 345},
                {x: new Date(1997, 1, 1), y: 515},
                {x: new Date(2001, 1, 1), y: 132},
                {x: new Date(2005, 1, 1), y: 305},
                {x: new Date(2011, 1, 1), y: 270},
                {x: new Date(2015, 1, 1), y: 470}
              ]}
            />
          </VictoryChart>

          <VictoryChart style={chartStyle} animate={{ duration: 2000 }}>
            <VictoryScatter
              data={this.state.scatterData}
              animate={{
                onExit: {
                  duration: 500,
                  before: () => ({opacity: 0.3})
                },
                onEnter: {
                  duration: 500,
                  before: () => ({ opacity: 0.3 }),
                  after: (datum) => ({ opacity: datum.opacity || 1 })
                }
              }}
            />
          </VictoryChart>

          <VictoryChart style={chartStyle}>
            <VictoryAxis dependentAxis orientation="right"/>
            <VictoryAxis orientation="top"/>
              <VictoryLine y={(d) => 0.5 * d.x + 0.5} style={{data: {stroke: "red"}}}/>
              <VictoryScatter y={(d) => d.x * d.x} style={{data: {stroke: "red"}}}/>
          </VictoryChart>

          <VictoryChart style={chartStyle} animate={{duration: 2000}}
            domainPadding={{x: 100}}
          >
            <VictoryStack>
              {this.state.barData.map((data, index) => {
                return <Wrapper key={index}><VictoryBar data={data}/></Wrapper>;
              })}
            </VictoryStack>
          </VictoryChart>
          <VictoryChart style={chartStyle} domainPadding={{x: 30, y: 30}}
            events={[{
              childName: "bar",
              target: "data",
              eventHandlers: {
                onClick: () => {
                  return [
                    {
                      target: "labels",
                      mutation: () => {
                        return {text: "o shit"};
                      }
                    }, {
                      childName: "line",
                      target: "data",
                      mutation: (props) => {
                        return {style: merge({}, props.style, {stroke: "lime"})};
                      }
                    }, {
                      childName: "line",
                      target: "labels",
                      mutation: (props) => {
                        return {
                          style: merge({}, props.style, {fill: "green"}),
                          text: "waddup"
                        };
                      }
                    }
                  ];
                }
              }
            }]}
          >
            <VictoryBar name="bar"
              style={{data: {width: 15, fill: "green"}}}
              data={[
                {x: 1, y: 1},
                {x: 2, y: 2},
                {x: 3, y: 3},
                {x: 4, y: 2},
                {x: 5, y: 1},
                {x: 6, y: 2},
                {x: 7, y: 3},
                {x: 8, y: 2},
                {x: 9, y: 1},
                {x: 10, y: 2},
                {x: 11, y: 3},
                {x: 12, y: 2},
                {x: 13, y: 1}
              ]}
            />
            <VictoryLine name="line"
              y={() => 0.5}
              style={{data: {stroke: "blue", strokeWidth: 5}}}
              label="LINE"
            />
          </VictoryChart>
          <VictoryChart style={chartStyle} domainPadding={{x: 50}} animate={{duration: 2000}}>
            <VictoryGroup offset={15}>
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
          </VictoryChart>
          <VictoryChart style={chartStyle}
            events={[{
              childName: "area-1",
              target: "data",
              eventHandlers: {
                onClick: () => {
                  return [
                    {
                      childName: "area-2",
                      target: "data",
                      mutation: (props) => {
                        return {style: merge({}, props.style, {fill: "gold"})};
                      }
                    }, {
                      childName: "area-3",
                      target: "data",
                      mutation: (props) => {
                        return {
                          style: merge({}, props.style, {fill: "orange"})
                        };
                      }
                    }, {
                      childName: "area-4",
                      target: "data",
                      mutation: (props) => {
                        return {
                          style: merge({}, props.style, {fill: "red"})
                        };
                      }
                    }
                  ];
                }
              }
            }]}
          >
            <VictoryStack colorScale={"qualitative"}>
              <VictoryArea name="area-1"
                data={[
                  {x: "a", y: 2}, {x: "b", y: 3}, {x: "c", y: 5}, {x: "d", y: 4}, {x: "e", y: 7}
                ]}
              />
              <VictoryArea name="area-2"
                data={[
                  {x: "a", y: 1}, {x: "b", y: 4}, {x: "c", y: 5}, {x: "d", y: 7}, {x: "e", y: 5}
                ]}
              />
              <VictoryArea name="area-3"
                data={[
                  {x: "a", y: 3}, {x: "b", y: 2}, {x: "c", y: 6}, {x: "d", y: 2}, {x: "e", y: 6}
                ]}
              />
              <VictoryArea name="area-4"
                data={[
                  {x: "a", y: 2}, {x: "b", y: 3}, {x: "c", y: 3}, {x: "d", y: 4}, {x: "e", y: 7}
                ]}
              />
            </VictoryStack>
          </VictoryChart>
        </div>
      </div>
    );
  }
}

export default App;
