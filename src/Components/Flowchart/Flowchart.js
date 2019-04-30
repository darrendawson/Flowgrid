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

    return height + 1;
  }


  // Place Flowchart into Graph ------------------------------------------------


  // builds a lookup table of what row/col each node will be in in the graph representation of the flowchart
  getNodeLocations = (flowchart, sizes, nodeID, locations = {}, row = 0, col = 0) => {


    // if we've already visited this node, bubble up
    if (nodeID in locations) {
      return locations;
    }

    // Record the location of this node
    locations[nodeID] = {row: row, col: col};
    let node = flowchart['flow'][nodeID];


    // bubble up when we've reaced the end of the line
    if (node['nodeType'] === "END") {
      return locations;
    }

    // in an IF node, path branches to nextNodeID_IfTrue and nextNodeID_IfFalse
    else if (node['nodeType'] === "IF") {

      // 1) we want to jump to the end of the IF branch and continue (Depth First style)
      let mergeNodeRow = row + sizes[nodeID]['height'];
      locations = this.getNodeLocations(flowchart, sizes, node['mergeNodeID'], locations, mergeNodeRow, col);

      // 2) we want to recursively fill the ifFalse branch that we skipped
      locations = this.getNodeLocations(flowchart, sizes, node['nextNodeID_IfFalse'], locations, row + 1, col);

      // 3) lastly, we want to recursively fill the ifTrue branch that was skipped
      let ifTrueCol = col + sizes[nodeID]['width'];
      locations = this.getNodeLocations(flowchart, sizes, node['nextNodeID_IfTrue'], locations, row, ifTrueCol);
    }


    // Otherwise, node will point to nextNodeID
    else {
      locations = this.getNodeLocations(flowchart, sizes, node['nextNodeID'], locations, row + 1, col);
    }

    return locations;
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


  // Grid ----------------------------------------------------------------------

  // creates an empty 2D array that can accomodate all the nodes inside of a flowchart
  // - get maxRow and maxCol in nodeLocations to figure out how large it should be
  // - array accessed by grid[row][col]
  createEmptyGrid = (nodeLocations) => {

    // get the dimensions of the grid
    let maxRow = 0;
    let maxCol = 0;
    for (let nodeID in nodeLocations) {
      maxRow = (nodeLocations[nodeID]['row'] > maxRow) ? nodeLocations[nodeID]['row'] : maxRow;
      maxCol = (nodeLocations[nodeID]['col'] > maxCol) ? nodeLocations[nodeID]['col'] : maxCol;
    }

    // create the grid
    let grid = [];
    for (let i = 0; i <= maxRow; i++) {
      let gridRow = [];
      for (let j = 0; j <= maxCol; j++) {
        gridRow.push(0);
      }
      grid.push(gridRow);
    }

    return grid;
  }


  // nodeLocations starts off as just nodes
  // this function will create empty rows / columns between nodes that act as space for edges
  addEdgeDistanceToNodeLocations = (nodeLocations) => {
    for (let nodeID in nodeLocations) {
      nodeLocations[nodeID]['row'] = nodeLocations[nodeID]['row'] * 2 + 1;
      nodeLocations[nodeID]['col'] = nodeLocations[nodeID]['col'] * 2 + 1;
    }
    return nodeLocations;
  }


  // converts a flowchart into a grid
  getFlowchartAsGrid = (flowchart) => {

    // get (row, col) location pairs for each node in the flowchart
    // -> calculates nested IfNode branch dependencies to make sure there aren't any collisions
    let branchDependencies = this.getAllBranchDependencies(flowchart);
    let branchSizes = this.getBranchSizes(flowchart, branchDependencies);
    let nodeLocations = this.getNodeLocations(flowchart, branchSizes, flowchart['rootNodeID']);
    nodeLocations = this.addEdgeDistanceToNodeLocations(nodeLocations);
    let grid = this.createEmptyGrid(nodeLocations);

    // Add nodes into the grid
    for (let nodeID in nodeLocations) {
      let nodeRow = nodeLocations[nodeID]['row'];
      let nodeCol = nodeLocations[nodeID]['col'];

      grid[nodeRow][nodeCol] = {"type": "node", "nodeID": nodeID};
    }

    // Add edges between nodes

    // return the grid
    return grid;
  }


  // Render --------------------------------------------------------------------


  renderNode = (flowchart, nodeID) => {
    return (
      <div className="grid_col">
        <p>{flowchart['flow'][nodeID]['nodeType']}</p>
      </div>
    );
  }

  renderEdge = () => {
    return (
      <div>

      </div>
    );
  }

  renderFlowchart = (flowchart) => {

    // convert flowchart into grid format
    let nodeGrid = this.getFlowchartAsGrid(flowchart);
    let gridToRender = [];

    // render grid
    for (let i = 0; i < nodeGrid.length; i++) {

      let rowToRender = [];
      let onlyEdgesInRow = true; // rows with only edges will be shorter

      for (let j = 0; j < nodeGrid[i].length; j++) {

        if (nodeGrid[i][j]['type'] === "node") {
          onlyEdgesInRow = false;
          rowToRender.push(this.renderNode(flowchart, nodeGrid[i][j]['nodeID']));
        }

        else if (nodeGrid[i][j]['type'] === "edge") {
          rowToRender.push(this.renderEdge(nodeGrid[i][j]));
        }

        else {
          // if there isn't a node or an edge, it'll just be an empty space
          rowToRender.push(<div className="grid_col"></div>);
        }
      }

      // add Row to grid
      let rowCSS = (onlyEdgesInRow) ? "grid_row_no_nodes" : "grid_row";
      gridToRender.push(
        <div className={rowCSS}>
          {rowToRender}
        </div>
      );
    }

    return gridToRender;
  }

  // renders the <Flowchart/>
  render() {

    return (
      <div id="FLOWCHART">

        {this.renderFlowchart(this.props.flowchart)}
      </div>
    );
  }
}

export default Flowchart;
