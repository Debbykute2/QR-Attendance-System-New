const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : { rejectUnauthorized: false },
});

async function initializeDatabase() {
  try {
    console.log("Connecting to PostgreSQL...");

    // =========================
    // STUDENTS TABLE
    // =========================
    console.log("Creating/checking students table...");

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

    // =========================
    // ATTENDANCE TABLE
    // =========================
    console.log("Creating/checking attendance table...");

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

    // =========================
    // ADD ATTENDANCE DATE
    // =========================
    console.log("Adding attendance_date column...");

    await pool.query(`
      ALTER TABLE attendance
      ADD COLUMN IF NOT EXISTS attendance_date DATE;
    `);

    console.log("attendance_date column ready");

    // =========================
    // FILL EXISTING RECORDS
    // =========================
    console.log("Updating existing attendance dates...");

    await pool.query(`
      UPDATE attendance
      SET attendance_date = attendance_time::DATE
      WHERE attendance_date IS NULL;
    `);

    console.log("Existing attendance dates updated");

    // =========================
    // SET DEFAULT DATE
    // =========================
    console.log("Setting attendance_date default...");

    await pool.query(`
      ALTER TABLE attendance
      ALTER COLUMN attendance_date
      SET DEFAULT CURRENT_DATE;
    `);

    console.log("attendance_date default ready");

    // =========================
    // REMOVE DUPLICATES
    // =========================
    console.log("Checking for duplicate attendance...");

    await pool.query(`
      DELETE FROM attendance a
      USING attendance b
      WHERE a.id > b.id
        AND a.student_id = b.student_id
        AND a.attendance_date = b.attendance_date;
    `);

    console.log("Duplicate attendance check complete");

    // =========================
    // MAKE DATE REQUIRED
    // =========================
    console.log("Making attendance_date required...");

    await pool.query(`
      ALTER TABLE attendance
      ALTER COLUMN attendance_date
      SET NOT NULL;
    `);

    console.log("attendance_date is now required");

    // =========================
    // UNIQUE INDEX
    // =========================
    console.log("Creating daily attendance unique index...");

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS
      unique_student_attendance_per_day
      ON attendance (student_id, attendance_date);
    `);

    console.log("Daily attendance rule ready");
    console.log("Database initialization completed successfully");

  } catch (error) {
    console.error("====================================");
    console.error("DATABASE INITIALIZATION FAILED");
    console.error("====================================");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Detail:", error.detail);
    console.error("Hint:", error.hint);
    console.error("====================================");
  }
}

module.exports = {
  pool,
  initializeDatabase,
};