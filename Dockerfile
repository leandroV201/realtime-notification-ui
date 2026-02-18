FROM node:22-slim AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

COPY . .
RUN yarn build


FROM nginx:alpine
WORKDIR /app

# Instala Node.js
RUN apk add --no-cache nodejs npm

# Copia assets para nginx servir
COPY --from=build /app/dist/client /app/dist/client

# Copia nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia servidor Node.js
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/server.mjs ./

# Copia entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
CMD ["/entrypoint.sh"]
