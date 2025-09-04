"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/movie.route.ts
const express_1 = require("express");
const db_1 = require("../config/db"); // db là Pool hoặc Client từ pg
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    try {
        const result = await db_1.db.query("SELECT * FROM movies"); // result.rows chứa dữ liệu
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi lấy danh sách phim" });
    }
});
exports.default = router;
