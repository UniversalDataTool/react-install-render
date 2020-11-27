#!/usr/bin/env node

const yargs = require("yargs")
const { hideBin } = require("yargs/helpers")
const reactInstallRender = require("./index.js")

const args = yargs(hideBin(process.argv))
  .usage("Usage: $0 <package-name-or-path> [--props '{}']")
  .demandCommand(1)
  .option("props", { describe: "Props to pass to default export" })
  .default("props", "{}").argv

const [packageNameOrPath] = args._
const { props } = args

reactInstallRender({ packageNameOrPath, props }).then(() => {
  console.log("success!")
})
