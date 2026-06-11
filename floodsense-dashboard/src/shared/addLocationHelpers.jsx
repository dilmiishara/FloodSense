// ─── shared/addLocationHelpers.js ────────────────────────────────────────────
//  All constants, style objects, and tiny UI components shared between
//  IoTNodeManager and SafeLocationManager.
//  Import from this file in both manager files.
// ─────────────────────────────────────────────────────────────────────────────

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const DISTRICTS = [
    "Ratnapura","Kalutara","Colombo","Galle","Kandy",
    "Matara","Kegalle","Badulla","Hambantota","Kurunegala",
];

export const SAFE_LOCATION_TYPES = [
    "School / Educational",
    "Hospital / Medical",
    "Community Centre",
    "Government Building",
    "Religious Building",
    "Sports Complex",
    "Other",
];

// Sensor icon components are imported from icons.jsx
import { HumidityIcon, TemperatureIcon, RainfallIcon, UltrasonicIcon } from "./icons.jsx";

export const SENSOR_CHIPS = [
    { Icon: HumidityIcon,    label:"Humidity",    sub:"DHT22 — relative %",    color:"var(--primary)" },
    { Icon: TemperatureIcon, label:"Temperature", sub:"DHT22 — °C",            color:"var(--orange)"  },
    { Icon: RainfallIcon,    label:"Rainfall",    sub:"Tipping bucket — mm",   color:"var(--green)"   },
    { Icon: UltrasonicIcon,  label:"Ultrasonic",  sub:"HC-SR04 — cm distance", color:"#7c3aed"        },
];

export const INITIAL_GATEWAYS = [
    { id:"gw-001", name:"Gateway-001", eui:"AA:BB:CC:DD:EE:FF:00:01", location:"Ratnapura", status:"active" },
    { id:"gw-002", name:"Gateway-002", eui:"AA:BB:CC:DD:EE:FF:00:02", location:"Kalutara",  status:"active" },
];

export const LOCATION_STATUS_OPTIONS = [
    { val:"available", label:"Available", color:"var(--green)"  },
    { val:"limited",   label:"Limited",   color:"var(--orange)" },
    { val:"full",      label:"Full",      color:"var(--red)"    },
    { val:"inactive",  label:"Inactive",  color:"var(--text-muted)" },
];

// ─── EXTRA CSS ────────────────────────────────────────────────────────────────
export const extraCSS = `
  .al-icon-btn-del:hover { background: var(--red-bg) !important; color: var(--red) !important; border-color: var(--red) !important; }
  .al-node-card:hover { border-color: var(--border-mid) !important; background: var(--surface-alt) !important; }
  input:focus, select:focus { border-color: var(--primary) !important; outline: none; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .fadeUp { animation: fadeUp .25s ease both; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
  .pulse { animation: pulse 1.4s ease-in-out infinite; }
  .section-toggle-btn { transition: all .18s; border: 1.5px solid var(--border); cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700; border-radius: 12px; padding: 10px 22px; }
  .section-toggle-btn:hover { border-color: var(--primary); }

  /* ── Professional Modal ── */
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
  }
  @keyframes overlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .modal-overlay {
    animation: overlayIn 0.2s ease both;
  }
  .modal-panel {
    animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .modal-close-btn:hover {
    background: var(--surface-alt) !important;
    border-color: var(--border-mid) !important;
    color: var(--text) !important;
  }
`;

// ─── INPUT / SELECT STYLE OBJECTS ─────────────────────────────────────────────
export const inp = {
    padding:"10px 13px", borderRadius:10, border:"1.5px solid var(--border)",
    background:"var(--surface-alt)", fontSize:13, color:"var(--text)", outline:"none",
    width:"100%", transition:"border .15s", fontFamily:"'Plus Jakarta Sans',sans-serif",
};

export const sel = {
    ...inp, appearance:"none", cursor:"pointer",
    backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:34,
};

export const g2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 };
export const g3 = { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 };

// ─── HELPER FUNCTION ──────────────────────────────────────────────────────────
export const iconForType = (type) => {
    if (!type) return "📍";
    if (type.includes("School"))    return "🏫";
    if (type.includes("Hospital"))  return "🏥";
    if (type.includes("Community")) return "🏢";
    if (type.includes("Govern"))    return "🏛️";
    if (type.includes("Religi"))    return "⛪";
    if (type.includes("Sports"))    return "🏟️";
    return "📍";
};

// ─── SHARED SMALL COMPONENTS ──────────────────────────────────────────────────
import React, { useEffect } from "react";

export const SectionLabel = ({ step, label }) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{
            width:22, height:22, borderRadius:7, background:"var(--primary)",
            color:"#fff", fontSize:10, fontWeight:800,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>{step}</div>
        <span style={{ fontSize:12, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:.5 }}>
            {label}
        </span>
    </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
//  Professional modal with:
//  • Smooth entry animation
//  • Proper top alignment so it never hides behind the app header
//  • Scrollable body — header & footer stay pinned
//  • Wide variant via `size` prop ("sm" | "md" | "lg" | "xl")
//  • Keyboard: Escape to close
// ─────────────────────────────────────────────────────────────────────────────
const SIZE_MAP = { sm: 400, md: 520, lg: 680, xl: 860 };

export const Modal = ({ show, onClose, title, children, footer, size = "md", icon }) => {
    // Close on Escape key
    useEffect(() => {
        if (!show) return;
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [show, onClose]);

    // Prevent body scroll when modal open
    useEffect(() => {
        document.body.style.overflow = show ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [show]);

    if (!show) return null;

    const maxW = SIZE_MAP[size] || SIZE_MAP.md;

    return (
        <div
            className="modal-overlay"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: "fixed", inset: 0, zIndex: 1000,
                background: "rgba(10, 15, 30, 0.55)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "flex-start",      // top-aligned so large modals don't hide behind header
                justifyContent: "center",
                padding: "72px 20px 32px",     // 72px top clears a typical 60px app header + breathing room
                overflowY: "auto",
            }}
        >
            <div
                className="modal-panel"
                style={{
                    background: "var(--surface)",
                    borderRadius: 20,
                    width: "100%",
                    maxWidth: maxW,
                    boxShadow: "0 32px 80px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: 32,
                    overflow: "hidden",         // clips children to rounded corners
                }}
            >
                {/* ── Header ── */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "18px 24px",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--surface)",
                    position: "sticky", top: 0, zIndex: 2,     // stays visible while body scrolls
                }}>
                    {icon && (
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: "var(--primary-bg, rgba(59,130,246,0.1))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 16, flexShrink: 0,
                        }}>{icon}</div>
                    )}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", letterSpacing: -0.2 }}>
                            {title}
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        className="modal-close-btn"
                        onClick={onClose}
                        style={{
                            width: 32, height: 32, borderRadius: 9,
                            border: "1.5px solid var(--border)",
                            background: "transparent",
                            color: "var(--text-muted)",
                            cursor: "pointer", fontSize: 15,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all .15s", flexShrink: 0,
                        }}
                    >✕</button>
                </div>

                {/* ── Scrollable Body ── */}
                <div style={{
                    padding: "22px 24px",
                    color: "var(--text)",
                    overflowY: "auto",
                    flex: 1,
                }}>
                    {children}
                </div>

                {/* ── Footer ── */}
                {footer && (
                    <div style={{
                        padding: "14px 24px",
                        borderTop: "1px solid var(--border)",
                        background: "var(--surface-alt, #f9fafb)",
                        display: "flex", gap: 8, justifyContent: "flex-end",
                        position: "sticky", bottom: 0, zIndex: 2,
                    }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export const StatPill = ({ label, value, accent }) => (
    <div style={{ background:"var(--surface-alt)", borderRadius:10, padding:"8px 14px",
        border:"1.5px solid var(--border)", display:"flex", flexDirection:"column",
        alignItems:"center", minWidth:64 }}>
        <div style={{ fontSize:20, fontWeight:900, color:accent, lineHeight:1,
            fontFamily:"'DM Mono',monospace" }}>{value}</div>
        <div style={{ fontSize:9, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase",
            letterSpacing:.5, marginTop:2 }}>{label}</div>
    </div>
);

export const IconBtn = ({ onClick, children }) => (
    <button className="al-icon-btn-del" onClick={onClick}
            style={{ width:30, height:30, borderRadius:8, border:"1.5px solid var(--border)",
                background:"var(--surface-alt)", color:"var(--text-muted)", cursor:"pointer", fontSize:13,
                display:"flex", alignItems:"center", justifyContent:"center", transition:".15s" }}>
        {children}
    </button>
);
