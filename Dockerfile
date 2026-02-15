FROM node:22-alpine3.21

ARG NEXT_PUBLIC_API_ENDPOINT=https://api.onlinewardleymaps.com/v1/maps/
ENV NEXT_PUBLIC_API_ENDPOINT=${NEXT_PUBLIC_API_ENDPOINT}

COPY frontend /frontend

WORKDIR /frontend

RUN yarn install \
&& yarn cache clean \
&& yarn build

EXPOSE 3000

CMD ["yarn", "start"]
