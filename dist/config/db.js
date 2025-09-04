"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// config/db.ts
const pg_1 = __importDefault(require("pg"));
const { Pool } = pg_1.default;
// Tạo connection pool với thông tin lấy từ environment variables
exports.db = new Pool({
    user: process.env.DB_USER, // ví dụ: postgres
    host: process.env.DB_HOST, // ví dụ: abc123.render.com
    database: process.env.DB_NAME, // ví dụ: movie_db
    password: process.env.DB_PASS, // mật khẩu dài trên Render
    port: Number(process.env.DB_PORT) || 5432, // mặc định 5432 nếu DB_PORT không có
});
