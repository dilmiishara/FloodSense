// ─── Dashboard.jsx ───────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { C, Card, Badge, Toggle, globalCSS, Header, Sidebar, Toast } from "../shared.jsx";
import { useSettings } from "../context/SettingsContext";

// Fix for default marker icons in Leaflet + React
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// --- Custom Professional Styles ---
const proStyles = `
  @keyframes scan {
    0% { transform: translateY(-100%); opacity: 0; }
    50% { opacity: 0.5; }
    100% { transform: translateY(100%); opacity: 0; }
  }
  @keyframes pulse-red {
    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }
  @keyframes waveMove {
    0% { transform: translateX(0) translateZ(0) scaleY(1) }
    50% { transform: translateX(-25%) translateZ(0) scaleY(0.8) }
    100% { transform: translateX(-50%) translateZ(0) scaleY(1) }
  }
  @keyframes lineDraw {
    from { stroke-dashoffset: 300; }
    to { stroke-dashoffset: 0; }
  }

  /* --- STAT CARD STYLES --- */
  .stat-card {
    position: relative;
    padding: 24px !important;
    background: #ffffff !important;
    border-radius: 16px !important;
    border: 1px solid rgba(226, 232, 240, 0.8) !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01) !important;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .stat-card:hover {
    transform: translateY(-4px);
    border-color: #3b82f6 !important;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05) !important;
  }
  .stat-label {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #94a3b8;
    margin-bottom: 8px;
  }
  .stat-value {
    font-size: 42px;
    font-weight: 900;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    letter-spacing: -1px;
  }
  .stat-footer {
    font-size: 12px;
    font-weight: 700;
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .stat-bg-icon {
    position: absolute;
    right: -10px;
    bottom: -10px;
    font-size: 80px;
    opacity: 0.04;
    pointer-events: none;
    transform: rotate(-15deg);
  }

  /* --- ROW ITEM STYLES --- */
  .row-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    border-radius: 12px;
    transition: all 0.2s ease;
    cursor: pointer;
    margin-bottom: 4px;
    border: 1px solid transparent;
  }
  .row-item:hover {
    background: #f8fafc;
    border-color: #e2e8f0;
    transform: translateX(4px);
  }
  .icon-box {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    background: #f1f5f9;
  }

  .gauge-circle {
    transition: stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* --- TREND CHART ANIMATION --- */
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
    transition: r 0.3s ease;
    cursor: pointer;
  }
  .trend-point:hover {
    r: 4;
  }

  .pro-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(0,0,0,0.05) !important;
  }
  .map-scanner {
    position: absolute; top: 0; left: 0; width: 100%; height: 50px;
    background: linear-gradient(to bottom, transparent, rgba(26, 82, 204, 0.1), transparent);
    animation: scan 3s infinite linear;
    pointer-events: none; z-index: 1000;
  }
  .live-dot {
    width: 8px; height: 8px; background: #ef4444; border-radius: 50%;
    display: inline-block; margin-right: 8px;
    animation: pulse-red 2s infinite;
  }
  .wave-box {
    position: relative; width: 110px; height: 110px; border-radius: 50%;
    background: #e0f2fe; border: 4px solid #fff; box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    overflow: hidden; display: flex; align-items: center; justify-content: center;
  }
  .wave-fill {
    position: absolute; bottom: 0; left: 0; width: 200%; height: 100%;
    transition: top 2s cubic-bezier(0.4, 0, 0.2, 1);
    animation: waveMove 4s linear infinite; transform-origin: center bottom;
  }
  .wave-fill-bg {
    opacity: 0.4; animation: waveMove 6s linear infinite reverse;
  }
`;

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
   const { systemSettings } = useSettings();
  const isEmergency    = systemSettings.emergency_mode;
  const isMaintenance  = systemSettings.maintenance_mode;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: "Active Sensors",     value: "05", sub: "All Systems Nominal", subColor: C.green,  icon: "" },
    { label: "Critical Alerts",    value: "03", sub: "High Risk Priority",  subColor: C.red,    valColor: C.red,    icon: "" },
    { label: "Affected Areas",     value: "06", sub: "Trend Increasing",    subColor: C.orange, valColor: C.orange, icon: "" },
    { label: "Safe Locations",     value: "12", sub: "8/12 Operational",    subColor: C.green,  valColor: C.green,  icon: "" },
  ];

  const recentAlerts = [
    { icon: "", bg: "rgba(239, 68, 68, 0.1)",  color: "#ef4444", title: "Flood Threshold Exceeded",  desc: "Ratnapura: Water level 4.8m (92%)",      time: "14:32", level: "CRITICAL" },
    { icon: "", bg: "rgba(239, 68, 68, 0.1)",  color: "#ef4444", title: "Critical Rise Rate",        desc: "Nivithigala: Predicted critical in 2.5hrs", time: "14:18", level: "CRITICAL" },
    { icon: "", bg: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", title: "Heavy Rainfall Warning",    desc: "Embilipitiya: 142mm expected / 6h",           time: "13:55", level: "WARNING" },
    { icon: "", bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", title: "Sensor Signal Weak",        desc: "Kolonna: Check local connectivity",    time: "13:20", level: "INFO" },
  ];

  const sensors = [
    { name: "Ratnapura",    pct: 87, color: C.red,    pulse: true, coords: [6.68, 80.40] },
    { name: "Balangoda",    pct: 74, color: C.orange, pulse: true, coords: [6.58, 80.00] },
    { name: "Kahawatta",    pct: 55, color: C.orange, coords: [6.93, 79.85] },
    { name: "Embilipitiya", pct: 38, color: C.yellow, coords: [7.29, 80.63] },
    { name: "Kolonna",      pct: 12, color: C.green,  coords: [9.66, 80.02] },
  ];

  const safeZones = [
    { icon: "", name: "Ratnapura Central School", cap: "240 cap", status: "Active", color: C.green },
    { icon: "", name: "Kolonna District Ground",  cap: "500 cap", status: "Active", color: C.green },
    { icon: "", name: "Kahawatta National Hospital", cap: "120 cap", status: "Full",   color: C.red },
    { icon: "", name: "Ayagama Community Hall", cap: "180 cap", status: "Active", color: C.green },
  ];

  const gauges = [
    { label: "CPU LOAD", pct: 75, color: C.green, size: 85 },
    { label: "RAM USAGE", pct: 38, color: "#3b82f6", size: 65 },
  ];

  const healthRows = [
    { key: "Uptime",     val: "99.8%",   color: C.green },
    { key: "Latency",    val: "24ms",    color: C.green },
    { key: "Server",     val: "Cloud-01", color: C.dark },
  ];

  return (
    <>
      <style>{globalCSS}</style>
      <style>{proStyles}</style>
      <div style={{ minHeight: "100vh", background: "#f0ede8", color: "#1e293b" }}>

        <div style={{ display: "flex", margin: "16px 20px" }}>

          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", maxHeight: "calc(100vh - 100px)", paddingRight: 4 }}>

            Alert Banner
            <div className="fadeUp" style={{ 
              background: "linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)", 
              color: "#fff", borderRadius: 12, padding: "14px 20px", 
              display: "flex", alignItems: "center", gap: 12, 
              boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.3)" 
            }}>
              <span style={{ fontSize: 20 }}></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.9, textTransform: 'uppercase' }}>System Alert</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Ratnapura Sector: Water levels exceeding 90% threshold. Monitoring active.</div>
              </div>
              <Badge style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>3 ACTIVE INCIDENTS</Badge>
            </div>

            {/* ── EMERGENCY BANNER — shows when emergency mode is ON ── */}
{isEmergency && (
  <div className="fadeUp" style={{
    background: "linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)",
    color: "#fff", borderRadius: 12, padding: "14px 20px",
    display: "flex", alignItems: "center", gap: 12,
    boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.3)",
    animation: "pulse-red 2s infinite",
  }}>
   
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.9, textTransform: "uppercase" }}>
        ⚠ Emergency Mode Active
      </div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>
        All thresholds overridden. Broadcasting to all channels. Immediate action required.
      </div>
    </div>
    <span style={{
      fontSize: 10, fontWeight: 800, padding: "4px 10px",
      borderRadius: 6, background: "rgba(255,255,255,0.2)",
      border: "1px solid rgba(255,255,255,0.3)",
    }}>
      EMERGENCY
    </span>
  </div>
)}

{/* ── MAINTENANCE BANNER — shows when maintenance mode is ON ── */}
{/* maintanace mode on */}
{isMaintenance && (
  <div className="fadeUp" style={{
    background: "linear-gradient(90deg, #f59e0b 0%, #b45309 100%)",
    color: "#fff", borderRadius: 12, padding: "14px 20px",
    display: "flex", alignItems: "center", gap: 12,
    boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)",
  }}>
   
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.9, textTransform: "uppercase" }}>
      ⚠ Maintenance Mode Active
      </div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>
        All alerts suppressed during scheduled maintenance. Monitoring continues in background.
      </div>
    </div>
    <span style={{
      fontSize: 10, fontWeight: 800, padding: "4px 10px",
      borderRadius: 6, background: "rgba(255,255,255,0.2)",
      border: "1px solid rgba(255,255,255,0.3)",
    }}>
      MAINTENANCE
    </span>
  </div>
)}

{/* ── DEFAULT BANNER — shows when both are OFF ── */}
{/* {!isEmergency && !isMaintenance && (
  <div className="fadeUp" style={{
    background: "linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)",
    color: "#fff", borderRadius: 12, padding: "14px 20px",
    display: "flex", alignItems: "center", gap: 12,
    boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.3)",
  }}>
    <span style={{ fontSize: 20 }}>⚠️</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.9, textTransform: "uppercase" }}>
        System Alert
      </div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>
        Ratnapura Sector: Water levels exceeding 90% threshold. Monitoring active.
      </div>
    </div>
    <span style={{
      fontSize: 10, fontWeight: 800, padding: "4px 10px",
      borderRadius: 6, background: "rgba(255,255,255,0.2)",
      border: "1px solid rgba(255,255,255,0.3)",
    }}>
      3 ACTIVE INCIDENTS
    </span>
  </div>
)} */}


            {/* STAT CARDS ROW */}
            <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
              {stats.map((s, i) => (
                <Card key={i} className="stat-card">
                  <div className="stat-bg-icon">{s.icon}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.valColor || "#0f172a" }}>
                    {s.value}
                  </div>
                  <div className="stat-footer" style={{ color: s.subColor }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.subColor, display: 'inline-block' }} />
                    {s.sub}
                  </div>
                </Card>
              ))}
            </div>

            {/* Interactive Workspace Row */}
            <div className="fadeUp" style={{ display: "flex", gap: 20 }}>
              {/* Sensor List */}
              <Card className="pro-card" style={{ width: 240, flexShrink: 0, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#475569", marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  SENSOR NODES <span style={{ color: C.mid }}>{sensors.length}</span>
                </div>
                {sensors.map((s, i) => (
                  <div key={i} style={{ 
                    background: i < 2 ? "rgba(239, 68, 68, 0.03)" : "#fff", 
                    borderRadius: 10, padding: "12px", marginBottom: 8, 
                    border: `1px solid ${i < 2 ? "rgba(239, 68, 68, 0.1)" : "#f1f5f9"}` 
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span><span className={s.pulse ? "pulse" : ""} style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: s.color, marginRight: 8 }} />{s.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.pct}%</span>
                    </div>
                    <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                       <div style={{ height: '100%', width: isLoaded ? `${s.pct}%` : '0%', background: s.color, transition: 'width 1.5s ease' }} />
                    </div>
                  </div>
                ))}
              </Card>

              {/* Water Depth Wave Gauges */}
              <div style={{ display: 'flex', gap: 20 }}>
                <Card className="pro-card" style={{ width: 185, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #fff 0%, #fff5f5 100%)', border: '1px solid rgba(230, 57, 70, 0.2) !important' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", marginBottom: 14, letterSpacing: '0.5px' }}>DEPTH: SECTOR A2</div>
                  <div className="wave-box">
                    <div className="wave-fill" style={{ top: isLoaded ? `${100 - sensors[0].pct}%` : '100%', background: 'linear-gradient(180deg, #e63946 0%, #9d0208 100%)' }} />
                    <div className="wave-fill wave-fill-bg" style={{ top: isLoaded ? `${100 - sensors[0].pct}%` : '100%' }} />
                    <div style={{ zIndex: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{sensors[0].pct}%</div>
                      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '1px', color: '#fff' }}>CRITICAL</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#e63946' }} />
                    <span style={{ fontSize: 11, fontWeight: 800 }}>{sensors[0].name}</span>
                  </div>
                </Card>

                <Card className="pro-card" style={{ width: 185, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #fff 0%, #fffcf5 100%)', border: '1px solid rgba(251, 133, 0, 0.2) !important' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", marginBottom: 14, letterSpacing: '0.5px' }}>DEPTH: SECTOR B1</div>
                  <div className="wave-box">
                    <div className="wave-fill" style={{ top: isLoaded ? `${100 - sensors[1].pct}%` : '100%', background: 'linear-gradient(180deg, #fb8500 0%, #ffb703 100%)' }} />
                    <div className="wave-fill wave-fill-bg" style={{ top: isLoaded ? `${100 - sensors[1].pct}%` : '100%' }} />
                    <div style={{ zIndex: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{sensors[1].pct}%</div>
                      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '1px', color: '#fff' }}>WARNING</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fb8500' }} />
                    <span style={{ fontSize: 11, fontWeight: 800 }}>{sensors[1].name}</span>
                  </div>
                </Card>
              </div>

              {/* Map View */}
              <Card className="pro-card" style={{ flex: 1, padding: 0, overflow: "hidden", position: 'relative' }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid #f1f5f9`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                    <span className="live-dot" /> LIVE OPERATIONS MAP
                  </div>
                </div>
                <div style={{ height: 340, position: 'relative' }}>
                  <div className="map-scanner" />
                  <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    {sensors.map((s, i) => (
                      <Marker key={i} position={s.coords}>
                        <Popup>
                          <div style={{ padding: 4 }}>
                            <strong>{s.name}</strong><br/>
                            Level: {s.pct}%
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </Card>

              {/* Diagnostics */}
              <Card className="pro-card" style={{ width: 180, flexShrink: 0, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 20, textAlign: 'center' }}>DIAGNOSTICS</div>
                {gauges.map((g, i) => {
                  const currentPct = isLoaded ? g.pct : 0;
                  const dashValue = currentPct * 2.64;
                  return (
                    <div key={i} style={{ marginBottom: 20, display: "flex", flexDirection: 'column', alignItems: "center", position: "relative" }}>
                      <div style={{ position: 'relative' }}>
                        <svg width={g.size} height={g.size} viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8"/>
                          <circle className="gauge-circle" cx="50" cy="50" r="42" fill="none" stroke={g.color} strokeWidth="8"
                            strokeDasharray={`${dashValue} 264`} strokeDashoffset="0"
                            strokeLinecap="round" transform="rotate(-90 50 50)" />
                        </svg>
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                          <div style={{ fontSize: i === 0 ? 18 : 14, fontWeight: 800 }}>{currentPct}%</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', marginTop: 8 }}>{g.label}</div>
                    </div>
                  );
                })}
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px", marginTop: 10 }}>
                  {healthRows.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 11 }}>
                      <span style={{ color: "#64748b" }}>{r.key}</span>
                      <span style={{ fontWeight: 700, color: r.color }}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="fadeUp" style={{ display: "flex", gap: 20 }}>
              
              {/* INCIDENT LOG */}
              <Card className="pro-card" style={{ flex: 1.5, padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", letterSpacing: "0.5px" }}>INCIDENT LOG</div>
                  <Badge style={{ background: "#f1f5f9", color: "#64748b", fontWeight: 700, fontSize: 10 }}>LIVE FEED</Badge>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {recentAlerts.map((a, i) => (
                    <div key={i} className="row-item">
                      <div className="icon-box" style={{ background: a.bg, color: a.color }}>
                        {a.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{a.title}</span>
                          <span style={{ 
                            fontSize: 9, 
                            fontWeight: 800, 
                            padding: "2px 6px", 
                            borderRadius: "4px", 
                            background: i < 2 ? "rgba(239, 68, 68, 0.1)" : "rgba(226, 232, 240, 0.5)", 
                            color: i < 2 ? "#ef4444" : "#64748b" 
                          }}>
                            {a.level}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 3, fontWeight: 500 }}>{a.desc}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{a.time}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginTop: 2 }}>PM</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* MODERN PRECIPITATION TREND */}
              <Card className="pro-card" style={{ flex: 1, padding: "20px 24px", position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", letterSpacing: "0.5px" }}>PRECIPITATION TREND</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.green }}>+12% vs last 6h</div>
                </div>
                
                <div style={{ height: 120, position: 'relative', marginTop: 10 }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Gradient Fill under the line */}
                    <path 
                      className="trend-area"
                      d="M0,50 L20,45 L40,48 L60,30 L80,15 L100,5 L100,60 L0,60 Z" 
                      fill="url(#chartGradient)" 
                      style={{ opacity: isLoaded ? 1 : 0 }}
                    />

                    {/* Animated Line */}
                    <path 
                      className="trend-line"
                      d="M0,50 L20,45 L40,48 L60,30 L80,15 L100,5" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    {[[0,50],[20,45],[40,48],[60,30],[80,15],[100,5]].map((pt, i) => (
                      <circle 
                        key={i} 
                        cx={pt[0]} cy={pt[1]} r="2" 
                        fill="#fff" stroke="#3b82f6" strokeWidth="1.5"
                        className="trend-point"
                        style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s', transitionDelay: `${0.2 * i}s` }}
                      />
                    ))}
                  </svg>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                    {["-6h", "-4h", "-2h", "NOW"].map(t => (
                      <span key={t} style={{ fontSize: 9, color: "#94a3b8", fontWeight: 800 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </Card>

              {/* SHELTER AVAILABILITY */}
              <Card className="pro-card" style={{ flex: 1, padding: "20px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", marginBottom: 20, letterSpacing: "0.5px" }}>SHELTER AVAILABILITY</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {safeZones.map((z, i) => (
                    <div key={i} className="row-item" style={{ padding: "10px 12px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{z.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                          <span style={{ color: "#64748b", fontSize: 11, fontWeight: 600 }}>{z.cap}</span>
                          <span style={{ color: "#cbd5e1" }}>•</span>
                          <span style={{ color: z.color, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>{z.status}</span>
                        </div>
                      </div>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: z.color, boxShadow: `0 0 8px ${z.color}` }} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}