"use strict";

module.exports = async function (fastify, opts) {
  const collection = fastify.mongo.db.collection("reports");

  fastify.get("/", async (request, reply) => {
    const result = await collection.find().toArray();
    if (result.length === 0) {
      throw new Error("No documents found");
    }
    return result;
  });

  fastify.post(
    "/report",
    {
      schema: {
        body: { $ref: "mfe-deps-report-schema#" },
      },
    },
    async (request, reply) => {
      return {};
    }
  );
};
