import React, { Component } from 'react';
import './Flowchart.css';

class Flowchart extends Component {

  constructor() {
    super();
  }



  // Branch Dependencies -------------------------------------------------------
  /*
    These functions are devoted to figuring out what IF branches are nested
  */


  // creates a dictionary of all IF statement dependencies
  // -> dependencies are lists of first-level If Statements within a loop
  // ex:
  //  |
  // [IF A] --------------------------------------------[node]
  //  |                                                   |
  // [IF B] ----------------[IF C] ------ [node]        [node]
  //  |                       |             |             |
  // [IF D] ----- [node]    [node]          |           [node]
  //  |             |         | -------------             |
  // [node]         |       [Merge C]                   [node]
  //  |--------------         |                           |
  // [Merge D]                |                           |
  //  |                       |                           |
  // [IF E] ----- [node]      |                           |
  //  |             |         |                           |
  // [node]         |         |                           |
  //  |-------------          |                           |
  // [Merge E]                |                           |
  //  |                       |                           |
  // [Merge B] ---------------                            |
  //  |                                                   |
  // [Merge A] -------------------------------------------
  //  |
  //
  // In this case,
  //  A: falseBranch=[B]       trueBranch=[]
  //  B: falseBranch=[D, E]    trueBranch=[C]
  //  C: falseBranch=[]        trueBranch=[]
  //  D: falseBranch=[]        trueBranch=[]
  //  E: falseBranch=[]        trueBranch=[]
  getAllBranchDependencies = (flowchart) => {
    let dependencies = {};

    // iterate over nodeIDs
    for (let nodeID in flowchart['flow']) {
      if (flowchart['flow'][nodeID]['nodeType'] === "IF") {
        dependencies[nodeID] = this.getBothBranchDependenciesForNode(flowchart, nodeID);
      }
    }

    return dependencies;
  }


  // given an IF node, gets dependencies for false and true branches
  getBothBranchDependenciesForNode = (flowchart, originNodeID) => {

    let originNode = flowchart['flow'][originNodeID];
    if (originNode['nodeType'] !== "IF") {
      return false;
    }

    let mergeNodeID = originNode['mergeNodeID'];
    let dependencies = {
      falseBranch: this.getBranchDependencies(flowchart, originNode['nextNodeID_IfFalse'], mergeNodeID),
      trueBranch: this.getBranchDependencies(flowchart, originNode['nextNodeID_IfTrue'], mergeNodeID)
    };

    return dependencies;
  }

  // get's a single track's dependencies (ifTrue or ifFalse)
  // - this creates a top level list of nested Loops (does not include references to nested loops within those loops)
  getBranchDependencies = (flowchart, nodeID, mergeNodeID) => {

    let dependencies = [];

    // keep going until we find the mergeNode
    while (nodeID !== mergeNodeID) {
      let currentNode = flowchart['flow'][nodeID];

      if (currentNode['nodeType'] === "IF") {
        dependencies.push(nodeID);
        nodeID = currentNode['mergeNodeID'];
      } else {
        nodeID = currentNode['nextNodeID'];
      }
    }

    return dependencies;
  }


  // Branch Sizes --------------------------------------------------------------
  /*
    Given Branch dependencies, these functions are devoted to figuring out
      the relative sizes each branch should be (height and width)
    NOTE:
      - This is not placing the branches into a graph.
  */

  getBranchSizes = (flowchart, dependencies) => {
    let sizes = {};

    // keep going until we've added the sizes for all IF nodes in dependencies
    // until then, iterate over all nodes
    while (Object.keys(sizes).length < Object.keys(dependencies).length) {
      for (let nodeID in dependencies) {

        // only check nodes we haven't already finished
        if (! (nodeID in sizes)) {

          // make sure that we have all the dependent branch sizes done before calculating the size for this branch
          let node = flowchart['flow'][nodeID];
          let falseBranch = dependencies[nodeID]['falseBranch'];
          let trueBranch = dependencies[nodeID]['trueBranch'];
          let readyToGetSize = true;
          for (let i = 0; i < falseBranch.length; i++) {
            if (! (falseBranch[i] in sizes)) {
              readyToGetSize = false;
            }
          }

          for (let i = 0; i < trueBranch.length; i++) {
            if (! (trueBranch[i] in sizes)) {
              readyToGetSize = false;
            }
          }

          // if all child branches are taken care of, we can calculate size for this node
          if (readyToGetSize) {
            let height = this.calculateTotalHeightOfBranch(flowchart, sizes, nodeID);
            let width = this.calculateWidthOfBranch(sizes, dependencies, nodeID);

            sizes[nodeID] = {height: height, width: width};
          }

        }
      }
    }

    return sizes;
  }


  // calculates the total width of an IF node
  // both the ifFalse and ifTrue branches can have their own nested branches within (that change width)
  // so this function takes the largest of each and adds them together
  // this makes sure the IF node will be wide enough in the graph
  calculateWidthOfBranch = (sizes, dependencies, nodeID) => {

    let width = 1;
    let falseBranch = dependencies[nodeID]['falseBranch'];
    let trueBranch = dependencies[nodeID]['trueBranch'];

    // calculate the max width of the ifFalse branch
    let maxFalseWidth = 0;
    for (let i = 0; i < falseBranch.length; i++) {
      let branchID = falseBranch[i];
      if (sizes[branchID]['width'] > maxFalseWidth) {
        maxFalseWidth = sizes[branchID]['width'];
      }
    }

    // calculate max width of the ifTrue branch
    let maxTrueWidth = 0;
    for (let i = 0; i < trueBranch.length; i++) {
      let branchID = trueBranch[i];
      if (sizes[branchID]['width'] > maxTrueWidth) {
        maxTrueWidth = sizes[branchID]['width'];
      }
    }

    // combine to get total width 
    return width + maxFalseWidth + maxTrueWidth;
  }

  // calls calculateHeightOfABranch() for ifFalse and ifTrue branches of IF node
  // returns the max of the two
  calculateTotalHeightOfBranch = (flowchart, sizes, nodeID) => {
    let node = flowchart['flow'][nodeID];
    let ifFalseHeight = this.calculateHeightOfABranch(flowchart, sizes, node['nextNodeID_IfFalse'], node['mergeNodeID']);
    let ifTrueHeight = this.calculateHeightOfABranch(flowchart, sizes, node['nextNodeID_IfTrue'], node['mergeNodeID']);

    if (ifTrueHeight > ifFalseHeight) {
      return ifTrueHeight;
    } else {
      return ifFalseHeight;
    }
  }


  // similar to getBranchDependencies()
  // runs until it hits the mergeNode
  // There are 2 categories of nodes:
  // - IF: lookup up the height of the IF statement in sizes and add it to height
  // - else: height += 1
  calculateHeightOfABranch = (flowchart, sizes, nodeID, mergeNodeID) => {
    let height = 0;

    // keep going until we merge
    while (nodeID !== mergeNodeID) {

      let node = flowchart['flow'][nodeID];

      if (node['nodeType'] === "IF") {
        height += sizes[nodeID]['height'];
        nodeID = node['mergeNodeID'];
      } else {
        height += 1;
        nodeID = node['nextNodeID'];
      }
    }

    return height;
  }

  // Helpful Functions ---------------------------------------------------------

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

    let dependencies = this.getAllBranchDependencies(flowchart);
    let sizes = this.getBranchSizes(flowchart, dependencies);

    return (
      <div id="Flowchart">
        <p>{JSON.stringify(sizes)}</p>
        <p>-</p>
        <p>{JSON.stringify(dependencies)}</p>
      </div>
    );
  }
}

export default Flowchart;
