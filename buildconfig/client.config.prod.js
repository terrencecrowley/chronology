const path = require("path");
const common = require("./client.config.common");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
  mode: 'production',

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'client.bundle.js'
  }
});
