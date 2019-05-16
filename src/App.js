import React, { Component } from 'react';
import './App.css';

import {FlowchartManager, FlowchartFunctions} from './Components/FlowchartManager/FlowchartManager.js';
var newFlowchart = new FlowchartFunctions();

class App extends Component {

  constructor() {
    super();

    let flowchart = newFlowchart.createEmptyFlowchart();

    this.state = {
      flowchart: flowchart
    }
  }


  // Update State --------------------------------------------------------------

  updateFlowchart = (newFlowchart) => {
    this.setState({flowchart: newFlowchart});
  }

  // Render --------------------------------------------------------------------

  render() {
    return (
      <div className="App">
        <FlowchartManager
          flowchart={this.state.flowchart}
          updateFlowchart={this.updateFlowchart}
        />
      </div>
    );
  }
}

export default App;
