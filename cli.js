#!/usr/bin/env node

const yargs = require("yargs")
const { hideBin } = require("yargs/helpers")
const reactInstallRender = require("./index.js")

const args = yargs(hideBin(process.argv))
  .usage("Usage: $0 <package-name-or-path> [--props '{}']")
  .demandCommand(1)
  .option("props", { describe: "Props to pass to default export" })
  .default("props", "{}")
  // .option("react-version", {
  //   describe: "React version to use",
  //   default: "latest",
  // })
  .option("cra-version", {
    describe: "Create React App version to use",
    default: "latest",
  })
  .option("import-path", {
    describe: "path to component to import (by default, uses default export)",
  }).argv

const [packageNameOrPath] = args._
const { props, reactVersion, importPath, craVersion } = args

reactInstallRender({
  props,
  reactVersion,
  importPath,
  packageNameOrPath,
  craVersion,
}).then(() => {
  console.log("success!")
})
