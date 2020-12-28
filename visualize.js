const { mkdirSync, writeFileSync, readFileSync } = require('fs');
const { join, resolve } = require('path');
const uniqWith = require('lodash.uniqwith');
const isEqual = require('lodash.isequal');

const dedupe = (arr) => uniqWith(arr, isEqual);

module.exports = function visualize(report, options = {}) {
  const outDir = resolve(options.outDir || join(process.cwd(), 'mfe-deps'));
  const reportSource = resolve(__dirname, 'visualize');
  const entry = resolve(reportSource, 'index.html');

  const nodes = dedupe(
    [
      {
        id: report.name,
        group: 'application',
      },
    ].concat(
      report.dependencies.map((dep) => ({
        id: dep.moduleName,
        group: dep.external ? 'shared-dependency' : 'dependency',
      }))
    )
  );

  const links = dedupe(
    report.dependencies.map((dep) => ({
      source: report.name,
      target: dep.moduleName,
    }))
  );

  let indexHtml = readFileSync(entry, 'utf-8');
  // TODO: use fs.mkdtemp instead
  try {
    mkdirSync(outDir);
  } catch (e) {
    // stfu
  }
  writeFileSync(
    resolve(outDir, 'index.html'),
    indexHtml.replace('%DATA%', JSON.stringify({ nodes, links }, null, 2))
  );
};
