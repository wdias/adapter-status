FROM node:11.11-slim

RUN npm install --global nodemon
# TODO: Use package.json TypeScript version
RUN npm install --global typescript 

WORKDIR /src
COPY package.json package-lock.json /src/
RUN npm install

COPY . /src
EXPOSE 8080

RUN sh -c tsc
# CMD ["npm", "run", "build-ts"]
CMD ["node", "dist/server.js"]
# CMD ["npm", "start"]
