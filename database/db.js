const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const baseDir = process.cwd();
const dbPath = process.env.DB_PATH
  ? path.resolve(baseDir, process.env.DB_PATH)
  : path.join(baseDir, "database", "books.db");

const dbDirectory = path.dirname(dbPath);
fs.mkdirSync(dbDirectory, { recursive: true });

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite database:", err.message);
    process.exit(1);
  }

  console.log(`Connected to SQLite database at: ${dbPath}`);
});

const createBooksTable = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.run(sql, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
};

const insertSampleBooks = () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) AS total FROM books", (countErr, row) => {
      if (countErr) {
        reject(countErr);
        return;
      }

      if (row.total > 0) {
        resolve();
        return;
      }

      const sampleBooks = [
        ["Clean Code", "Robert C. Martin", 450],
        ["JavaScript: The Good Parts", "Douglas Crockford", 520],
        ["The Pragmatic Programmer", "Andrew Hunt", 610],
        ["Node.js Design Patterns", "Mario Casciaro", 680],
        ["Eloquent JavaScript", "Marijn Haverbeke", 390],
        ["Python Crash Course", "Eric Matthes", 430],
        ["Learning SQL", "Alan Beaulieu", 560],
        ["Head First Java", "Kathy Sierra", 470],
        ["Algorithms", "Robert Sedgewick", 720],
        ["Database System Concepts", "Abraham Silberschatz", 820],
      ];

      const insertSql = `
        INSERT INTO books (title, author, price)
        VALUES (?, ?, ?)
      `;

      db.serialize(() => {
        let completed = 0;
        let insertError = null;

        sampleBooks.forEach(([title, author, price]) => {
          db.run(insertSql, [title, author, price], (err) => {
            if (err) {
              insertError = err;
            }

            completed += 1;

            if (completed === sampleBooks.length) {
              if (insertError) {
                reject(insertError);
                return;
              }

              console.log("10 sample books inserted successfully.");
              resolve();
            }
          });
        });
      });
    });
  });
};

const initializeDatabase = async () => {
  try {
    await createBooksTable();
    await insertSampleBooks();
    return db;
  } catch (error) {
    console.error("Database initialization error:", error.message);
    throw error;
  }
};

module.exports = {
  db,
  createBooksTable,
  insertSampleBooks,
  initializeDatabase,
};
