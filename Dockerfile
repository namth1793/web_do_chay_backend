# Dùng Alpine để image nhỏ gọn, có đủ build tools cho better-sqlite3
FROM node:22-alpine

# Cài build dependencies cần thiết để compile better-sqlite3 trên Linux
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files trước để tận dụng Docker layer cache
COPY package*.json ./

# Cài dependencies & compile better-sqlite3 cho Linux ngay trong container
RUN npm ci --omit=dev

# Copy source code (node_modules đã có từ bước trên, không bị ghi đè)
COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
