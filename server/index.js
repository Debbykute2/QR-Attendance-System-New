const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initializeDatabase } = require("./database/db");
const studentRoutes = require("./routes/students");
const attendanceRoutes = require("./routes/attendance");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "QR Attendance System API is running",
    status: "success",
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "API test successful",
  });
});

// Only start the server when index.js is run directly
if (require.main === module) {
  async function startServer() {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  startServer();
}

module.exports = app;