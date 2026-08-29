const express = require("express");
const QRCode = require("qrcode");

const { pool } = require("../database/db");

const router = express.Router();

/*
  Register a new student
*/
router.post("/", async (req, res) => {
  try {
    const {
      student_id,
      name,
      email,
      department,
    } = req.body;

    if (!student_id || !name || !email || !department) {
      return res.status(400).json({
        message: "All student fields are required.",
      });
    }

    // Check whether student already exists
    const existingStudent = await pool.query(
      "SELECT * FROM students WHERE student_id = $1",
      [student_id]
    );

    if (existingStudent.rows.length > 0) {
      return res.status(409).json({
        message: "A student with this Student ID already exists.",
      });
    }

    /*
      The QR contains the student's unique Student ID.
      This means the same QR can be retrieved and printed again later.
    */
    const qrData = JSON.stringify({
      student_id,
    });

    const qr_code = await QRCode.toDataURL(qrData);

    const result = await pool.query(
      `
      INSERT INTO students
      (student_id, name, email, department, qr_code)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, student_id, name, email, department, qr_code, created_at
      `,
      [
        student_id,
        name,
        email,
        department,
        qr_code,
      ]
    );

    res.status(201).json({
      message: "Student registered successfully.",
      student: result.rows[0],
    });

  } catch (error) {
    console.error("Student registration error:", error);

    res.status(500).json({
      message: "Failed to register student.",
    });
  }
});


/*
  Get all students
*/
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        student_id,
        name,
        email,
        department,
        qr_code,
        created_at
      FROM students
      ORDER BY created_at DESC
      `
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Get students error:", error);

    res.status(500).json({
      message: "Failed to retrieve students.",
    });
  }
});


/*
  Get one student by Student ID
*/
router.get("/:student_id", async (req, res) => {
  try {
    const { student_id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        student_id,
        name,
        email,
        department,
        qr_code,
        created_at
      FROM students
      WHERE student_id = $1
      `,
      [student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Get student error:", error);

    res.status(500).json({
      message: "Failed to retrieve student.",
    });
  }
});


module.exports = router;