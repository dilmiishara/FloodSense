// ─── shared.jsx ─────────────────────────────────────────────────────────────
// Shared theme constants, CSS, and reusable UI components for FloodSense Portal
// Import these into every page component.
import { useNavigate, useLocation  } from "react-router-dom";
import { useState } from "react";
import {rolePages} from "./shared/permissions.js";
import { useSettings } from "./context/SettingsContext";

// ─── COLOR CONSTANTS ─────────────────────────────────────────────────────────
export const C = {
    bg: "#f0ede8", white: "#ffffff", dark: "#1a1a1a", mid: "#666",
    light: "#f7f5f2", red: "#cc2200", orange: "#e86e00", yellow: "#c8920a",
    green: "#1a7a4a", blue: "#1a52cc",
    redBg: "#fff0ee", orangeBg: "#fff4ec", yellowBg: "#fdf6e3",
    greenBg: "#edf7f2", blueBg: "#eef3ff", border: "#e8e4df",
    shadow: "0 1px 5px rgba(0,0,0,0.07)",
};

// ─── GLOBAL CSS ──────────────────────────────────────────────────────────────
export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:#f0ede8;font-family:'DM Sans',sans-serif;color:#1a1a1a;min-height:100vh;overflow-x:hidden;}
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px;}
  input,select,textarea,button{font-family:'DM Sans',sans-serif;}
  table{border-collapse:collapse;width:100%;}
  th{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#aaa;padding:9px 12px;text-align:left;border-bottom:1.5px solid #e8e4df;}
  td{padding:10px 12px;border-bottom:1px solid #fafafa;font-size:13px;vertical-align:middle;}
  tr:last-child td{border:none;}
  tr:hover td{background:#faf9f7;}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes progAnim{from{width:0}to{width:100%}}
  @keyframes popIn{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  .pulse{animation:pulse 1.4s ease-in-out infinite;}
  .blink{animation:blink 1.2s ease-in-out infinite;}
  .fadeUp{animation:fadeUp .3s ease both;}
  .spinner{width:52px;height:52px;border:4px solid #f0f0f0;border-top-color:#1a1a1a;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px;}
  .progbar{background:#f0f0f0;height:4px;border-radius:2px;overflow:hidden;margin-top:14px;}
  .progfill{height:100%;background:#1a1a1a;border-radius:2px;animation:progAnim 1.8s ease forwards;}
`;

// ─── BADGE COMPONENT ─────────────────────────────────────────────────────────
export const Badge = ({ type, children }) => {
    const styles = {
        critical: { background: "#fff0ee", color: "#cc2200" },
        high:     { background: "#fff4ec", color: "#e86e00" },
        medium:   { background: "#fdf6e3", color: "#c8920a" },
        safe:     { background: "#edf7f2", color: "#1a7a4a" },
        active:   { background: "#edf7f2", color: "#1a7a4a" },
        inactive: { background: "#f0f0f0", color: "#888" },
        warn:     { background: "#fff4ec", color: "#e86e00" },
        admin:    { background: "#1a1a1a", color: "#fff" },
        officer:  { background: "#eef3ff", color: "#1a52cc" },
        view:     { background: "#f0f0f0", color: "#555" },
        pending:  { background: "#eef3ff", color: "#1a52cc" },
    };
    return (
        <span style={{
            display: "inline-block", padding: "3px 10px", borderRadius: 20,
            fontSize: 10, fontWeight: 800,
            ...(styles[type] || styles.active),
        }}>{children}</span>
    );
};

// ─── CARD ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, style = {} }) => (
    <div style={{
        background: "#ffffff", borderRadius: 14,
        padding: "18px 20px", boxShadow: "0 1px 5px rgba(0,0,0,.07)", ...style,
    }}>{children}</div>
);

// ─── BUTTON ───────────────────────────────────────────────────────────────────
export const Btn = ({ children, variant = "dark", onClick, style = {}, disabled }) => {
    const variants = {
        dark:    { background: "#1a1a1a", color: "#fff", border: "none" },
        red:     { background: "#cc2200", color: "#fff", border: "none" },
        green:   { background: "#1a7a4a", color: "#fff", border: "none" },
        outline: { background: "#ffffff", color: "#1a1a1a", border: "1.5px solid #e8e4df" },
        ghost:   { background: "#f7f5f2", color: "#666",   border: "1.5px solid #e8e4df" },
    };
    return (
        <button disabled={disabled} onClick={onClick} style={{
            padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: disabled ? "default" : "pointer", opacity: disabled ? .5 : 1,
            transition: "all .15s", ...variants[variant], ...style,
        }}>{children}</button>
    );
};


// ─── FORM GROUP ───────────────────────────────────────────────────────────────
export const FormGroup = ({ label, hint, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: .5 }}>{label}</label>
        {children}
        {hint && <span style={{ fontSize: 11, color: "#bbb" }}>{hint}</span>}
    </div>
);

// ─── INPUT ────────────────────────────────────────────────────────────────────
export const Input = ({ style = {}, ...props }) => (
    <input {...props} style={{
        padding: "10px 13px", borderRadius: 10, border: "1.5px solid #e8e4df",
        background: "#f7f5f2", fontSize: 13, color: "#1a1a1a", outline: "none",
        width: "100%", transition: "border .15s", ...style,
    }} />
);

// ─── SELECT ───────────────────────────────────────────────────────────────────
export const Select = ({ children, style = {}, ...props }) => (
    <select {...props} style={{
        padding: "10px 13px", borderRadius: 10, border: "1.5px solid #e8e4df",
        background: "#f7f5f2", fontSize: 13, color: "#1a1a1a", outline: "none",
        width: "100%", cursor: "pointer", ...style,
    }}>{children}</select>
);

// ─── TOGGLE SWITCH ────────────────────────────────────────────────────────────
export const Toggle = ({ on, onToggle }) => (
    <div onClick={onToggle} style={{
        width: 40, height: 22, borderRadius: 11,
        background: on ? "#050101" : "#ddd",
        position: "relative", cursor: "pointer", flexShrink: 0, transition: "background .2s",
    }}>
        <div style={{
            position: "absolute", top: 3,
            left: on ? 21 : 3, width: 16, height: 16,
            background: "#fff", borderRadius: "50%", transition: "left .2s",
        }} />
    </div>
);

// ─── TOGGLE ROW ───────────────────────────────────────────────────────────────
export const ToggleRow = ({ name, desc, on, onToggle }) => (
    <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 0", borderBottom: "1px solid #fafafa",
    }}>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{desc}</div>
        </div>
        <Toggle on={on} onToggle={onToggle} />
    </div>
);

// ─── PROBABILITY BAR ──────────────────────────────────────────────────────────
export const ProbBar = ({ pct, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 80, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
    </div>
);

// ─── TAB BAR ─────────────────────────────────────────────────────────────────
export const TabBar = ({ tabs, active, onChange }) => (
    <div style={{
        display: "flex", background: "#ffffff", borderRadius: 12,
        padding: 4, boxShadow: "0 1px 5px rgba(0,0,0,.07)", gap: 2,
    }}>
        {tabs.map(t => (
            <div key={t.id} onClick={() => onChange(t.id)} style={{
                flex: 1, padding: "9px 4px", textAlign: "center", borderRadius: 9,
                fontSize: 12.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                transition: "all .15s",
                background: active === t.id ? "#1a1a1a" : "transparent",
                color: active === t.id ? "#fff" : "#666",
            }}>{t.label}</div>
        ))}
    </div>
);

// ─── SRI LANKA SVG MAP ────────────────────────────────────────────────────────
export const SriLankaMap = ({ mode = "sensor" }) => {
    const path = "M200,90 L230,95 L260,105 L280,120 L295,140 L305,165 L308,190 L305,215 L300,235 L295,255 L290,275 L285,295 L278,315 L270,335 L260,355 L248,375 L235,393 L220,408 L205,420 L190,428 L175,432 L160,430 L148,422 L138,410 L130,395 L124,378 L120,360 L118,340 L118,320 L120,300 L124,280 L130,260 L138,242 L148,226 L158,212 L162,195 L162,178 L165,162 L172,148 L180,135 L188,122 L195,110 Z";
    if (mode === "heatmap") return (
        <svg viewBox="0 80 400 420" style={{ width: "100%", maxHeight: 380 }}>
            <defs>
                <radialGradient id="hg1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#cc2200" stopOpacity=".95"/><stop offset="100%" stopColor="#cc2200" stopOpacity="0"/></radialGradient>
                <radialGradient id="hg2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#e86e00" stopOpacity=".85"/><stop offset="100%" stopColor="#e86e00" stopOpacity="0"/></radialGradient>
                <radialGradient id="hg3" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#c8920a" stopOpacity=".7"/><stop offset="100%" stopColor="#c8920a" stopOpacity="0"/></radialGradient>
            </defs>
            <path d={path} fill="#222" stroke="#333" strokeWidth="1"/>
            <ellipse cx="185" cy="350" rx="50" ry="44" fill="url(#hg1)"/>
            <ellipse cx="162" cy="312" rx="36" ry="32" fill="url(#hg1)"/>
            <ellipse cx="176" cy="396" rx="30" ry="26" fill="url(#hg1)"/>
            <ellipse cx="148" cy="278" rx="28" ry="24" fill="url(#hg2)"/>
            <ellipse cx="183" cy="296" rx="24" ry="20" fill="url(#hg2)"/>
            <ellipse cx="206" cy="248" rx="24" ry="20" fill="url(#hg3)"/>
            <text x="185" y="352" fontSize="8" fill="rgba(255,255,255,.9)" textAnchor="middle" fontWeight="800">Ratnapura 92%</text>
            <text x="162" y="314" fontSize="7" fill="rgba(255,255,255,.9)" textAnchor="middle" fontWeight="700">Kalutara 78%</text>
            <text x="176" y="398" fontSize="7" fill="rgba(255,255,255,.8)" textAnchor="middle">Galle 65%</text>
            <text x="148" y="280" fontSize="7" fill="rgba(255,255,255,.7)" textAnchor="middle">Colombo 60%</text>
            <text x="206" y="250" fontSize="7" fill="rgba(255,255,255,.6)" textAnchor="middle">Kandy 40%</text>
        </svg>
    );
    if (mode === "affected") return (
        <svg viewBox="0 80 400 420" style={{ width: "100%", maxHeight: 380 }}>
            <path d={path} fill="#d8d5d0" stroke="#fff" strokeWidth="1.5"/>
            <path d="M162,340 L180,330 L198,335 L210,350 L208,368 L195,378 L178,375 L164,362 Z" fill="#cc2200" opacity=".85" stroke="#fff" strokeWidth="1"/>
            <path d="M148,300 L165,295 L178,305 L182,322 L170,332 L155,328 L144,315 Z" fill="#cc2200" opacity=".75" stroke="#fff" strokeWidth="1"/>
            <path d="M155,385 L175,378 L192,385 L195,402 L180,412 L162,408 L152,395 Z" fill="#cc2200" opacity=".7" stroke="#fff" strokeWidth="1"/>
            <path d="M138,270 L155,265 L165,278 L162,295 L148,298 L135,288 Z" fill="#e86e00" opacity=".75" stroke="#fff" strokeWidth="1"/>
            <path d="M175,405 L195,400 L210,408 L208,422 L192,428 L176,423 Z" fill="#e86e00" opacity=".7" stroke="#fff" strokeWidth="1"/>
            <path d="M188,238 L205,232 L220,240 L222,258 L208,265 L192,260 Z" fill="#c8920a" opacity=".7" stroke="#fff" strokeWidth="1"/>
            <path d="M192,98 L210,95 L225,102 L226,118 L212,122 L196,116 Z" fill="#aaddaa" opacity=".7" stroke="#fff" strokeWidth="1"/>
            <circle cx="185" cy="350" r="5" fill="#cc2200" className="pulse"/>
            <circle cx="185" cy="350" r="10" fill="#cc2200" opacity=".2"/>
            <circle cx="162" cy="312" r="4" fill="#cc2200" className="pulse"/>
            <text x="185" y="355" fontSize="7" fill="#fff" fontWeight="700" textAnchor="middle">Ratnapura</text>
            <text x="162" y="316" fontSize="6" fill="#fff" fontWeight="700" textAnchor="middle">Kalutara</text>
        </svg>
    );
    return (
        <svg viewBox="0 80 400 420" style={{ width: "100%", maxHeight: 380 }}>
            <path d={path} fill="#e0ddd8" stroke="#fff" strokeWidth="2"/>
            <circle cx="185" cy="350" r="6" fill="#cc2200"/>
            <circle cx="185" cy="350" r="12" fill="#cc2200" opacity=".2" className="pulse"/>
            <circle cx="162" cy="312" r="5" fill="#cc2200"/>
            <circle cx="162" cy="312" r="10" fill="#cc2200" opacity=".2" className="pulse"/>
            <circle cx="148" cy="278" r="5" fill="#e86e00"/>
            <circle cx="206" cy="248" r="4" fill="#c8920a"/>
            <circle cx="210" cy="108" r="4" fill="#1a7a4a"/>
            <text x="197" y="348" fontSize="8" fill="#cc2200" fontWeight="700">Ratnapura-A2</text>
            <text x="172" y="310" fontSize="8" fill="#cc2200" fontWeight="700">Kalutara-B1</text>
            <text x="158" y="276" fontSize="8" fill="#e86e00">Colombo-W</text>
            <text x="214" y="246" fontSize="8" fill="#c8920a">Kandy</text>
            <text x="218" y="106" fontSize="8" fill="#1a7a4a">Jaffna</text>
        </svg>
    );
};

// ─── HEADER ───────────────────────────────────────────────────────────────────
export const Header = () => {
  // Get global state from context
  const { systemSettings, toggleEmergencyMode } = useSettings();

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 16,
      margin: "14px 14px 0",
      padding: "13px 22px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 1px 5px rgba(0,0,0,.07)",
    }}>

      {/* LEFT SIDE — System Name (now dynamic from DB) */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        fontSize: 17, fontWeight: 800, letterSpacing: -.3
      }}>
        <div style={{
          width: 34, height: 34, background: "#1a1a1a",
          borderRadius: 9, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff"
            strokeWidth="2.2" strokeLinecap="round" width="20" height="20">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" opacity=".3"/>
            <path d="M5 15 Q8.5 9 12 13 Q15.5 17 19 11"/>
          </svg>
        </div>

        {/* ✅ This now comes from the database */}
        {systemSettings.system_name}
      </div>

      {/* RIGHT SIDE — Emergency Mode Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>

        {/* Notification bell */}
        <div style={{ position: "relative", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="#555" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div style={{
            position: "absolute", top: -2, right: -2,
            width: 8, height: 8, background: "#cc2200",
            borderRadius: "50%", border: "2px solid #fff"
          }} />
        </div>

        <span style={{ fontSize: 13, fontWeight: 600, color: "#666" }}>
          Emergency Mode
        </span>

        {/* ✅ This toggle is now synced with Settings page */}
        <Toggle
          on={systemSettings.emergency_mode}
          onToggle={toggleEmergencyMode}
        />

        {/* Avatar */}
        <div style={{
          width: 34, height: 34, background: "#1a1a1a",
          borderRadius: "50%", display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 12, fontWeight: 700
        }}>
          MR
        </div>
      </div>
    </div>
  );
};

// ─── SIDEBAR COMPONENT ──────────────────────────────────────────────────────
export const Sidebar = ({ page }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState("idle");

    const role = localStorage.getItem("role") || "maintainer";
    const NAV = rolePages[role] || [];

    const handleConfirmLogout = () => {
        setStatus("loading");
        setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            navigate("/", { replace: true });
        }, 1800);
    };

    return (
        <>
            <div style={{
                width: 196, minWidth: 196, marginRight: 14, background: "#ffffff",
                borderRadius: 16, padding: "20px 12px",
                boxShadow: "0 1px 5px rgba(0,0,0,.07)",
                display: "flex", flexDirection: "column", minHeight: 600,
            }}>
                <div style={{
                    fontSize: 17, fontWeight: 800,
                    padding: "0 8px", marginBottom: 6
                }}>
                    FloodSense
                </div>

                {NAV.map(item => {
                    const isActive = location.pathname === item.path;
                    const id = item.path.split("/").pop();

                    return (
                        <div key={item.path}>
                            <div
                                onClick={() => navigate(item.path)}
                                style={{
                                    padding: "9px 12px",
                                    borderRadius: 10,
                                    fontSize: 13.5,
                                    fontWeight: isActive ? 700 : 500,
                                    cursor: "pointer",
                                    color: isActive ? "#1a1a1a" : "#666",
                                    marginBottom: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 9,
                                    background: isActive ? "#eeebe6" : "transparent",
                                    transition: "background .15s",
                                }}
                            >
                                {item.name}
                            </div>
                        </div>
                    );
                })}

                <div style={{
                    height: 1,
                    background: "#e8e4df",
                    margin: "8px 0"
                }} />

                {/* Logout */}
                <div
                    onClick={() => setShowModal(true)}
                    style={{
                        padding: "9px 12px",
                        borderRadius: 10,
                        fontSize: 13.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        color: "#cc2200",
                        marginTop: "auto"
                    }}
                >
                    ⎋ Logout
                </div>
            </div>

            {/* Logout Modal */}
            {showModal && (
                <div style={modalStyles.overlay}>
                    <div className="fadeUp" style={modalStyles.modal}>
                        {status === "idle" ? (
                            <>
                                <div style={modalStyles.iconBadge}>⎋</div>
                                <h2 style={modalStyles.title}>Sign Out?</h2>
                                <p style={modalStyles.subtitle}>End your administrative session and lock the portal.</p>

                                {/* Session Context Box (Very Professional) */}
                                <div style={modalStyles.sessionBox}>
                                    <div style={modalStyles.sessionRow}>
                                        <span>User Role</span>
                                        <strong style={{color: '#1a1a1a'}}>System Admin</strong>
                                    </div>
                                    <div style={modalStyles.sessionRow}>
                                        <span>Live Alerts</span>
                                        <strong style={{color: '#cc2200'}}>3 Active</strong>
                                    </div>
                                    <div style={modalStyles.sessionRow}>
                                        <span>Last Sync</span>
                                        <strong style={{color: '#666'}}>Just now</strong>
                                    </div>
                                </div>

                                <p style={modalStyles.warningText}>
                                    Note: Automatic flood monitoring will continue in the background after you log out.
                                </p>

                                <div style={modalStyles.btnGroup}>
                                    <button onClick={() => setShowModal(false)} style={modalStyles.cancelBtn}>
                                        Stay
                                    </button>
                                    <button onClick={handleConfirmLogout} style={modalStyles.confirmBtn}>
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '20px 0' }}>
                                <div className="spinner" style={{ width: 44, height: 44, borderTopColor: '#cc2200' }} />
                                <h3 style={{ marginTop: 24, fontSize: 18, fontWeight: 800 }}>Securing System...</h3>
                                <p style={{ fontSize: 13, color: '#999', marginTop: 8 }}>Cleaning session cache and credentials</p>
                                <div className="progbar" style={{ width: '80%', margin: '20px auto 0' }}>
                                    <div className="progfill" style={{ background: '#cc2200' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </>
    );
};

const modalStyles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(26, 28, 30, 0.4)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
    },
    modal: {
        background: '#ffffff', width: '100%', maxWidth: '420px',
        borderRadius: '28px', padding: '45px 40px', textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e8e4df'
    },
    iconBadge: {
        width: '64px', height: '64px', background: '#fff0ee', color: '#cc2200',
        borderRadius: '20px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '28px', margin: '0 auto 20px',
    },
    title: { fontSize: '24px', fontWeight: '900', color: '#1a1a1a', marginBottom: '8px' },
    subtitle: { fontSize: '15px', color: '#666', marginBottom: '24px' },
    sessionBox: {
        background: '#f7f5f2', borderRadius: '16px', padding: '16px',
        marginBottom: '20px', border: '1px solid #e8e4df'
    },
    sessionRow: {
        display: 'flex', justifyContent: 'space-between', fontSize: '12px',
        fontWeight: '600', color: '#aaa', padding: '4px 0', textTransform: 'uppercase'
    },
    warningText: { fontSize: '12px', color: '#aaa', fontStyle: 'italic', marginBottom: '32px' },
    btnGroup: { display: 'flex', gap: '12px' },
    cancelBtn: {
        flex: 1, padding: '16px', borderRadius: '14px', border: '1.5px solid #e8e4df',
        background: '#fff', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
    },
    confirmBtn: {
        flex: 1, padding: '16px', borderRadius: '14px', border: 'none',
        background: '#1a1a1a', color: '#fff', fontWeight: '700', cursor: 'pointer',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
};

// ─── PAGE SHELL ───────────────────────────────────────────────────────────────
export const PageShell = ({ page, setPage, children }) => {
    return (
        <>
            <style>{globalCSS}</style>
            <div style={{ minHeight: "100vh", background: "#f0ede8" }}>
                <Header />   {/* ← no props needed, Header uses context directly */}
                <div style={{ display: "flex", margin: "12px 14px 14px", gap: 0 }}>
                    <Sidebar page={page} setPage={setPage} />
                    <div style={{ flex: 1, minWidth: 0, maxHeight: "calc(100vh - 110px)", overflowY: "auto", paddingRight: 2 }}>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};

// ─── TOAST HOOK ───────────────────────────────────────────────────────────────
export const Toast = ({ message }) =>
    message ? (
        <div style={{
            position: "fixed", top: 20, right: 20, background: "#1a7a4a",
            color: "#fff", borderRadius: 12, padding: "13px 20px",
            fontSize: 13, fontWeight: 700,
            boxShadow: "0 4px 20px rgba(0,0,0,.15)", zIndex: 999,
            display: "flex", alignItems: "center", gap: 8,
        }}>{message}</div>
    ) : null;

// ─── SIDEBAR NAVIGATION ──────────────────────────────────────────────────────
// const NAV = [
//     { id: "dashboard",   icon: "⊞", label: "Dashboard",    section: "Main" },
//     { id: "mapview",     icon: "🗺", label: "Map View" },
//     { id: "alerts",      icon: "🔔", label: "Alerts" },
//     { id: "prediction",  icon: "🔮", label: "Prediction" },
//     { id: "addlocation", icon: "📍", label: "Add Location", section: "Manage" },
//     { id: "reports",     icon: "📊", label: "Reports" },
//     { id: "settings",    icon: "⚙",  label: "Settings" },
//     { id: "posts",       icon: "📝", label: "Posts", section: "Manage" },
// ];