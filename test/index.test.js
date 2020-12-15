const webpack = require('webpack');
const config = require('./fixtures/webpack.config.js');
const { rmdirSync, existsSync } = require('fs');
const { resolve } = require('path');

const FIXTURE = (f) => resolve(__dirname, 'fixtures', f);

beforeAll(() => {
  const fixtureDist = FIXTURE('dist');
  try {
    rmdirSync(fixtureDist, { recursive: true });
    console.log(`Cleared ${fixtureDist} successfully.`);
  } catch (err) {
    console.error(`Error while deleting ${fixtureDist}.`);
  }
});

test('Basic usage', (done) => {
  const compiler = webpack(config);
  compiler.run((err) => {
    expect(err).toBeFalsy();
    expect(existsSync(FIXTURE('dist/mfe-deps.json'))).toBe(true);
    done();
  });
});

test('Failed config', () => {
  expect(() => {
    const compiler = webpack({
      mode: 'development',
      entry: FIXTURE('./index.js'),
      output: {
        path: FIXTURE('dist'),
      },
      plugins: [new MfeDepsWebpackPlugin({})],
    });
    compiler.run((err) => {
      expect(err).toBeFalsy();
      done();
    });
  }).toThrow();
});
