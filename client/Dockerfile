# ============================================================
# Stage 1: Build the React application
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for cache-efficient installs
COPY package*.json ./
RUN npm install --silent

# Copy source code
COPY . .

# REACT_APP_API_URL="" means all /api/v1 calls go to relative path
# nginx will proxy them to app-service:5000
ARG REACT_APP_API_URL=""
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# ============================================================
# Stage 2: Serve with nginx
# ============================================================
FROM nginx:1.25-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our nginx config that proxies /api to app-service
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the React build output
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
