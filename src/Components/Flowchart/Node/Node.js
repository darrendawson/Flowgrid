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
    return (
      <div className="Node">
        <p>{this.props.nodeType}</p>
        <p>{this.props.nodeID}</p>
      </div>
    );
  }
}

export default Node;
