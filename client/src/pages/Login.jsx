import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Login = () => {
  const [step, setStep] = useState(1); // Multi-step form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter your password");
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate("/dashboard/home");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container login-page">
      <div className="auth-box login-box">
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
            <h2 className="login-title">Sign in</h2>

            {error && <div className="error-message login-error">{error}</div>}

            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email, phone, or Skype"
                  autoComplete="email"
                  className="ms-input login-input"
                />
              </div>

              <p className="login-no-account">
                No account? <Link to="/signup">Create one!</Link>
              </p>

              <div className="login-button-container">
                <button type="submit" className="btn-primary login-btn">
                  Next
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="login-title">Enter password</h2>
            <p className="email-display login-email-display">{email}</p>

            {error && <div className="error-message login-error">{error}</div>}

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="ms-input login-input"
                  autoFocus
                />
              </div>

              <div className="login-button-container">
                <button
                  type="button"
                  className="btn-back login-back"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button type="submit" className="btn-primary login-btn">
                  Sign in
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <div className="login-footer">
        <a
          href="https://www.microsoft.com/en-ca/privacy/privacystatement"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy statement
        </a>
        <span className="login-copyright">©2025 Microsoft</span>
      </div>
    </div>
  );
};

export default Login;
