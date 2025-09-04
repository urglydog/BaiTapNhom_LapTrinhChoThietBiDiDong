import { createPool, Pool } from "mysql2/promise";

export const db: Pool = createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "movie_app",
});
