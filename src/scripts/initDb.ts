import { db } from "../config/db";

async function init() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        director VARCHAR(255),
        release_year INT,
        genre VARCHAR(50)
      );
    `);

    await db.query(`
      INSERT INTO movies (title, director, release_year, genre)
      VALUES 
      ('Inception', 'Christopher Nolan', 2010, 'Sci-Fi'),
      ('The Matrix', 'The Wachowskis', 1999, 'Sci-Fi')
      ON CONFLICT DO NOTHING;
    `);

    console.log("✅ Bảng và dữ liệu đã tạo xong!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

init();
