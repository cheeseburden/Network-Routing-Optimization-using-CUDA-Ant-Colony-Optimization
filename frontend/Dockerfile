# ─────────────────────────────────────────────────────────────
# NetOptima Frontend — React (Vite) → Nginx
# Stage 1: Build the React app
# Stage 2: Serve via Nginx with API reverse proxy
# ─────────────────────────────────────────────────────────────

# ── Build Stage ──
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Production Stage ──
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
