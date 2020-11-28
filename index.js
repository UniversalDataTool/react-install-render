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

window.runTest = () => {
  const testRenderer = TestRenderer.create(TestComponent(${props}))

  console.log(testRenderer.toJSON())
}


    `.trim()
  )

  childProcess.execSync(`npx parcel build ./test.js`, {
    shell: true,
    stdio: "inherit",
    cwd: tmpDirPath,
  })

  console.log("Creating", path.resolve(tmpDirPath, "run-packed-with-jsdom.js"))
  fs.writeFileSync(
    path.resolve(tmpDirPath, "run-packed-with-jsdom.js"),
    `
// As recommended by https://github.com/jsdom/jsdom/wiki/Don't-stuff-jsdom-globals-onto-the-Node-global
const jsdom = require("jsdom");
const fs = require("fs");
const { window } = new jsdom.JSDOM("", { runScripts: "dangerously" });

const lib = fs.readFileSync("./dist/test.js", { encoding: "utf-8" });
const scriptEl = window.document.createElement("script");
scriptEl.textContent = lib;

window.document.head.appendChild(scriptEl);

scriptEl.onerror = (e) => {
  console.log(
    "error loading react element:" +
      e.toString() +
      "\\n\\nSince the output has been minified, this is pretty tricky to debug. Try using your React Component manually (with an \\"npm install path/to/your/package\\" on your package). You can always create an issue if you think it's a problem with this module. https://github.com/UniversalDataTool/react-install-render/issues"
  );
};

window.runTest();
      `.trim()
  )

  console.log("running ", "node run-packed-with-jsdom.js")
  childProcess.execSync(`node run-packed-with-jsdom.js`, {
    shell: true,
    stdio: "inherit",
    cwd: tmpDirPath,
  })

  await rmfr(tmpDirPath)
}
