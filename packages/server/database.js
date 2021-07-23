'use strict'

const fp = require('fastify-plugin')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope
module.exports = fp(async function dbConnector(fastify, opts) {
  const db_host =
    process.env.NODE_ENV === 'production' ? 'mongodb' : 'localhost'
  const DB_URL = `mongodb://${process.env.APP_DB_USER}:${process.env.APP_DB_PW}@${db_host}/${process.env.MONGO_INITDB_DATABASE}`

  fastify.register(require('fastify-mongodb'), {
    url: DB_URL,
  })

  fastify.addSchema({
    $id: 'mfe-deps-report-schema',
    type: 'object',
    required: ['name', 'dependencies'],
    properties: {
      name: { type: 'string' },
      dependencies: {
        type: 'array',
        items: {
          type: 'object',
          required: ['type', 'import', 'module', 'source', 'external'],
          properties: {
            type: { type: 'string' },
            import: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
            module: { type: 'string' },
            source: { type: 'string' },
            external: { type: 'boolean' },
          },
        },
      },
    },
  })
})
