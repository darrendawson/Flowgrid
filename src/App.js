import React, { Component } from 'react';
import './App.css';

import Flowchart from './Components/Flowchart/Flowchart.js';

class App extends Component {

  constructor() {
    super();

    let flowchart = this.createEmptyFlowchart();

    this.state = {
      flowchart: flowchart
    }
  }


  // Flowchart Functions -------------------------------------------------------


  // creates an empty flowchart object with a start and end node
  createEmptyFlowchart = () => {
    let flowchart = {};
    flowchart['flow'] = {};

    // get unique IDs for the starting and ending nodes
    let startNodeID = this.getNewNodeID(flowchart);
    flowchart['flow'][startNodeID] = 1;
    let endNodeID = this.getNewNodeID(flowchart);

    // add startNode
    let startNode = {nodeID: startNodeID, nodeType: "START", nextNodeID: endNodeID};
    flowchart['flow'][startNodeID] = startNode;

    // add endNode
    let endNode = {nodeID: endNodeID, nodeType: "END", nextNodeID: 0};
    flowchart['flow'][endNodeID] = endNode;

    // add root to flowchart so we know where to start
    flowchart['rootNodeID'] = startNodeID;
    return flowchart;
  }




  // nodes have unique String IDs that are randomly generated.
  // this function returns an ID that has no collisions with current Nodes
  getNewNodeID = (flowchart) => {

    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    while (true) {
      let newID = "";
      for (let i = 0; i < 15; i++) {
        newID += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      // make sure that the ID is new before sending it back
      if (! (newID in flowchart['flow'])) {
        return newID;
      }
    }
  }



  // Render --------------------------------------------------------------------

  render() {
    return (
      <div className="App">
        <Flowchart
          flowchart={this.state.flowchart}
        />
      </div>
    );
  }
}

export default App;
