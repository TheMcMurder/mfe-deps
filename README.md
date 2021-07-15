# mfe-deps-server

## api

### GET `/`

The root URL serves the page to display the visualization of dependencies across all microfrontends reported.

### POST `/api/report`

A POST request to `/api/report` requires a JSON body with the following shape:

```ts
// TODO: copy db schema once I figure it out
```

This JSON can be generated using mfe-deps-analyzer plugin for Webpack.

## Local development

See [Development documentation](./DEVELOPMENT.md).