"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const db_1 = require("./config/db");
const movie_route_1 = __importDefault(require("./routes/movie.route"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Route test DB
app.get("/test", async (req, res) => {
    try {
        const result = await db_1.db.query("SELECT NOW()");
        res.json({ time: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB connection failed" });
    }
});
// Route movies
app.use("/movies", movie_route_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
