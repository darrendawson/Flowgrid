import React, { Component } from 'react';
import './Flowchart.css';

class Flowchart extends Component {

  constructor() {
    super();
  }

  render() {
    return (
      <div id="Flowchart">
        <p>{JSON.stringify(this.props.flowchart)}</p>
      </div>
    );
  }
}

export default Flowchart;
