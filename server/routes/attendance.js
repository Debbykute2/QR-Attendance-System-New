const express = require("express");

const { pool } = require("../database/db");

const router = express.Router();

/*
  Record attendance
*/
router.post("/", async (req, res) => {
  try {
    let { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({
        message: "Student ID is required.",
      });
    }

    /*
      The QR code contains JSON:
      {"student_id":"STU001"}

      Convert it back into the Student ID.
    */
    try {
      const qrData = JSON.parse(student_id);

      if (qrData.student_id) {
        student_id = qrData.student_id;
      }
    } catch (error) {
      // If it isn't JSON, use the value directly.
    }

    // Check that the student exists
    const studentResult = await pool.query(
      `
      SELECT student_id, name, email, department
      FROM students
      WHERE student_id = $1
      `,
      [student_id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    const student = studentResult.rows[0];

    // Record attendance
    const attendanceResult = await pool.query(
      `
      INSERT INTO attendance (student_id)
      VALUES ($1)
      RETURNING id, student_id, attendance_time
      `,
      [student_id]
    );

    res.status(201).json({
      message: "Attendance recorded successfully.",
      attendance: {
        ...attendanceResult.rows[0],
        name: student.name,
        email: student.email,
        department: student.department,
      },
    });

  } catch (error) {
    console.error("Attendance error:", error);

    res.status(500).json({
      message: "Failed to record attendance.",
    });
  }
});


/*
  Get all attendance records
*/
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        attendance.id,
        attendance.student_id,
        students.name,
        students.email,
        students.department,
        attendance.attendance_time
      FROM attendance
      INNER JOIN students
        ON attendance.student_id = students.student_id
      ORDER BY attendance.attendance_time DESC
      `
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Get attendance error:", error);

    res.status(500).json({
      message: "Failed to retrieve attendance records.",
    });
  }
});


module.exports = router;
