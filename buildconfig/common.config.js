var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
       return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
});

// include aws-sdk explicitly
delete nodeModules['aws-sdk'];

var serverConfig = {
  entry: './src/server/server.ts',
  target: 'node',
  output: {
    path: __dirname + '/../dist',
    filename: 'server.bundle.js'
  },
  externals: nodeModules,

  // Enable source maps
  devtool: "source-map",

  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },

  module: {
    rules: [
      { test: /\.json$/, exclude: /node_modules/, loader: 'json-loader' },
			{ test: /\.node$/, loader: 'node-loader' },
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.js$/, enforce: "pre", loader: "source-map-loader" }
    ]
  }
};

module.exports = serverConfig;
