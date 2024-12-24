const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: {
    index: ['./js/index.js'],
    meeting: ['./js/meeting.js']
  },
  output: {
    path: path.resolve(__dirname, '/static'),
    publicPath: '/static',
    hashDigestLength: 5,
    filename: '[name].min.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(jpg|png|svg)$/,
        type: 'asset'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000, // Check for changes every second
    ignored: /node_modules/, // Ignore node_modules to reduce the number of files being watched
  },
  externals: {
    'babel-polyfill': 'babel-polyfill',
    react: 'React',
    'react-dom': 'ReactDOM',
    redux: 'Redux',
    'redux-thunk': 'ReduxThunk',
    lodash: {
      commonjs: 'lodash',
      amd: 'lodash',
      root: '_',
      var: '_'
    }
  },
  context: __dirname,
  target: 'web',
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.BABEL_ENV': JSON.stringify('development'),
    })
  ]
};
