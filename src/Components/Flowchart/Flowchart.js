import React, { Component } from 'react';
import './Flowchart.css';

class Flowchart extends Component {

  constructor() {
    super();
  }


  // returns a list of all possible node paths through a flowchart
  getAllPossiblePaths = (flowchart, nodeID, completePaths, pathInProgress) => {

    let node = flowchart['flow'][nodeID];

    // add current node to the path in progress
    pathInProgress.push(nodeID);

    // bubble up if we've hit the end of the current path
    if (node['nodeType'] === "END") {
      completePaths.push(pathInProgress);
    }

    else if (node['nodeType'] === "IF") {

      // because JS has weird pointer rules, clone pathInProgress into new lists
      // before passing them through recursively
      let newPathIfFalse = [];
      let newPathIfTrue = [];
      for (let i = 0; i < pathInProgress.length; i++) {
        newPathIfFalse.push(pathInProgress[i]);
        newPathIfTrue.push(pathInProgress[i]);
      }
      completePaths = this.getAllPossiblePaths(flowchart, node['nextNodeID_IfTrue'], completePaths, newPathIfFalse);
      completePaths = this.getAllPossiblePaths(flowchart, node['nextNodeID_IfFalse'], completePaths, newPathIfTrue);
    }

    else {
      completePaths = this.getAllPossiblePaths(flowchart, node['nextNodeID'], completePaths, pathInProgress);
    }

    return completePaths;
  }


  // Render --------------------------------------------------------------------

  render() {
    let flowchart = this.props.flowchart;
    let paths = this.getAllPossiblePaths(flowchart, flowchart['rootNodeID'], [], []);

    return (
      <div id="Flowchart">
        <p>{JSON.stringify(paths[0])}</p>
        <p>{JSON.stringify(paths[1])}</p>
      </div>
    );
  }
}

export default Flowchart;
