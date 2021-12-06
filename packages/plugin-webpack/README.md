# mfe-deps-webpack-plugin

## Install

```sh
yarn add -D mfe-deps-webpack-plugin
```

## Usage

| Option    | Default     | Description                                 |
| --------- | ----------- | ------------------------------------------- |
| name      |             | Application name to be reported             |
| meta      | `undefined` | Metadata to be included in report           |
| visualize | `false`     | Generate a local visualization of report    |
| open      | `false`     | Open local visualization in default browser |

Add to Webpack config plugins array

```js
const MfeDepsWebpackPlugin = require('mfe-deps-webpack-plugin');
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
        owners: 'A-Team',
      },
      visualize: true,
      open: true,
    }),
  ],
  externals: ['react'],
};
```

## Development

Development workflow can be entirely local with the `./test` folder or using `yalc` to install package in other project