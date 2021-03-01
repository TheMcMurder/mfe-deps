"use strict";

const fs = require("fs").promises;
const { EventEmitter, on } = require("events");

const uniqWith = require("lodash.uniqwith");
const isEqual = require("lodash.isequal");
const dedupe = (arr) => uniqWith(arr, isEqual);

const opsEvents = new EventEmitter();
const REPORTED = "reported";
const UPDATED = "updated";

module.exports = async function (fastify, opts) {
  const reports = fastify.mongo.db.collection("reports");
  const graphs = fastify.mongo.db.collection("graphs");
  const indexHtml = await fs.readFile(__dirname + "/index.html");

  const queryForGraphData = async () => {
    const [nodes, links] = await Promise.all([
      graphs
        .aggregate([
          { $project: { nodes: 1, _id: 0 } },
          { $unwind: "$nodes" },
          {
            $project: {
              id: "$nodes.id",
              name: "$nodes.name",
              group: "$nodes.group",
            },
          },
        ])
        .toArray(),
      graphs
        .aggregate([
          { $project: { links: 1, _id: 0 } },
          { $unwind: "$links" },
          { $project: { source: "$links.source", target: "$links.target" } },
        ])
        .toArray(),
    ]);

    return {
      nodes,
      links,
    };
  };

  opsEvents.on(REPORTED, async (a) => {
    const data = await queryForGraphData();
    opsEvents.emit(UPDATED, JSON.stringify(data));
  });

  fastify.get("/", async (request, reply) => {
    reply.type("text/html").send(indexHtml);
    opsEvents.emit(REPORTED);
  });

  fastify.get("/data", (request, reply) => {
    reply.sse(
      (async function* () {
        opsEvents.emit(REPORTED);
        for await (const data of on(opsEvents, UPDATED)) {
          console.log("data", data);
          yield {
            data,
          };
        }
      })()
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
        const source = request.body;
        const graph = derriveGraph(source);
        await Promise.all([
          reports.updateOne(
            source,
            { $set: { _id: source.name } },
            { upsert: true }
          ),
          graphs.updateOne(
            graph,
            { $set: { _id: source.name } },
            { upsert: true }
          ),
        ]);
        opsEvents.emit(REPORTED);
        reply.status(200).send();
      } catch (e) {
        console.error("/report error:", e);
        reply.status(500).send(e);
      }
    }
  );
};

const getScope = (isExternal, name) => (isExternal ? "shared" : name);

const getModuleId = ({ external, module }, name) => {
  const scope = getScope(external, name);
  return `${module}::${scope}`;
};

function derriveGraph(report) {
  const nodes = dedupe(
    [
      {
        id: report.name,
        group: "application",
      },
    ].concat(
      report.dependencies.map((dep) => {
        return {
          id: getModuleId(dep, report.name),
          name: dep.module,
          group: `dependency::${getScope(dep.external, report.name)}`,
        };
      })
    )
  );

  const links = dedupe(
    report.dependencies.map((dep) => ({
      source: report.name,
      target: getModuleId(dep, report.name),
    }))
  );

  return { links, nodes };
}

const nodes = [
  // app
  {
    id: "@example/app",
    name: "@example/app",
    group: "application", // for color grouping
  },
  // react is a shared dependency
  {
    id: "react::shared",
    name: "react",
    group: "dependency::shared",
  },
  // single-spa-react is an app dependency
  {
    id: "single-spa-react::@example/app",
    name: "single-spa-react",
    group: "dependency::@example/app",
  },
  // nav
  {
    id: "@example/nav",
    name: "@example/nav",
    group: "application", // for color grouping
  },
  // react is a shared dependency DUPLICATE
  {
    id: "react::shared",
    name: "react",
    group: "dependency::shared",
  },
  // single-spa-react is a nav dependency
  {
    id: "single-spa-react::@example/nav",
    name: "single-spa-react",
    group: "dependency::@example/nav",
  },
];

const links = [
  { source: "@example/app", target: "react::shared" },
  { source: "@example/app", target: "single-spa-react::@example/app" },
  { source: "@example/nav", target: "react::shared" },
  { source: "@example/nav", target: "single-spa-react::@example/nav" },
];
