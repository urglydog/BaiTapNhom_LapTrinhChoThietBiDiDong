// routes/movie.route.ts
import { Router } from "express";
import { db } from "../config/db"; // db là Pool hoặc Client từ pg

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM movies"); // result.rows chứa dữ liệu
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy danh sách phim" });
  }
});

export default router;
