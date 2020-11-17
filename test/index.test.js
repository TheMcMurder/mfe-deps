const webpack = require('webpack');
const MfeDepsWebpackPlugin = require('../index.js');
const { join } = require('path');

it('Basic usage', (done) => {
  const compiler = webpack({
    context: join(__dirname, 'fixtures'),
    mode: 'development',
    entry: './index.js',
    output: {
      path: join(__dirname, 'dist'),
    },
    plugins: [new MfeDepsWebpackPlugin()],
  });

  compiler.run((err, stats) => {
    console.log('err', err);
    console.log('stats', stats);
    done();
  });
});
