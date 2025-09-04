import express from "express";
import { db } from "./config/db";

const app = express();

app.get("/test", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB connection failed" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server chạy tại http://localhost:3000");
});
