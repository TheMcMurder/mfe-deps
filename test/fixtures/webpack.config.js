const MfeDepsWebpackPlugin = require('../../index.js');
const { join } = require('path');

module.exports = {
  profile: true,
  mode: 'development',
  entry: './index.js',
  output: {
    path: join(__dirname, 'dist'),
  },
  plugins: [new MfeDepsWebpackPlugin()],
  externals: ['react'],
};
