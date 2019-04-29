import React, { Component } from 'react';
import './App.css';

import Flowchart from './Components/Flowchart/Flowchart.js';

class App extends Component {

  constructor() {
    super();

    let flowchart = this.createEmptyFlowchart();
    let rootNodeID = flowchart['rootNodeID'];
    let endNodeID = flowchart['flow'][rootNodeID]['nextNodeID'];

    flowchart = this.insertEmptyIfNode(flowchart, rootNodeID);
    let ifNodeID = flowchart['flow'][rootNodeID]['nextNodeID'];
    flowchart = this.insertEmptyIfNode(flowchart, ifNodeID, false);
    flowchart = this.insertEmptyIfNode(flowchart, ifNodeID, true);

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


  // inserts an empty command node into the flowchart between parent and child
  // if the parent is an IF node, then rewriting parent['nextNodeID'] will actually be parent['nextNodeID_IfTrue/False']
  // [parent Node]
  //      |
  // [New Node]
  //      |
  // [Child Node]
  insertEmptyCommandNode = (flowchart, parentNodeID, branchTakenIsTrue = false) => {

    // add node to flowchart and have it point at child
    let childNodeID = this.getChildNodeID(flowchart, parentNodeID, branchTakenIsTrue);
    let newNodeID = this.getNewNodeID(flowchart);
    let newNode = {nodeID: newNodeID, nodeType: "COMMAND", nextNodeID: childNodeID};
    flowchart['flow'][newNodeID] = newNode;

    // rewrite parent so it'll point at the new node instead of the child node
    flowchart = this.redirectParentNode(flowchart, parentNodeID, newNodeID, branchTakenIsTrue);

    return flowchart;
  }


  // inserts an empty IF node into flowchart between parent and child
  // - inserts a bunch of other nodes to make it work
  //
  // [Parent Node]
  //      |
  // [New IF Node]  ------- [New Command Node]
  //      |                         |
  // [New Command Node]             |
  //      |                         |
  //      |--------------------------
  //      |
  // [New Merge Node]
  //      |
  // [Child Node]
  insertEmptyIfNode = (flowchart, parentNodeID, branchTakenIsTrue = false) => {

    // get what the child of the current parent
    let childNodeID = this.getChildNodeID(flowchart, parentNodeID, branchTakenIsTrue);

    // get nodeIDs for all the newly generated nodes
    let ifNodeID = this.getNewNodeID(flowchart);
    flowchart['flow'][ifNodeID] = 1;
    let ifFalseNodeID = this.getNewNodeID(flowchart);
    flowchart['flow'][ifFalseNodeID] = 1;
    let ifTrueNodeID = this.getNewNodeID(flowchart);
    flowchart['flow'][ifTrueNodeID] = 1;
    let mergeNodeID = this.getNewNodeID(flowchart);
    flowchart['flow'][mergeNodeID] = 1;


    // rewrite parentNode so it points at the new IfNode
    flowchart = this.redirectParentNode(flowchart, parentNodeID, ifNodeID, branchTakenIsTrue);

    // create new IF node and add it to flowchart
    flowchart['flow'][ifNodeID] = {
      nodeID: ifNodeID,
      nodeType: "IF",
      nextNodeID_IfTrue: ifTrueNodeID,
      nextNodeID_IfFalse: ifFalseNodeID,
      mergeNodeID: mergeNodeID
    };

    // create the ifTrue and ifFalse command Nodes and add them to flowchart
    flowchart['flow'][ifFalseNodeID] = {
      nodeID: ifFalseNodeID,
      nodeType: "COMMAND",
      nextNodeID: mergeNodeID
    };

    flowchart['flow'][ifTrueNodeID] = {
      nodeID: ifTrueNodeID,
      nodeType: "COMMAND",
      nextNodeID: mergeNodeID
    }

    // add the mergeNode to the flowchart
    flowchart['flow'][mergeNodeID] = {
      nodeID: mergeNodeID,
      nodeType: "MERGE",
      nextNodeID: childNodeID
    };

    return flowchart;
  }



  // convenience function for properly pointing a parent at a child
  // handles cases where parent is a commandNode or an IfNode
  redirectParentNode = (flowchart, parentNodeID, childNodeID, branchTakenIsTrue = false) => {

    if (flowchart['flow'][parentNodeID]['nodeType'] === "IF") {
      let branchTaken = (branchTakenIsTrue) ? "nextNodeID_IfTrue" : "nextNodeID_IfFalse";
      flowchart['flow'][parentNodeID][branchTaken] = childNodeID;
    } else {
      flowchart['flow'][parentNodeID]['nextNodeID'] = childNodeID;
    }

    return flowchart;
  }


  // gets the ID for the child of a node
  // -> handles situation where the parent is an IF and needs to branch
  getChildNodeID = (flowchart, parentNodeID, branchTakenIsTrue = false) => {

    let parentNode = flowchart['flow'][parentNodeID];

    if (parentNode['nodeType'] === "IF") {
      if (branchTakenIsTrue) {
        return parentNode['nextNodeID_IfTrue'];
      } else {
        return parentNode['nextNodeID_IfFalse'];
      }
    } else {
      return parentNode['nextNodeID'];
    }
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
