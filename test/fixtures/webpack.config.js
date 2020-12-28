const MfeDepsWebpackPlugin = require('../../index.js');
const { join } = require('path');
const { name, repository } = require('./package.json');

module.exports = {
  mode: 'development',
  entry: join(__dirname, './index.js'),
  output: {
    path: join(__dirname, 'dist'),
  },
  plugins: [
    new MfeDepsWebpackPlugin({
      name: name,
      meta: {
        repo: repository.url,
      },
      visualize: true,
      open: true,
    }),
  ],
  externals: ['react'],
};
