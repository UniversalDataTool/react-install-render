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

  childProcess.execSync(
    `npm install react react-test-renderer ${packageNameOrPath}`,
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

const TestComponent = require("${packageJSON.name}")
const TestRenderer = require("react-test-renderer")

const testRenderer = TestRenderer.create(TestComponent(${props}))

console.log(testRenderer.toJSON())


    `.trim()
  )

  childProcess.execSync(`node test.js`, {
    shell: true,
    stdio: "inherit",
    cwd: tmpDirPath,
  })

  await rmfr(tmpDirPath)
}
