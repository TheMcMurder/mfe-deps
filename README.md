# MFE Deps monorepo

Monorepo for single-spa microfrontend dependency analysis.

## Local Development

1. clone repo
1. run `yarn`
1. run `yarn bootstrap`
1. navigate into the individual package and follow that development guide


# Stuff remaining
- Fix server memory leak (Event Emitter multiple listeners being registered maybe?)
- Add auth?
- Mask/hide certain packages (IE. hide all instaces of "SystemJS-webpack-intero" to reduce number of nodes/clean up visually)
- requires a config file to be consumed
- add /meta endpoint
- display aplicaiton meta in a sidebar (or layover? or modal?)

# Future stuff
- Rollup plugin
- share visualization logic between plugin and server
- complex auth
- database scheme/use graphql?
- list all packages to filter by
- Add PATCH /report to allow updating mfe report
