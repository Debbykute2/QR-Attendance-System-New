const request = require("supertest");
const express = require("express");

const app = express();

app.use(express.json());

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

describe("QR Attendance API", () => {
  test("GET / should return API status", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "QR Attendance System API is running"
    );
    expect(response.body.status).toBe("success");
  });

  test("GET /api/test should return successful response", async () => {
    const response = await request(app).get("/api/test");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("API test successful");
  });
});