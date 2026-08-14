# ─── Stage 1: Builder ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ─── Stage 2: Runtime ────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Tạo thư mục lưu ảnh screenshots
RUN mkdir -p /app/screenshots

COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]
