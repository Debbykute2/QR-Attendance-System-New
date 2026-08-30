import { useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const API_URL = import.meta.env.VITE_API_URL;

function QRScanner({ onAttendanceRecorded }) {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const scannerRef = useRef(null);
  const processingRef = useRef(false);

  const startScanner = async () => {
    setMessage("");
    setError("");
    processingRef.current = false;

    const readerElement = document.getElementById("qr-reader");

    if (!readerElement) {
      setError(
        "Scanner area could not be found. Please refresh the page."
      );
      return;
    }

    try {
      // Clear previous scanner content
      readerElement.innerHTML = "";

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },

        async (decodedText) => {
          // Prevent multiple scans at the same time
          if (processingRef.current) {
            return;
          }

          processingRef.current = true;

          try {
            // Stop camera before sending attendance
            try {
              await scanner.stop();
              scanner.clear();
            } catch (stopError) {
              console.log(
                "Scanner stopped with message:",
                stopError
              );
            }

            scannerRef.current = null;
            setScanning(false);

            console.log("QR Code scanned:", decodedText);
            console.log("Sending attendance to:", API_URL);

            // Check API URL
            if (!API_URL) {
              throw new Error(
                "API URL is not configured. Please check VITE_API_URL."
              );
            }

            const response = await fetch(
              `${API_URL}/api/attendance`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  student_id: decodedText,
                }),
              }
            );

            // Safely read response
            let data = {};

            try {
              data = await response.json();
            } catch (jsonError) {
              console.error(
                "Could not read server response:",
                jsonError
              );
            }

            console.log("Attendance response:", data);
            console.log("Response status:", response.status);

            // =========================
            // DUPLICATE ATTENDANCE
            // =========================
            if (response.status === 409) {
              setMessage(
                data.message ||
                  "Attendance already recorded for today."
              );

              setError("");

              // Allow another scan later
              processingRef.current = false;

              return;
            }

            // =========================
            // STUDENT NOT FOUND
            // =========================
            if (response.status === 404) {
              setError(
                data.message ||
                  "Student not found."
              );

              setMessage("");
              processingRef.current = false;

              return;
            }

            // =========================
            // OTHER SERVER ERRORS
            // =========================
            if (!response.ok) {
              throw new Error(
                data.message ||
                  data.error ||
                  `Server error (${response.status}).`
              );
            }

            // =========================
            // SUCCESS
            // =========================
            setMessage(
              data.message ||
                "Attendance recorded successfully!"
            );

            setError("");

            /*
              Refresh the attendance list separately.

              IMPORTANT:
              If refreshing the list fails, we DO NOT
              want to tell the user that attendance failed.
              The attendance has already been saved.
            */
            if (onAttendanceRecorded) {
              try {
                await onAttendanceRecorded();
              } catch (refreshError) {
                console.error(
                  "Attendance list refresh failed:",
                  refreshError
                );
              }
            }

            // Allow another scan
            processingRef.current = false;

          } catch (err) {
            console.error("Attendance error:", err);

            setError(
              err.message ||
                "Failed to record attendance."
            );

            setMessage("");

            processingRef.current = false;
          }
        },

        () => {
          // Ignore QR scanning errors while camera is running
        }
      );

      setScanning(true);

    } catch (err) {
      console.error("Camera error:", err);

      processingRef.current = false;

      if (
        err.name === "NotAllowedError" ||
        String(err)
          .toLowerCase()
          .includes("permission")
      ) {
        setError(
          "Camera permission was denied. Please allow camera access in your browser settings."
        );
      } else {
        setError(
          "Unable to start the camera. Make sure your browser has camera permission."
        );
      }
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (err) {
      console.error(
        "Error stopping scanner:",
        err
      );
    }

    processingRef.current = false;
    setScanning(false);
  };

  return (
    <div className="scanner-page">
      <h2>Scan Attendance</h2>

      <p>
        Click <strong>Start Camera</strong> and point
        the camera at a student's QR code.
      </p>

      <div
        id="qr-reader"
        style={{
          width: "100%",
          maxWidth: "500px",
          margin: "20px auto",
          display: scanning ? "block" : "none",
        }}
      ></div>

      {!scanning ? (
        <button
          onClick={startScanner}
          className="start-camera-btn"
        >
          📷 Start Camera
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="stop-camera-btn"
        >
          ⏹ Stop Camera
        </button>
      )}

      {message && (
        <div className="success-message">
          {message.includes("already") ||
          message.includes("today") ? (
            <>⚠️ {message}</>
          ) : (
            <>✅ {message}</>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}
    </div>
  );
}

export default QRScanner;