const { mkdirSync, writeFileSync, readFileSync } = require('fs');
const { resolve, dirname, basename } = require('path');
const openLocally = require('open');
const uniqWith = require('lodash.uniqwith');
const isEqual = require('lodash.isequal');

const mkdir = (path) => {
  try {
    mkdirSync(path, { recursive: true });
  } catch (e) {
    /* noop */
  }
};
const dedupe = (arr) => uniqWith(arr, isEqual);
const isFile = (path) => basename(path) !== path;

module.exports = function visualize(report, options = {}) {
  let { output = './mfe-deps.html', open = false } = options;
  output = resolve(output);
  if (!isFile(output)) throw new Error('output must be a path to a file.');
  let template = readFileSync(resolve(__dirname, 'index.html'), 'utf-8');
  mkdir(dirname(output));
  const data = JSON.stringify(
    {
      nodes: dedupe(
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
      ),
      links: dedupe(
        report.dependencies.map((dep) => ({
          source: report.name,
          target: dep.moduleName,
        }))
      ),
    },
    null,
    2
  );
  writeFileSync(output, template.replace('%DATA%', data));
  if (open) openLocally(output);
};
