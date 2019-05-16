## FlowGrid: Flowcharts in React

FlowGrid demos a functioning Flowchart built exclusively with React.js components and no external libraries.
This chart renders as a 2D grid of nodes, edges, and empty spaces so it doesn't need to use <canvas/> elements.

<FlowchartManager/> is the component to interface with.
It contains:
 - <Flowchart/>             Renders the Flowchart as a grid  
 - <FlowchartSidebar/>      Renders details about selected Node and lets user modify them


## How to Use

Flowgrid isn't on NPM. To add Flowgrid to your React project:

1. Copy and paste all code nested in ./src/Components/FlowchartManager into your React project
2. import {FlowchartManager, FlowchartFunctions} from FlowchartManager.js
    (FlowchartManager is the component, FlowchartFunctions is a class with functions for manipulating a flowchart)
3. Declare an instance of FlowchartFunctions
4. Use it to create a Flowchart object and pass it to <FlowchartManager/>. You'll need to pass in an updateFlowchart function as a prop as well.

Basically, just look at App.js and use the code there!


## Flowgrid Object

A flowchart object is a JS object of form:
{
  'rootNodeID': "",
  'flow': {nodeID: nodeFlowDetails, ....},
  'nodes': {nodeID: nodeDetails, ....}
}

Where:
nodeFlowDetails = {
  'nodeID': "",
  'nextNodeID': "",
  'nextNodeID_IfTrue': "",    // used for branching
  'nextNodeID_IfFalse': ""    // used for branching
}

And:
nodeDetails = {
  'nodeID': "",
  'description': ""
}

You should expand on what's inside nodeDetails to fit your particular use case.


## React Configuration

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
