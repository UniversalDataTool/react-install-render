// We use an add package to demonstrate that dependencies are installed
import add from "add"
import React from "react"

// <Component a={1} b={2} /> => <div>3</div>
module.exports = ({ a, b }) => {
  window.a = 1
  return React.createElement("div", {}, add([a, b]))
}
