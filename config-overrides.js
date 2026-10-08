const webpack = require("webpack");

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    assert: require.resolve("assert"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify"),
    url: require.resolve("url"),
    fs: false,
    net: false,
    tls: false,
    "process/browser": require.resolve("process/browser"),
  });
  config.resolve.fallback = fallback;
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    "@react-native-async-storage/async-storage": false,
    "pino-pretty": false,
  };
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: { fullySpecified: false },
  });
  config.ignoreWarnings = [
    /Failed to parse source map/,
    /Critical dependency: the request of a dependency is an expression/,
  ];
  config.plugins = (config.plugins || [])
    .filter((plugin) => plugin.constructor && plugin.constructor.name !== "ESLintWebpackPlugin")
    .concat([
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
    ]);
  return config;
};
