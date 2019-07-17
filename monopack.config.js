const merge = require('webpack-merge');

module.exports = {
  webpackConfigModifier: (defaultConfig) => {
    return merge(defaultConfig, {
      module: {
        rules: [
          {
            test: /\.ts$/,
            loader: 'ts-loader',
          },
          {
            test: /\.js$/,
            use: ["source-map-loader"],
            enforce: "pre"
          },
        ]
      },
      resolve: {
        extensions: [ '.ts', '.js' ],
      },
      stats: {
        // suppress "export not found" warnings about re-exported types
        // warningsFilter: /export .* was not found in/
      },
    });
  }
};
