"use strict";

const fp = require("fastify-plugin");

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope
module.exports = fp(async function dbConnector(fastify, opts) {
  fastify.register(require("fastify-mongodb"), {
    url: process.env.MONGODB_URL || "mongodb://localhost/mfedepsserver",
  });

  fastify.addSchema({
    $id: "mfe-deps-report-schema",
    type: "object",
    properties: {
      name: { type: "string" },
      dependencies: {
        type: "array",
        items: {
          type: "object",
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
