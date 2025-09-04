"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/movie.route.ts
const express_1 = require("express");
const db_1 = require("../config/db");
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    try {
        const [rows] = await db_1.db.query("SELECT * FROM movies");
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: "Lỗi lấy danh sách phim" });
    }
});
exports.default = router;
