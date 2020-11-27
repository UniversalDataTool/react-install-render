const tmp = require("tmp-promise")
const path = require("path")
const fs = require("fs")
const childProcess = require("child_process")
const rmfr = require("rmfr")

module.exports = async ({ packageNameOrPath, props }) => {
  const { path: tmpDirPath, cleanup } = await tmp.dir()

  childProcess.execSync("npm init -y", {
    shell: true,
    stdio: "inherit",
    cwd: tmpDirPath,
  })

  // TODO windows support
  let isPathToPackage = packageNameOrPath.includes("/")
  if (isPathToPackage) {
    packageNameOrPath = path.resolve(packageNameOrPath)
  }

  // TODO run the parcel from the react-install-render node_modules folder instead
  // of reinstalling parcel on every run
  childProcess.execSync(
    `npm install react parcel react-test-renderer ${packageNameOrPath}`,
    {
      shell: true,
      stdio: "inherit",
      cwd: tmpDirPath,
    }
  )

  let packageJSON
  if (isPathToPackage) {
    packageJSON = JSON.parse(
      fs
        .readFileSync(path.resolve(packageNameOrPath, "package.json"))
        .toString()
    )
  } else {
    packageJSON = JSON.parse(
      fs
        .readFileSync(
          path.resolve(
            tmpDirPath,
            "node_modules",
            packageNameOrPath,
            "package.json"
          )
        )
        .toString()
    )
  }

  fs.writeFileSync(
    path.resolve(tmpDirPath, "test.js"),
    `

import TestRenderer from "react-test-renderer"
import TestComponent from "${packageJSON.name}"

global.window = {}

const testRenderer = TestRenderer.create(TestComponent(${props}))

console.log(testRenderer.toJSON())


    `.trim()
  )

  childProcess.execSync(`npx parcel build ./test.js`, {
    shell: true,
    stdio: "inherit",
    cwd: tmpDirPath,
  })

  childProcess.execSync(`node dist/test.js`, {
    shell: true,
    stdio: "inherit",
    cwd: tmpDirPath,
  })

  await rmfr(tmpDirPath)
}
