# 1) Build stage
FROM node:20 AS build
WORKDIR /app

# install deps
COPY frontend/package*.json ./
RUN npm ci

# bring in source
COPY frontend/ ./

COPY fwc_redtide.json /fwc_redtide.json

RUN npx vite build

# 2) Final nginx with proxy config
FROM nginx:1.27-alpine
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html