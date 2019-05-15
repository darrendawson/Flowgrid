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
      selectParentNodeActive: false,

      newNodeType: false,
      verticalLineCSS: verticalLineCSS,
      horizontalLineCSS: horizontalLineCSS
    }
  }


  // onClick -------------------------------------------------------------------

  // selects a node type for the new node
  // if there's only one parent, automatically calls createNewNode()
  onClick_SelectNodeType = (nodeType) => {

    let nodes = this.getActiveNodes();
    if (nodes.length === 0) {
      return;
    } else if (nodes.length === 1) {
      this.onClick_CreateNewNode(nodes[0]['parentNodeID'], nodeType);
      return;
    } else if (nodes.length > 1) {
      this.setState({selectParentNodeActive: true, newNodeType: nodeType});
      return;
    }
  }


  // will create a new node in <Flowchart/>
  // nodeType is optional so it can either come from:
  // - <Edge/>.state  (if there are multiple possible parents)
  // - args           (if called directly by onClick_SelectNodeType())
  onClick_CreateNewNode = (parentNodeID, nodeType = false) => {

    // get childNodeID from active nodes
    let nodes = this.getActiveNodes();
    let childNodeID = false;
    for (let i = 0; i < nodes.length && childNodeID === false; i++) {
      if (nodes[i]['parentNodeID'] === parentNodeID) {
        childNodeID = nodes[i]['childNodeID'];
      }
    }

    // if childNode doesn't exist, we can't do anything
    if (!childNodeID) {
      return;
    }

    // insert the new node
    if (this.state.newNodeType === "COMMAND" || nodeType === "COMMAND") {
      this.props.insertNewCommandNode(parentNodeID, childNodeID);
    } else if (this.state.newNodeType === "IF" || nodeType === "IF") {
      this.props.insertNewIfNode(parentNodeID, childNodeID);
    } else if (this.state.newNodeType === "LOOP" || nodeType === "LOOP") {
      this.props.insertNewLoopNode(parentNodeID, childNodeID);
    }

    // clear <Edge/> state
    this.setState({
      mouseHoverActive: false,
      selectNewNodeTypeActive: false,
      selectParentNodeActive: false,
      newNodeType: false
    });
  }



  // Nodes ---------------------------------------------------------------------

  // returns a list of all (parentNode, childNode) combinations that allow
  // the user to create a new node inbetween them: parentNode->[NEW NODE]->childNode
  getActiveNodes = () => {
    let activeNodes = [];
    for (let i = 0; i < this.props.nodes.length; i++) {
      let parentChildNodes = this.props.nodes[i];
      if (parentChildNodes['createNewNodesActive']) {
        activeNodes.push({
          parentNodeID: parentChildNodes['parentNodeID'],
          childNodeID: parentChildNodes['childNodeID'],
          createNewNodesActive: true
        });
      }
    }
    return activeNodes;
  }

  // gets relative directions of Active parentNodes to current edge
  // reverses lookup order so you reference by a nodeID by its relative direction (instead of visa versa)
  getActiveParentNodeDirections = () => {

    let parentNodeDirections = {};

    for (let i = 0; i < this.props.nodes.length; i++) {
      let parentChildNodes = this.props.nodes[i];
      if (parentChildNodes['createNewNodesActive']) {

        let parentID = parentChildNodes['parentNodeID'];
        let parentDirection = this.props.parentDirections[parentID];
        parentNodeDirections[parentDirection] = parentID;
      }
    }

    return parentNodeDirections;
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

  // Render Line Types ---------------------------------------------------------

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


  // Render --------------------------------------------------------------------

  // renders menu for selecting which parent is the real parent
  renderSelectParentNode = () => {

    // get IDs for parent nodes
    let parentNodeDirections = this.getActiveParentNodeDirections();
    let upParentID = parentNodeDirections['up'];
    let upRightParentID = parentNodeDirections['up_right'];

    return (
      <div id="edge_container_select_parent">

        {/* UP parent*/}
        <div className="vertical_line" onClick={() => this.onClick_CreateNewNode(upParentID)}></div>
        <div className="row">
          <div className="empty_horizontal_line"></div>
          <div className="center_space"></div>

          {/* UP-RIGHT parent*/}
          <div className="horizontal_line" onClick={() => this.onClick_CreateNewNode(upRightParentID)}></div>
        </div>
        <div className="empty_vertical_line"></div>
      </div>
    );
  }

  // renders menu for selecting the type of a new node
  renderSelectNewNodeType = () => {
    return (
      <div className="choose_node_type_container">
        <button
          className="pick_new_node_type_button"
          onClick={() => this.onClick_SelectNodeType("COMMAND")}
          >Command
        </button>

        <button
          className="pick_new_node_type_button"
          onClick={() => this.onClick_SelectNodeType("IF")}
          >If
        </button>
        <button className="pick_new_node_type_button"
          onClick={() => this.onClick_SelectNodeType("LOOP")}
          >Loop</button>
      </div>
    );
  }


  // create button is the big plus you press to initiate creating a new node
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


  // edge has 2 options for rendering:
  // 1) User has not clicked the createNewNode button
  //    -> renders as an edge
  // 2) user has clicked the createNewNode button
  //    -> renders the choice they have (create new Command Node or create new If Node)
  renderEdge = () => {

    //
    if (this.state.selectNewNodeTypeActive) {

      let activeParentNodes = this.getActiveParentNodeDirections();

      if (this.state.selectParentNodeActive) {
        return this.renderSelectParentNode();

      } else {
        return this.renderSelectNewNodeType();
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



  // renders the <Edge/>
  render() {

    // call this in the render function because of weird props/constructor issues
    this.fixLineColors();

    return (
      <div id="EDGE"
        onMouseEnter={() => this.setState({mouseHoverActive: true})}
        onMouseLeave={() => this.setState({mouseHoverActive: false, selectNewNodeTypeActive: false, selectParentNodeActive: false, newNodeType: false})}>
        {this.renderEdge()}
      </div>
    );
  }
}

export default Edge;
