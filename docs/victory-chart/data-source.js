import React from "react";

const dataSets = [
  [{x: 0, y: 0}, {x: 10, y: 20}, {x: 2, y: 1}],
  [{x: 0, y: 0}, {x: -1, y: -2}, {x: -2, y: -1}]
];

class DataSource extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDataSet: 0
    };
  }

  getChildContext() {
    return ({
      dataSet: dataSets[this.state ? this.state.selectedDataSet : 0 ]
    });
  }

  renderOptions() {
    const options = [
      { id: 0, label: "POSITIVE" },
      { id: 1, label: "Negative" }
    ];

    return options.map((option) => (
      <option key={option.id}>{option.label}</option>
    ));
  }

  onDataSetChanged(selectedIndex) {
    this.setState({
      selectedDataSet: selectedIndex
    });
  }

  render() {
    return (
      <div>
        <select onChange={(ev) => {this.onDataSetChanged(ev.target.selectedIndex);}}>
          {this.renderOptions()}
        </select>
        {this.props.children}
      </div>
    );
  }
}

DataSource.childContextTypes = {
  dataSet: React.PropTypes.array
};

DataSource.propTypes = {
  children: React.PropTypes.node
};

export default DataSource;
