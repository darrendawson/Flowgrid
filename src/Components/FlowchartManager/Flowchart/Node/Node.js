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
    if (this.props.nodeType === "IF") {

      let nodeCSS = (this.props.nodeSelected) ? "diamond_selected" : "diamond";

      return (
        <div id="NODE" onClick={this.props.selectNode}>
          <div className={nodeCSS}>
            <div className="diamond_content">
              <p>{this.props.nodeDescription}</p>
            </div>
          </div>
        </div>
      );
    }

    else {
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
}

export default Node;
