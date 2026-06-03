// ─── shared.jsx ─────────────────────────────────────────────────────────────
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import { rolePages } from "./shared/permissions.js";
import { useSettings } from "./context/SettingsContext";
import { LogOut, Edit, Bell, Sun, Moon, Contrast } from "lucide-react";
import { NAV_ICONS, LogoutIcon } from "./shared/icons";

// ─── THEME CONTEXT ────────────────────────────────────────────────────────────
export const ThemeContext = createContext({ theme: "light", setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
    useEffect(() => {
        localStorage.setItem("theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

// ─── THEME TOKENS ─────────────────────────────────────────────────────────────
// Usage: T[theme].tokenName
export const T = {
    light: {
        bg:         "#f0f4fc",
        surface:    "#ffffff",
        surfaceAlt: "#f5f8ff",
        border:     "#dde4f5",
        borderMid:  "#c5d2ee",
        text:       "#0f1b3d",
        textMid:    "#4a5680",
        textMuted:  "#8b97bc",
        primary:    "#1a52cc",
        primaryHov: "#1242b0",
        primaryBg:  "#eef3ff",
        accent:     "#0e9de8",
        shadow:     "0 1px 6px rgba(26,82,204,0.10)",
        shadowMd:   "0 4px 20px rgba(26,82,204,0.12)",
        red:        "#cc2200", redBg:    "#fff0ee",
        orange:     "#e07800", orangeBg: "#fff4ec",
        yellow:     "#b87f00", yellowBg: "#fdf6e3",
        green:      "#1a7a4a", greenBg:  "#edf7f2",
        navActive:  "#eef3ff",
        navActiveBorder: "#1a52cc",
        sidebarBg:  "#ffffff",
        headerBg:   "#ffffff",
    },
    dark: {
        bg:         "#0d1224",
        surface:    "#151c35",
        surfaceAlt: "#1a2340",
        border:     "#242e4e",
        borderMid:  "#2f3c62",
        text:       "#e8edf8",
        textMid:    "#a0accc",
        textMuted:  "#5e6a8a",
        primary:    "#4d82f0",
        primaryHov: "#6694f5",
        primaryBg:  "#1a2755",
        accent:     "#3ec8fa",
        shadow:     "0 1px 6px rgba(0,0,0,0.35)",
        shadowMd:   "0 4px 20px rgba(0,0,0,0.45)",
        red:        "#ff6347", redBg:    "#2e1410",
        orange:     "#f0952a", orangeBg: "#2e1e0c",
        yellow:     "#e0b540", yellowBg: "#2e2408",
        green:      "#3dc47a", greenBg:  "#0e2a1c",
        navActive:  "#1a2755",
        navActiveBorder: "#4d82f0",
        sidebarBg:  "#151c35",
        headerBg:   "#151c35",
    },
    contrast: {
        bg:         "#000000",
        surface:    "#0a0a0a",
        surfaceAlt: "#111111",
        border:     "#ffffff",
        borderMid:  "#cccccc",
        text:       "#ffffff",
        textMid:    "#dddddd",
        textMuted:  "#aaaaaa",
        primary:    "#4d9fff",
        primaryHov: "#7ab8ff",
        primaryBg:  "#001a3a",
        accent:     "#00e5ff",
        shadow:     "0 1px 0px #ffffff33",
        shadowMd:   "0 4px 0px #ffffff22",
        red:        "#ff4444", redBg:    "#1a0000",
        orange:     "#ff9900", orangeBg: "#1a1000",
        yellow:     "#ffdd00", yellowBg: "#1a1a00",
        green:      "#44ff88", greenBg:  "#001a0d",
        navActive:  "#001a3a",
        navActiveBorder: "#4d9fff",
        sidebarBg:  "#0a0a0a",
        headerBg:   "#000000",
    },
};

// ─── COLOR CONSTANTS (legacy, kept for backwards compat) ─────────────────────
export const C = {
    bg: "#f0f4fc", white: "#ffffff", dark: "#0f1b3d", mid: "#4a5680",
    light: "#f5f8ff", red: "#cc2200", orange: "#e07800", yellow: "#b87f00",
    green: "#1a7a4a", blue: "#1a52cc",
    redBg: "#fff0ee", orangeBg: "#fff4ec", yellowBg: "#fdf6e3",
    greenBg: "#edf7f2", blueBg: "#eef3ff", border: "#dde4f5",
    shadow: "0 1px 6px rgba(26,82,204,0.10)",
};

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --bg: #f0f4fc; --surface: #ffffff; --surface-alt: #f5f8ff;
    --border: #dde4f5; --border-mid: #c5d2ee;
    --text: #0f1b3d; --text-mid: #4a5680; --text-muted: #8b97bc;
    --primary: #1a52cc; --primary-hov: #1242b0; --primary-bg: #eef3ff;
    --accent: #0e9de8; --shadow: 0 1px 6px rgba(26,82,204,0.10);
    --shadow-md: 0 4px 20px rgba(26,82,204,0.12);
    --red: #cc2200; --red-bg: #fff0ee;
    --orange: #e07800; --orange-bg: #fff4ec;
    --yellow: #b87f00; --yellow-bg: #fdf6e3;
    --green: #1a7a4a; --green-bg: #edf7f2;
    --nav-active: #eef3ff; --nav-active-border: #1a52cc;
    --sidebar-bg: #ffffff; --header-bg: #ffffff;
  }
  [data-theme="dark"] {
    --bg: #0d1224; --surface: #151c35; --surface-alt: #1a2340;
    --border: #242e4e; --border-mid: #2f3c62;
    --text: #e8edf8; --text-mid: #a0accc; --text-muted: #5e6a8a;
    --primary: #4d82f0; --primary-hov: #6694f5; --primary-bg: #1a2755;
    --accent: #3ec8fa; --shadow: 0 1px 6px rgba(0,0,0,0.35);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.45);
    --red: #ff6347; --red-bg: #2e1410;
    --orange: #f0952a; --orange-bg: #2e1e0c;
    --yellow: #e0b540; --yellow-bg: #2e2408;
    --green: #3dc47a; --green-bg: #0e2a1c;
    --nav-active: #1a2755; --nav-active-border: #4d82f0;
    --sidebar-bg: #151c35; --header-bg: #151c35;
  }
  [data-theme="contrast"] {
    --bg: #000000; --surface: #0a0a0a; --surface-alt: #111111;
    --border: #ffffff; --border-mid: #cccccc;
    --text: #ffffff; --text-mid: #dddddd; --text-muted: #aaaaaa;
    --primary: #4d9fff; --primary-hov: #7ab8ff; --primary-bg: #001a3a;
    --accent: #00e5ff; --shadow: 0 1px 0px #ffffff33;
    --shadow-md: 0 4px 0px #ffffff22;
    --red: #ff4444; --red-bg: #1a0000;
    --orange: #ff9900; --orange-bg: #1a1000;
    --yellow: #ffdd00; --yellow-bg: #1a1a00;
    --green: #44ff88; --green-bg: #001a0d;
    --nav-active: #001a3a; --nav-active-border: #4d9fff;
    --sidebar-bg: #0a0a0a; --header-bg: #000000;
  }

  *{margin:0;padding:0;box-sizing:border-box;}
  html,body,#root{height:100%;overflow:hidden;}
  body{background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);}
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:var(--border-mid);border-radius:3px;}
  input,select,textarea,button{font-family:'Plus Jakarta Sans',sans-serif;}
  table{border-collapse:collapse;width:100%;}
  th{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);padding:9px 12px;text-align:left;border-bottom:1.5px solid var(--border);}
  td{padding:10px 12px;border-bottom:1px solid var(--border);font-size:13px;vertical-align:middle;color:var(--text);}
  tr:last-child td{border:none;}
  tr:hover td{background:var(--surface-alt);}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes progAnim{from{width:0}to{width:100%}}
  @keyframes popIn{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  .pulse{animation:pulse 1.4s ease-in-out infinite;}
  .blink{animation:blink 1.2s ease-in-out infinite;}
  .fadeUp{animation:fadeUp .3s ease both;}
  .spinner{width:52px;height:52px;border:4px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px;}
  .progbar{background:var(--border);height:4px;border-radius:2px;overflow:hidden;margin-top:14px;}
  .progfill{height:100%;background:var(--primary);border-radius:2px;animation:progAnim 1.8s ease forwards;}
  .nav-item:hover{background:var(--surface-alt) !important;}
  .bell-btn:hover{background:var(--surface-alt) !important;}
  .theme-btn:hover{background:var(--primary-bg) !important; color:var(--primary) !important;}
  .theme-btn.active{background:var(--primary) !important; color:#fff !important;}
`;

// ─── THEME SWITCHER ───────────────────────────────────────────────────────────
export const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();
    const options = [
        { id: "light",    Icon: Sun,      label: "Light" },
        { id: "dark",     Icon: Moon,     label: "Dark" },
        { id: "contrast", Icon: Contrast, label: "Contrast" },
    ];
    return (
        <div style={{
            display: "flex", alignItems: "center",
            background: "var(--surface-alt)", borderRadius: 12,
            padding: 4, border: "1.5px solid var(--border)", gap: 2,
        }}>
            {options.map(({ id, Icon, label }) => (
                <button
                    key={id}
                    title={label}
                    className={`theme-btn${theme === id ? " active" : ""}`}
                    onClick={() => setTheme(id)}
                    style={{
                        width: 34, height: 34, borderRadius: 9, border: "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all .18s",
                        background: theme === id ? "var(--primary)" : "transparent",
                        color: theme === id ? "#fff" : "var(--text-muted)",
                    }}
                >
                    <Icon size={15} />
                </button>
            ))}
        </div>
    );
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
export const Badge = ({ type, children }) => {
    const styles = {
        critical: { background: "var(--red-bg)",    color: "var(--red)" },
        high:     { background: "var(--orange-bg)", color: "var(--orange)" },
        medium:   { background: "var(--yellow-bg)", color: "var(--yellow)" },
        safe:     { background: "var(--green-bg)",  color: "var(--green)" },
        active:   { background: "var(--green-bg)",  color: "var(--green)" },
        inactive: { background: "var(--surface-alt)", color: "var(--text-muted)" },
        warn:     { background: "var(--orange-bg)", color: "var(--orange)" },
        admin:    { background: "var(--text)",      color: "var(--surface)" },
        officer:  { background: "var(--primary-bg)", color: "var(--primary)" },
        view:     { background: "var(--surface-alt)", color: "var(--text-mid)" },
        pending:  { background: "var(--primary-bg)", color: "var(--primary)" },
        info:     { background: "var(--primary-bg)", color: "var(--primary)" },
    };
    return (
        <span style={{
            display: "inline-block", padding: "3px 10px", borderRadius: 20,
            fontSize: 10, fontWeight: 800,
            ...(styles[type] || styles.active),
        }}>{children}</span>
    );
};

// ─── CARD ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, style = {} }) => (
    <div style={{
        background: "var(--surface)", borderRadius: 16,
        padding: "18px 20px",
        boxShadow: "var(--shadow)",
        border: "1px solid var(--border)",
        ...style,
    }}>{children}</div>
);

// ─── BUTTON ───────────────────────────────────────────────────────────────────
export const Btn = ({ children, variant = "primary", onClick, style = {}, disabled }) => {
    const variants = {
        primary: { background: "var(--primary)",      color: "#fff",              border: "none" },
        dark:    { background: "var(--text)",          color: "var(--surface)",    border: "none" },
        red:     { background: "var(--red)",           color: "#fff",              border: "none" },
        green:   { background: "var(--green)",         color: "#fff",              border: "none" },
        outline: { background: "var(--surface)",       color: "var(--text)",       border: "1.5px solid var(--border)" },
        ghost:   { background: "var(--surface-alt)",   color: "var(--text-mid)",   border: "1.5px solid var(--border)" },
    };
    return (
        <button disabled={disabled} onClick={onClick} style={{
            padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: disabled ? "default" : "pointer", opacity: disabled ? .5 : 1,
            transition: "all .15s", ...(variants[variant] || variants.primary), ...style,
        }}>{children}</button>
    );
};

// ─── FORM GROUP ───────────────────────────────────────────────────────────────
export const FormGroup = ({ label, hint, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: .5 }}>{label}</label>
        {children}
        {hint && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{hint}</span>}
    </div>
);

// ─── INPUT ────────────────────────────────────────────────────────────────────
export const Input = ({ style = {}, ...props }) => (
    <input {...props} style={{
        padding: "10px 13px", borderRadius: 10,
        border: "1.5px solid var(--border)",
        background: "var(--surface-alt)", fontSize: 13,
        color: "var(--text)", outline: "none",
        width: "100%", transition: "border .15s", ...style,
    }} />
);

// ─── SELECT ───────────────────────────────────────────────────────────────────
export const Select = ({ children, style = {}, ...props }) => (
    <select {...props} style={{
        padding: "10px 13px", borderRadius: 10,
        border: "1.5px solid var(--border)",
        background: "var(--surface-alt)", fontSize: 13,
        color: "var(--text)", outline: "none",
        width: "100%", cursor: "pointer", ...style,
    }}>{children}</select>
);

// ─── TOGGLE SWITCH ────────────────────────────────────────────────────────────
export const Toggle = ({ on, onToggle }) => (
    <div onClick={onToggle} style={{
        width: 40, height: 22, borderRadius: 11,
        background: on ? "var(--primary)" : "var(--border-mid)",
        position: "relative", cursor: "pointer", flexShrink: 0, transition: "background .2s",
    }}>
        <div style={{
            position: "absolute", top: 3,
            left: on ? 21 : 3, width: 16, height: 16,
            background: "#fff", borderRadius: "50%", transition: "left .2s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }} />
    </div>
);

// ─── TOGGLE ROW ───────────────────────────────────────────────────────────────
export const ToggleRow = ({ name, desc, on, onToggle }) => (
    <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 0", borderBottom: "1px solid var(--border)",
    }}>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{name}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>
        </div>
        <Toggle on={on} onToggle={onToggle} />
    </div>
);

// ─── PROBABILITY BAR ──────────────────────────────────────────────────────────
export const ProbBar = ({ pct, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 80, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: color || "var(--primary)", borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: color || "var(--primary)" }}>{pct}%</span>
    </div>
);

// ─── TAB BAR ──────────────────────────────────────────────────────────────────
export const TabBar = ({ tabs, active, onChange }) => (
    <div style={{
        display: "flex", background: "var(--surface)", borderRadius: 12,
        padding: 4, boxShadow: "var(--shadow)",
        border: "1px solid var(--border)", gap: 2,
    }}>
        {tabs.map(t => (
            <div key={t.id} onClick={() => onChange(t.id)} style={{
                flex: 1, padding: "9px 4px", textAlign: "center", borderRadius: 9,
                fontSize: 12.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                transition: "all .15s",
                background: active === t.id ? "var(--primary)" : "transparent",
                color: active === t.id ? "#fff" : "var(--text-muted)",
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
                <radialGradient id="hg3" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#1a52cc" stopOpacity=".7"/><stop offset="100%" stopColor="#1a52cc" stopOpacity="0"/></radialGradient>
            </defs>
            <path d={path} fill="#1a2340" stroke="#2f3c62" strokeWidth="1"/>
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
            <path d={path} fill="#c8d8f0" stroke="#fff" strokeWidth="1.5"/>
            <path d="M162,340 L180,330 L198,335 L210,350 L208,368 L195,378 L178,375 L164,362 Z" fill="#cc2200" opacity=".85" stroke="#fff" strokeWidth="1"/>
            <path d="M148,300 L165,295 L178,305 L182,322 L170,332 L155,328 L144,315 Z" fill="#cc2200" opacity=".75" stroke="#fff" strokeWidth="1"/>
            <path d="M155,385 L175,378 L192,385 L195,402 L180,412 L162,408 L152,395 Z" fill="#cc2200" opacity=".7" stroke="#fff" strokeWidth="1"/>
            <path d="M138,270 L155,265 L165,278 L162,295 L148,298 L135,288 Z" fill="#e86e00" opacity=".75" stroke="#fff" strokeWidth="1"/>
            <path d="M175,405 L195,400 L210,408 L208,422 L192,428 L176,423 Z" fill="#e86e00" opacity=".7" stroke="#fff" strokeWidth="1"/>
            <path d="M188,238 L205,232 L220,240 L222,258 L208,265 L192,260 Z" fill="#1a52cc" opacity=".7" stroke="#fff" strokeWidth="1"/>
            <path d="M192,98 L210,95 L225,102 L226,118 L212,122 L196,116 Z" fill="#1a7a4a" opacity=".7" stroke="#fff" strokeWidth="1"/>
            <circle cx="185" cy="350" r="5" fill="#cc2200" className="pulse"/>
            <circle cx="185" cy="350" r="10" fill="#cc2200" opacity=".2"/>
            <circle cx="162" cy="312" r="4" fill="#cc2200" className="pulse"/>
            <text x="185" y="355" fontSize="7" fill="#fff" fontWeight="700" textAnchor="middle">Ratnapura</text>
            <text x="162" y="316" fontSize="6" fill="#fff" fontWeight="700" textAnchor="middle">Kalutara</text>
        </svg>
    );
    return (
        <svg viewBox="0 80 400 420" style={{ width: "100%", maxHeight: 380 }}>
            <path d={path} fill="#c8d8f0" stroke="#fff" strokeWidth="2"/>
            <circle cx="185" cy="350" r="6" fill="#cc2200"/>
            <circle cx="185" cy="350" r="12" fill="#cc2200" opacity=".2" className="pulse"/>
            <circle cx="162" cy="312" r="5" fill="#cc2200"/>
            <circle cx="162" cy="312" r="10" fill="#cc2200" opacity=".2" className="pulse"/>
            <circle cx="148" cy="278" r="5" fill="#e07800"/>
            <circle cx="206" cy="248" r="4" fill="#b87f00"/>
            <circle cx="210" cy="108" r="4" fill="#1a7a4a"/>
            <text x="197" y="348" fontSize="8" fill="#cc2200" fontWeight="700">Ratnapura-A2</text>
            <text x="172" y="310" fontSize="8" fill="#cc2200" fontWeight="700">Kalutara-B1</text>
            <text x="158" y="276" fontSize="8" fill="#e07800">Colombo-W</text>
            <text x="214" y="246" fontSize="8" fill="#b87f00">Kandy</text>
            <text x="218" y="106" fontSize="8" fill="#1a7a4a">Jaffna</text>
        </svg>
    );
};

// ─── HEADER ───────────────────────────────────────────────────────────────────
export const Header = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const { systemSettings, toggleEmergencyMode } = useSettings();

    const user = JSON.parse(localStorage.getItem("user")) || {
        first_name: "User", last_name: "", email: "user@example.com"
    };

    const getInitials = () => {
        const f = user.first_name ? user.first_name[0] : "";
        const l = user.last_name ? user.last_name[0] : "";
        return (f + l).toUpperCase() || "U";
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    const isEmergency = systemSettings?.emergency_mode;

    return (
        <div style={{
            background: "var(--header-bg)",
            borderBottom: "1px solid var(--border)",
            padding: "0 32px",
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            position: "relative",
            zIndex: 1000,
            boxShadow: "0 1px 0 var(--border)",
        }}>
            {/* LEFT — Logo + Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                    width: 46, height: 46,
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                    borderRadius: 13, display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                    boxShadow: "0 4px 14px rgba(26,82,204,0.35)",
                }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" width="26" height="26">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" opacity=".35"/>
                        <path d="M5 15 Q8.5 9 12 13 Q15.5 17 19 11"/>
                    </svg>
                </div>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, color: "var(--text)", lineHeight: 1.15 }}>
                        {systemSettings?.system_name || "FloodSense"}
                    </div>
                    <div style={{ fontSize: 11.5, fontWeight: 500, color: "var(--text-muted)", letterSpacing: 0.1, marginTop: 2 }}>
                        Flood Monitoring & Prediction Portal
                    </div>
                </div>
            </div>

            {/* RIGHT — Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

                {/* Theme Switcher */}
                <ThemeSwitcher />

                {/* Divider */}
                <div style={{ width: 1, height: 30, background: "var(--border)", margin: "0 2px" }} />

                {/* Bell */}
                <div className="bell-btn" style={{
                    position: "relative", cursor: "pointer",
                    width: 42, height: 42, borderRadius: 12,
                    background: "var(--surface-alt)", border: "1.5px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background .15s",
                }}>
                    <Bell size={18} color="var(--text-mid)" />
                    <div style={{
                        position: "absolute", top: 9, right: 10,
                        width: 7, height: 7, background: "var(--red)",
                        borderRadius: "50%", border: "2px solid var(--header-bg)",
                    }} />
                </div>

                {/* Emergency Mode pill */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "0 16px 0 12px", height: 42,
                    background: isEmergency ? "var(--red-bg)" : "var(--surface-alt)",
                    borderRadius: 12,
                    border: `1.5px solid ${isEmergency ? "var(--red)" : "var(--border)"}`,
                    transition: "all .25s",
                }}>
                    <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: isEmergency ? "var(--red)" : "var(--text-muted)",
                        boxShadow: isEmergency ? "0 0 0 3px rgba(204,34,0,0.2)" : "none",
                        transition: "all .25s", flexShrink: 0,
                    }} />
                    <div style={{ lineHeight: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isEmergency ? "var(--red)" : "var(--text-mid)" }}>
                            Emergency Mode
                        </div>
                        <div style={{ fontSize: 10.5, color: isEmergency ? "var(--red)" : "var(--text-muted)", marginTop: 2, opacity: isEmergency ? 0.85 : 1 }}>
                            {isEmergency ? "Broadcasting to all channels" : "Standby"}
                        </div>
                    </div>
                    <Toggle on={isEmergency} onToggle={toggleEmergencyMode} />
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 30, background: "var(--border)", margin: "0 2px" }} />

                {/* Avatar + Dropdown */}
                <div style={{ position: "relative" }}>
                    <div
                        onClick={() => setShowDropdown(!showDropdown)}
                        style={{
                            width: 42, height: 42, borderRadius: 12,
                            background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                            color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 14, fontWeight: 800, cursor: "pointer",
                            boxShadow: "0 2px 10px rgba(26,82,204,0.3)", transition: "opacity .15s",
                        }}
                    >
                        {getInitials()}
                    </div>

                    {showDropdown && (
                        <div className="fadeUp" style={{
                            position: "absolute", top: 52, right: 0, width: 220,
                            background: "var(--surface)", borderRadius: 16,
                            boxShadow: "var(--shadow-md)",
                            zIndex: 1001, padding: "6px",
                            border: "1px solid var(--border)",
                        }}>
                            <div style={{ padding: "14px 14px 12px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 9,
                                    background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 13, fontWeight: 800, marginBottom: 9,
                                }}>
                                    {getInitials()}
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text)" }}>{user.first_name} {user.last_name}</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{user.email}</div>
                            </div>
                            <button style={{
                                width: "100%", padding: "10px 12px", border: "none", background: "none",
                                display: "flex", alignItems: "center", gap: 10, fontSize: 13,
                                cursor: "pointer", textAlign: "left", borderRadius: 10,
                                fontWeight: 600, color: "var(--text-mid)",
                            }} onClick={() => { setShowDropdown(false); window.location.href = '/app/profile'; }}>
                                <Edit size={14} /> Edit Profile
                            </button>
                            <button style={{
                                width: "100%", padding: "10px 12px", border: "none", background: "none",
                                display: "flex", alignItems: "center", gap: 10, fontSize: 13,
                                cursor: "pointer", textAlign: "left", borderRadius: 10,
                                fontWeight: 600, color: "var(--red)",
                            }} onClick={handleLogout}>
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
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

    const mainNav = NAV.filter(i => !["settings", "profile"].includes(i.path.split("/").pop()));
    const bottomNav = NAV.filter(i => ["settings", "profile"].includes(i.path.split("/").pop()));

    const NavItem = ({ item }) => {
        const id = item.path.split("/").pop();
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
        const IconComponent = NAV_ICONS[id] || null;
        return (
            <div
                className={isActive ? "" : "nav-item"}
                onClick={() => navigate(item.path)}
                style={{
                    padding: "9px 12px", borderRadius: 10, fontSize: 13,
                    fontWeight: isActive ? 700 : 500, cursor: "pointer",
                    color: isActive ? "var(--primary)" : "var(--text-muted)",
                    display: "flex", alignItems: "center", gap: 10,
                    background: isActive ? "var(--nav-active)" : "transparent",
                    borderLeft: isActive ? "2.5px solid var(--nav-active-border)" : "2.5px solid transparent",
                    transition: "all .15s", letterSpacing: -0.1,
                }}
            >
                <span style={{
                    opacity: isActive ? 1 : 0.5,
                    width: 16, height: 16,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    color: isActive ? "var(--primary)" : "var(--text-muted)",
                }}>
                    {IconComponent ? <IconComponent size={16} /> : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="4"/>
                        </svg>
                    )}
                </span>
                {item.name}
            </div>
        );
    };

    return (
        <>
            <div style={{
                width: 210, minWidth: 210,
                background: "var(--sidebar-bg)",
                borderRight: "1px solid var(--border)",
                display: "flex", flexDirection: "column",
                padding: "20px 10px 14px",
                overflowY: "auto", flexShrink: 0,
            }}>
                <div style={{
                    fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: 1.2, color: "var(--text-muted)", padding: "0 12px", marginBottom: 6,
                }}>
                    Main Menu
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {mainNav.map(item => <NavItem key={item.path} item={item} />)}
                </div>

                {bottomNav.length > 0 && (
                    <>
                        <div style={{ height: 1, background: "var(--border)", margin: "14px 4px 10px" }} />
                        <div style={{
                            fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                            letterSpacing: 1.2, color: "var(--text-muted)", padding: "0 12px", marginBottom: 6,
                        }}>
                            Manage
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {bottomNav.map(item => <NavItem key={item.path} item={item} />)}
                        </div>
                    </>
                )}

                <div style={{ flex: 1 }} />
                <div style={{ height: 1, background: "var(--border)", margin: "10px 4px" }} />

                <div
                    className="nav-item"
                    onClick={() => setShowModal(true)}
                    style={{
                        padding: "9px 12px", borderRadius: 10, fontSize: 13,
                        fontWeight: 600, cursor: "pointer", color: "var(--red)",
                        display: "flex", alignItems: "center", gap: 10,
                        transition: "background .15s", borderLeft: "2.5px solid transparent",
                    }}
                >
                    <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: 0.7, color: "var(--red)" }}>
                        <LogoutIcon size={16} />
                    </span>
                    Logout
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
                                <div style={modalStyles.sessionBox}>
                                    <div style={modalStyles.sessionRow}><span>User Role</span><strong style={{ color: "var(--text)" }}>System Admin</strong></div>
                                    <div style={modalStyles.sessionRow}><span>Live Alerts</span><strong style={{ color: "var(--red)" }}>3 Active</strong></div>
                                    <div style={modalStyles.sessionRow}><span>Last Sync</span><strong style={{ color: "var(--text-mid)" }}>Just now</strong></div>
                                </div>
                                <p style={modalStyles.warningText}>Automatic flood monitoring will continue in the background after you log out.</p>
                                <div style={modalStyles.btnGroup}>
                                    <button onClick={() => setShowModal(false)} style={modalStyles.cancelBtn}>Stay</button>
                                    <button onClick={handleConfirmLogout} style={modalStyles.confirmBtn}>Sign Out</button>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: "20px 0" }}>
                                <div className="spinner" />
                                <h3 style={{ marginTop: 24, fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Securing System...</h3>
                                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>Cleaning session cache and credentials</p>
                                <div className="progbar" style={{ width: "80%", margin: "20px auto 0" }}>
                                    <div className="progfill" />
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
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(15,27,61,0.5)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000,
    },
    modal: {
        background: "var(--surface)", width: "100%", maxWidth: "420px",
        borderRadius: "24px", padding: "42px 38px", textAlign: "center",
        boxShadow: "var(--shadow-md)", border: "1px solid var(--border)",
    },
    iconBadge: {
        width: "60px", height: "60px", background: "var(--red-bg)", color: "var(--red)",
        borderRadius: "18px", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "26px", margin: "0 auto 18px",
    },
    title: { fontSize: "22px", fontWeight: "900", color: "var(--text)", marginBottom: "8px" },
    subtitle: { fontSize: "14px", color: "var(--text-muted)", marginBottom: "22px" },
    sessionBox: { background: "var(--surface-alt)", borderRadius: "14px", padding: "14px", marginBottom: "18px", border: "1px solid var(--border)" },
    sessionRow: { display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", padding: "4px 0", textTransform: "uppercase" },
    warningText: { fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "28px" },
    btnGroup: { display: "flex", gap: "10px" },
    cancelBtn: { flex: 1, padding: "14px", borderRadius: "12px", border: "1.5px solid var(--border)", background: "var(--surface)", fontWeight: "700", cursor: "pointer", color: "var(--text)" },
    confirmBtn: { flex: 1, padding: "14px", borderRadius: "12px", border: "none", background: "var(--primary)", color: "#fff", fontWeight: "700", cursor: "pointer" },
};

// ─── PAGE SHELL ───────────────────────────────────────────────────────────────
export const PageShell = ({ page, setPage, children }) => (
    <ThemeProvider>
        <style>{globalCSS}</style>
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>
            <Header />
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                <Sidebar page={page} setPage={setPage} />
                <div style={{ flex: 1, overflowY: "auto", padding: "18px", minWidth: 0 }}>
                    {children}
                </div>
            </div>
        </div>
    </ThemeProvider>
);

// ─── TOAST ────────────────────────────────────────────────────────────────────
export const Toast = ({ message }) =>
    message ? (
        <div style={{
            position: "fixed", top: 20, right: 20,
            background: "var(--primary)", color: "#fff",
            borderRadius: 12, padding: "13px 20px",
            fontSize: 13, fontWeight: 700,
            boxShadow: "var(--shadow-md)", zIndex: 999,
            display: "flex", alignItems: "center", gap: 8,
        }}>{message}</div>
    ) : null;
