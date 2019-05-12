import React, { Component } from 'react';
import './Edge.css';

class Edge extends Component {


  constructor(props) {
    super(props);

    let activeNodes = this.getActiveNodes();
    let lineColorCSS = (activeNodes.length > 0) ? "white" : "grey";
    let verticalLineCSS = "vertical_line " + lineColorCSS;
    let horizontalLineCSS = "horizontal_line " + lineColorCSS;

    this.state = {
      mouseHoverActive: false,
      selectNewNodeTypeActive: false,

      verticalLineCSS: verticalLineCSS,
      horizontalLineCSS: horizontalLineCSS
    }
  }


  // onClick -------------------------------------------------------------------

  onClick_CreateNewNode = (nodeType) => {

    let nodes = this.getActiveNodes();
    if (nodes.length === 0) {
      return;
    }

    let parentNodeID = nodes[0]['parentNodeID'];
    let childNodeID = nodes[0]['childNodeID'];

    if (nodeType === "COMMAND") {
      this.props.insertNewCommandNode(parentNodeID, childNodeID);
    } else if (nodeType === "IF") {
      this.props.insertNewIfNode(parentNodeID, childNodeID);
    }

    this.setState({mouseHoverActive: false, selectNewNodeTypeActive: false});
  }



  // Nodes ---------------------------------------------------------------------

  // returns a list of all (parentNode, childNode) combinations that allow
  // the user to create a new node inbetween them: parentNode->[NEW NODE]->childNode
  getActiveNodes = () => {
    let activeNodes = [];
    for (let i = 0; i < this.props.nodes.length; i++) {
      let nodes = this.props.nodes[i];
      if (nodes['createNewNodesActive']) {
        activeNodes.push({
          parentNodeID: nodes['parentNodeID'],
          childNodeID: nodes['childNodeID'],
          createNewNodesActive: true
        });
      }
    }
    return activeNodes;
  }

  // makes sure that an <Edge/> with no activeNodes will render grey
  // (this function is necessary because of React's constructor being unreliable for some cases)
  // -> it gets called in every render to double check
  fixLineColors = () => {

    let activeNodes = this.getActiveNodes();
    let lineColorCSS = (activeNodes.length > 0) ? "white" : "grey";
    let verticalLineCSS = "vertical_line " + lineColorCSS;
    let horizontalLineCSS = "horizontal_line " + lineColorCSS;

    if (this.state.horizontalLineCSS !== horizontalLineCSS) {
      this.setState({horizontalLineCSS: horizontalLineCSS});
    } else if (this.state.verticalLineCSS !== verticalLineCSS) {
      this.setState({verticalLineCSS: verticalLineCSS});
    }
  }

  // Render --------------------------------------------------------------------


  renderCreateButton = () => {

    let nodes = this.getActiveNodes();
    if (nodes.length === 0) {
      return;
    }

    let parentNodeID = nodes[0]['parentNodeID'];
    let childNodeID = nodes[0]['childNodeID'];

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
        <div className="edge_container">
          <div className={this.state.verticalLineCSS}></div>
          {this.renderCreateButton()}
          <div className={this.state.verticalLineCSS}></div>
        </div>
      );
    } else {
      return (
        <div className="edge_container">
          <div className={this.state.verticalLineCSS}></div>
        </div>
      );
    }
  }


  renderHorizontal = () => {
    if (this.state.mouseHoverActive) {
      return (
        <div className="edge_container">
          <div className="row">
            <div className={this.state.horizontalLineCSS}></div>
            {this.renderCreateButton()}
            <div className={this.state.horizontalLineCSS}></div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="edge_container">
          <div className="row">
            <div className={this.state.horizontalLineCSS}></div>
          </div>
        </div>
      );
    }
  }


  renderUpLeft = () => {
    if (this.state.mouseHoverActive) {
      return (
        <div className="edge_container">
          <div className={this.state.verticalLineCSS}></div>
          <div className="row">
            <div className={this.state.horizontalLineCSS}></div>
            {this.renderCreateButton()}
            <div className="empty_horizontal_line"></div>
          </div>
          <div className="empty_vertical_line"></div>
        </div>
      );
    } else {
      return (
        <div className="edge_container">
          <div className={this.state.verticalLineCSS}></div>
          <div className="row">
            <div className={this.state.horizontalLineCSS}></div>
            <div className="filling_line"></div>
            <div className="empty_horizontal_line"></div>
          </div>
          <div className="empty_vertical_line"></div>
        </div>
      );
    }
  }


  renderVerticalRight = () => {
    if (this.state.mouseHoverActive) {
      return (
        <div className="edge_container">
          <div className={this.state.verticalLineCSS}></div>
          <div className="row">
            <div className="empty_horizontal_line"></div>
            {this.renderCreateButton()}
            <div className={this.state.horizontalLineCSS}></div>
          </div>
          <div className={this.state.verticalLineCSS}></div>
        </div>
      );
    } else {
      return (
        <div className="edge_container">
          <div className={this.state.verticalLineCSS}></div>
          <div className="row">
            <div className="empty_horizontal_line"></div>
            <div className={this.state.horizontalLineCSS}></div>
          </div>
          <div className={this.state.verticalLineCSS}></div>
        </div>
      );
    }
  }


  // the DOWN portion of this is constant grey down_horizontal can only happen if a loop is merging back
  // (and loop edges are grey)
  renderDownHorizontal = () => {
    if (this.state.mouseHoverActive) {
      return (
        <div className="edge_container">
          <div className="empty_vertical_line"></div>
          <div className="row">
            <div className={this.state.horizontalLineCSS}></div>
            {this.renderCreateButton()}
            <div className={this.state.horizontalLineCSS}></div>
          </div>
          <div className="vertical_line grey"></div>
        </div>
      );
    } else {
      return (
        <div className="edge_container">
          <div className="empty_vertical_line"></div>
          <div className="row">
            <div className={this.state.horizontalLineCSS}></div>
            <div className={this.state.horizontalLineCSS}></div>
          </div>
          <div className="vertical_line grey"></div>
        </div>
      );
    }
  }


  renderUpRight = () => {
    if (this.state.mouseHoverActive) {
      return (
        <div className="edge_container">
          <div className={this.state.verticalLineCSS}></div>
          <div className="row">
            <div className="empty_horizontal_line"></div>
            {this.renderCreateButton()}
            <div className={this.state.horizontalLineCSS}></div>
          </div>
          <div className="empty_vertical_line"></div>
        </div>
      );
    } else {
      return (
        <div className="edge_container">
          <div className={this.state.verticalLineCSS}></div>
          <div className="row">
            <div className="empty_horizontal_line"></div>
            <div className={this.state.horizontalLineCSS}></div>
          </div>
          <div className="empty_vertical_line"></div>
        </div>
      );
    }
  }

  renderDownRight = () => {
    if (this.state.mouseHoverActive) {
      return (
        <div className="edge_container">
          <div className="empty_vertical_line"></div>
          <div className="row">
            <div className="empty_horizontal_line"></div>
            {this.renderCreateButton()}
            <div className={this.state.horizontalLineCSS}></div>
          </div>
          <div className={this.state.verticalLineCSS}></div>
        </div>
      );
    } else {
      return (
        <div className="edge_container">
          <div className="empty_vertical_line"></div>
          <div className="row">
            <div className="empty_horizontal_line"></div>
            <div className={this.state.horizontalLineCSS}></div>
          </div>
          <div className={this.state.verticalLineCSS}></div>
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

      if (this.getActiveNodes().length === 1) {
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
        return (
          <p>{JSON.stringify(this.props.parentDirections)}</p>
        );
      }


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

      } else if (this.props.direction === "down_horizontal") {
        return this.renderDownHorizontal();

      } else if (this.props.direction === "up_right") {
        return this.renderUpRight();

      } else if (this.props.direction === "down_right") {
        return this.renderDownRight();

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

    // call this in the render function because of weird props/constructor issues
    this.fixLineColors();

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
