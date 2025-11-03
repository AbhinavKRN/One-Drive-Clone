import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter an email address");
      return;
    }

    setStep(2);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = await signup(name, email, password);
    if (result.success) {
      navigate("/dashboard/home");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container signup-page">
      <div className="auth-box signup-box">
        <div className="auth-header">
          <div className="microsoft-logo-wrapper">
            <div className="microsoft-logo-grid">
              <div className="microsoft-square microsoft-red"></div>
              <div className="microsoft-square microsoft-green"></div>
              <div className="microsoft-square microsoft-blue"></div>
              <div className="microsoft-square microsoft-yellow"></div>
            </div>
            <span className="microsoft-text">Microsoft</span>
          </div>
        </div>

        {step === 1 ? (
          <>
            <h2>Create your Microsoft account</h2>
            <p className="auth-subtitle signup-subtitle">
              Enter your email address.
            </p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className="ms-input"
                />
              </div>

              <button type="submit" className="btn-primary">
                Next
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <h2>Create a password</h2>
            <p className="auth-subtitle">
              Make sure it's 6 characters or more.
            </p>
            <p className="email-display">{email}</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  autoComplete="name"
                  className="ms-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="new-password"
                  className="ms-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  className="ms-input"
                />
              </div>

              <button type="submit" className="btn-primary">
                Create account
              </button>
            </form>

            <div className="auth-footer">
              <button className="btn-back" onClick={() => setStep(1)}>
                Back
              </button>
            </div>
          </>
        )}
      </div>

      <div className="auth-privacy-notice signup-privacy">
        Use private browsing if this is not your device.{" "}
        <a
          href="https://support.microsoft.com/en-us/account-billing/avoid-staying-signed-in-on-a-public-computer-d3f1448b-64b9-4b35-89d0-ce56715c6756"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
        </a>
      </div>

      <div className="auth-footer-links signup-footer-links">
        <a
          href="https://www.microsoft.com/en-in/servicesagreement"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of use
        </a>
        <a
          href="https://www.microsoft.com/en-ca/privacy/privacystatement"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy and Cookies
        </a>
      </div>
    </div>
  );
};

export default Signup;
