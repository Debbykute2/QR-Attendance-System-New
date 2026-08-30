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

    // Remove accidental spaces
    student_id = student_id.trim();

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

    /*
      Check whether this student has already
      recorded attendance today.
    */
    const existingAttendance = await pool.query(
      `
      SELECT id, student_id, attendance_date, attendance_time
      FROM attendance
      WHERE student_id = $1
        AND attendance_date = CURRENT_DATE
      LIMIT 1
      `,
      [student_id]
    );

    if (existingAttendance.rows.length > 0) {
      return res.status(409).json({
        message: "Attendance already recorded for today.",
        attendance: {
          ...existingAttendance.rows[0],
          name: student.name,
          email: student.email,
          department: student.department,
        },
      });
    }

    /*
      Record attendance.
      PostgreSQL's unique index provides a second
      layer of protection against duplicate scans.
    */
    try {
      const attendanceResult = await pool.query(
        `
        INSERT INTO attendance (
          student_id,
          attendance_date
        )
        VALUES ($1, CURRENT_DATE)
        RETURNING
          id,
          student_id,
          attendance_date,
          attendance_time
        `,
        [student_id]
      );

      return res.status(201).json({
        message: "Attendance recorded successfully.",
        attendance: {
          ...attendanceResult.rows[0],
          name: student.name,
          email: student.email,
          department: student.department,
        },
      });

    } catch (insertError) {

      /*
        PostgreSQL error code 23505 means a UNIQUE
        constraint was violated.

        This protects against two scans happening
        almost simultaneously.
      */
      if (insertError.code === "23505") {
        return res.status(409).json({
          message: "Attendance already recorded for today.",
        });
      }

      throw insertError;
    }

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
        attendance.attendance_date,
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