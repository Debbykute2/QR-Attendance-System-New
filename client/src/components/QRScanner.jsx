import { useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const API_URL = import.meta.env.VITE_API_URL;

function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const scannerRef = useRef(null);

  const startScanner = async () => {
    setMessage("");
    setError("");

    // Make sure the QR reader element exists
    const readerElement = document.getElementById("qr-reader");

    if (!readerElement) {
      setError("Scanner area could not be found. Please refresh the page.");
      return;
    }

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // QR code successfully scanned
          try {
            await scanner.stop();
            scanner.clear();
            scannerRef.current = null;
            setScanning(false);

            const response = await fetch(`${API_URL}/api/attendance`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                student_id: decodedText,
              }),
            });

            const data = await response.json();

            if (response.ok) {
              setMessage(
                data.message || "Attendance recorded successfully!"
              );
            } else {
              setError(data.error || "Unable to record attendance.");
            }
          } catch (err) {
            console.error(err);
            setError("Failed to record attendance.");
          }
        },
        () => {
          // Ignore QR scanning errors while camera is running
        }
      );

      setScanning(true);
    } catch (err) {
      console.error("Camera error:", err);

      if (
        err.name === "NotAllowedError" ||
        String(err).toLowerCase().includes("permission")
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
      console.error("Error stopping scanner:", err);
    }

    setScanning(false);
  };

  return (
    <div className="scanner-page">
      <h2>Scan Attendance</h2>

      <p>
        Click <strong>Start Camera</strong> and point the camera at a student's
        QR code.
      </p>

      {/* Scanner area */}
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
        <button onClick={startScanner} className="start-camera-btn">
          📷 Start Camera
        </button>
      ) : (
        <button onClick={stopScanner} className="stop-camera-btn">
          ⏹ Stop Camera
        </button>
      )}

      {message && (
        <div className="success-message">
          ✅ {message}
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