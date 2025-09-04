// config/db.ts
import pkg from "pg";
const { Pool } = pkg;

// Tạo connection pool với thông tin lấy từ environment variables
export const db = new Pool({
  user: process.env.DB_USER, // ví dụ: postgres
  host: process.env.DB_HOST, // ví dụ: abc123.render.com
  database: process.env.DB_NAME, // ví dụ: movie_db
  password: process.env.DB_PASS, // mật khẩu dài trên Render
  port: Number(process.env.DB_PORT) || 5432, // mặc định 5432 nếu DB_PORT không có
});
