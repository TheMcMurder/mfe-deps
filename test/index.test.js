const webpack = require('webpack');
const config = require('./fixtures/webpack.config.js');

it('Basic usage', (done) => {
  const compiler = webpack(config);

  compiler.run((err, stats) => {
    // console.log('err', err);
    console.log('stats', stats);
    done();
  });
});
