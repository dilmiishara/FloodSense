import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, AlertCircle, Activity, X, KeyRound, ShieldCheck } from "lucide-react";
import api from "../api/axios";

// ─── GLOBAL CSS (same as shared.jsx) ─────────────────────────────────────────
const loginCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --bg: #f0f4fc; --surface: #ffffff; --surface-alt: #f5f8ff;
    --border: #dde4f5; --border-mid: #c5d2ee;
    --text: #0f1b3d; --text-mid: #4a5680; --text-muted: #8b97bc;
    --primary: #1a52cc; --primary-hov: #1242b0; --primary-bg: #eef3ff;
    --accent: #0e9de8; --shadow: 0 1px 6px rgba(26,82,204,0.10);
    --shadow-md: 0 4px 20px rgba(26,82,204,0.12);
    --red: #cc2200; --red-bg: #fff0ee;
    --green: #1a7a4a; --green-bg: #edf7f2;
  }
  [data-theme="dark"] {
    --bg: #0d1224; --surface: #151c35; --surface-alt: #1a2340;
    --border: #242e4e; --border-mid: #2f3c62;
    --text: #e8edf8; --text-mid: #a0accc; --text-muted: #5e6a8a;
    --primary: #4d82f0; --primary-hov: #6694f5; --primary-bg: #1a2755;
    --accent: #3ec8fa;
    --shadow: 0 1px 6px rgba(0,0,0,0.35); --shadow-md: 0 4px 20px rgba(0,0,0,0.45);
    --red: #ff6347; --red-bg: #2e1410;
    --green: #3dc47a; --green-bg: #0e2a1c;
  }
  [data-theme="contrast"] {
    --bg: #000000; --surface: #0a0a0a; --surface-alt: #111111;
    --border: #ffffff; --border-mid: #cccccc;
    --text: #ffffff; --text-mid: #dddddd; --text-muted: #aaaaaa;
    --primary: #4d9fff; --primary-hov: #7ab8ff; --primary-bg: #001a3a;
    --accent: #00e5ff;
    --shadow: 0 1px 0px #ffffff33; --shadow-md: 0 4px 0px #ffffff22;
    --red: #ff4444; --red-bg: #1a0000;
    --green: #44ff88; --green-bg: #001a0d;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); }
  input, button { font-family: 'Plus Jakarta Sans', sans-serif; }

  .login-input-wrapper:focus-within {
    border-color: var(--primary) !important;
    box-shadow: 0 0 0 3px var(--primary-bg) !important;
  }
  .login-input-wrapper:focus-within svg {
    color: var(--primary) !important;
  }
  .login-submit-btn:hover:not(:disabled) {
    background: var(--primary-hov) !important;
  }
  .login-forgot:hover {
    color: var(--accent) !important;
  }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes progAnim { from { width: 0; } to { width: 100%; } }
  .fadeUp { animation: fadeUp .3s ease both; }
  .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 12px; }
  .progbar { background: var(--border); height: 4px; border-radius: 2px; overflow: hidden; margin-top: 14px; }
  .progfill { height: 100%; background: var(--primary); border-radius: 2px; animation: progAnim 1.8s ease forwards; }
`;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [showResetModal, setShowResetModal] = useState(false);
  const [step, setStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      let roleString = res.data.user.role === 1 ? "admin" : "maintenance";
      localStorage.setItem("role", roleString);
      localStorage.setItem("user", JSON.stringify({ ...res.data.user, role: roleString }));
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unauthorized access. Access restricted to Disaster Management personnel.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail) return setModalError("Please enter your registered email address.");
    setResetLoading(true);
    setModalError(""); setModalSuccess("");
    try {
      await api.post("/forgot-password", { email: resetEmail });
      setModalSuccess("Verification key dispatched to your email!");
      setTimeout(() => { setStep(2); setModalSuccess(""); }, 1500);
    } catch (err) {
      setModalError(err.response?.data?.message || "Registered email not found.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (!otpCode || !newPassword || !confirmPassword) return setModalError("Please fill all fields.");
    if (newPassword !== confirmPassword) return setModalError("Passwords do not match.");
    setResetLoading(true);
    setModalError(""); setModalSuccess("");
    try {
      await api.post("/reset-password", { email: resetEmail, otp: otpCode, password: newPassword, password_confirmation: confirmPassword });
      setModalSuccess("Password updated! Closing...");
      setTimeout(() => {
        setShowResetModal(false); setStep(1);
        setResetEmail(""); setOtpCode(""); setNewPassword(""); setConfirmPassword(""); setModalSuccess("");
      }, 2000);
    } catch (err) {
      setModalError(err.response?.data?.message || "Invalid or expired token.");
    } finally {
      setResetLoading(false);
    }
  };

  const openReset = () => { setShowResetModal(true); setStep(1); setModalError(""); setModalSuccess(""); };

  return (
    <>
      <style>{loginCSS}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

        {/* ── LEFT VISUAL PANEL ── */}
        <div style={{
          flex: 1.2, position: "relative",
          backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072")',
          backgroundSize: "cover", backgroundPosition: "center",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px", overflow: "hidden",
        }}>
          {/* Overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(13,18,36,0.94) 0%, rgba(26,82,204,0.30) 100%)",
          }} />

          {/* Branding */}
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480 }}>
            {/* Logo badge */}
            <div style={{
              width: 64, height: 64,
              background: "linear-gradient(135deg, #1a52cc 0%, #0e9de8 100%)",
              borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 28, boxShadow: "0 12px 28px rgba(26,82,204,0.45)",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" width="32" height="32">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" opacity=".3"/>
                <path d="M5 15 Q8.5 9 12 13 Q15.5 17 19 11"/>
              </svg>
            </div>

            {/* Title */}
            <div style={{ fontSize: "3.6rem", fontWeight: 900, color: "#fff", letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 16 }}>
              Flood<span style={{ color: "#4d82f0" }}>Sense</span>
            </div>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.80)", lineHeight: 1.65, marginBottom: 40, fontWeight: 400 }}>
              National Flood Prediction & Risk Detection System. Real-time monitoring for the Democratic Socialist Republic of Sri Lanka.
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 24, marginBottom: 40 }}>
              {[["24/7", "Active Monitoring"], ["Live", "Sensor Network"], ["≥94%", "Prediction Accuracy"]].map(([val, lbl]) => (
                <div key={lbl} style={{
                  background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 20px",
                  border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)",
                }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff" }}>{val}</div>
                  <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{lbl}</div>
                </div>
              ))}
            </div>

            {/* Sensor status pills */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "Colombo Network", dot: "#4d82f0" },
                { label: "Southern Sensors", dot: "#3dc47a" },
                { label: "Central Hub", dot: "#3dc47a" },
              ].map(({ label, dot }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 20, padding: "7px 14px",
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: dot, boxShadow: `0 0 0 3px ${dot}33` }} />
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", letterSpacing: 0.3 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--bg)", padding: "40px 32px",
        }}>
          <div style={{ width: "100%", maxWidth: 440 }}>

            {/* Card */}
            <div style={{
              background: "var(--surface)", borderRadius: 24,
              padding: "40px 36px",
              boxShadow: "var(--shadow-md)", border: "1px solid var(--border)",
            }}>

              {/* Header */}
              <div style={{ marginBottom: 28, textAlign: "center" }}>
                <div style={{
                  width: 46, height: 46,
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                  borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", boxShadow: "0 4px 14px rgba(26,82,204,0.35)",
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" width="24" height="24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" opacity=".3"/>
                    <path d="M5 15 Q8.5 9 12 13 Q15.5 17 19 11"/>
                  </svg>
                </div>
                <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--text)", letterSpacing: -0.5 }}>System Login</div>
                <div style={{ fontSize: "0.87rem", color: "var(--text-muted)", marginTop: 5, fontWeight: 400 }}>
                  Provide administrative credentials to access the portal.
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: "var(--red-bg)", border: "1px solid var(--red)", borderRadius: 12,
                  padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10,
                  color: "var(--red)", fontSize: "0.88rem", fontWeight: 500, marginBottom: 22,
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ lineHeight: 1.45 }}>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin}>
                {/* Email */}
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Email Address</label>
                  <div className="login-input-wrapper" style={inputWrapStyle}>
                    <Mail size={16} style={inputIconStyle} />
                    <input
                      type="email"
                      placeholder="admin@floodsense.gov.lk"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                    <span
                      onClick={openReset}
                      className="login-forgot"
                      style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700, cursor: "pointer", transition: "color .15s" }}
                    >
                      Request Reset
                    </span>
                  </div>
                  <div className="login-input-wrapper" style={inputWrapStyle}>
                    <Lock size={16} style={inputIconStyle} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 13, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="login-submit-btn"
                  style={{
                    width: "100%", padding: "13px", borderRadius: 12,
                    background: "var(--primary)", color: "#fff",
                    fontSize: "0.97rem", fontWeight: 800, border: "none",
                    cursor: isLoading ? "default" : "pointer",
                    opacity: isLoading ? 0.75 : 1,
                    transition: "background .15s",
                    letterSpacing: -0.2,
                  }}
                >
                  {isLoading ? "Authenticating..." : "Login to Portal"}
                </button>
              </form>

              {/* Footer */}
              <div style={{ textAlign: "center", marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  © 2026 FloodSense Sri Lanka · Secure Government Gateway
                </span>
              </div>
            </div>

            {/* Version tag */}
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500, letterSpacing: 0.5 }}>
                FloodSense v2.4 · DMC Sri Lanka
              </span>
            </div>
          </div>
        </div>

        {/* ── RESET PASSWORD MODAL ── */}
        {showResetModal && (
          <div style={{
            position: "fixed", inset: 0,
            background: "rgba(15,27,61,0.55)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000,
          }}>
            <div className="fadeUp" style={{
              background: "var(--surface)", width: "90%", maxWidth: 420,
              borderRadius: 24, padding: "40px 36px",
              boxShadow: "var(--shadow-md)", border: "1px solid var(--border)",
              position: "relative",
            }}>
              {/* Close */}
              <button
                onClick={() => setShowResetModal(false)}
                disabled={resetLoading}
                style={{
                  position: "absolute", top: 16, right: 16,
                  width: 30, height: 30, borderRadius: "50%",
                  background: "var(--surface-alt)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--text-muted)",
                }}
              >
                <X size={14} />
              </button>

              {/* Alerts */}
              {modalError && (
                <div style={{
                  background: "var(--red-bg)", border: "1px solid var(--red)", borderRadius: 10,
                  padding: "10px 13px", display: "flex", gap: 9,
                  color: "var(--red)", fontSize: "0.84rem", fontWeight: 500, marginBottom: 16,
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {modalError}
                </div>
              )}
              {modalSuccess && (
                <div style={{
                  background: "var(--green-bg)", border: "1px solid var(--green)", borderRadius: 10,
                  padding: "10px 13px", display: "flex", gap: 9,
                  color: "var(--green)", fontSize: "0.84rem", fontWeight: 500, marginBottom: 16,
                }}>
                  <ShieldCheck size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {modalSuccess}
                </div>
              )}

              {step === 1 ? (
                /* ── Step 1: Send OTP ── */
                <form onSubmit={handleSendOtp}>
                  <div style={{ textAlign: "center", marginBottom: 26 }}>
                    <div style={{
                      width: 54, height: 54, background: "var(--primary-bg)",
                      borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 14px",
                    }}>
                      <Lock size={22} color="var(--primary)" />
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--text)", letterSpacing: -0.3 }}>Recover Password</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
                      Enter your registered email to dispatch a security validation key.
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Registered Email</label>
                    <div className="login-input-wrapper" style={inputWrapStyle}>
                      <Mail size={16} style={inputIconStyle} />
                      <input
                        type="email" placeholder="admin@floodsense.gov.lk"
                        style={inputStyle} value={resetEmail}
                        onChange={e => setResetEmail(e.target.value)}
                        required disabled={resetLoading}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                    <button type="button" onClick={() => setShowResetModal(false)} disabled={resetLoading} style={modalSecBtn}>Cancel</button>
                    <button type="submit" disabled={resetLoading} style={modalPriBtn}>
                      {resetLoading ? "Processing..." : "Send Reset Key"}
                    </button>
                  </div>
                </form>
              ) : (
                /* ── Step 2: Verify & Reset ── */
                <form onSubmit={handleVerifyAndReset}>
                  <div style={{ textAlign: "center", marginBottom: 22 }}>
                    <div style={{
                      width: 54, height: 54, background: "var(--green-bg)",
                      borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 14px",
                    }}>
                      <ShieldCheck size={22} color="var(--green)" />
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--text)", letterSpacing: -0.3 }}>Verify Identity</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
                      A 6-digit token was sent to<br />
                      <strong style={{ color: "var(--text)", fontWeight: 700 }}>{resetEmail}</strong>
                    </div>
                  </div>

                  {[
                    { label: "6-Digit Token", icon: <KeyRound size={16} style={inputIconStyle} />, type: "text", placeholder: "XXXXXX", maxLength: 6, value: otpCode, onChange: e => setOtpCode(e.target.value) },
                    { label: "New Password", icon: <Lock size={16} style={inputIconStyle} />, type: "password", placeholder: "Min. 8 characters", value: newPassword, onChange: e => setNewPassword(e.target.value) },
                    { label: "Confirm Password", icon: <Lock size={16} style={inputIconStyle} />, type: "password", placeholder: "Repeat new password", value: confirmPassword, onChange: e => setConfirmPassword(e.target.value) },
                  ].map(({ label, icon, ...inputProps }) => (
                    <div key={label} style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>{label}</label>
                      <div className="login-input-wrapper" style={inputWrapStyle}>
                        {icon}
                        <input {...inputProps} required disabled={resetLoading} style={inputStyle} />
                      </div>
                    </div>
                  ))}

                  <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                    <button type="button" onClick={() => setStep(1)} disabled={resetLoading} style={modalSecBtn}>Back</button>
                    <button type="submit" disabled={resetLoading} style={modalPriBtn}>
                      {resetLoading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── SHARED STYLE OBJECTS ────────────────────────────────────────────────────
const labelStyle = {
  display: "block", fontSize: "0.82rem", fontWeight: 700,
  color: "var(--text-muted)", textTransform: "uppercase",
  letterSpacing: 0.5, marginBottom: 7,
};

const inputWrapStyle = {
  position: "relative", display: "flex", alignItems: "center",
  background: "var(--surface-alt)", border: "1.5px solid var(--border)",
  borderRadius: 10, transition: "all .15s",
};

const inputIconStyle = {
  position: "absolute", left: 13, color: "var(--text-muted)", flexShrink: 0, transition: "color .15s",
};

const inputStyle = {
  width: "100%", padding: "11px 13px 11px 40px", border: "none",
  background: "transparent", fontSize: "0.93rem", color: "var(--text)", outline: "none",
  borderRadius: 10,
};

const modalSecBtn = {
  flex: 1, padding: "11px", borderRadius: 10,
  border: "1.5px solid var(--border)", background: "var(--surface)",
  fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", color: "var(--text-mid)",
};

const modalPriBtn = {
  flex: 1.6, padding: "11px", borderRadius: 10, border: "none",
  background: "var(--primary)", color: "#fff",
  fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
};

export default Login;