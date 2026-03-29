import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, AlertCircle, ShieldCheck, Activity } from "lucide-react";
import api from "../api/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      navigate(res.data.user.role === 1 ? "/admin/dashboard" : "/officer/dashboard");
    } catch (err) {
      setError("Unauthorized access. Access restricted to Disaster Management personnel.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Side: Visual/Branding Section */}
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

      {/* Right Side: Login Form */}
      <div style={styles.formSide}>
        <div style={styles.loginCard}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={styles.formTitle}>System Login</h2>
            <p style={styles.formSubtitle}>Enter your official credentials to access the portal.</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Official Email</label>
              <div style={styles.inputWrapper}>
                <Mail style={styles.icon} size={20} />
                <input
                  type="email"
                  placeholder="admin@floodsense.gov.lk"
                  style={styles.input}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={styles.label}>Password</label>
                <span style={styles.forgotPass}>Request Reset</span>
              </div>
              <div style={styles.inputWrapper}>
                <Lock style={styles.icon} size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  style={styles.input}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={styles.submitBtn}>
              {isLoading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>

          <p style={styles.footerText}>
            © 2026 FloodSense Sri Lanka. Secure Government Gateway.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#fff',
  },
  visualSide: {
    flex: 1.2,
    position: 'relative',
    backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072")', // Tech Satellite Image
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    padding: '40px',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.5) 100%)',
  },
  brandingContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '500px',
  },
  logoBadge: {
    width: '64px',
    height: '64px',
    backgroundColor: '#ff4d4d',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    boxShadow: '0 10px 20px rgba(255, 77, 77, 0.3)',
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    marginBottom: '16px',
    letterSpacing: '-1px',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    opacity: 0.9,
    marginBottom: '40px',
  },
  statsContainer: {
    display: 'flex',
    gap: '30px',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    opacity: 0.7,
  },
  formSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F7F4',
    padding: '40px',
  },
  loginCard: {
    width: '100%',
    maxWidth: '420px',
  },
  formTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: '8px',
  },
  formSubtitle: {
    color: '#666',
    fontSize: '0.95rem',
  },
  errorBox: {
    backgroundColor: '#fff1f1',
    borderLeft: '4px solid #ff4d4d',
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#c0392b',
    fontSize: '0.9rem',
    marginBottom: '24px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#444',
    marginBottom: '8px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '12px',
    color: '#94a3b8',
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 44px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '1rem',
    outline: 'none',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
  },
  forgotPass: {
    fontSize: '0.8rem',
    color: '#ff4d4d',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: '#1A1C1E',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '40px',
    fontSize: '0.75rem',
    color: '#aaa',
  }
};

export default Login;