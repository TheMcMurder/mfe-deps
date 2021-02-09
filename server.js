const fastify = require("fastify")({ logger: true });

const PORT = process.env.PORT || 3000;

fastify.register(require("./db"));
fastify.register(require("./routes"));

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

const start = async () => {
  try {
    await fastify.listen(PORT, "0.0.0.0");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
