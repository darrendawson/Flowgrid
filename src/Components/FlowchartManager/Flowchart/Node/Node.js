/*
  Props:
   - nodeID:            the unique id for this node
   - nodeType:          [IF, COMMAND, MERGE, START, or END] -> used to determine how this node gets rendered
   - nodeDescription:   a text description of what that node does (like a comment)
*/

import React, { Component } from 'react';
import './Node.css';

class Node extends Component {

  constructor() {
    super();
  }

  render() {

    // a selected node will have  a border highlight
    let nodeCSS = (this.props.nodeSelected) ? "selected" : "";

    return (
      <div
        id="NODE"
        className={nodeCSS}
        onClick={this.props.selectNode}>
        <p>{this.props.nodeType} ({this.props.nodeID})</p>
        <p>{this.props.nodeDescription}</p>
      </div>
    );
  }
}

export default Node;
