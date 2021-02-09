const fp = require("fastify-plugin");

async function dbConnector(fastify, options) {
  fastify.register(require("fastify-mongodb"), {
    url: "mongodb://localhost:27017/mfe-deps",
  });

  // fastify.addSchema({
  //   $id: "mfe-deps-report-schema",
  //   type: "object",
  //   properties: {
  //     name: { type: "string" },
  //     dependencies: {
  //       type: "array",
  //       items: {
  //         type: "object",
  //         properties: {
  //           type: ["ES6", "require"],
  //           import: {
  //             type: "array",
  //             items: {
  //               type: "object",
  //               properties: {
  //                 type: ["default", "specifier"],
  //                 name: "string",
  //               },
  //             },
  //           },
  //           module: "string",
  //           source: "string",
  //           external: "boolean",
  //         },
  //       },
  //     },
  //   },
  // });
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
module.exports = fp(dbConnector);
