// ─── Dashboard.jsx ───────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card, Badge, globalCSS, Toast } from "../shared.jsx";
import { useSettings } from "../context/SettingsContext";

// Fix for default marker icons in Leaflet + React
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const proStyles = `
  @keyframes scan {
    0% { transform: translateY(-100%); opacity: 0; }
    50% { opacity: 0.4; }
    100% { transform: translateY(100%); opacity: 0; }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(204, 34, 0, 0.5); }
    70%  { box-shadow: 0 0 0 10px rgba(204, 34, 0, 0); }
    100% { box-shadow: 0 0 0 0 rgba(204, 34, 0, 0); }
  }
  @keyframes waveMove {
    0%   { transform: translateX(0) scaleY(1); }
    50%  { transform: translateX(-25%) scaleY(0.8); }
    100% { transform: translateX(-50%) scaleY(1); }
  }
  @keyframes lineDraw {
    from { stroke-dashoffset: 300; }
    to   { stroke-dashoffset: 0; }
  }

  .stat-card {
    position: relative;
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(26,82,204,0.12) !important;
  }
  .stat-label {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.1px;
    color: var(--text-muted);
    margin-bottom: 8px;
  }
  .stat-value {
    font-size: 40px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -1.5px;
    font-variant-numeric: tabular-nums;
  }
  .stat-footer {
    font-size: 12px;
    font-weight: 700;
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .stat-bg-icon {
    position: absolute;
    right: -8px;
    bottom: -8px;
    font-size: 72px;
    opacity: 0.05;
    pointer-events: none;
    transform: rotate(-15deg);
  }

  .row-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 12px;
    border-radius: 11px;
    cursor: pointer;
    margin-bottom: 4px;
    border: 1px solid transparent;
    transition: all 0.18s ease;
  }
  .row-item:hover {
    background: var(--surface-alt);
    border-color: var(--border);
    transform: translateX(3px);
  }

  .icon-box {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    flex-shrink: 0;
  }

  .gauge-circle {
    transition: stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .trend-line {
    stroke-dasharray: 300;
    stroke-dashoffset: 300;
    animation: lineDraw 2s ease-out forwards;
    animation-delay: 0.5s;
  }
  .trend-area {
    opacity: 0;
    transition: opacity 1s ease-in;
    transition-delay: 1.5s;
  }
  .trend-point {
    transition: r 0.25s ease;
    cursor: pointer;
  }
  .trend-point:hover { r: 4; }

  .pro-card {
    transition: all 0.25s ease;
  }

  .map-scanner {
    position: absolute; top: 0; left: 0; width: 100%; height: 50px;
    background: linear-gradient(to bottom, transparent, rgba(26,82,204,0.10), transparent);
    animation: scan 3s infinite linear;
    pointer-events: none; z-index: 1000;
  }

  .live-dot {
    width: 8px; height: 8px; background: var(--red);
    border-radius: 50%; display: inline-block; margin-right: 8px;
    animation: pulse-ring 2s infinite;
  }

  .wave-box {
    position: relative; width: 110px; height: 110px; border-radius: 50%;
    background: var(--primary-bg);
    border: 4px solid var(--surface); box-shadow: 0 8px 18px rgba(26,82,204,0.15);
    overflow: hidden; display: flex; align-items: center; justify-content: center;
  }
  .wave-fill {
    position: absolute; bottom: 0; left: 0; width: 200%; height: 100%;
    transition: top 2s cubic-bezier(0.4, 0, 0.2, 1);
    animation: waveMove 4s linear infinite; transform-origin: center bottom;
  }
  .wave-fill-bg { opacity: 0.35; animation: waveMove 6s linear infinite reverse; }

  .diag-box {
    background: var(--surface-alt);
    border-radius: 10px;
    padding: 8px 12px;
  }
`;

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { systemSettings } = useSettings();
  const isEmergency   = systemSettings.emergency_mode;
  const isMaintenance = systemSettings.maintenance_mode;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: "Active Sensors",  value: "05", sub: "All Systems Nominal", subColor: "var(--green)",  icon: "📡" },
    { label: "Critical Alerts", value: "03", sub: "High Risk Priority",  subColor: "var(--red)",    valColor: "var(--red)",    icon: "🚨" },
    { label: "Affected Areas",  value: "06", sub: "Trend Increasing",    subColor: "var(--orange)", valColor: "var(--orange)", icon: "🗺️" },
    { label: "Safe Locations",  value: "12", sub: "8/12 Operational",    subColor: "var(--primary)", valColor: "var(--primary)", icon: "🛡️" },
  ];

  const recentAlerts = [
    { icon: "🌊", bg: "var(--red-bg)",    color: "var(--red)",    title: "Flood Threshold Exceeded",   desc: "Ratnapura: Water level 4.8m (92%)",         time: "14:32", level: "CRITICAL", levelBg: "var(--red-bg)",    levelCol: "var(--red)" },
    { icon: "📈", bg: "var(--red-bg)",    color: "var(--red)",    title: "Critical Rise Rate",         desc: "Nivithigala: Predicted critical in 2.5hrs",  time: "14:18", level: "CRITICAL", levelBg: "var(--red-bg)",    levelCol: "var(--red)" },
    { icon: "🌧️", bg: "var(--orange-bg)", color: "var(--orange)", title: "Heavy Rainfall Warning",     desc: "Embilipitiya: 142mm expected / 6h",          time: "13:55", level: "WARNING",  levelBg: "var(--orange-bg)", levelCol: "var(--orange)" },
    { icon: "📶", bg: "var(--primary-bg)", color: "var(--primary)", title: "Sensor Signal Weak",        desc: "Kolonna: Check local connectivity",          time: "13:20", level: "INFO",    levelBg: "var(--primary-bg)", levelCol: "var(--primary)" },
  ];

  const sensors = [
    { name: "Ratnapura",    pct: 87, color: "var(--red)",    pulse: true,  coords: [6.68, 80.40] },
    { name: "Balangoda",    pct: 74, color: "var(--orange)", pulse: true,  coords: [6.58, 80.00] },
    { name: "Kahawatta",    pct: 55, color: "var(--orange)",               coords: [6.93, 79.85] },
    { name: "Embilipitiya", pct: 38, color: "var(--yellow)",               coords: [7.29, 80.63] },
    { name: "Kolonna",      pct: 12, color: "var(--green)",                coords: [9.66, 80.02] },
  ];

  const safeZones = [
    { icon: "🏫", name: "Ratnapura Central School",   cap: "240 cap", status: "Active", color: "var(--green)" },
    { icon: "🏟️", name: "Kolonna District Ground",    cap: "500 cap", status: "Active", color: "var(--green)" },
    { icon: "🏥", name: "Kahawatta National Hospital", cap: "120 cap", status: "Full",   color: "var(--red)"   },
    { icon: "🏛️", name: "Ayagama Community Hall",     cap: "180 cap", status: "Active", color: "var(--green)" },
  ];

  const gauges = [
    { label: "CPU LOAD",  pct: 75, color: "var(--green)",   rawColor: "#1a7a4a", size: 85 },
    { label: "RAM USAGE", pct: 38, color: "var(--primary)", rawColor: "#1a52cc", size: 65 },
  ];

  const healthRows = [
    { key: "Uptime",  val: "99.8%",   color: "var(--green)"   },
    { key: "Latency", val: "24ms",    color: "var(--green)"   },
    { key: "Server",  val: "Cloud-01", color: "var(--text-mid)" },
  ];

  // Banner helpers
  const BannerBase = ({ gradient, glowColor, labelColor, label, message, badge }) => (
      <div className="fadeUp" style={{
        background: gradient,
        color: "#fff", borderRadius: 13, padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 14,
        boxShadow: `0 8px 24px -4px ${glowColor}`,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, opacity: 0.85, textTransform: "uppercase", letterSpacing: .6, marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{message}</div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 800, padding: "4px 11px", borderRadius: 7,
          background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", whiteSpace: "nowrap",
        }}>{badge}</span>
      </div>
  );

  return (
      <>
        <style>{globalCSS}</style>
        <style>{proStyles}</style>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── ALERT BANNER (always shown) ── */}
          <BannerBase
              gradient="linear-gradient(90deg, var(--red) 0%, #991700 100%)"
              glowColor="rgba(204,34,0,0.28)"
              label="⚡ System Alert"
              message="Ratnapura Sector: Water levels exceeding 90% threshold. Monitoring active."
              badge="3 ACTIVE INCIDENTS"
          />

          {/* ── EMERGENCY BANNER ── */}
          {isEmergency && (
              <BannerBase
                  gradient="linear-gradient(90deg, #b91c1c 0%, #7f1d1d 100%)"
                  glowColor="rgba(185,28,28,0.30)"
                  label="⚠ Emergency Mode Active"
                  message="All thresholds overridden. Broadcasting to all channels. Immediate action required."
                  badge="EMERGENCY"
              />
          )}

          {/* ── MAINTENANCE BANNER ── */}
          {isMaintenance && (
              <BannerBase
                  gradient="linear-gradient(90deg, var(--orange) 0%, #92400e 100%)"
                  glowColor="rgba(224,120,0,0.28)"
                  label="⚠ Maintenance Mode Active"
                  message="All alerts suppressed during scheduled maintenance. Monitoring continues in background."
                  badge="MAINTENANCE"
              />
          )}

          {/* ── STAT CARDS ── */}
          <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {stats.map((s, i) => (
                <Card key={i} className="stat-card" style={{ padding: "22px 22px 18px" }}>
                  <div className="stat-bg-icon">{s.icon}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.valColor || "var(--text)" }}>{s.value}</div>
                  <div className="stat-footer" style={{ color: s.subColor }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.subColor, display: "inline-block", flexShrink: 0 }} />
                    {s.sub}
                  </div>
                </Card>
            ))}
          </div>

          {/* ── INTERACTIVE ROW ── */}
          <div className="fadeUp" style={{ display: "flex", gap: 16 }}>

            {/* Sensor List */}
            <Card className="pro-card" style={{ width: 235, flexShrink: 0, padding: "18px 16px" }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--text-muted)", marginBottom: 14, display: "flex", justifyContent: "space-between", textTransform: "uppercase", letterSpacing: ".6px" }}>
                Sensor Nodes
                <span style={{ background: "var(--primary-bg)", color: "var(--primary)", padding: "2px 8px", borderRadius: 8, fontWeight: 800, fontSize: 10 }}>{sensors.length}</span>
              </div>
              {sensors.map((s, i) => (
                  <div key={i} style={{
                    background: i < 2 ? "var(--red-bg)" : "var(--surface-alt)",
                    borderRadius: 10, padding: "11px 12px", marginBottom: 7,
                    border: `1px solid ${i < 2 ? "var(--border-mid)" : "var(--border)"}`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, display: "flex", justifyContent: "space-between", color: "var(--text)" }}>
                  <span>
                    <span className={s.pulse ? "pulse" : ""} style={{
                      display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                      background: s.color, marginRight: 7, verticalAlign: "middle",
                    }} />
                    {s.name}
                  </span>
                      <span style={{ fontWeight: 800, color: s.color }}>{s.pct}%</span>
                    </div>
                    <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: isLoaded ? `${s.pct}%` : "0%", background: s.color, transition: "width 1.5s ease", borderRadius: 2 }} />
                    </div>
                  </div>
              ))}
            </Card>

            {/* Wave Gauges */}
            <div style={{ display: "flex", gap: 16 }}>
              {/* Sector A2 */}
              <Card className="pro-card" style={{ width: 180, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--surface)", padding: "18px 14px" }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: "var(--text-muted)", marginBottom: 14, letterSpacing: ".5px", textTransform: "uppercase" }}>Depth: Sector A2</div>
                <div className="wave-box">
                  <div className="wave-fill" style={{ top: isLoaded ? `${100 - sensors[0].pct}%` : "100%", background: "linear-gradient(180deg, var(--red) 0%, #7f1d1d 100%)" }} />
                  <div className="wave-fill wave-fill-bg" style={{ top: isLoaded ? `${100 - sensors[0].pct}%` : "100%", background: "var(--red)" }} />
                  <div style={{ zIndex: 10, textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{sensors[0].pct}%</div>
                    <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "1px", color: "rgba(255,255,255,.8)" }}>CRITICAL</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{sensors[0].name}</span>
                </div>
              </Card>

              {/* Sector B1 */}
              <Card className="pro-card" style={{ width: 180, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--surface)", padding: "18px 14px" }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: "var(--text-muted)", marginBottom: 14, letterSpacing: ".5px", textTransform: "uppercase" }}>Depth: Sector B1</div>
                <div className="wave-box">
                  <div className="wave-fill" style={{ top: isLoaded ? `${100 - sensors[1].pct}%` : "100%", background: "linear-gradient(180deg, var(--orange) 0%, #92400e 100%)" }} />
                  <div className="wave-fill wave-fill-bg" style={{ top: isLoaded ? `${100 - sensors[1].pct}%` : "100%", background: "var(--orange)" }} />
                  <div style={{ zIndex: 10, textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{sensors[1].pct}%</div>
                    <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "1px", color: "rgba(255,255,255,.8)" }}>WARNING</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--orange)" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{sensors[1].name}</span>
                </div>
              </Card>
            </div>

            {/* Live Map */}
            <Card className="pro-card" style={{ flex: 1, padding: 0, overflow: "hidden", position: "relative" }}>
              <div style={{
                padding: "12px 18px", borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "var(--surface)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", color: "var(--text)" }}>
                  <span className="live-dot" /> LIVE OPERATIONS MAP
                </div>
              </div>
              <div style={{ height: 310, position: "relative" }}>
                <div className="map-scanner" />
                <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                  {sensors.map((s, i) => (
                      <Marker key={i} position={s.coords}>
                        <Popup>
                          <div style={{ padding: 4, fontFamily: "inherit" }}>
                            <strong>{s.name}</strong><br />Level: {s.pct}%
                          </div>
                        </Popup>
                      </Marker>
                  ))}
                </MapContainer>
              </div>
            </Card>

            {/* Diagnostics */}
            <Card className="pro-card" style={{ width: 175, flexShrink: 0, padding: "18px 16px" }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--text-muted)", marginBottom: 18, textAlign: "center", textTransform: "uppercase", letterSpacing: ".5px" }}>Diagnostics</div>
              {gauges.map((g, i) => {
                const dashVal = isLoaded ? g.pct * 2.64 : 0;
                return (
                    <div key={i} style={{ marginBottom: 18, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ position: "relative" }}>
                        <svg width={g.size} height={g.size} viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
                          <circle className="gauge-circle" cx="50" cy="50" r="42" fill="none" stroke={g.rawColor} strokeWidth="8"
                                  strokeDasharray={`${dashVal} 264`} strokeDashoffset="0"
                                  strokeLinecap="round" transform="rotate(-90 50 50)" />
                        </svg>
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                          <div style={{ fontSize: i === 0 ? 17 : 13, fontWeight: 800, color: "var(--text)" }}>{isLoaded ? g.pct : 0}%</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", marginTop: 7, textTransform: "uppercase", letterSpacing: ".5px" }}>{g.label}</div>
                    </div>
                );
              })}
              <div className="diag-box">
                {healthRows.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 11, borderBottom: i < healthRows.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <span style={{ color: "var(--text-muted)" }}>{r.key}</span>
                      <span style={{ fontWeight: 700, color: r.color }}>{r.val}</span>
                    </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── BOTTOM ROW ── */}
          <div className="fadeUp" style={{ display: "flex", gap: 16 }}>

            {/* Incident Log */}
            <Card className="pro-card" style={{ flex: 1.5, padding: "18px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", textTransform: "uppercase", letterSpacing: ".5px" }}>Incident Log</div>
                <span style={{ fontSize: 9.5, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "var(--green-bg)", color: "var(--green)" }}>LIVE FEED</span>
              </div>
              {recentAlerts.map((a, i) => (
                  <div key={i} className="row-item">
                    <div className="icon-box" style={{ background: a.bg, color: a.color }}>{a.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{a.title}</span>
                        <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 5, background: a.levelBg, color: a.levelCol }}>{a.level}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 3, fontWeight: 500 }}>{a.desc}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{a.time}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>PM</div>
                    </div>
                  </div>
              ))}
            </Card>

            {/* Precipitation Trend */}
            <Card className="pro-card" style={{ flex: 1, padding: "18px 22px", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", textTransform: "uppercase", letterSpacing: ".5px" }}>Precipitation Trend</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--green)", background: "var(--green-bg)", padding: "3px 9px", borderRadius: 8 }}>+12% vs last 6h</div>
              </div>
              <div style={{ height: 120, position: "relative", marginTop: 8 }}>
                <svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="var(--primary)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path className="trend-area" d="M0,50 L20,45 L40,48 L60,30 L80,15 L100,5 L100,60 L0,60 Z"
                        fill="url(#chartGrad)" style={{ opacity: isLoaded ? 1 : 0 }} />
                  <path className="trend-line" d="M0,50 L20,45 L40,48 L60,30 L80,15 L100,5"
                        fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
                  {[[0,50],[20,45],[40,48],[60,30],[80,15],[100,5]].map((pt, i) => (
                      <circle key={i} cx={pt[0]} cy={pt[1]} r="2"
                              fill="var(--surface)" stroke="var(--primary)" strokeWidth="1.5"
                              className="trend-point"
                              style={{ opacity: isLoaded ? 1 : 0, transition: `opacity 0.5s ${0.2 * i}s` }} />
                  ))}
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                  {["-6h", "-4h", "-2h", "NOW"].map(t => (
                      <span key={t} style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 800 }}>{t}</span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Shelter Availability */}
            <Card className="pro-card" style={{ flex: 1, padding: "18px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", marginBottom: 14, textTransform: "uppercase", letterSpacing: ".5px" }}>Shelter Availability</div>
              {safeZones.map((z, i) => (
                  <div key={i} className="row-item">
                    <div style={{ fontSize: 18, flexShrink: 0 }}>{z.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{z.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                        <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600 }}>{z.cap}</span>
                        <span style={{ color: "var(--border-mid)" }}>•</span>
                        <span style={{ color: z.color, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".4px" }}>{z.status}</span>
                      </div>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: z.color, boxShadow: `0 0 7px ${z.color}`, flexShrink: 0 }} />
                  </div>
              ))}
            </Card>
          </div>

        </div>
      </>
  );
}
