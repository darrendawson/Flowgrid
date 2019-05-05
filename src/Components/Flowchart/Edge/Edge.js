import React, { Component } from 'react';
import './Edge.css';

class Edge extends Component {


  constructor() {
    super();

    this.state = {
      mouseHoverActive: false,
      selectNewNodeTypeActive: false
    }
  }


  // onClick -------------------------------------------------------------------

  onClick_CreateNewNode = (nodeType) => {

    let parentNodeID = this.props.nodes[0]['parentNodeID'];
    let childNodeID = this.props.nodes[0]['childNodeID'];

    if (nodeType === "COMMAND") {
      this.props.insertNewCommandNode(parentNodeID, childNodeID);
    } else if (nodeType === "IF") {
      this.props.insertNewIfNode(parentNodeID, childNodeID);
    }

    this.setState({mouseHoverActive: false, selectNewNodeTypeActive: false});
  }



  // Render --------------------------------------------------------------------


  renderCreateButton = () => {

    let parentNodeID = this.props.nodes[0]['parentNodeID'];
    let childNodeID = this.props.nodes[0]['childNodeID'];

    return (
      <button
        id="create_button"
        onClick={() => this.setState({selectNewNodeTypeActive: true})}
        >+
      </button>
    );
  }

  //
  renderVertical = () => {
    if (this.state.mouseHoverActive) {
      return (
        <div className="vertical">
          <div className="line"></div>
          {this.renderCreateButton()}
          <div className="line"></div>
        </div>
      );
    } else {
      return (
        <div className="vertical">
          <div className="line"></div>
        </div>
      );
    }
  }


  renderHorizontal = () => {
    if (this.state.mouseHoverActive) {
      return (
        <div className="horizontal">
          <div className="line"></div>
          {this.renderCreateButton()}
          <div className="line"></div>
        </div>
      );
    } else {
      return (
        <div className="horizontal">
          <div className="line"></div>
        </div>
      );
    }
  }


  renderUpLeft = () => {
    if (this.state.mouseHoverActive) {
      return (
        <div className="down_left">
          <div className="vertical_line"></div>
          <div className="row">
            <div className="horizontal_line"></div>
            {this.renderCreateButton()}
            <div className="horizontal_empty_line"></div>
          </div>
          <div className="vertical_empty_line"></div>
        </div>
      );
    } else {
      return (
        <div className="down_left">
          <div className="vertical_line"></div>
          <div className="row">
            <div className="horizontal_line"></div>
            <div className="filling_line"></div>
            <div className="horizontal_empty_line"></div>
          </div>
          <div className="vertical_empty_line"></div>
        </div>
      );
    }
  }


  renderVerticalRight = () => {
    if (this.state.mouseHoverActive) {
      return (
        <div className="vertical_right">
          <div className="vertical_line"></div>
          <div className="row">
            <div className="horizontal_empty_line"></div>
            {this.renderCreateButton()}
            <div className="horizontal_line"></div>
          </div>
          <div className="vertical_line"></div>
        </div>
      );
    } else {
      return (
        <div className="vertical_right">
          <div className="vertical_line"></div>
          <div className="row">
            <div className="horizontal_empty_line"></div>
            <div className="filling_line"></div>
            <div className="horizontal_line"></div>
          </div>
          <div className="vertical_line"></div>
        </div>
      );
    }
  }

  // edge has 2 options for rendering:
  // 1) User has not clicked the createNewNode button
  //    -> renders as an edge
  // 2) user has clicked the createNewNode button
  //    -> renders the choice they have (create new Command Node or create new If Node)
  renderEdge = () => {

    //
    if (this.state.selectNewNodeTypeActive) {

      return (
        <div className="choose_node_type_container">
          <button
            className="pick_new_node_type_button"
            onClick={() => this.onClick_CreateNewNode("COMMAND")}
            >Command
          </button>

          <button
            className="pick_new_node_type_button"
            onClick={() => this.onClick_CreateNewNode("IF")}
            >If
          </button>
          <button className="pick_new_node_type_button">Loop</button>
        </div>
      );


    } else {

      // Render edge normally
      if (this.props.direction === "vertical") {
        return this.renderVertical();

      } else if (this.props.direction === "horizontal") {
        return this.renderHorizontal();

      } else if (this.props.direction === "up_left") {
        return this.renderUpLeft();

      } else if (this.props.direction === "vertical_right") {
        return this.renderVerticalRight();

      } else {
        return (
          <div>
            <p>{this.props.direction}</p>
          </div>
        );
      }
    }
  }



  render() {
    return (
      <div id="EDGE"
        onMouseEnter={() => this.setState({mouseHoverActive: true})}
        onMouseLeave={() => this.setState({mouseHoverActive: false, selectNewNodeTypeActive: false})}>
        {this.renderEdge()}
      </div>
    );
  }
}

export default Edge;
