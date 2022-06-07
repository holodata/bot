FROM node:16-alpine

WORKDIR /app

# node modules
COPY package.json yarn.lock /app/
RUN yarn --frozen-lockfile

# build app
COPY tsconfig.json /app/
COPY src /app/src
RUN yarn build && yarn link

CMD ["npm", "start"]
