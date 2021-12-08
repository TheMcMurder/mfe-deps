"use strict";

const fp = require("fastify-plugin");

const MONGODB_DEV_URL = "mongodb://mfe-deps-user:mfe-deps-password@localhost/dependencies"
const MONGODB_URL = process.env.MONGODB_URL || MONGODB_DEV_URL
if (MONGODB_URL === MONGODB_DEV_URL) {
  console.warn('\tUsing fallback development URL. No configured MONGODB_URL found')
}

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope
module.exports = fp(async function dbConnector(fastify, opts) {
  fastify.register(require("fastify-mongodb"), {
    url: MONGODB_URL
  });

  fastify.addSchema({
    $id: "mfe-deps-report-schema",
    type: "object",
    required: ["name", "dependencies"],
    properties: {
      name: { type: "string" },
      dependencies: {
        type: "array",
        items: {
          type: "object",
          required: ["type", "import", "module", "source", "external"],
          properties: {
            type: { type: "string" },
            import: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  name: { type: "string" },
                },
              },
            },
            module: { type: "string" },
            source: { type: "string" },
            external: { type: "boolean" },
          },
        },
      },
    },
  });
});
