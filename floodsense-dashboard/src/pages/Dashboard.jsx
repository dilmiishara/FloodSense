import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, globalCSS } from "../shared.jsx";
import { useSettings } from "../context/SettingsContext";
import { ShieldAlert, AlertTriangle } from "lucide-react";

// ── API Services & Hooks Imports ─────────────────────────────────────────────
import { fetchMasterDashboardData } from "../api/services/alertService";
import { useStationData } from "../hooks/useStationData"; 

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
  
  /* EMERGENCY RADAR PULSE */
  @keyframes emergency-radar {
    0%   { background: #ef4444; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
    70%  { background: #b91c1c; box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
    100% { background: #ef4444; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }

  @keyframes lineDraw {
    from { stroke-dashoffset: 300; }
    to   { stroke-dashoffset: 0; }
  }

  /* GLOBAL SKELETON SHIMMER EFFECT */
  .shimmer-block {
    background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
    background-size: 200% 100%;
    animation: shimmerAnimation 2.5s infinite ease-in-out;
  }
  @keyframes shimmerAnimation {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* Custom Tech Toast Notification Sliding Animation */
  @keyframes slideInFromRight {
    0% { transform: translateX(120%); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }

  /* Premium Command Toast Box Styles */
  .premium-toast {
    position: fixed;
    top: 24px;
    right: 24px;
    background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
    color: #fff;
    padding: 16px 20px;
    border-radius: 14px;
    border-left: 5px solid var(--red);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(225,29,72,0.2);
    z-index: 9999;
    width: 380px;
    animation: slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    font-family: 'Inter', sans-serif;
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

  .map-scanner {
    position: absolute; top: 0; left: 0; width: 100%; height: 50px;
    background: linear-gradient(to bottom, transparent, rgba(26,82,204,0.06), transparent);
    animation: scan 3s infinite linear;
    pointer-events: none; z-index: 1000;
  }

  .live-dot {
    width: 8px; height: 8px; background: var(--red);
    border-radius: 50%; display: inline-block; margin-right: 8px;
    animation: pulse-ring 2s infinite;
  }
  
  .radar-emergency-node {
    animation: emergency-radar 1s infinite ease-in-out !important;
  }
`;

const STATION_COORDS = {
  "Rathnapura": [6.6827, 80.3992],
  "Ellagawa":   [6.7583, 80.2014],
  "Putupaula":  [6.6111, 80.0528]
};

const STATION_THRESHOLDS = {
  "Rathnapura": 5.20,
  "Ellagawa":   10.00,
  "Putupaula":  3.00
};

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { systemSettings } = useSettings();
  const isEmergency   = systemSettings.emergency_mode;
  const isMaintenance = systemSettings.maintenance_mode;

  // Database Summary States
  const [criticalCount, setCriticalCount] = useState(0);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [totalShelters, setTotalShelters] = useState(0);
  const [activeShelters, setActiveShelters] = useState(0);
  const [liveShelters, setLiveShelters] = useState([]);

  // LIVE TOAST NOTIFICATION REAL-TIME STATES
  const [activeToast, setActiveToast] = useState(null);
  const [currentToastIdx, setCurrentToastIdx] = useState(0); 
  const isInitialLoad = useRef(true);
  const rawStationData = useStationData();
  const processedAlertIds = useRef(new Set());

useEffect(() => {
    const loadData = async () => {
        try {
            const res = await fetchMasterDashboardData();
            const data = res.data;
            
            setCriticalCount(data.critical_count || 0);
            setLiveAlerts(data.recent_alerts || []);
            setTotalShelters(data.total_shelters || 0);
            setActiveShelters(data.active_shelters || 0);
            setLiveShelters(data.recent_shelters || []);
            
            const criticals = (data.recent_alerts || []).filter(a => a.severity?.toLowerCase() === 'critical');
            
            const newAlerts = criticals.filter(a => !processedAlertIds.current.has(a.id));

            if (newAlerts.length > 0) {
                newAlerts.forEach(a => processedAlertIds.current.add(a.id));
                setActiveToast(newAlerts);
                setCurrentToastIdx(0);
                
                // play audio
                try { new Audio("/alert.mp3").play(); } catch (e) { console.warn("Audio error"); }
            }
        } catch (err) { console.error(err); } finally { setIsLoaded(true); }
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
}, []); 



 useEffect(() => {
  if (!isLoaded || liveAlerts.length === 0) return;
  const criticals = liveAlerts.filter(a => a.severity?.toLowerCase() === 'critical');
  const seenIds = JSON.parse(sessionStorage.getItem('seenAlertIds') || '[]');

  const newAlerts = criticals.filter(a => !seenIds.includes(a.id));

  if (newAlerts.length > 0) {
    const updatedSeenIds = [...seenIds, ...newAlerts.map(a => a.id)];
    sessionStorage.setItem('seenAlertIds', JSON.stringify(updatedSeenIds));

    setActiveToast(newAlerts);
    setCurrentToastIdx(0);
  
    try { new Audio("/alert.mp3").play(); } catch (e) { console.warn("Audio error"); }
  }
}, [liveAlerts, isLoaded]); 

  // Toast Timer Logic
useEffect(() => {
  if (!activeToast || activeToast.length === 0) return;

  const hideTimer = setTimeout(() => {
    setActiveToast(null);
  }, 10000);
  let carouselInterval = null;
  if (activeToast.length > 1) {
    carouselInterval = setInterval(() => {
      setCurrentToastIdx(prev => (prev + 1) % activeToast.length);
    }, 2500);
  }

  return () => { 
    clearTimeout(hideTimer); 
    if (carouselInterval) clearInterval(carouselInterval); 
  };
}, [activeToast]);

  useEffect(() => {
    if (activeToast && activeToast.length > 1) {
      const carouselTimer = setInterval(() => {
        setCurrentToastIdx((prevIdx) => (prevIdx + 1) % activeToast.length);
      }, 2500);
      return () => clearInterval(carouselTimer);
    }
  }, [activeToast]);

  const sensors = rawStationData.map((s) => {
    const threshold = STATION_THRESHOLDS[s.name] || 5.00;
    const computedPct = Math.min(100, Math.round((s.level / threshold) * 100));
    
    let uiColor = "var(--green)";
    if (s.status === "critical") uiColor = "var(--red)";
    else if (s.status === "warning") uiColor = "var(--orange)";

    return {
      name: s.name,
      pct: computedPct,
      actualLevel: s.level,
      color: uiColor,
      coords: STATION_COORDS[s.name] || [6.55, 80.60],
      status: s.status,
      time: s.time
    };
  });

  const stats = [
    { label: "Active Sensors",  value: sensors.length < 10 ? `0${sensors.length}` : sensors.length, sub: "Kalu Ganga Basin Live", subColor: "var(--green)", icon: "📡" },
    { label: "Critical Alerts", value: criticalCount < 10 ? `0${criticalCount}` : criticalCount, sub: "High Risk Priority",  subColor: "var(--red)",     valColor: "var(--red)",    icon: "🚨" },
    { label: "Affected Areas",  value: "06", sub: "Trend Increasing",    subColor: "var(--orange)", valColor: "var(--orange)", icon: "🗺️" },
    { label: "Safe Locations",  value: totalShelters < 10 ? `0${totalShelters}` : totalShelters, sub: `${activeShelters}/${totalShelters} Operational`, subColor: "var(--primary)", valColor: "var(--primary)", icon: "🛡️" },
  ];

  const chartData = [
    { time: "-6h", rainfall: 45 }, { time: "-5h", rainfall: 52 },
    { time: "-4h", rainfall: 48 }, { time: "-3h", rainfall: 85 },
    { time: "-2h", rainfall: 118 }, { time: "-1h", rainfall: 130 },
    { time: "NOW", rainfall: 142 },
  ];

  const getSeverityHelper = (sev) => {
    const s = sev?.toLowerCase();
    if (s === 'critical') {
      return { 
        bg: "rgba(225, 29, 72, 0.08)", 
        color: "#e11d48", 
        icon: <ShieldAlert size={18} color="#e11d48" /> 
      };
    }
    return { 
      bg: "rgba(245, 158, 11, 0.08)", 
      color: "#d97706", 
      icon: <AlertTriangle size={18} color="#d97706" /> 
    };
  };

  const BannerBase = ({ gradient, glowColor, label, message, badge }) => (
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
        <div style={{
          fontSize: 10, fontWeight: 800, padding: "4px 11px", borderRadius: 7,
          background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", whiteSpace: "nowrap",
        }}>{badge}</div>
      </div>
  );

  // High-Tech Soft Shimmer Layout Gate
  if (!isLoaded || rawStationData[0]?.loading) {
    return (
      <>
        <style>{proStyles}</style>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px 0" }}>
          <div className="shimmer-block" style={{ height: 60, width: "100%", borderRadius: 13 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="shimmer-block" style={{ height: 110, borderRadius: 16 }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div className="shimmer-block" style={{ width: 260, height: 350, flexShrink: 0, borderRadius: 16 }} />
            <div className="shimmer-block" style={{ flex: 1, height: 350, borderRadius: 16 }} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div className="shimmer-block" style={{ flex: 1.4, height: 230, borderRadius: 16 }} />
            <div className="shimmer-block" style={{ flex: 1, height: 230, borderRadius: 16 }} />
            <div className="shimmer-block" style={{ flex: 1, height: 230, borderRadius: 16 }} />
          </div>
        </div>
      </>
    );
  }

  const currentToast = activeToast ? activeToast[currentToastIdx] : null;
  const hasActiveCriticalAlerts = liveAlerts.some(a => a.severity?.toLowerCase() === 'critical');

  return (
      <>
        <style>{globalCSS}</style>
        <style>{proStyles}</style>

        {/* ──LIVE MULTIPLE TOAST CAROUSEL MATRIX ── */}
        {activeToast && currentToast && (
          <div className="premium-toast">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ fontSize: "18px", marginTop: "-1px" }}>🚨</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    SYSTEM EMERGENCY NOTICE
                  </span>
                  {activeToast.length > 1 && (
                    <span style={{ background: "rgba(225,29,72,0.2)", color: "var(--red)", fontSize: "9px", fontWeight: "800", padding: "1px 6px", borderRadius: "6px", marginLeft: "auto" }}>
                      {currentToastIdx + 1}/{activeToast.length} ALERTS
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "2px", letterSpacing: "-0.2px" }}>
                  {currentToast.type || "CRITICAL FLOOD ALERT"}
                </div>
                <div style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 500, lineHeight: 1.4 }}>
                  <strong style={{ color: "#fff" }}>[{currentToast.area?.name || currentToast.location || 'Sector'}]</strong> {currentToast.message}
                </div>
              </div>
              <button 
                onClick={() => setActiveToast(null)} 
                style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "13px", fontWeight: "700", padding: "0 2px" }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ──GLOBAL TOP EMERGENCY STATUS BAR ── */}
          {hasActiveCriticalAlerts && (
            <div className="fadeUp" style={{
              background: "rgba(225, 29, 72, 0.06)",
              border: "1px solid rgba(225, 29, 72, 0.2)",
              borderRadius: 12,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="radar-emergency-node" style={{ width: 10, height: 10, borderRadius: "50%", display: "inline-block" }} />
                <span style={{ fontSize: "11.5px", fontWeight: 800, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                  Active Disaster Mitigation Protocol Engaged
                </span>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--red)", background: "rgba(225,29,72,0.15)", padding: "2px 8px", borderRadius: "6px" }}>
                {liveAlerts.filter(a => a.severity?.toLowerCase() === 'critical').length} CRITICAL THREATS LIVE
              </span>
            </div>
          )}

          {/* ── ALERTS & MODES PANEL ── */}
          {isEmergency && (
              <BannerBase
                  gradient="linear-gradient(90deg, #b91c1c 0%, #7f1d1d 100%)"
                  glowColor="rgba(185,28,28,0.20)"
                  label="⚠ Emergency Mode Active"
                  message="All thresholds overridden. Broadcasting to all channels. Immediate action required."
                  badge="EMERGENCY"
              />
          )}

          {isMaintenance && (
              <BannerBase
                  gradient="linear-gradient(90deg, var(--orange) 0%, #92400e 100%)"
                  glowColor="rgba(224,120,0,0.15)"
                  label="⚠ Maintenance Mode Active"
                  message="All alerts suppressed during scheduled maintenance."
                  badge="MAINTENANCE"
              />
          )}

          {/* ── TOP COUNTER STAT CARDS ── */}
          <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {stats.map((s, i) => (
                <Card key={i} className="stat-card" style={{ padding: "22px 22px 18px", backgroundColor: "#fff", border: "1px solid #f1f5f9" }}>
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

          {/* ── MIDDLE OPERATIONS ROW (MAP CENTERED) ── */}
          <div className="fadeUp" style={{ display: "flex", gap: 16 }}>

            {/* Active Sensor Nodes Directory List */}
            <Card style={{ width: 260, flexShrink: 0, padding: "20px 18px", backgroundColor: "#fff", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 16, display: "flex", justifyContent: "space-between", textTransform: "uppercase", letterSpacing: ".6px" }}>
                Active Sensor Nodes
                <span style={{ background: "var(--primary-bg)", color: "var(--primary)", padding: "2px 8px", borderRadius: 8, fontWeight: 800, fontSize: 10 }}>{sensors.length}</span>
              </div>
              {sensors.map((s, i) => (
                  <div key={i} style={{
                    background: s.status === "critical" ? "var(--red-bg)" : "var(--surface-alt)",
                    borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                    border: `1px solid ${s.status === "critical" ? "rgba(225,29,72,0.15)" : "#f1f5f9"}`,
                  }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, display: "flex", justifyContent: "space-between", color: "#0f172a" }}>
                      <span>
                        <span style={{
                          display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                          background: s.color, marginRight: 8, verticalAlign: "middle",
                        }} />
                        {s.name}
                      </span>
                      <span style={{ fontWeight: 800, color: s.color }}>{s.actualLevel.toFixed(2)}m</span>
                    </div>
                    <div style={{ height: 5, background: "#f1f5f9", borderRadius: 3, marginTop: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, transition: "width 1.5s ease" }} />
                    </div>
                    <div style={{ fontSize: 8.5, color: "var(--text-muted)", marginTop: 5, textAlign: "right", fontWeight: "700", fontFamily: "monospace" }}>
                      TS: {s.time}
                    </div>
                  </div>
              ))}
            </Card>

            {/* Hero Map Component */}
            <Card style={{ flex: 1, padding: 0, overflow: "hidden", position: "relative", backgroundColor: "#fff", border: "1px solid #f1f5f9", borderRadius: "16px" }}>
              <div style={{
                padding: "14px 20px", borderBottom: "1px solid #f1f5f9",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#fff",
              }}>
                <div style={{ fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", color: "#0f172a", letterSpacing: "0.5px" }}>
                  <span className="live-dot" /> LIVE GEO-OPERATIONS DATA WINDOW
                </div>
              </div>
              <div style={{ height: 350, position: "relative" }}>
                <div className="map-scanner" />
                <MapContainer center={[6.65, 80.25]} zoom={10} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                  {sensors.map((s, i) => (
                      <Marker key={i} position={s.coords}>
                        <Popup>
                          <div style={{ padding: 4, fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                            <strong style={{ color: '#0f172a' }}>{s.name} Telemetry Station</strong><br />
                            <span style={{ color: s.color, fontWeight: '700' }}>Live Water Level: {s.actualLevel.toFixed(2)}m</span><br />
                            <span style={{ fontSize: '10px', color: '#64748b' }}>Status: {s.status.toUpperCase()}</span>
                          </div>
                        </Popup>
                      </Marker>
                  ))}
                </MapContainer>
              </div>
            </Card>

          </div>

          {/* ── CLEAN FOOTER ROW ── */}
          <div className="fadeUp" style={{ display: "flex", gap: 16 }}>

            {/* Live Operational Alerts Stream Panel */}
            <Card style={{ flex: 1.4, padding: "20px 22px", backgroundColor: "#fff", border: "1px solid #f1f5f9", borderRadius: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: ".6px" }}>Live Operational Alerts Stream</div>
                <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "var(--green-bg)", color: "var(--green)" }}>LIVE FEED</span>
              </div>
              
              {liveAlerts.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>No real-time database alerts triggered.</div>
              ) : liveAlerts.map((a, i) => {
                  const uiCfg = getSeverityHelper(a.severity);
                  return (
                    <div key={i} className="row-item" style={{ backgroundColor: "#ffffff", border: "1px solid #f1f5f9" }}>
                      <div className="icon-box" style={{ background: uiCfg.bg }}>{uiCfg.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{a.type}</span>
                          <span style={{ fontSize: 8.5, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: uiCfg.bg, color: uiCfg.color }}>{a.severity.toUpperCase()}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", background: "var(--primary-bg)", padding: "1px 6px", borderRadius: 5 }}>{a.area?.name || a.location || "Sector"}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
                          {a.message}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>
                          {new Date(a.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 1, fontWeight: "600" }}>TRACKED</div>
                      </div>
                    </div>
                  );
              })}
            </Card>

            {/* Rain Fall Analytics Graph */}
            <Card style={{ flex: 1, padding: "22px 24px", backgroundColor: "#fff", border: "1px solid #f1f5f9", borderRadius: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: ".6px" }}>
                  Precipitation Trend
                </div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--green)", background: "var(--green-bg)", padding: "4px 10px", borderRadius: 8 }}>
                  +12% vs last 6h
                </div>
              </div>

              <div style={{ width: "100%", height: 135, fontSize: "10px", fontWeight: "600" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="premiumRainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a52cc" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#1a52cc" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} axisLine={false} dy={8} style={{ fontWeight: '700' }} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0, 160]} tickFormatter={(val) => `${val}mm`} />
                    <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '10px', color: '#fff', border: 'none', fontSize: '11px', fontWeight: '700' }} />
                    <Area type="monotone" dataKey="rainfall" stroke="#1a52cc" strokeWidth={3} fillOpacity={1} fill="url(#premiumRainGrad)" dot={{ stroke: '#1a52cc', strokeWidth: 2, fill: '#fff', r: 3 }} activeDot={{ r: 5, strokeWidth: 0, fill: '#ff4d4d' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Shelter Evacuation Readiness State Box */}
            <Card style={{ flex: 1, padding: "20px 22px", backgroundColor: "#fff", border: "1px solid #f1f5f9", borderRadius: "16px" }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "#0f172a", marginBottom: 16, textTransform: "uppercase", letterSpacing: ".5px" }}>
                Shelter Readiness
              </div>
              
              {liveShelters.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>No evacuation shelters registered in system.</div>
              ) : liveShelters.map((z, i) => (
                  <div key={i} className="row-item" style={{ backgroundColor: "#ffffff", border: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--primary-bg)", color: "var(--primary)", width: "32px", height: "32px", borderRadius: "8px", fontWeight: "700" }}>🛡️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12.5, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {z.location_name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                        <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600 }}>
                          {z.max_capacity} Max Cap
                        </span>
                        <span style={{ color: "var(--border-mid)" }}>•</span>
                        <span style={{ color: "var(--green)", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".4px" }}>
                          {z.location_type}
                        </span>
                      </div>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: `0 0 7px var(--green)`, flexShrink: 0 }} />
                  </div>
              ))}
            </Card>
          </div>

        </div>
      </>
  );
}