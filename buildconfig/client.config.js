module.exports = {
  entry: './src/client/client.tsx',
  target: 'web',

  externals: {
    "jquery": "jQuery",
    "react": "React",
    "react-dom": "ReactDOM",
    "shpjs": "shp",
    "mapbox-gl": "mapboxgl"
  },

  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    /*fallback: { "buffer": require.resolve("buffer/") }*/
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.js$/, enforce: "pre", loader: "source-map-loader" },
      { test: /\.scss$/,
        use:[
        {
          loader: 'file-loader',
          options: {
          name: 'bundle.css',
          outputPath: __dirname + '/dist'
          },
        },
        { loader: 'extract-loader' },
        { loader: 'css-loader' },
        {
          loader: 'sass-loader',
          options: {
          includePaths: ['./node_modules']
          }
        }
        ]
      }
    ]
  }
};
