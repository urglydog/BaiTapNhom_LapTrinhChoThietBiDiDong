import { db } from "./config/db";

async function testDB() {
  try {
    // query trả về [rows, fields]
    const [rows] = await (db as any).query("SELECT 1 + 1 AS result");
    console.log("Kết nối DB thành công:", rows);
  } catch (error) {
    console.error("Lỗi kết nối DB:", error);
  }
}

testDB();
