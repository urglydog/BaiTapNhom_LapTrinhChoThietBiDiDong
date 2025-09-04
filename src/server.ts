// src/server.ts
import express from "express";
import { db } from "./config/db";
import movieRouter from "./routes/movie.route";

const app = express();
app.use(express.json());

// Route test DB
app.get("/test", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB connection failed" });
  }
});

// Route movies
app.use("/movies", movieRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
