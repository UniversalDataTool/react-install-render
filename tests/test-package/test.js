import TestRenderer from "react-test-renderer"
import TestComponent from "./index.js"

const testRenderer = TestRenderer.create(TestComponent({ a: 1, b: 2 }))

console.log(testRenderer.toJSON())
