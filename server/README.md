# Backend Container Inspection API

Đây là backend API được xây dựng bằng Node.js, Express, và MongoDB để phục vụ cho ứng dụng React Container Inspection.

## Cài đặt và Khởi chạy

### 1. Chuẩn bị
- Đảm bảo bạn đã cài đặt [Node.js](https://nodejs.org/) và [MongoDB](https://www.mongodb.com/try/download/community) trên máy của bạn.
- Chạy MongoDB server.

### 2. Cài đặt Dependencies
Di chuyển vào thư mục `backend` và chạy lệnh sau để cài đặt các package cần thiết:
```bash
cd backend
npm install
```

### 3. Cấu hình Biến môi trường
Tạo một file `.env` trong thư mục `backend` bằng cách copy từ file `.env.example`:
```bash
cp .env.example .env
```
Mở file `.env` và chỉnh sửa các giá trị nếu cần. `MONGO_URI` mặc định là `mongodb://localhost:27017/container_inspection`, và `JWT_SECRET` cần được thay bằng một chuỗi bí mật của riêng bạn.
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/container_inspection
JWT_SECRET=your_super_secret_key_12345
JWT_EXPIRES_IN=30d
```

### 4. Khởi chạy Server
Chạy lệnh sau để khởi động server:
```bash
npm start
```
Server sẽ chạy tại địa chỉ `http://localhost:5000`.

Để chạy ở chế độ "development" với `nodemon` (tự động restart server khi có thay đổi), bạn có thể dùng:
```bash
npm run dev
```

## Kết nối Frontend với Backend

Để frontend (ứng dụng React của bạn) có thể giao tiếp với backend này, bạn cần cấu hình để các request API từ frontend được gửi đến địa chỉ của backend server.

### 1. Sử dụng Proxy trong Vite (hoặc Create React App)

Cách tốt nhất là cấu hình một proxy trong file `vite.config.ts` của project frontend. Điều này giúp tránh các lỗi CORS khi phát triển.

Mở file `vite.config.ts` ở thư mục gốc của project frontend và thêm vào mục `server.proxy`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Địa chỉ backend server của bạn
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

### 2. Cập nhật code gọi API trong Frontend

Bây giờ, trong code React của bạn, khi bạn gọi API, bạn chỉ cần dùng đường dẫn tương đối, ví dụ `/api/auth/login`. Vite sẽ tự động chuyển tiếp request này đến `http://localhost:5000/api/auth/login`.

**Ví dụ với `fetch`:**

```javascript
// Thay vì:
// const response = await fetch('http://localhost:5000/api/inspections');

// Bạn chỉ cần dùng:
const response = await fetch('/api/inspections', {
    headers: {
        // Gửi token nếu người dùng đã đăng nhập
        'Authorization': `Bearer ${your_auth_token}`
    }
});
const data = await response.json();
console.log(data);
```

Với các bước trên, toàn bộ hệ thống backend đã sẵn sàng và frontend có thể kết nối để bắt đầu phát triển các tính năng đầy đủ.
