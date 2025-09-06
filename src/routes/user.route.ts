// routes/user.route.ts
import { Router } from "express";
import { db } from "../config/db";

const router = Router();

// Lấy danh sách user
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy danh sách user" });
  }
});

export default router;
