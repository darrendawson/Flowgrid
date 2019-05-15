/*
  <FlowchartSidebar/> renders details about a node and lets user modify them
*/

import React, { Component } from 'react';
import './FlowchartSidebar.css';

class FlowchartSidebar extends Component {

  constructor() {
    super();
  }

  // Render --------------------------------------------------------------------

  render() {
    return (
      <div id="FLOWCHART_SIDEBAR">
        <div className="row_flex_between">
          <div className="row_flex_start">
            <h1 id="node_title">{this.props.nodeID}</h1>
            <h3 id="node_type">({this.props.nodeType})</h3>
          </div>
          <button id="close_sidebar_button" onClick={this.props.closeSidebar}>X</button>
        </div>
        <div className="divider"></div>

        <div className="row_flex_between">
          <p>{this.props.nodeDescription}</p>
        </div>
      </div>
    );
  }
}

export default FlowchartSidebar;
