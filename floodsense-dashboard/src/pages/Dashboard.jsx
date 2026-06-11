import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, globalCSS } from "../shared.jsx";
import { useSettings } from "../context/SettingsContext";
import { ShieldAlert, AlertTriangle, Thermometer, Droplets, Wind, Waves } from "lucide-react";

// ── API Services & Hooks Imports ─────────────────────────────────────────────
import { fetchMasterDashboardData } from "../api/services/alertService";
import { useStationData } from "../hooks/useStationData";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// ─────────────────────────────────────────────────────────────────────────────
// MOCK IoT DEVICE DATA — your standalone physical IoT device
// Not linked to any station or location.
// Replace with your real API / WebSocket hook when backend is ready.
// Shape: { deviceId, waterLevel, rainfall, humidity, temperature, updatedAt, signalStrength }
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_IOT_DEVICE = {
  deviceId:       "IOT-DEVICE-001",
  waterLevel:     2.45,   // meters
  rainfall:       18.7,   // mm/h
  humidity:       85,     // %
  temperature:    26.3,   // °C
  updatedAt:      "09:42 AM",
  signalStrength: 94,     // %
};

const STATION_COORDS = {
  "Rathnapura": [6.6827, 80.3992],
  "Ellagawa":   [6.7583, 80.2014],
  "Putupaula":  [6.6111, 80.0528],
};

const STATION_THRESHOLDS = {
  "Rathnapura": 5.20,
  "Ellagawa":   10.00,
  "Putupaula":  3.00,
};

// ─────────────────────────────────────────────────────────────────────────────
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
  @keyframes emergency-radar {
    0%   { background: #ef4444; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
    70%  { background: #b91c1c; box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
    100% { background: #ef4444; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }
  @keyframes iot-tick {
    0%  { opacity: 1; }
    50% { opacity: 0.35; }
    100%{ opacity: 1; }
  }
  .shimmer-block {
    background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
    background-size: 200% 100%;
    animation: shimmerAnim 2.5s infinite ease-in-out;
  }
  @keyframes shimmerAnim {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes slideInFromRight {
    0%   { transform: translateX(120%); opacity: 0; }
    100% { transform: translateX(0);    opacity: 1; }
  }
  .premium-toast {
    position: fixed; top: 24px; right: 24px;
    background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
    color: #fff; padding: 16px 20px; border-radius: 14px;
    border-left: 5px solid var(--red);
    box-shadow: 0 20px 25px -5px rgba(0,0,0,.4), 0 10px 10px -5px rgba(0,0,0,.2), 0 0 0 1px rgba(225,29,72,.2);
    z-index: 9999; width: 380px;
    animation: slideInFromRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
    font-family: 'Inter', sans-serif;
  }
  .stat-card { position: relative; overflow: hidden; transition: transform .25s ease, box-shadow .25s ease; }
  .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(26,82,204,.12) !important; }
  .stat-label  { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1.1px; color:var(--text-muted); margin-bottom:8px; }
  .stat-value  { font-size:40px; font-weight:900; line-height:1; letter-spacing:-1.5px; }
  .stat-footer { font-size:12px; font-weight:700; margin-top:10px; display:flex; align-items:center; gap:6px; }
  .stat-bg-icon { position:absolute; right:-8px; bottom:-8px; font-size:72px; opacity:.05; pointer-events:none; transform:rotate(-15deg); }
  .row-item {
    display:flex; align-items:center; gap:14px; padding:10px 12px; border-radius:11px;
    cursor:pointer; margin-bottom:4px; border:1px solid transparent; transition:all .18s ease;
  }
  .row-item:hover { background:var(--surface-alt); border-color:var(--border); transform:translateX(3px); }
  .icon-box { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
  .map-scanner {
    position:absolute; top:0; left:0; width:100%; height:50px;
    background:linear-gradient(to bottom, transparent, rgba(26,82,204,.06), transparent);
    animation:scan 3s infinite linear; pointer-events:none; z-index:1000;
  }
  .live-dot { width:8px; height:8px; background:var(--red); border-radius:50%; display:inline-block; margin-right:8px; animation:pulse-ring 2s infinite; }
  .iot-live-dot { width:6px; height:6px; border-radius:50%; background:#22c55e; display:inline-block; animation:iot-tick 2s infinite ease-in-out; }
  .radar-emergency-node { animation: emergency-radar 1s infinite ease-in-out !important; }
`;

// ── Sidebar: Sensor Nodes + IoT Device in one 260px card ─────────────────────
function LeftSidebar({ sensors, iotDevice }) {
  const iotMetrics = [
    { label: "Water Level", value: iotDevice.waterLevel.toFixed(2), unit: "m",    icon: <Waves      size={13} color="#1a52cc" />, iconBg: "rgba(26,82,204,.10)",  color: "#1a52cc", bar: Math.min(100,(iotDevice.waterLevel/10)*100),     barColor: iotDevice.waterLevel > 7 ? "#ef4444" : iotDevice.waterLevel > 4 ? "#f97316" : "#1a52cc" },
    { label: "Rainfall",    value: iotDevice.rainfall,              unit: "mm/h", icon: <Droplets   size={13} color="#3b82f6" />, iconBg: "rgba(59,130,246,.10)",  color: "#3b82f6", bar: Math.min(100,(iotDevice.rainfall/50)*100),         barColor: "#3b82f6" },
    { label: "Humidity",    value: iotDevice.humidity,              unit: "%",    icon: <Wind       size={13} color="#6366f1" />, iconBg: "rgba(99,102,241,.10)",  color: "#6366f1", bar: iotDevice.humidity,                                  barColor: iotDevice.humidity > 90 ? "#ef4444" : "#6366f1" },
    { label: "Temp",        value: iotDevice.temperature,           unit: "°C",   icon: <Thermometer size={13} color="#f59e0b" />, iconBg: "rgba(245,158,11,.10)", color: "#f59e0b", bar: Math.min(100,((iotDevice.temperature-15)/25)*100),  barColor: iotDevice.temperature > 35 ? "#ef4444" : "#f59e0b" },
  ];

  return (
    <Card style={{ width: 260, flexShrink: 0, padding: "18px 16px", backgroundColor: "#fff", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Section A: Station Sensor Nodes ── */}
      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", marginBottom: 12, display: "flex", justifyContent: "space-between", textTransform: "uppercase", letterSpacing: ".6px" }}>
        Active Sensor Nodes
        <span style={{ background: "var(--primary-bg)", color: "var(--primary)", padding: "2px 8px", borderRadius: 8, fontWeight: 800, fontSize: 10 }}>{sensors.length}</span>
      </div>

      {sensors.map((s, i) => (
        <div key={i} style={{
          background: s.status === "critical" ? "var(--red-bg)" : "var(--surface-alt)",
          borderRadius: 11, padding: "11px 13px", marginBottom: 7,
          border: `1px solid ${s.status === "critical" ? "rgba(225,29,72,.15)" : "#f1f5f9"}`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, display: "flex", justifyContent: "space-between", color: "#0f172a" }}>
            <span>
              <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: s.color, marginRight: 7, verticalAlign: "middle" }} />
              {s.name}
            </span>
            <span style={{ fontWeight: 800, color: s.color }}>{s.actualLevel.toFixed(2)}m</span>
          </div>
          <div style={{ height: 4, background: "#f1f5f9", borderRadius: 3, marginTop: 9, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, transition: "width 1.5s ease" }} />
          </div>
          <div style={{ fontSize: 8, color: "var(--text-muted)", marginTop: 4, textAlign: "right", fontWeight: 700, fontFamily: "monospace" }}>
            TS: {s.time}
          </div>
        </div>
      ))}

      {/* ── Divider ── */}
      <div style={{ borderTop: "1px solid #f1f5f9", margin: "10px 0" }} />

      {/* ── Section B: Standalone IoT Device ── */}
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: "linear-gradient(135deg,#1a52cc,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Waves size={12} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: ".5px" }}>IoT Device</div>
            <div style={{ fontSize: 8.5, color: "#94a3b8", fontWeight: 700, fontFamily: "monospace" }}>{iotDevice.deviceId}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span className="iot-live-dot" />
          <span style={{ fontSize: 9, fontWeight: 800, color: "#22c55e" }}>{iotDevice.signalStrength}%</span>
        </div>
      </div>

      {/* 2×2 metric grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {iotMetrics.map((m, i) => (
          <div key={i} style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 10, padding: "10px 11px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: m.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {m.icon}
              </div>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".4px" }}>{m.label}</span>
            </div>
            <div style={{ fontSize: 19, fontWeight: 900, color: m.color, letterSpacing: "-.8px", lineHeight: 1 }}>
              {m.value}<span style={{ fontSize: 9.5, fontWeight: 700, color: "#94a3b8", marginLeft: 2 }}>{m.unit}</span>
            </div>
            <div style={{ height: 3, background: "#e2e8f0", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
              <div style={{ height: "100%", width: `${m.bar}%`, background: m.barColor, borderRadius: 2, transition: "width 1.5s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Last updated */}
      <div style={{ marginTop: 10, textAlign: "right", fontSize: 8.5, color: "#94a3b8", fontWeight: 700, fontFamily: "monospace" }}>
        UPDATED: {iotDevice.updatedAt}
      </div>

    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [isLoaded, setIsLoaded]         = useState(false);
  const { systemSettings }              = useSettings();
  const isEmergency                     = systemSettings.emergency_mode;
  const isMaintenance                   = systemSettings.maintenance_mode;

  const [criticalCount, setCriticalCount]   = useState(0);
  const [liveAlerts,    setLiveAlerts]      = useState([]);
  const [totalShelters, setTotalShelters]   = useState(0);
  const [activeShelters,setActiveShelters]  = useState(0);
  const [liveShelters,  setLiveShelters]    = useState([]);

  // IoT device state — swap MOCK_IOT_DEVICE for your real hook when ready
  const [iotDevice, setIotDevice] = useState(MOCK_IOT_DEVICE);

  const [activeToast,    setActiveToast]    = useState(null);
  const [currentToastIdx,setCurrentToastIdx]= useState(0);
  const processedAlertIds = useRef(new Set());
  const rawStationData    = useStationData();

  useEffect(() => {
    const loadData = async () => {
      try {
        const res  = await fetchMasterDashboardData();
        const data = res.data;
        setCriticalCount(data.critical_count    || 0);
        setLiveAlerts(  data.recent_alerts      || []);
        setTotalShelters(data.total_shelters    || 0);
        setActiveShelters(data.active_shelters  || 0);
        setLiveShelters(  data.recent_shelters  || []);
        const criticals = (data.recent_alerts || []).filter(a => a.severity?.toLowerCase() === 'critical');
        const newAlerts = criticals.filter(a => !processedAlertIds.current.has(a.id));
        if (newAlerts.length > 0) {
          newAlerts.forEach(a => processedAlertIds.current.add(a.id));
          setActiveToast(newAlerts);
          setCurrentToastIdx(0);
          try { new Audio("/alert.mp3").play(); } catch(e) {}
        }
      } catch(err) { console.error(err); } finally { setIsLoaded(true); }
    };
    loadData();
    const iv = setInterval(loadData, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!isLoaded || liveAlerts.length === 0) return;
    const criticals = liveAlerts.filter(a => a.severity?.toLowerCase() === 'critical');
    const seenIds   = JSON.parse(sessionStorage.getItem('seenAlertIds') || '[]');
    const newAlerts = criticals.filter(a => !seenIds.includes(a.id));
    if (newAlerts.length > 0) {
      sessionStorage.setItem('seenAlertIds', JSON.stringify([...seenIds, ...newAlerts.map(a => a.id)]));
      setActiveToast(newAlerts);
      setCurrentToastIdx(0);
      try { new Audio("/alert.mp3").play(); } catch(e) {}
    }
  }, [liveAlerts, isLoaded]);

  useEffect(() => {
    if (!activeToast || activeToast.length === 0) return;
    const hideTimer = setTimeout(() => setActiveToast(null), 10000);
    let carouselIv  = null;
    if (activeToast.length > 1) {
      carouselIv = setInterval(() => setCurrentToastIdx(p => (p + 1) % activeToast.length), 2500);
    }
    return () => { clearTimeout(hideTimer); if (carouselIv) clearInterval(carouselIv); };
  }, [activeToast]);

  const sensors = rawStationData.map(s => {
    const threshold   = STATION_THRESHOLDS[s.name] || 5.00;
    const computedPct = Math.min(100, Math.round((s.level / threshold) * 100));
    let uiColor = "var(--green)";
    if (s.status === "critical") uiColor = "var(--red)";
    else if (s.status === "warning") uiColor = "var(--orange)";
    return { name: s.name, pct: computedPct, actualLevel: s.level, color: uiColor, coords: STATION_COORDS[s.name] || [6.55,80.60], status: s.status, time: s.time };
  });

  const stats = [
    { label: "Active Sensors",  value: sensors.length < 10 ? `0${sensors.length}` : sensors.length, sub: "Kalu Ganga Basin Live",             subColor: "var(--green)",   icon: "📡" },
    { label: "Critical Alerts", value: criticalCount < 10  ? `0${criticalCount}`  : criticalCount,  sub: "High Risk Priority",                subColor: "var(--red)",     valColor: "var(--red)",     icon: "🚨" },
    { label: "Affected Areas",  value: "06",                                                          sub: "Trend Increasing",                 subColor: "var(--orange)",  valColor: "var(--orange)",  icon: "🗺️" },
    { label: "Safe Locations",  value: totalShelters < 10  ? `0${totalShelters}`  : totalShelters,  sub: `${activeShelters}/${totalShelters} Operational`, subColor: "var(--primary)", valColor: "var(--primary)", icon: "🛡️" },
  ];

  const chartData = [
    { time: "-6h", rainfall: 45 }, { time: "-5h", rainfall: 52 },
    { time: "-4h", rainfall: 48 }, { time: "-3h", rainfall: 85 },
    { time: "-2h", rainfall: 118},{ time: "-1h", rainfall: 130},
    { time: "NOW", rainfall: 142},
  ];

  const getSeverityHelper = sev => {
    if (sev?.toLowerCase() === 'critical') return { bg: "rgba(225,29,72,.08)", color: "#e11d48", icon: <ShieldAlert size={18} color="#e11d48" /> };
    return { bg: "rgba(245,158,11,.08)", color: "#d97706", icon: <AlertTriangle size={18} color="#d97706" /> };
  };

  const BannerBase = ({ gradient, glowColor, label, message, badge }) => (
    <div className="fadeUp" style={{ background: gradient, color: "#fff", borderRadius: 13, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: `0 8px 24px -4px ${glowColor}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10.5, fontWeight: 800, opacity: .85, textTransform: "uppercase", letterSpacing: .6, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{message}</div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 800, padding: "4px 11px", borderRadius: 7, background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.3)", whiteSpace: "nowrap" }}>{badge}</div>
    </div>
  );

  if (!isLoaded || rawStationData[0]?.loading) {
    return (
      <>
        <style>{proStyles}</style>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px 0" }}>
          <div className="shimmer-block" style={{ height: 60, width: "100%", borderRadius: 13 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {[1,2,3,4].map(i => <div key={i} className="shimmer-block" style={{ height: 110, borderRadius: 16 }} />)}
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div className="shimmer-block" style={{ width: 260, height: 420, flexShrink: 0, borderRadius: 16 }} />
            <div className="shimmer-block" style={{ flex: 1, height: 420, borderRadius: 16 }} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div className="shimmer-block" style={{ flex: 1.4, height: 230, borderRadius: 16 }} />
            <div className="shimmer-block" style={{ flex: 1,   height: 230, borderRadius: 16 }} />
            <div className="shimmer-block" style={{ flex: 1,   height: 230, borderRadius: 16 }} />
          </div>
        </div>
      </>
    );
  }

  const currentToast            = activeToast ? activeToast[currentToastIdx] : null;
  const hasActiveCriticalAlerts = liveAlerts.some(a => a.severity?.toLowerCase() === 'critical');

  return (
    <>
      <style>{globalCSS}</style>
      <style>{proStyles}</style>

      {/* ── LIVE TOAST ── */}
      {activeToast && currentToast && (
        <div className="premium-toast">
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ fontSize: 18, marginTop: -1 }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "var(--red)", textTransform: "uppercase", letterSpacing: ".8px" }}>SYSTEM EMERGENCY NOTICE</span>
                {activeToast.length > 1 && (
                  <span style={{ background: "rgba(225,29,72,.2)", color: "var(--red)", fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 6, marginLeft: "auto" }}>
                    {currentToastIdx + 1}/{activeToast.length} ALERTS
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2, letterSpacing: "-.2px" }}>{currentToast.type || "CRITICAL FLOOD ALERT"}</div>
              <div style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 500, lineHeight: 1.4 }}>
                <strong style={{ color: "#fff" }}>[{currentToast.area?.name || currentToast.location || 'Sector'}]</strong> {currentToast.message}
              </div>
            </div>
            <button onClick={() => setActiveToast(null)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 700, padding: "0 2px" }}>✕</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── EMERGENCY BAR ── */}
        {hasActiveCriticalAlerts && (
          <div className="fadeUp" style={{ background: "rgba(225,29,72,.06)", border: "1px solid rgba(225,29,72,.2)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="radar-emergency-node" style={{ width: 10, height: 10, borderRadius: "50%", display: "inline-block" }} />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--red)", textTransform: "uppercase", letterSpacing: ".6px" }}>Active Disaster Mitigation Protocol Engaged</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--red)", background: "rgba(225,29,72,.15)", padding: "2px 8px", borderRadius: 6 }}>
              {liveAlerts.filter(a => a.severity?.toLowerCase() === 'critical').length} CRITICAL THREATS LIVE
            </span>
          </div>
        )}

        {/* ── MODE BANNERS ── */}
        {isEmergency && <BannerBase gradient="linear-gradient(90deg,#b91c1c,#7f1d1d)" glowColor="rgba(185,28,28,.20)" label="⚠ Emergency Mode Active" message="All thresholds overridden. Broadcasting to all channels. Immediate action required." badge="EMERGENCY" />}
        {isMaintenance && <BannerBase gradient="linear-gradient(90deg,var(--orange),#92400e)" glowColor="rgba(224,120,0,.15)" label="⚠ Maintenance Mode Active" message="All alerts suppressed during scheduled maintenance." badge="MAINTENANCE" />}

        {/* ── STAT CARDS ── */}
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

        {/* ── MAP ROW — left sidebar now holds BOTH sensor nodes + IoT device ── */}
        <div className="fadeUp" style={{ display: "flex", gap: 16 }}>

          {/* Combined left sidebar */}
          <LeftSidebar sensors={sensors} iotDevice={iotDevice} />

          {/* Map */}
          <Card style={{ flex: 1, padding: 0, overflow: "hidden", position: "relative", backgroundColor: "#fff", border: "1px solid #f1f5f9", borderRadius: 16 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
              <div style={{ fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", color: "#0f172a", letterSpacing: ".5px" }}>
                <span className="live-dot" /> LIVE GEO-OPERATIONS DATA WINDOW
              </div>
            </div>
            <div style={{ height: "calc(100% - 49px)", minHeight: 380, position: "relative" }}>
              <div className="map-scanner" />
              <MapContainer center={[6.65, 80.25]} zoom={10} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {sensors.map((s, i) => (
                  <Marker key={i} position={s.coords}>
                    <Popup>
                      <div style={{ padding: 4, fontSize: 12, fontFamily: "Inter, sans-serif" }}>
                        <strong style={{ color: "#0f172a" }}>{s.name} Telemetry Station</strong><br />
                        <span style={{ color: s.color, fontWeight: 700 }}>Live Water Level: {s.actualLevel.toFixed(2)}m</span><br />
                        <span style={{ fontSize: 10, color: "#64748b" }}>Status: {s.status.toUpperCase()}</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </Card>

        </div>

        {/* ── FOOTER ROW ── */}
        <div className="fadeUp" style={{ display: "flex", gap: 16 }}>

          {/* Live Alerts */}
          <Card style={{ flex: 1.4, padding: "20px 22px", backgroundColor: "#fff", border: "1px solid #f1f5f9", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: ".6px" }}>Live Operational Alerts Stream</div>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "var(--green-bg)", color: "var(--green)" }}>LIVE FEED</span>
            </div>
            {liveAlerts.length === 0
              ? <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>No real-time database alerts triggered.</div>
              : liveAlerts.map((a, i) => {
                  const uiCfg = getSeverityHelper(a.severity);
                  return (
                    <div key={i} className="row-item" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9" }}>
                      <div className="icon-box" style={{ background: uiCfg.bg }}>{uiCfg.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{a.type}</span>
                          <span style={{ fontSize: 8.5, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: uiCfg.bg, color: uiCfg.color }}>{a.severity.toUpperCase()}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", background: "var(--primary-bg)", padding: "1px 6px", borderRadius: 5 }}>{a.area?.name || a.location || "Sector"}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{a.message}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>{new Date(a.detected_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                        <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 1, fontWeight: 600 }}>TRACKED</div>
                      </div>
                    </div>
                  );
                })
            }
          </Card>

          {/* Precipitation Chart */}
          <Card style={{ flex: 1, padding: "22px 24px", backgroundColor: "#fff", border: "1px solid #f1f5f9", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: ".6px" }}>Precipitation Trend</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--green)", background: "var(--green-bg)", padding: "4px 10px", borderRadius: 8 }}>+12% vs last 6h</div>
            </div>
            <div style={{ width: "100%", height: 135, fontSize: 10, fontWeight: 600 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="premiumRainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1a52cc" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1a52cc" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} axisLine={false} dy={8} style={{ fontWeight: 700 }} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0,160]} tickFormatter={v => `${v}mm`} />
                  <Tooltip contentStyle={{ background: "#0f172a", borderRadius: 10, color: "#fff", border: "none", fontSize: 11, fontWeight: 700 }} />
                  <Area type="monotone" dataKey="rainfall" stroke="#1a52cc" strokeWidth={3} fillOpacity={1} fill="url(#premiumRainGrad)" dot={{ stroke: "#1a52cc", strokeWidth: 2, fill: "#fff", r: 3 }} activeDot={{ r: 5, strokeWidth: 0, fill: "#ff4d4d" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Shelter Readiness */}
          <Card style={{ flex: 1, padding: "20px 22px", backgroundColor: "#fff", border: "1px solid #f1f5f9", borderRadius: 16 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: "#0f172a", marginBottom: 16, textTransform: "uppercase", letterSpacing: ".5px" }}>Shelter Readiness</div>
            {liveShelters.length === 0
              ? <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>No evacuation shelters registered in system.</div>
              : liveShelters.map((z, i) => (
                  <div key={i} className="row-item" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--primary-bg)", color: "var(--primary)", width: 32, height: 32, borderRadius: 8, fontWeight: 700 }}>🛡️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12.5, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{z.location_name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                        <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600 }}>{z.max_capacity} Max Cap</span>
                        <span style={{ color: "var(--border-mid)" }}>•</span>
                        <span style={{ color: "var(--green)", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".4px" }}>{z.location_type}</span>
                      </div>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 7px var(--green)", flexShrink: 0 }} />
                  </div>
                ))
            }
          </Card>

        </div>
      </div>
    </>
  );
}