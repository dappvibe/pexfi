FROM node:20-alpine

COPY . /app
WORKDIR /app
VOLUME /data

RUN npm ci

CMD ["npx", "tsx", "src/server.ts"]
