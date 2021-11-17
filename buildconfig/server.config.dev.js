const path = require("path");
const common = require("./server.config.common");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
  mode: 'development',

  // Enable source maps
  devtool: "source-map"
});
