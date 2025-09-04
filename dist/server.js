"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./config/db");
const app = (0, express_1.default)();
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
app.listen(3000, () => {
    console.log("🚀 Server chạy tại http://localhost:3000");
});
