import React, { Component } from 'react';
import './Flowchart.css';

import Edge from './Edge/Edge.js';
import Node from './Node/Node.js';


class Flowchart extends Component {

  constructor() {
    super();
  }

  // Insert Node Functionality -------------------------------------------------

  // given parent and child node, insert node between them
  // -> this function should check to see if the parentNode type is an ifNode
  //  - If it is, then make sure it calls insertEmptyCommandNodeIntoFlowchart() with proper declarations
  insertNewCommandNode = (parentNodeID, childNodeID) => {

    let flowchart = this.props.flowchart;

    // determine whether the parent node is an if statement
    // and if it is, determine whether the child node is on the ifTrue or ifFalse path
    let parentTookIfTrue = false;
    if (flowchart['flow'][parentNodeID]['nodeType'] === "IF") {
      parentTookIfTrue = (flowchart['flow'][parentNodeID]['nextNodeID_IfTrue'] === childNodeID);
    }


    flowchart = this.props.insertEmptyCommandNode(flowchart, parentNodeID, parentTookIfTrue);
    this.props.updateFlowchart(flowchart);
  }


  // same as insertNewCommandNode, but for an IF node
  insertNewIfNode = (parentNodeID, childNodeID) => {

    let flowchart = this.props.flowchart;

    // determine whether the parent node is an if statement
    // and if it is, determine whether the child node is on the ifTrue or ifFalse path
    let parentTookIfTrue = false;
    if (flowchart['flow'][parentNodeID]['nodeType'] === "IF") {
      parentTookIfTrue = (flowchart['flow'][parentNodeID]['nextNodeID_IfTrue'] === childNodeID);
    }

    flowchart = this.props.insertEmptyIfNode(flowchart, parentNodeID, parentTookIfTrue);
    this.props.updateFlowchart(flowchart);
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
      if (sizes[branchID]['width']['widthTotal'] > maxFalseWidth) {
        maxFalseWidth = sizes[branchID]['width']['widthTotal'];
      }
    }

    // calculate max width of the ifTrue branch
    let maxTrueWidth = 0;
    for (let i = 0; i < trueBranch.length; i++) {
      let branchID = trueBranch[i];
      if (sizes[branchID]['width']['widthTotal'] > maxTrueWidth) {
        maxTrueWidth = sizes[branchID]['width']['widthTotal'];
      }
    }

    // combine to get total width
    return {
      'widthIfFalse': maxFalseWidth,
      'widthIfTrue': maxTrueWidth,
      'widthTotal': maxFalseWidth + maxTrueWidth + 1
    };
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
      let ifTrueCol = col + sizes[nodeID]['width']['widthIfFalse'] + 1;
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
  getAllPossiblePaths = (flowchart, nodeID, completePaths = [], pathInProgress = []) => {

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



    // Add edges between nodes
    for (let nodeID in nodeLocations) {

      let node = flowchart['flow'][nodeID];

      // add edges
      if (node['nodeType'] === "END") {
        // don't draw any edges coming out of the END type node
      } else if (node['nodeType'] === "IF") {
        // add edges for both branches of if statement
        grid = this.insertEdgesForNodePairIntoGrid(grid, nodeLocations, nodeID, node['nextNodeID_IfFalse']);
        grid = this.insertEdgesForNodePairIntoGrid(grid, nodeLocations, nodeID, node['nextNodeID_IfTrue']);

      } else if (node['nodeType'] === "LOOP_COND") {
        // loop conditional nodes are like IF statements, except the "ifTrue" points at a previous node in the flowchart
        // ifTrue (loop back up) is stored as 'loopHeadNodeID'
        // ifFalse (break from loop) is stored as 'nextNodeID'
        grid = this.insertEdgesForNodePairIntoGrid(grid, nodeLocations, nodeID, node['loopHeadNodeID']);
        grid = this.insertEdgesForNodePairIntoGrid(grid, nodeLocations, nodeID, node['nextNodeID']);
      } else {
        // otherwise, node only points to one more node
        grid = this.insertEdgesForNodePairIntoGrid(grid, nodeLocations, nodeID, node['nextNodeID']);
      }
    }


    // Add nodes into the grid
    for (let nodeID in nodeLocations) {
      let nodeRow = nodeLocations[nodeID]['row'];
      let nodeCol = nodeLocations[nodeID]['col'];
      grid[nodeRow][nodeCol] = {"type": "node", "nodeID": nodeID};
    }


    // return the grid
    return grid;
  }


  // Edges ---------------------------------------------------------------------
  /*
    - functions specifically for inserting / manipulating edges
  */


  // given [Node A] and [Node B], draws connecting edges between them
  insertEdgesForNodePairIntoGrid = (grid, nodeLocationLookup, nodeA_ID, nodeB_ID) => {

    let nodeA_Row = nodeLocationLookup[nodeA_ID]['row'];
    let nodeA_Column = nodeLocationLookup[nodeA_ID]['col'];
    let nodeB_Row = nodeLocationLookup[nodeB_ID]['row'];
    let nodeB_Column = nodeLocationLookup[nodeB_ID]['col'];

    // for storing values to pass to this.combineTwoEdges()
    let newEdge;
    let currentEdge;

    if (nodeB_Row > nodeA_Row && nodeB_Column === nodeA_Column) {
      /*
        Case:
            [Node A]
                |
                V
            [Node B]
      */

      for (let i = nodeA_Row + 1; i < nodeB_Row; i++) {
        newEdge = {"type": "edge", "direction": "vertical", "nodes": [{"parentNodeID": nodeA_ID, "childNodeID": nodeB_ID}]};
        currentEdge = grid[i][nodeA_Column];
        grid[i][nodeA_Column] = this.combineTwoEdges(newEdge, currentEdge);
      }


    } else if (nodeA_Row === nodeB_Row && nodeA_Column < nodeB_Column) {
      /*
        Case:
          [Node A] -> [Node B]
      */
      for (let i = nodeA_Column + 1; i < nodeB_Column; i++) {
        newEdge = {"type": "edge", "direction": "horizontal", "nodes": [{"parentNodeID": nodeA_ID, "childNodeID": nodeB_ID}]};
        currentEdge = grid[nodeA_Row][i];
        grid[nodeA_Row][i] = this.combineTwoEdges(newEdge, currentEdge);
      }

    } else if (nodeA_Row < nodeB_Row && nodeA_Column > nodeB_Column) {
      /*
        Case:
               |         [Node A]
               |            |
               | -----------.
               |
            [Node B]
      */


      // add edge directly under NodeA that
      for (let i = nodeA_Row + 1; i < nodeB_Row - 1; i++) {
        newEdge = {"type": "edge", "direction": "vertical", "nodes": [{"parentNodeID": nodeA_ID, "childNodeID": nodeB_ID}]};
        currentEdge = grid[i][nodeA_Column];
        grid[i][nodeA_Column] = this.combineTwoEdges(newEdge, currentEdge);
      }

      // add up_left
      newEdge = {"type": "edge", "direction": "up_left", "nodes": [{"parentNodeID": nodeA_ID, "childNodeID": nodeB_ID}]};
      currentEdge = grid[nodeB_Row - 1][nodeA_Column];
      grid[nodeB_Row - 1][nodeA_Column] = this.combineTwoEdges(newEdge, currentEdge);


      // add horizontal edges
      for (let i = nodeB_Column + 1; i < nodeA_Column; i++) {
        newEdge = {"type": "edge", "direction": "horizontal", "nodes": [{"parentNodeID": nodeA_ID, "childNodeID": nodeB_ID}]};
        currentEdge = grid[nodeB_Row + 1][i];
        grid[nodeB_Row - 1][i] = this.combineTwoEdges(newEdge, currentEdge);
      }

      // Add edge to connect to edge above Node B
      newEdge = {"type": "edge", "direction": "down_right", "nodes": [{"parentNodeID": nodeA_ID, "childNodeID": nodeB_ID}]};
      currentEdge = grid[nodeB_Row - 1][nodeB_Column];
      grid[nodeB_Row - 1][nodeB_Column] = this.combineTwoEdges(newEdge, currentEdge);


    } else if (nodeA_Row > nodeB_Row && nodeA_Column === nodeB_Column) {
      /*
        Case (loop):
            --[Node B]
            |    .
            |    .
            --[Node A]
      */

      // add edge directly to left of nodeA
      newEdge = {"type": "edge", "direction": "up_right", "nodes": [{"parentNodeID": nodeA_ID, "childNodeID": nodeB_ID}]};
      currentEdge = grid[nodeA_Row][nodeA_Column - 1];
      grid[nodeA_Row][nodeA_Column - 1] = this.combineTwoEdges(newEdge, currentEdge);

      // add edge directly to left of nodeB
      newEdge = {"type": "edge", "direction": "down_right", "nodes": [{"parentNodeID": nodeA_ID, "childNodeID": nodeB_ID}]};
      currentEdge = grid[nodeB_Row][nodeB_Column - 1];
      grid[nodeB_Row][nodeB_Column - 1] = this.combineTwoEdges(newEdge, currentEdge);

      // add vertical edges between nodeA and nodeB
      for (let i = nodeB_Row + 1; i < nodeA_Row; i++) {
        newEdge = {"type": "edge", "direction": "vertical", "nodes": [{"parentNodeID": nodeA_ID, "childNodeID": nodeB_ID}]};
        currentEdge = grid[i][nodeA_Column - 1];
        grid[i][nodeA_Column - 1] = this.combineTwoEdges(newEdge, currentEdge);
      }
    }

    return grid;
  }


  // takes in 2 edges and returns there sum:
  // ex: vertical edge + horizontal edge = vertical_horizontal (a plus)
  combineTwoEdges = (edge1, edge2) => {

    // only add edges together if there are edges to add!
    if (edge1 === 0 || edge1['type'] !== "edge") {
      return edge2;
    } else if (edge2 === 0 || edge2['type'] !== "edge") {
      return edge1;
    }


    // combine list of node directions
    let nodes = [];
    for (let i = 0; i < edge1['nodes'].length; i++) {
      nodes.push(edge1['nodes'][i]);
    }

    for (let i = 0; i < edge2['nodes'].length; i++) {
      nodes.push(edge2['nodes'][i]);
    }

    // if edges are the same or can't be combined, then return them
    if (edge1['direction'] === edge2['direction']) {
      edge1['nodes'] = nodes;
      return edge1;
    } else if (edge1['direction'] === "vertical_horizontal") {
      edge1['nodes'] = nodes;
      return edge1;
    } else if (edge2['direction'] === "vertical_horizontal") {
      edge2['nodes'] = nodes;
      return edge2;
    }


    // get edgeTypes to compare
    let edgeTypes = [edge1['direction'], edge2['direction']];

    /*
      3/4 lines like this:
      -------------
      |     |     |
      |     |     |
      |     |-----|
      |     |     |
      |     |     |
      -------------
      (this is vertical_right)
      naming scheme involves vertical component first and horizontal second
      "horizontal" is having both left and right lines active (vertical follows the same principle)
    */
    if (
      (edgeTypes.includes('vertical') && edgeTypes.includes('up_right'))         ||
      (edgeTypes.includes('vertical') && edgeTypes.includes('down_right'))       ||
      (edgeTypes.includes('up_right') && edgeTypes.includes('down_right'))       ||
      (edgeTypes.includes('vertical_right') && edgeTypes.includes('up_right'))   ||
      (edgeTypes.includes('vertical_right') && edgeTypes.includes('down_right')) ||
      (edgeTypes.includes('vertical') && edgeTypes.includes('vertical_right'))
    ) {
      return {"type": "edge", "direction": "vertical_right", "nodes": nodes};
    }

    else if (
      (edgeTypes.includes('horizontal') && edgeTypes.includes('up_left'))    ||
      (edgeTypes.includes('horizontal') && edgeTypes.includes('up_right'))   ||
      (edgeTypes.includes('up_left') && edgeTypes.includes('up_right'))      ||
      (edgeTypes.includes('up_horizontal') && edgeTypes.includes('up_left')) ||
      (edgeTypes.includes('up_horizontal') && edgeTypes.includes('up_right'))||
      (edgeTypes.includes('horizontal') && edgeTypes.includes('up_horizontal'))
    ) {
      return {"type": "edge", "direction": "up_horizontal", "nodes": nodes};
    }

    else if (
      (edgeTypes.includes('vertical') && edgeTypes.includes('up_left'))        ||
      (edgeTypes.includes('vertical') && edgeTypes.includes('down_left'))      ||
      (edgeTypes.includes('up_left') && edgeTypes.includes('down_left'))       ||
      (edgeTypes.includes('vertical_left') && edgeTypes.includes('up_left'))   ||
      (edgeTypes.includes('vertical_left') && edgeTypes.includes('down_left')) ||
      (edgeTypes.includes('vertical') && edgeTypes.includes('vertical_left'))
    ) {
      return {"type": "edge", "direction": "vertical_left", "nodes": nodes};
    }

    else if (
      (edgeTypes.includes('horizontal') && edgeTypes.includes('down_left'))       ||
      (edgeTypes.includes('horizontal') && edgeTypes.includes('down_right'))      ||
      (edgeTypes.includes('down_left') && edgeTypes.includes('down_right'))       ||
      (edgeTypes.includes('down_horizontal') && edgeTypes.includes('down_left'))  ||
      (edgeTypes.includes('down_horizontal') && edgeTypes.includes('down_right')) ||
      (edgeTypes.includes('down') && edgeTypes.includes('down_horizontal'))
    ) {
      return {"type": "edge", "direction": "down_horizontal", "nodes": nodes};
    }


    /*
      4/4 Lines - this is for when edges add up to be a big +
    */
    else if (
      (edgeTypes.includes('vertical') && edgeTypes.includes('horizontal')) ||

      (edgeTypes.includes('vertical_right') && edgeTypes.includes('down_left')) ||
      (edgeTypes.includes('vertical_right') && edgeTypes.includes('up_left')) ||

      (edgeTypes.includes('vertical_right') && edgeTypes.includes('up_horizontal')) ||
      (edgeTypes.includes('vertical_right') && edgeTypes.includes('down_horizontal')) ||
      (edgeTypes.includes('vertical_right') && edgeTypes.includes('vertical_left')) ||
      (edgeTypes.includes('vertical_right') && edgeTypes.includes('horizontal')) ||

      (edgeTypes.includes('vertical_left') && edgeTypes.includes('up_right')) ||
      (edgeTypes.includes('vertical_left') && edgeTypes.includes('down_right')) ||

      (edgeTypes.includes('vertical_left') && edgeTypes.includes('up_horizontal')) ||
      (edgeTypes.includes('vertical_left') && edgeTypes.includes('down_horizontal')) ||
      (edgeTypes.includes('vertical_left') && edgeTypes.includes('horizontal')) ||

      (edgeTypes.includes('up_horizontal') && edgeTypes.includes('down_left')) ||
      (edgeTypes.includes('up_horizontal') && edgeTypes.includes('down_right')) ||

      (edgeTypes.includes('up_horizontal') && edgeTypes.includes('vertical')) ||
      (edgeTypes.includes('up_horizontal') && edgeTypes.includes('down_horizontal')) ||

      (edgeTypes.includes('down_horizontal') && edgeTypes.includes('up_left')) ||
      (edgeTypes.includes('down_horizontal') && edgeTypes.includes('up_right')) ||
      (edgeTypes.includes('down_horizontal') && edgeTypes.includes('vertical'))
    ) {

      return {"type": "edge", "direction": "vertical_horizontal", "nodes": nodes};
    }

  }

  // Render --------------------------------------------------------------------


  // renders a <Node/>
  renderNode = (flowchart, nodeID) => {

    let node = flowchart['flow'][nodeID];
    let nodeDetails = flowchart['nodes'][nodeID];

    return (
      <Node
        nodeID={nodeID}
        nodeType={node['nodeType']}
        nodeDescription={nodeDetails['description']}
      />
    );
  }

  // renders an <Edge/>
  renderEdge = (edge) => {
    return (
      <Edge
        direction={edge['direction']}
        nodes={edge['nodes']}
        insertNewCommandNode={this.insertNewCommandNode}
        insertNewIfNode={this.insertNewIfNode}
      />
    );
  }


  // returns flowchart to render
  renderFlowchart = (flowchart) => {

    // convert flowchart into grid format
    let nodeGrid = this.getFlowchartAsGrid(flowchart);
    let gridToRender = [];

    // render grid by building up rows
    for (let i = 0; i < nodeGrid.length; i++) {

      let rowToRender = [];
      let onlyEdgesInRow = true; // rows with only edges will be shorter

      // build up columns in the row
      for (let j = 0; j < nodeGrid[i].length; j++) {

        // get Column type (even columns are edge only)
        let colCSS = (j % 2 === 0) ? "grid_col_no_nodes" : "grid_col";

        // render a node
        if (nodeGrid[i][j]['type'] === "node") {
          onlyEdgesInRow = false;
          rowToRender.push(
            <div className={colCSS}>
              {this.renderNode(flowchart, nodeGrid[i][j]['nodeID'])}
            </div>
          );
        }

        // render edge
        else if (nodeGrid[i][j]['type'] === "edge") {
          rowToRender.push(
            <div className={colCSS}>
              {this.renderEdge(nodeGrid[i][j])}
            </div>
          );
        }

        // if there isn't a node or an edge, it'll just be an empty space
        else {
          rowToRender.push(<div className={colCSS}></div>);
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
