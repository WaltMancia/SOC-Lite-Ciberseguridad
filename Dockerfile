FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=node:node /app ./
USER node

EXPOSE 3000
CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && npm start"]
