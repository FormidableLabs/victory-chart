"use strict";
/**
 * Webpack frontend perf configuration.
 */
var path = require("path");
var prodCfg = require("./webpack.config");

var _ = require("lodash");

// Replace with `__dirname` if using in project root.
var ROOT = process.cwd();

module.exports = {
  cache: true,
  context: path.join(ROOT, "perf/client"),
  entry: "./main",
  output: {
    filename: "main.js",
    publicPath: "/assets/"
  },
  resolve: _.merge({}, prodCfg.resolve, {
    alias: {
      // Allow root import of `src/FOO` from ROOT/src.
      src: path.join(ROOT, "src")
    }
  }),
  module: _.assign({}, prodCfg.module, {
    rules: (prodCfg.module.rules || []).concat([
      {
        test: /\.json$/,
        loader: require.resolve("json-loader")
      }
    ])
  }),
  devtool: "source-map"
};
