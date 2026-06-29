# Multi-stage build: Node -> nginx
FROM node:22-alpine AS builder

WORKDIR /app
COPY site/package*.json ./
RUN npm install --production=false

COPY site .
RUN npm run build

# Final stage: nginx serving static output
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
