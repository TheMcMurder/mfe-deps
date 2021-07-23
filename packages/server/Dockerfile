FROM node:14-slim as build
WORKDIR /www
COPY package.json yarn.lock ./
RUN yarn install  --production --frozen-lockfile
COPY . /www

FROM node:14-slim as release
WORKDIR /www
COPY --from=build /www /www
USER node
ARG container_port=3000
ENV PORT=$container_port
ENV NODE_ENV=production
EXPOSE $PORT
CMD ["node_modules/.bin/fastify", "start", "app.js"]