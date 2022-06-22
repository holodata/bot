FROM node:16-alpine

WORKDIR /app

# node modules
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

# build app
COPY tsconfig.json ./
COPY src src
RUN yarn build

CMD ["yarn", "start"]
