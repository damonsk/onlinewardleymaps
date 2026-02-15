FROM node:22-alpine3.21

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./
COPY src ./src

RUN yarn install \
&& yarn build \
&& yarn cache clean

EXPOSE 3001

CMD ["yarn", "start"]
