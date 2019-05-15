/*
  <FlowchartSidebar/> renders details about a node and lets user modify them
*/

import React, { Component } from 'react';
import './FlowchartSidebar.css';

class FlowchartSidebar extends Component {

  constructor() {
    super();
  }

  // Update Node Info ----------------------------------------------------------

  // updates the description parameter of this node
  updateNodeDescription = (event) => {
    let flowchart = this.props.flowchart;
    let newDescription = event.target.value;

    if (this.props.nodeDescription !== newDescription) {
      flowchart['nodes'][this.props.nodeID]['description'] = newDescription;
      this.props.updateFlowchart(flowchart);
    }
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
        <div className="empty_row"></div>

        <h3 className="section_title">Node Tag</h3>          
        <div className="row_flex_center">
          <input
            className="description_input"
            value={this.props.nodeDescription}
            onChange={this.updateNodeDescription.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default FlowchartSidebar;
