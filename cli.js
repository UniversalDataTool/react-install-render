#!/usr/bin/env node

const yargs = require("yargs")
const { hideBin } = require("yargs/helpers")

const args = yargs(hideBin(process.argv))
  .usage("Usage: $0 <package-name-or-path> [--props '{}']")
  .demandCommand(0)
  .option("props", { describe: "Props to pass to default export" })
  .default("props", {}).argv

console.log(args)
