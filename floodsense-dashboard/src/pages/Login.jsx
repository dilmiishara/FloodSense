import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, AlertCircle, Activity, X, KeyRound, ShieldCheck } from "lucide-react";
import api from "../api/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  //  FORGET PASSWORD MODAL STATES
  const [showResetModal, setShowResetModal] = useState(false);
  const [step, setStep] = useState(1); 
  const [resetEmail, setResetEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  //  INPUT FOCUS STATES 
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);

      let roleString = "";
      let redirectPath = "";

      if (res.data.user.role === 1) {
        roleString = "admin";
        redirectPath = "/app/dashboard";
      } else {
        roleString = "maintenance";
        redirectPath = "/app/dashboard";
      }

      localStorage.setItem("role", roleString);
      localStorage.setItem("user", JSON.stringify({
        ...res.data.user,
        role: roleString 
      }));

      navigate(redirectPath, { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Unauthorized access. Access restricted to Disaster Management personnel.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail) return setModalError("Please enter your registered email address.");
    
    setResetLoading(true);
    setModalError("");
    setModalSuccess("");

    try {
      await api.post("/forgot-password", { email: resetEmail });
      setModalSuccess("Verification key successfully dispatched to your email address!");
      setTimeout(() => {
        setStep(2); 
        setModalSuccess("");
      }, 1500);
    } catch (err) {
      setModalError(err.response?.data?.message || "Registered email structure not found.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (!otpCode || !newPassword || !confirmPassword) {
      return setModalError("Please fulfill all security input sections.");
    }
    if (newPassword !== confirmPassword) {
      return setModalError("New password confirmation does not match.");
    }

    setResetLoading(true);
    setModalError("");
    setModalSuccess("");

    try {
      await api.post("/reset-password", {
        email: resetEmail,
        otp: otpCode,
        password: newPassword,
        password_confirmation: confirmPassword
      });

      setModalSuccess("Security password re-configured successfully! Closing...");
      setTimeout(() => {
        setShowResetModal(false);
        setStep(1);
        setResetEmail("");
        setOtpCode("");
        setNewPassword("");
        setConfirmPassword("");
        setModalSuccess("");
      }, 2000);
    } catch (err) {
      setModalError(err.response?.data?.message || "Invalid or expired token code.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
      <div style={styles.container}>
        <div style={styles.visualSide}>
          <div style={styles.overlay}></div>
          <div style={styles.brandingContent}>
            <div style={styles.logoBadge}>
              <Activity color="white" size={32} />
            </div>
            <h1 style={styles.heroTitle}>Flood<span style={{color: '#ff4d4d'}}>Sense</span></h1>
            <p style={styles.heroSubtitle}>
              National Flood Prediction & Risk Detection System.
              Real-time monitoring for the Democratic Socialist Republic of Sri Lanka.
            </p>
            <div style={styles.statsContainer}>
              <div style={styles.statBox}>
                <span style={styles.statValue}>24/7</span>
                <span style={styles.statLabel}>Active Monitoring</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statValue}>Live</span>
                <span style={styles.statLabel}>Sensor Network</span>
              </div>
            </div>
          </div>
        </div>

        
        <div style={styles.formSide}>
          <div style={styles.loginFormCard}>
            
            <div style={{ marginBottom: '28px', textAlign: 'center' }}>
              <h2 style={styles.formTitle}>System Login</h2>
              <p style={styles.formSubtitle}>Provide administrative credentials to log in.</p>
            </div>

            {error && (
                <div style={styles.errorBox}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span style={{ lineHeight: "1.4" }}>{error}</span>
                </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Username</label>
                
                <div style={{
                  ...styles.inputWrapper,
                  borderColor: emailFocused ? "#ff4d4d" : "#e2e8f0",
                  boxShadow: emailFocused ? "0 0 0 4px rgba(255, 77, 77, 0.1)" : "none"
                }}>
                  <Mail style={{ ...styles.icon, color: emailFocused ? "#ff4d4d" : "#94a3b8" }} size={18} />
                  <input
                      type="email"
                      placeholder="admin@floodsense.gov.lk"
                      style={styles.input}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, marginBottom: 0 }}>Password</label>
                  <span 
                    onClick={() => { setShowResetModal(true); setStep(1); setModalError(""); setModalSuccess(""); }} 
                    style={styles.forgotPass}
                  >
                    Request Reset
                  </span>
                </div>
                <div style={{
                  ...styles.inputWrapper,
                  borderColor: passwordFocused ? "#ff4d4d" : "#e2e8f0",
                  boxShadow: passwordFocused ? "0 0 0 4px rgba(255, 77, 77, 0.1)" : "none"
                }}>
                  <Lock style={{ ...styles.icon, color: passwordFocused ? "#ff4d4d" : "#94a3b8" }} size={18} />
                  <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      style={styles.input}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                {isLoading ? "Authenticating Gateway..." : "Login"}
              </button>
            </form>

            <p style={styles.footerText}>
              © 2026 FloodSense Sri Lanka. Secure Government Gateway.
            </p>
          </div>
        </div>

        {/* ── PREMIUM INTERACTIVE RECOVERY MODAL ── */}
        {showResetModal && (
          <div style={styles.modalBackdrop}>
            <div style={styles.modalCard}>
              
              <button onClick={() => setShowResetModal(false)} style={styles.modalCloseBtn} disabled={resetLoading}>
                <X size={16} />
              </button>

              {modalError && (
                <div style={{ ...styles.errorBox, marginBottom: '16px', padding: '12px 16px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem' }}>{modalError}</span>
                </div>
              )}

              {modalSuccess && (
                <div style={styles.successBox}>
                  <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem' }}>{modalSuccess}</span>
                </div>
              )}

              {/* REQUEST OTP LOOKUP */}
              {step === 1 ? (
                <form onSubmit={handleSendOtp}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={styles.modalIconBadgeReset}><Lock size={22} color="#ff4d4d" /></div>
                    <h3 style={styles.modalTitleText}>Recover Password</h3>
                    <p style={styles.modalSubTitleText}>Enter your registered gateway email to dispatch a security validation key.</p>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Registered Email Address</label>
                    <div style={{ ...styles.inputWrapper, backgroundColor: '#fff', borderColor: '#e2e8f0', boxShadow: 'none' }}>
                      <Mail style={styles.icon} size={18} />
                      <input
                        type="email"
                        placeholder="admin@floodsense.gov.lk"
                        style={styles.input}
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        disabled={resetLoading}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="button" onClick={() => setShowResetModal(false)} style={styles.modalSecondaryBtn} disabled={resetLoading}>Cancel</button>
                    <button type="submit" style={styles.modalPrimaryBtnReset} disabled={resetLoading}>
                      {resetLoading ? "Processing..." : "Send Reset Key"}
                    </button>
                  </div>
                </form>
              ) : (
                /* VERIFY OTP AND CHANGE PASSWORD */
                <form onSubmit={handleVerifyAndReset}>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={styles.modalIconBadgeSuccess}><ShieldCheck size={22} color="#2ecc71" /></div>
                    <h3 style={styles.modalTitleText}>Verify Identity</h3>
                    <p style={styles.modalSubTitleText}>A 6-digit key token has been sent to <br/><span style={{fontWeight: '700', color: '#1A1C1E'}}>{resetEmail}</span></p>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>6-Digit Verification Token</label>
                    <div style={{ ...styles.inputWrapper, backgroundColor: '#fff', borderColor: '#e2e8f0', boxShadow: 'none' }}>
                      <KeyRound style={styles.icon} size={18} />
                      <input
                        type="text"
                        placeholder="XXXXXX"
                        maxLength="6"
                        style={styles.input}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                        disabled={resetLoading}
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>New Security Password</label>
                    <div style={{ ...styles.inputWrapper, backgroundColor: '#fff', borderColor: '#e2e8f0', boxShadow: 'none' }}>
                      <Lock style={styles.icon} size={18} />
                      <input
                        type="password"
                        placeholder="Minimum 6 characters"
                        style={styles.input}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={resetLoading}
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Confirm Security Password</label>
                    <div style={{ ...styles.inputWrapper, backgroundColor: '#fff', borderColor: '#e2e8f0', boxShadow: 'none' }}>
                      <Lock style={styles.icon} size={18} />
                      <input
                        type="password"
                        placeholder="Repeat master security key"
                        style={styles.input}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={resetLoading}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="button" onClick={() => setStep(1)} style={styles.modalSecondaryBtn} disabled={resetLoading}>Back</button>
                    <button type="submit" style={styles.modalPrimaryBtnSave} disabled={resetLoading}>
                      {resetLoading ? "Configuring..." : "Update Password"}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}
      </div>
  );
}

// ── STYLES SCHEMA ──
const styles = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#fff' },
  
  visualSide: { flex: 1.2, position: 'relative', backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072")', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '40px' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.5) 100%)' },
  brandingContent: { position: 'relative', zIndex: 2, maxWidth: '500px' },
  logoBadge: { width: '64px', height: '64px', backgroundColor: '#ff4d4d', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 10px 20px rgba(255, 77, 77, 0.3)' },
  heroTitle: { fontSize: '3.5rem', fontWeight: '800', marginBottom: '16px', letterSpacing: '-1px' },
  heroSubtitle: { fontSize: '1.1rem', lineHeight: '1.6', opacity: 0.9, marginBottom: '40px' },
  statsContainer: { display: 'flex', gap: '30px' },
  statBox: { display: 'flex', flexDirection: 'column' },
  statValue: { fontSize: '1.5rem', fontWeight: 'bold' },
  statLabel: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 },
  
  formSide: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F7F4', padding: '40px' },
  loginFormCard: { 
    width: '100%', 
    maxWidth: '430px', 
    backgroundColor: '#ffffff', 
    padding: '40px', 
    borderRadius: '24px', 
    boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.05), 0 1px 3px 0 rgba(15, 23, 42, 0.02)',
    border: '1px solid #e2e8f0'
  },
  formTitle: { fontSize: '1.9rem', fontWeight: '800', color: '#1A1C1E', marginBottom: '4px', letterSpacing: '-0.5px' },
  formSubtitle: { color: '#64748b', fontSize: '0.88rem', fontWeight: '400' },
  
  // Sleek Custom Lockout Alert Banner 
  errorBox: { 
    backgroundColor: '#fff5f5', 
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#fee2e2',
    padding: '12px 14px', 
    borderRadius: '12px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    color: '#e11d48', 
    fontSize: '0.88rem', 
    marginBottom: '24px',
    fontWeight: '500'
  },
  successBox: { backgroundColor: '#f0fdf4', borderWidth: '1px', borderStyle: 'solid', borderColor: '#bbf7d0', padding: '12px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', fontSize: '0.88rem', marginBottom: '24px', fontWeight: '500' },
  
  // Inputs Core Design
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#444', marginBottom: '8px', textAlign: 'left' },
  inputWrapper: { 
    position: 'relative', 
    display: 'flex', 
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f8fafc',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '12px',
    transition: 'all 0.2s ease-in-out'
  },
  icon: { position: 'absolute', left: '14px', color: '#94a3b8', transition: 'color 0.2s' },
  input: { width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: 'none', fontSize: '0.95rem', outline: 'none', backgroundColor: 'transparent', color: '#1A1C1E' },
  eyeBtn: { position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' },
  forgotPass: { fontSize: '0.8rem', color: '#ff4d4d', fontWeight: '600', cursor: 'pointer', transition: 'color 0.2s' },
  submitBtn: { width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#1A1C1E', color: 'white', fontSize: '1.1rem', fontWeight: '700', border: 'none', cursor: 'pointer', marginTop: '10px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' },
  footerText: { textAlign: 'center', marginTop: '40px', fontSize: '0.75rem', color: '#aaa' },
  
  // Modal Layer Styles
  modalBackdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modalCard: { background: '#ffffff', width: '90%', maxWidth: '400px', padding: '36px', borderRadius: '24px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', border: '1px solid #e2e8f0' },
  modalCloseBtn: { position: 'absolute', top: '18px', right: '18px', border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' },
  modalIconBadgeReset: { width: '54px', height: '54px', background: '#fff1f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' },
  modalIconBadgeSuccess: { width: '54px', height: '54px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' },
  modalTitleText: { fontWeight: '800', margin: 0, fontSize: '1.25rem', color: '#1A1C1E', letterSpacing: '-0.3px' },
  modalSubTitleText: { color: '#64748b', fontSize: '0.85rem', marginTop: '6px', lineHeight: '1.4' },
  modalSecondaryBtn: { flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', color: '#475569' },
  modalPrimaryBtnReset: { flex: 1.5, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#ff4d4d', color: '#fff', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 77, 77, 0.2)' },
  modalPrimaryBtnSave: { flex: 1.5, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#1A1C1E', color: '#fff', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }
};

export default Login;