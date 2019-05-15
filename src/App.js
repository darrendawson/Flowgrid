import React, { Component } from 'react';
import './App.css';

import {FlowchartManager, FlowchartFunctions} from './Components/FlowchartManager/FlowchartManager.js';
var newFlowchart = new FlowchartFunctions();

class App extends Component {

  constructor() {
    super();

    let flowchart = newFlowchart.createEmptyFlowchart();

    /*
    let rootNodeID = flowchart['rootNodeID'];
    let endNodeID = flowchart['flow'][rootNodeID]['nextNodeID'];

    flowchart = this.insertEmptyLoopNode(flowchart, rootNodeID);
    //flowchart = this.insertEmptyIfNode(flowchart, rootNodeID);
    //let ifNodeID = flowchart['flow'][rootNodeID]['nextNodeID'];
    //flowchart = this.insertEmptyIfNode(flowchart, ifNodeID, false);
    //flowchart = this.insertEmptyIfNode(flowchart, ifNodeID, true);
    */

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
          insertEmptyCommandNode={this.insertEmptyCommandNode}
          insertEmptyIfNode={this.insertEmptyIfNode}
          insertEmptyLoopNode={this.insertEmptyLoopNode}
          updateFlowchart={this.updateFlowchart}
        />
      </div>
    );
  }
}

export default App;
