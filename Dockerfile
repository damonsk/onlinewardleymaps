FROM node:22-alpine3.21

COPY frontend /frontend

WORKDIR /frontend

RUN yarn install \
&& yarn cache clean \
&& yarn build

EXPOSE 3000

CMD ["yarn", "start"]
