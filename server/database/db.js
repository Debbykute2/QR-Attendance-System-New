const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        department VARCHAR(150) NOT NULL,
        qr_code TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Students table ready");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        attendance_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id)
          REFERENCES students(student_id)
          ON DELETE CASCADE
      );
    `);

    console.log("Attendance table ready");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
  }
}

module.exports = {
  pool,
  initializeDatabase,
};