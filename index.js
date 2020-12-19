const tmp = require("tmp-promise")
const path = require("path")
const fs = require("fs")
const childProcess = require("child_process")
const rmfr = require("rmfr")

module.exports = async ({
  packageNameOrPath,
  importPath,
  reactVersion,
  craVersion,
  props,
}) => {
  const { path: tmpDirPath, cleanup } = await tmp.dir()

  const projPath = path.resolve(tmpDirPath, "project")

  fs.mkdirSync(projPath)

  childProcess.execSync(`npx create-react-app@${craVersion} .`, {
    shell: true,
    stdio: "inherit",
    cwd: projPath,
  })
  await rmfr(path.resolve(projPath, "src"))
  fs.mkdirSync(path.resolve(projPath, "src"))

  // TODO windows support
  let isPathToPackage = packageNameOrPath.includes("/")
  if (isPathToPackage) {
    packageNameOrPath = path.resolve(packageNameOrPath)
  }

  // TODO run the parcel from the react-install-render node_modules folder instead
  // of reinstalling parcel on every run
  // childProcess.execSync(
  //   `npm install --production react@${reactVersion} react-dom@${reactVersion} parcel react-test-renderer@${reactVersion} jsdom global-jsdom jsdom-worker node-fetch ${packageNameOrPath}`,
  //   {
  //     shell: true,
  //     stdio: "inherit",
  //     cwd: projPath,
  //   }
  // )

  console.log("Installing package...")
  childProcess.execSync(
    `npm install --production ${packageNameOrPath} parcel react-test-renderer`,
    { shell: true, stdio: "inherit", cwd: projPath }
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
            projPath,
            "node_modules",
            packageNameOrPath.split("@")[0],
            "package.json"
          )
        )
        .toString()
    )
  }

  if (importPath) {
    importPath = importPath.replace(/^\//, "")
  }

  fs.writeFileSync(
    path.resolve(projPath, "src/index.js"),
    `
import TestRenderer from "react-test-renderer"
import TestComponent from "${packageJSON.name}${
      importPath ? `/${importPath}` : ""
    }"

window.runTest = () => {
  console.log("creating test component...")
  const testRenderer = TestRenderer.create(TestComponent(${props}))

  console.log(testRenderer.toJSON())
}


    `.trim()
  )

  childProcess.execSync(`npx parcel build --no-minify ./src/index.js`, {
    shell: true,
    stdio: "inherit",
    cwd: projPath,
  })

  fs.writeFileSync(
    path.resolve(projPath, "run-packed-with-jsdom.js"),
    `
require("global-jsdom")();
require("jsdom-worker");
require("./dist/index.js");
window.runTest();
      `.trim()
  )

  fs.writeFileSync(
    path.resolve(projPath, "dist", "test.html"),
    `
<html>
<head>
<script src="./test.js"></script>
<script>
  window.runTest();
</script>
</head>
</html>


    `.trim()
  )

  console.log("running ", "node run-packed-with-jsdom.js")
  childProcess.execSync(`node run-packed-with-jsdom.js`, {
    shell: true,
    stdio: "inherit",
    cwd: projPath,
  })

  await rmfr(tmpDirPath)
}
