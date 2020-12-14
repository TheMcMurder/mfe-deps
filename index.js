const { promises: fs } = require('fs');
const { resolve } = require('path');

/**
 * The reason this is implemented as a webpack plugin is because:
 * - statically analyzing the code can tell you about dependent modules BUT can't tell which are `external`
 * - analyzing the final output can tell you which are `external` (depending on the format) but can't tell which are bundled dependencies
 * By doing this in the bundler, you can get visibilty into both external and bundled dependencies.
 */
module.exports = class MfeDepsWebpackPlugin {
  constructor({ name, meta }) {
    if (!name)
      throw new Error(`${MfeDepsWebpackPlugin.name} requires a 'name' option`);
    this.name = name;
    this.meta = meta;
    this.dependencies = [];
    this.externals = [];
  }
  static name = 'MfeDepsWebpackPlugin';

  writeReport(reportPath, report) {
    return fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  }

  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap(
      MfeDepsWebpackPlugin.name,
      (factory) => {
        factory.hooks.parser
          .for('javascript/auto')
          .tap(MfeDepsWebpackPlugin.name, (parser) => {
            parser.hooks.importSpecifier.tap(
              MfeDepsWebpackPlugin.name,
              (statement, source, exportName, identifierName) => {
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
      (stats, callback) => {
        this.externals = Array.from(stats.compilation.modules)
          .map((module) => (!module.externalType ? false : module.request))
          .filter(Boolean);

        const dependencies = this.dependencies
          .map((dep) => ({
            ...dep,
            external: this.externals.includes(dep.moduleName),
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

        this.writeReport(
          // TODO: make this configurable
          resolve(compiler.outputPath, 'mfe-deps.json'),
          report
        ).then(callback);
      }
    );
  }
};
