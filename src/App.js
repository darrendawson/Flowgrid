import React, { Component } from 'react';
import './App.css';

import Flowchart from './Components/Flowchart/Flowchart.js';

class App extends Component {

  constructor() {
    super();
  }

  render() {
    return (
      <div className="App">
        <Flowchart/>
      </div>
    );
  }
}

export default App;
