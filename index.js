/**
 * The reason this is implemented as a webpack plugin is because:
 * - statically analyzing the code can tell you about dependent modules BUT can't tell which are `external`
 * - analyzing the final output can tell you which are `external` (depending on the format) but can't tell which are bundled dependencies
 * By doing this in the bundler, you can get visibilty into both external and bundled dependencies.
 */
module.exports = class MfeDepsWebpackPlugin {
  constructor() {
    this.dependencies = [];
    this.externals = [];
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
              (statement, source, exportName, identifierName) => {
                const isLocalImport = source.startsWith('.');
                if (!isLocalImport) {
                  this.dependencies.push({
                    specifier: source,
                    import: exportName,
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

        const report = this.dependencies.map((dep) => ({
          ...dep,
          external: this.externals.includes(dep.source),
        }));

        console.log('report', report);
        callback();
      }
    );
  }
};
