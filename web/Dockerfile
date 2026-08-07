# syntax=docker/dockerfile:1
# Build context for this Dockerfile is the ./web directory.

# ---- deps: install node_modules, cached on the lockfile ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- dev: Vite dev server with HMR (used by docker-compose.yml) ----
FROM node:24-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---- build: compile the static bundle ----
FROM deps AS build
WORKDIR /app
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ---- serve: static assets behind nginx (production) ----
FROM nginx:1.27-alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
