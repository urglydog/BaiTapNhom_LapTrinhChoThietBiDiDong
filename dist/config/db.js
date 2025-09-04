"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const promise_1 = require("mysql2/promise");
exports.db = (0, promise_1.createPool)({
    host: "localhost",
    user: "root",
    password: "root",
    database: "movie_app",
});
