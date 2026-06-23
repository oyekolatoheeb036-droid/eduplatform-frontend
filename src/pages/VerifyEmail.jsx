// src/pages/VerifyEmail.jsx

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const navigate = useNavigate();
  const hasFetched = useRef(false); // prevents double API call in React Strict Mode

  useEffect(() => {
    if (hasFetched.current) return; // guard — only run once
    hasFetched.current = true;

    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setStatus("success");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === "verifying" && (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>Verifying your email...</h2>
            <p style={styles.text}>Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={styles.iconSuccess}>✅</div>
            <h2 style={{ ...styles.title, color: "#1a237e" }}>Email Verified!</h2>
            <p style={styles.text}>
              Your account has been verified successfully.
            </p>
            <p style={styles.subText}>Redirecting you to login in 3 seconds...</p>
            <button style={styles.button} onClick={() => navigate("/login")}>
              Go to Login Now
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div style={styles.iconError}>❌</div>
            <h2 style={{ ...styles.title, color: "#c62828" }}>Verification Failed</h2>
            <p style={styles.text}>
              This link is invalid or has already been used.
            </p>
            <p style={styles.subText}>
              You may already be verified — try logging in first.
            </p>
            <button style={styles.button} onClick={() => navigate("/login")}>
              Try Login
            </button>
            <button
              style={{ ...styles.button, backgroundColor: "#c62828", marginTop: "10px" }}
              onClick={() => navigate("/register")}
            >
              Back to Register
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
    fontFamily: "sans-serif",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "48px 40px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    maxWidth: "420px",
    width: "100%",
  },
  title: {
    fontSize: "24px",
    marginBottom: "12px",
    color: "#1a1a1a",
  },
  text: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "8px",
  },
  subText: {
    fontSize: "14px",
    color: "#999",
    marginBottom: "24px",
  },
  button: {
    display: "block",
    width: "100%",
    backgroundColor: "#1a237e",
    color: "white",
    border: "none",
    padding: "12px 28px",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "8px",
  },
  iconSuccess: {
    fontSize: "52px",
    marginBottom: "16px",
  },
  iconError: {
    fontSize: "52px",
    marginBottom: "16px",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "5px solid #e0e0e0",
    borderTop: "5px solid #1a237e",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px auto",
  },
};