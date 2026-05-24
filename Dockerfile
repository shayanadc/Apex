# ── Stage 1: builder ──────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN HUSKY=0 npm ci
COPY . .
RUN npm run build

# ── Stage 2: production ───────────────────────────────────────
FROM node:24-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN HUSKY=0 npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/dist ./dist
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/index.js"]
