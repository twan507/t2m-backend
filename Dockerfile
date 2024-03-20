# Sử dụng bản Node.js chính thức làm image gốc
FROM node:18-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Copy file package.json và package-lock.json (nếu có) vào thư mục làm việc
COPY package*.json ./

# Cài đặt tất cả các phụ thuộc (dependencies)
RUN npm install

# Copy tất cả các file và thư mục khác từ dự án NestJS của bạn vào thư mục làm việc trong container
COPY . .

# Biên dịch ứng dụng NestJS của bạn
RUN npm run build

# Mở cổng 8000 trong container cho ứng dụng NestJS
EXPOSE 8000

# Chạy ứng dụng NestJS
CMD ["node", "dist/main"]
