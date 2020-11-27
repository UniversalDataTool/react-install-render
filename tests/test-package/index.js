// We use an add package to demonstrate that dependencies are installed
const add = require("add")
const React = require("react")

// <Component a={1} b={2} /> => <div>3</div>
module.exports = ({ a, b }) => {
  return React.createElement("div", {}, add([a, b]))
}
