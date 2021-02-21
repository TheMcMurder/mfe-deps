FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .
RUN yarn install
# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 3000
CMD [ "yarn", "start" ]