const path = require("path");
const common = require("./client.config");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
  mode: 'production',

  output: {
    path: path.resolve(__dirname, '../../dist'),
    filename: 'draclient.bundle.js'
  }
});
