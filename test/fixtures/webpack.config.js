const MfeDepsWebpackPlugin = require('../../index.js');
const { join } = require('path');
const { name } = require('./package.json');

module.exports = {
  profile: true,
  mode: 'development',
  entry: './index.js',
  output: {
    path: join(__dirname, 'dist'),
  },
  plugins: [
    new MfeDepsWebpackPlugin({
      name: name,
    }),
  ],
  externals: ['react'],
};
