// routes/movie.route.ts
import { Router } from "express";
import { db } from "../config/db";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM movies");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy danh sách phim" });
  }
});

export default router;
