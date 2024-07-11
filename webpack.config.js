const path = require('path');
const webpack = require('webpack');

module.exports = {
target: 'node',
stats: {
    errorDetails: true,
  },
mode: 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: { 
    "url": require.resolve("url/"),
    "stream": require.resolve("stream-browserify"),
     "path": require.resolve("path-browserify"),
     "util": require.resolve("util/"),
     "crypto": require.resolve("crypto-browserify"),
     "querystring": require.resolve("querystring-es3"),
     "http": require.resolve("stream-http"),
     "zlib": require.resolve("browserify-zlib"),
     "os": require.resolve("os-browserify/browser"),
     "vm": require.resolve("vm-browserify"),
     "assert": require.resolve("assert/"),
     "https": require.resolve("https-browserify")
   },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
   plugins: [
    new webpack.ContextReplacementPlugin(
      /express\/lib/,
      (context) => {
        if (/\/express\/lib\/view\.js$/.test(context.context)) {
          context.regExp = /^\.\/.*$/; 
          context.request = path.resolve(__dirname, 'node_modules/express/lib');
        }
      }
    ),
  ],
};


