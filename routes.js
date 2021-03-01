"use strict";

const fs = require("fs").promises;
const uniqWith = require("lodash.uniqwith");
const isEqual = require("lodash.isequal");
const dedupe = (arr) => uniqWith(arr, isEqual);
const { EventIterator } = require("event-iterator");

module.exports = async function (fastify, opts) {
  const collection = fastify.mongo.db.collection("reports");
  const indexHtml = await fs.readFile(__dirname + "/index.html");

  fastify.get("/", async (request, reply) => {
    reply.type("text/html").send(indexHtml);
  });

  fastify.get("/data", (request, reply) => {
    reply.sse(
      new EventIterator((push) => {
        // changeStream.on("change", (d) => push(d));
        // return () => changeStream.close();
      })
    );
  });

  fastify.post(
    "/report",
    {
      schema: {
        body: { $ref: "mfe-deps-report-schema#" },
      },
    },
    async (request, reply) => {
      try {
        const data = visualize(request.body.data);
        collection.insert(data);
        reply.status(200);
      } catch (e) {
        return reply.status(500);
      }
    }
  );
};

const MOCK_REPORT = {
  name: "@example/login",
  dependencies: [
    {
      type: "ES6",
      import: [
        {
          type: "default",
          name: "React",
        },
      ],
      module: "react",
      source:
        "/Users/cfiloteo/dev/mfe-dependency-analyzer/mfe-dependencies-test-repo/packages/login/src/example-login.tsx",
      external: true,
    },
    {
      type: "ES6",
      import: [
        {
          type: "default",
          name: "ReactDOM",
        },
      ],
      module: "react-dom",
      source:
        "/Users/cfiloteo/dev/mfe-dependency-analyzer/mfe-dependencies-test-repo/packages/login/src/example-login.tsx",
      external: true,
    },
    {
      type: "ES6",
      import: [
        {
          type: "default",
          name: "singleSpaReact",
        },
      ],
      module: "single-spa-react",
      source:
        "/Users/cfiloteo/dev/mfe-dependency-analyzer/mfe-dependencies-test-repo/packages/login/src/example-login.tsx",
      external: false,
    },
    {
      type: "ES6",
      import: [
        {
          type: "default",
          name: "React",
        },
      ],
      module: "react",
      source:
        "/Users/cfiloteo/dev/mfe-dependency-analyzer/mfe-dependencies-test-repo/packages/login/src/root.component.tsx",
      external: true,
    },
    {
      type: "ES6",
      import: [
        {
          type: "specifier",
          name: "setPublicPath",
        },
      ],
      module: "systemjs-webpack-interop",
      source:
        "/Users/cfiloteo/dev/mfe-dependency-analyzer/mfe-dependencies-test-repo/packages/login/src/set-public-path.tsx",
      external: false,
    },
  ],
};

function visualize(report) {
  const nodes = dedupe(
    [
      {
        id: report.name,
        group: "application",
      },
    ].concat(
      report.dependencies.map((dep) => ({
        id: dep.module,
        group: dep.external ? "shared-dependency" : "dependency",
      }))
    )
  );

  const links = dedupe(
    report.dependencies.map((dep) => ({
      source: report.name,
      target: dep.module,
    }))
  );

  return { links, nodes };
}
