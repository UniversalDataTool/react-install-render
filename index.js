const tmp = require("tmp")

module.exports = async ({}) => {
  const { path } = await tmp.dir()
  console.log({ path })
}
