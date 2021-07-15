const webpack = require('webpack');
const config = require('./fixtures/webpack.config.js');
const { rmdirSync, existsSync, readFileSync } = require('fs');
const { resolve } = require('path');
const open = require('open');

jest.mock('open');

const FIXTURE = (f) => resolve(__dirname, 'fixtures', f);

afterAll(() => {
  const fixtureDist = FIXTURE('dist');
  try {
    // Clean up fixtures dist/ folder
    rmdirSync(fixtureDist, { recursive: true });
  } catch (err) {
    console.error(`Error while deleting ${fixtureDist}.\n`, err);
  }
});

test('Basic usage', (done) => {
  const compiler = webpack(config);
  compiler.run((_err, stats) => {
    expect(stats.hasErrors()).toBe(false);
    const reportPath = FIXTURE('dist/mfe-deps.json');
    expect(existsSync(reportPath)).toBe(true);
    const reportContents = readFileSync(reportPath, { encoding: 'utf-8' });
    expect(reportContents).toBeTruthy();
    const report = JSON.parse(readFileSync(reportPath));
    expect(report).toBeTruthy();
    // Expected dependencies to show up with correct external
    expect(report.dependencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          moduleName: 'react',
          external: true,
        }),
        expect.objectContaining({
          moduleName: 'react-dom',
          external: false,
        }),
      ])
    );
    // Metadata is included
    expect(report.meta).toBeTruthy();
    expect(open).toHaveBeenCalled();
    done();
  });
});

test('Throws if required options (name) are missing', () => {
  expect(() => {
    new MfeDepsWebpackPlugin({});
  }).toThrow();
});
