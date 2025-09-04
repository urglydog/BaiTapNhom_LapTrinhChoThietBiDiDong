"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
async function testDB() {
    try {
        // query trả về [rows, fields]
        const [rows] = await db_1.db.query("SELECT 1 + 1 AS result");
        console.log("Kết nối DB thành công:", rows);
    }
    catch (error) {
        console.error("Lỗi kết nối DB:", error);
    }
}
testDB();
