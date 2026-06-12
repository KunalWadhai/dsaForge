FROM node:alpine

WORKDIR /app

COPY package*.json .

RUN npm ci --legacy-peer-deps

COPY . .

EXPOSE 8000

CMD ["node", "src/query.js"]