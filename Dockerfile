FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run lint && npm run build && npx esbuild server/index.mjs --bundle --platform=node --format=esm --outfile=server/index.bundle.mjs

FROM node:24-alpine AS api
WORKDIR /app
ENV NODE_ENV=production DB_PATH=/data/univfolio.sqlite API_PORT=3001
RUN mkdir /data && chown node:node /data
COPY --from=build /app/server/index.bundle.mjs ./index.mjs
COPY server/seed.json ./seed.json
USER node
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:3001/api/health || exit 1
CMD ["node", "index.mjs"]

FROM nginx:stable-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/api/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
