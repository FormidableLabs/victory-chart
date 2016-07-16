import React from "react";
import ReactDOM from "react-dom";
import Ecology from "ecology";
import { merge, random, range } from "lodash";
import Radium, { Style } from "radium";
import * as docgen from "react-docgen";
import DataSource from "./data-source";
import {
  VictoryChart, VictoryLine, VictoryAxis, VictoryBar, VictoryScatter, VictoryStack
} from "../../src/index";
import { VictoryTheme, appendLinkIcon, ecologyPlaygroundLoading } from "formidable-landers";

class Docs extends React.Component {
  render() {
    return (
      <div>
        <Ecology
          overview={require("!!raw!./ecology.md")}
          source={docgen.parse(require("!!raw!../../src/components/victory-chart/victory-chart"))}
          scope={{
            merge, range, random, DataSource, React, ReactDOM, VictoryScatter, VictoryLine,
            VictoryAxis, VictoryBar, VictoryChart, VictoryStack
          }}
          playgroundtheme="elegant"
          customRenderers={merge(appendLinkIcon, ecologyPlaygroundLoading)}
        />
        <Style rules={VictoryTheme}/>
      </div>
    );
  }
}

export default Radium(Docs);
