"use strict";

const { FastifySSEPlugin } = require("fastify-sse-v2");

module.exports = async function (fastify, opts) {
  fastify.register(FastifySSEPlugin);
  fastify.register(require("./routes"));
};
