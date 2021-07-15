const { writeFileSync } = require('fs');
const { resolve } = require('path');
const createVisualization = require('./visualize');

/**
 * The reason this is implemented as a webpack plugin is because:
 * - statically analyzing the code can tell you about dependent modules BUT can't tell which are `external`
 * - analyzing the final output can tell you which are `external` (depending on the format) but can't tell which are bundled dependencies
 * By doing this in the bundler, you can get visibilty into both external and bundled dependencies.
 */
module.exports = class MfeDepsWebpackPlugin {
  constructor({ name, meta, visualize = false, open = false } = {}) {
    if (!name)
      throw new Error(`${MfeDepsWebpackPlugin.name} requires a 'name' option`);
    this.name = name;
    this.meta = meta;
    this.open = open;
    this.visualize = visualize;
    this.dependencies = [];
  }
  static name = 'MfeDepsWebpackPlugin';

  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap(
      MfeDepsWebpackPlugin.name,
      (factory) => {
        factory.hooks.parser
          .for('javascript/auto')
          .tap(MfeDepsWebpackPlugin.name, (parser) => {
            parser.hooks.importSpecifier.tap(
              MfeDepsWebpackPlugin.name,
              (_statement, source, exportName, _identifierName) => {
                const isLocalImport = source.startsWith('.');
                if (!isLocalImport) {
                  this.dependencies.push({
                    moduleName: source,
                    specifier: exportName,
                    file: parser.state.module.rawRequest,
                  });
                }
              }
            );
          });
      }
    );

    compiler.hooks.done.tapAsync(
      MfeDepsWebpackPlugin.name,
      (stats, finished) => {
        const externals = Array.from(stats.compilation.modules)
          .map((module) => (!module.externalType ? false : module.request))
          .filter(Boolean);

        const dependencies = this.dependencies
          .map((dep) => ({
            ...dep,
            external: externals.includes(dep.moduleName),
          }))
          .reduce((acc, { specifier, moduleName, file, external }) => {
            const existingImportIndex = acc.findIndex(
              (d) => d.specifier === specifier && d.moduleName === moduleName
            );
            if (existingImportIndex !== -1) {
              acc[existingImportIndex].files.push(file);
            } else {
              acc.push({
                specifier,
                moduleName,
                files: [file],
                external,
              });
            }

            return acc;
          }, []);

        const report = {
          name: this.name,
          dependencies,
        };
        if (this.meta) report.meta = this.meta;

        writeFileSync(
          resolve(compiler.outputPath, 'mfe-deps.json'),
          JSON.stringify(report, null, 2)
        );

        if (this.visualize) createVisualization(report, { open: this.open });

        finished();
      }
    );
  }
};
