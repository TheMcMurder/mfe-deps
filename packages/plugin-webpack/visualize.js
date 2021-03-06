const { mkdirSync, writeFileSync } = require('fs');
const { resolve, dirname, basename } = require('path');
const openLocally = require('open');
const uniqWith = require('lodash.uniqwith');
const isEqual = require('lodash.isequal');

const mkdir = (path) => {
  try {
    mkdirSync(path, { recursive: true });
  } catch (e) {
    /* noop */
  }
};
const dedupe = (arr) => uniqWith(arr, isEqual);
const isFile = (path) => basename(path) !== path;
/*
Escapes `<` characters in JSON to safely be used in <script> tags
https://github.com/webpack-contrib/webpack-bundle-analyzer/blob/ba2bf40d2a8d28925f9abf7d46a1c3ff3c62c523/src/template.js
*/
const toJSON = (obj) => JSON.stringify(obj, null, 2).replace(/</gu, '\\u003c');
const html = (lines, ...val) =>
  lines.map((str, i) => `${str}${val[i] || ''}`).join('');

module.exports = function visualize(report, options = {}) {
  let { output = './mfe-deps.html', open = false } = options;
  output = resolve(output);
  if (!isFile(output)) throw new Error('output must be a path to a file.');
  mkdir(dirname(output));
  const nodes = dedupe(
    [
      {
        id: report.name,
        group: 'application',
      },
    ].concat(
      report.dependencies.map((dep) => ({
        id: dep.moduleName,
        group: dep.external ? 'shared-dependency' : 'dependency',
      }))
    )
  );
  const links = dedupe(
    report.dependencies.map((dep) => ({
      source: report.name,
      target: dep.moduleName,
    }))
  );

  const template = html`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Dependencies</title>
        <style>
          body {
            background: #fff;
            padding: 0;
            margin: 0;
            font-family: helvetica, arial;
            overflow: hidden;
          }

          .graph {
            width: 100%;
            height: 100%;
            fill: #000;
            overflow: hidden;
            position: relative;
          }

          svg {
            height: 100%;
            width: 100%;
          }

          g.dimmed {
            stroke-opacity: 0.05;
          }

          g.dimmed text.shadow {
            stroke-opacity: 0;
          }

          circle {
            stroke: #333;
            stroke-width: 1.5px;
          }

          text {
            font: 10px sans-serif;
            pointer-events: none;
          }

          text.shadow {
            stroke: #fff;
            stroke-width: 3px;
            stroke-opacity: 0.8;
          }

          path.link {
            fill: none;
            stroke: #666;
            stroke-width: 1.5px;
          }

          path.link.licensing {
            stroke: green;
          }

          path.link.resolved {
            stroke-dasharray: 0, 2 1;
          }

          .zoom {
            background: rgba(0, 0, 0, 0.25);
            border-radius: 7px;
            bottom: 10px;
            display: flex;
            padding: 6px;
            position: fixed;
            right: 10px;
            z-index: 100;
          }

          .zoom button {
            background: rgba(255, 255, 255, 0.75);
            background-position: 50% 50%;
            background-repeat: no-repeat;
            border: none;
            width: 2rem;
            height: 2rem;
            border-radius: 4px;
          }

          .zoom button:not(:last-child) {
            margin-right: 6px;
          }

          .zoom button:hover {
            background-color: white;
          }

          #zoom-in {
            background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJAQMAAADaX5RTAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkUwRTZCRkI3NjQzNzExRTBBQUI3RTAwMUU2MTZDRkQ5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkUwRTZCRkI4NjQzNzExRTBBQUI3RTAwMUU2MTZDRkQ5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RTBFNkJGQjU2NDM3MTFFMEFBQjdFMDAxRTYxNkNGRDkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RTBFNkJGQjY2NDM3MTFFMEFBQjdFMDAxRTYxNkNGRDkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7cwPMXAAAABlBMVEUAAAD///+l2Z/dAAAAAnRSTlP/AOW3MEoAAAARSURBVAhbY3jcwABBcAATAQBxlwhT4XiahwAAAABJRU5ErkJggg==);
          }

          #zoom-out {
            background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJAQMAAADaX5RTAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkU5MjRDMEQ5NjQzNzExRTBCM0JDQkU2MzVGQTBCNjRDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkU5MjRDMERBNjQzNzExRTBCM0JDQkU2MzVGQTBCNjRDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RTkyNEMwRDc2NDM3MTFFMEIzQkNCRTYzNUZBMEI2NEMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RTkyNEMwRDg2NDM3MTFFMEIzQkNCRTYzNUZBMEI2NEMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7uh53jAAAABlBMVEUAAAD///+l2Z/dAAAAAnRSTlP/AOW3MEoAAAARSURBVAhbY/jfwABBcAATAQB6xwj7vHGbwAAAAABJRU5ErkJggg==);
          }
        </style>
      </head>
      <body>
        <div class="zoom">
          <button id="zoom-in" aria-label="Zoom in"></button>
          <button id="zoom-out" aria-label="Zoom out"></button>
        </div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/6.2.0/d3.min.js"></script>
        <script>
          document.addEventListener('DOMContentLoaded', () => {
            const data = ${toJSON({
              nodes,
              links,
            })};
            const links = data.links.map(Object.create);
            const nodes = data.nodes.map(Object.create);

            // distributed force graph
            const simulation = d3
              .forceSimulation(nodes)
              .force(
                'link',
                d3.forceLink(links).id((d) => d.id)
              )
              .force('charge', d3.forceManyBody())
              .force('x', d3.forceX())
              .force('y', d3.forceY());

            // zoom
            const zoom = d3
              .zoom()
              .scaleExtent([1, 10])
              .on('zoom', function zoomed({ transform }) {
                g.attr('transform', transform);
              });

            // outer container
            const height = window.innerWidth;
            const width = window.innerHeight;
            const svg = d3
              .create('svg')
              .attr('viewBox', [-width / 2, -height / 2, width, height])
              .call(zoom);

            // elements container
            const g = svg.append('g');

            // lines between circles
            const link = g
              .append('g')
              .attr('stroke', '#999')
              .attr('stroke-opacity', 0.5)
              .selectAll('line')
              .data(links)
              .join('line')
              .attr('stroke-width', (d) => Math.sqrt(d.value));

            // drag behavior
            const drag = (simulation) =>
              d3
                .drag()
                .on('start', function dragstarted({ active, x, y }, d) {
                  if (!active) simulation.alphaTarget(0.3).restart();
                  d.fx = x;
                  d.fy = y;
                })
                .on('drag', function dragged({ x, y }, d) {
                  d.fx = x;
                  d.fy = y;
                })
                .on('end', function dragended({ active }, d) {
                  if (!active) simulation.alphaTarget(0);
                  d.fx = null;
                  d.fy = null;
                });

            // circles and binding drag behavior
            const node = g
              .selectAll('.node')
              .data(nodes)
              .enter()
              .append('g')
              .attr('class', 'node')
              .call(drag(simulation));

            // circle styles
            const scale = d3.scaleOrdinal(d3.schemeCategory10);
            const color = (d) => scale(d.group);
            node.append('circle').attr('r', 5).attr('fill', color);

            // circle label
            node
              .append('text')
              .attr('dx', 8)
              .attr('dy', '.35em')
              .text((d) => d.id);

            simulation.on('tick', () => {
              // connect lines between nodes
              link
                .attr('x1', (d) => d.source.x)
                .attr('y1', (d) => d.source.y)
                .attr('x2', (d) => d.target.x)
                .attr('y2', (d) => d.target.y);
              // move nodes to ends of lines
              node.attr(
                'transform',
                (d) => 'translate(' + d.x + ',' + d.y + ')'
              );
            });

            document.body.prepend(svg.node());

            // zoom in button
            document
              .getElementById('zoom-in')
              .addEventListener('click', (e) => {
                svg.transition().call(zoom.scaleBy, 2);
              });

            // zoom out button
            document
              .getElementById('zoom-out')
              .addEventListener('click', (e) => {
                svg.transition().call(zoom.scaleBy, 0.5);
              });
          });
        </script>
      </body>
    </html>
  `;

  writeFileSync(output, template);
  if (open) openLocally(output);
};
