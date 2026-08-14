# Playwright cần base image có đủ browser dependencies
FROM mcr.microsoft.com/playwright:v1.45.0-jammy

WORKDIR /app

# Tạo thư mục screenshots
RUN mkdir -p /app/screenshots

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

CMD ["node", "src/index.js"]
