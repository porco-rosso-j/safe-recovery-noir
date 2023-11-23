const webpack = require("webpack");
const { EsbuildPlugin } = require('esbuild-loader')

module.exports = {
  webpack: function override(config, webpackEnv) {

    let loaders = config.resolve
    loaders.fallback = {
      "fs": false,
      "http": false,
      "https": false,
      "zlib": false,
      "path": false,
      "stream": false,
      "url": false,
      "crypto": false,
      "assert": false,
      util: require.resolve("util/"),
      os: false,
      // os: require.resolve("os-browserify/browser")
    }

    config.plugins = (config.plugins || []).concat([
      new webpack.ProvidePlugin({
        // why need to add .js? 
        process: "process/browser.js",
        Buffer: ["buffer", "Buffer"],
      }),
    ]);

    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        // "./node_modules/@graphql-tools/url-loader/cjs$": path.resolve(__dirname, "index.js")
        os: "./node_modules/os-browserify/browser.js"
      },
    }

    config.module = {
      ...config.module,
      rules: [
        // filter out the  babel-loader
        ...config.module.rules.filter(rule => {
          return !rule.loader || !rule.loader.includes('babel-loader')
        }),
        {
          // Match js, jsx, ts & tsx files
          test: /\.(cjs|js|mjs|jsx|ts|tsx)$/,
          loader: 'esbuild-loader',
          options: {
            tsconfig: './tsconfig.json',
            // JavaScript version to compile to
            target: 'es2020'
          }
        },
      ]
    }


    config.optimization = {
      ...config.optimization,
      minimizer: [
        new EsbuildPlugin({
          target: 'es2020',  // Syntax to compile,
          css: true

        }),
      ]
    }

    return config
  }
}