import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { Card, globalCSS } from "../shared.jsx";
import { useSettings } from "../context/SettingsContext";
import { AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react";

import { fetchMasterDashboardData, fetchLatestSensorReading } from "../api/services/alertService";
import { useStationData } from "../hooks/useStationData";
import {
  HumidityIcon, TemperatureIcon, RainfallIcon,
  UltrasonicIcon, WarningIcon,
  ShelterTypeIcon, SafeShieldIcon,
} from "../shared/icons";

// ─── Lazy load the Predicted Flood Area map ───────────────────────────────────
const AffectedMap = lazy(() => import("../components/map/AffectedMap.jsx"));

// ─── Constants ────────────────────────────────────────────────────────────────
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

const TOAST_DURATION = 6000;
const SHELTER_PREVIEW = 3; // default visible shelter count

// ─── Map loading spinner ──────────────────────────────────────────────────────
const MapLoading = () => (
  <div style={{ height: "100%", minHeight: 380, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
    <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading predicted flood map...</span>
  </div>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  @keyframes shelterExpand {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .shimmer-block {
    background: linear-gradient(90deg, var(--surface) 25%, var(--surface-alt) 50%, var(--surface) 75%);
    background-size: 200% 100%;
    animation: shimmerAnim 2.5s infinite ease-in-out;
  }
  @keyframes shimmerAnim {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes toastSlideIn {
    0%   { transform: translateX(120%); opacity: 0; }
    100% { transform: translateX(0);    opacity: 1; }
  }
  @keyframes toastSlideOut {
    0%   { transform: translateX(0);    opacity: 1; }
    100% { transform: translateX(120%); opacity: 0; }
  }
  @keyframes toastProgress {
    from { width: 100%; }
    to   { width: 0%; }
  }
  .toast-enter  { animation: toastSlideIn  0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
  .toast-exit   { animation: toastSlideOut 0.35s ease-in forwards; }
  .alert-toast { background: var(--surface); border: 1px solid var(--border); border-left: 5px solid var(--red) !important; box-shadow: var(--shadow-md), 0 0 0 1px rgba(225,29,72,.15); }
  .alert-toast-progress-track { background: var(--border); }
  .alert-toast-icon { background: var(--red-bg); }
  .alert-toast-label { color: var(--red); }
  .alert-toast-title { color: var(--text); }
  .alert-toast-location { color: var(--text-mid); }
  .alert-toast-message { color: var(--text-muted); }
  .alert-toast-pending { background: var(--red-bg); color: var(--red); }
  .alert-toast-close { background: var(--surface-alt); border: 1px solid var(--border); color: var(--text-muted); }
  .alert-toast-close:hover { background: var(--border); }
  .stat-card { position: relative; overflow: hidden; transition: transform .25s ease, box-shadow .25s ease; }
  .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(26,82,204,.12) !important; }
  .stat-label  { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1.1px; color:var(--text-muted); margin-bottom:8px; }
  .stat-value  { font-size:40px; font-weight:900; line-height:1; letter-spacing:-1.5px; }
  .stat-footer { font-size:12px; font-weight:700; margin-top:10px; display:flex; align-items:center; gap:6px; }
  .stat-bg-icon { position:absolute; right:-8px; bottom:-8px; opacity:.05; pointer-events:none; display:flex; align-items:center; justify-content:center; }
  .row-item { display:flex; align-items:center; gap:14px; padding:10px 12px; border-radius:11px; cursor:pointer; margin-bottom:4px; border:1px solid transparent; transition:all .18s ease; }
  .row-item:hover { background:var(--surface-alt); border-color:var(--border); transform:translateX(3px); }
  .icon-box { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
  .iot-live-dot { width:6px; height:6px; border-radius:50%; background:#22c55e; display:inline-block; animation:iot-tick 2s infinite ease-in-out; }
  .radar-emergency-node { animation: emergency-radar 1s infinite ease-in-out !important; }
  .live-dot { width:8px; height:8px; background:var(--red); border-radius:50%; display:inline-block; margin-right:8px; animation:pulse-ring 2s infinite; }
  .shelter-extra { animation: shelterExpand 0.22s ease forwards; }
  .show-more-btn { width:100%; margin-top:8px; padding:8px 0; border-radius:10px; border:1.5px dashed var(--border); background:transparent; color:var(--text-muted); font-size:11px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all .15s; }
  .show-more-btn:hover { background:var(--surface-alt); border-color:var(--primary); color:var(--primary); }
`;

// ─── Toast Queue Hook ─────────────────────────────────────────────────────────
function useToastQueue(duration = 6000) {
  const [queue,   setQueue]   = useState([]);
  const [current, setCurrent] = useState(null);
  const timerRef = useRef(null);
  const idRef    = useRef(0);

  const enqueue = useCallback((alerts) => {
    setQueue(prev => {
      const existingIds = new Set(prev.map(a => a.alert.id));
      const fresh = alerts
        .filter(a => !existingIds.has(a.id))
        .map(a => ({ alert: a, uid: ++idRef.current }));
      return [...prev, ...fresh];
    });
  }, []);

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current);
    setCurrent(prev => prev ? { ...prev, exiting: true } : null);
    timerRef.current = setTimeout(() => setCurrent(null), 360);
  }, []);

  useEffect(() => {
    if (current !== null) return;
    if (queue.length === 0) return;
    const [next, ...rest] = queue;
    setQueue(rest);
    setCurrent({ ...next, exiting: false });
  }, [queue, current]);

  useEffect(() => {
    if (!current || current.exiting) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(dismiss, duration);
    return () => clearTimeout(timerRef.current);
  }, [current?.uid]);

  return { current, enqueue, dismiss, pending: queue.length };
}

// ─── Toast Component ──────────────────────────────────────────────────────────
function AlertToast({ item, onDismiss, pending, duration }) {
  const { alert: a } = item;
  return (
    <div
      className={`alert-toast ${item.exiting ? "toast-exit" : "toast-enter"}`}
      style={{ position: "fixed", top: 24, right: 24, width: 380, zIndex: 9999, borderRadius: 14, overflow: "hidden" }}
    >
      <div className="alert-toast-progress-track" style={{ height: 3 }}>
        <div style={{ height: "100%", background: "var(--red)", animation: item.exiting ? "none" : `toastProgress ${duration}ms linear forwards` }} />
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div className="alert-toast-icon" style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <WarningIcon size={18} color="var(--red)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="alert-toast-label" style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".8px" }}>Critical Alert</span>
              {pending > 0 && <span className="alert-toast-pending" style={{ fontSize: 9, fontWeight: 800, padding: "1px 7px", borderRadius: 6 }}>+{pending} more</span>}
            </div>
            <div className="alert-toast-title" style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: "-.2px", marginBottom: 4 }}>
              {a.type || "CRITICAL FLOOD ALERT"}
            </div>
            <div className="alert-toast-message" style={{ fontSize: 11.5, fontWeight: 500, lineHeight: 1.45 }}>
              <strong className="alert-toast-location">[{a.area?.name || a.location || "Sector"}]</strong>{" "}{a.message}
            </div>
          </div>
          <button onClick={onDismiss} className="alert-toast-close" style={{ width: 26, height: 26, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Left Sidebar ─────────────────────────────────────────────────────────────
function LeftSidebar({ sensors, iotDevice }) {
  if (!iotDevice) {
    return (
      <div style={{ width: 360, flexShrink: 0 }}>
        <div className="shimmer-block" style={{ height: 420, borderRadius: 16 }} />
      </div>
    );
  }

  const iotMetrics = [
    { label: "Water Level", value: Number(iotDevice.waterLevel).toFixed(2), unit: "m",    icon: <UltrasonicIcon size={13} color="#1a52cc" />, iconBg: "rgba(26,82,204,.10)",  color: "#1a52cc", bar: Math.min(100, (iotDevice.waterLevel / 10) * 100), barColor: iotDevice.waterLevel > 7 ? "#ef4444" : iotDevice.waterLevel > 4 ? "#f97316" : "#1a52cc" },
    { label: "Rainfall",    value: iotDevice.rainfall,                       unit: "mm/h", icon: <RainfallIcon size={13} color="#3b82f6" />,    iconBg: "rgba(59,130,246,.10)",  color: "#3b82f6", bar: Math.min(100, (iotDevice.rainfall / 50) * 100),    barColor: "#3b82f6" },
    { label: "Humidity",    value: iotDevice.humidity,                       unit: "%",    icon: <HumidityIcon size={13} color="#6366f1" />,    iconBg: "rgba(99,102,241,.10)",  color: "#6366f1", bar: iotDevice.humidity,                                  barColor: iotDevice.humidity > 90 ? "#ef4444" : "#6366f1" },
    { label: "Temp",        value: iotDevice.temperature,                    unit: "°C",   icon: <TemperatureIcon size={13} color="#f59e0b" />, iconBg: "rgba(245,158,11,.10)",  color: "#f59e0b", bar: Math.min(100, ((iotDevice.temperature - 15) / 25) * 100), barColor: iotDevice.temperature > 35 ? "#ef4444" : "#f59e0b" },
  ];

  return (
    <Card style={{ width: 360, flexShrink: 0, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", marginBottom: 12, display: "flex", justifyContent: "space-between", textTransform: "uppercase", letterSpacing: ".6px" }}>
        Active Sensor Nodes
        <span style={{ background: "var(--primary-bg)", color: "var(--primary)", padding: "2px 8px", borderRadius: 8, fontWeight: 800, fontSize: 10 }}>{sensors.length}</span>
      </div>

      {sensors.map((s, i) => (
        <div key={i} style={{ background: s.status === "critical" ? "var(--red-bg)" : "var(--surface-alt)", borderRadius: 11, padding: "11px 13px", marginBottom: 7, border: `1px solid ${s.status === "critical" ? "var(--red)" : "var(--border)"}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, display: "flex", justifyContent: "space-between", color: "var(--text)" }}>
            <span>
              <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: s.color, marginRight: 7, verticalAlign: "middle" }} />
              {s.name}
            </span>
            <span style={{ fontWeight: 800, color: s.color }}>{s.actualLevel.toFixed(2)}m</span>
          </div>
          <div style={{ height: 4, background: "var(--border)", borderRadius: 3, marginTop: 9, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, transition: "width 1.5s ease" }} />
          </div>
          <div style={{ fontSize: 8, color: "var(--text-muted)", marginTop: 4, textAlign: "right", fontWeight: 700, fontFamily: "monospace" }}>TS: {s.time}</div>
        </div>
      ))}

      <div style={{ borderTop: "1px solid var(--border)", margin: "10px 0" }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UltrasonicIcon size={12} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text)", textTransform: "uppercase", letterSpacing: ".5px" }}>IoT Device</div>
            <div style={{ fontSize: 8.5, color: "var(--text-muted)", fontWeight: 700, fontFamily: "monospace" }}>{iotDevice.deviceId}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span className="iot-live-dot" />
          <span style={{ fontSize: 9, fontWeight: 800, color: "#22c55e" }}>{iotDevice.signalStrength}%</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {iotMetrics.map((m, i) => (
          <div key={i} style={{ background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 11px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: m.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{m.icon}</div>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".4px" }}>{m.label}</span>
            </div>
            <div style={{ fontSize: 19, fontWeight: 900, color: m.color, letterSpacing: "-.8px", lineHeight: 1 }}>
              {m.value}<span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", marginLeft: 2 }}>{m.unit}</span>
            </div>
            <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
              <div style={{ height: "100%", width: `${m.bar}%`, background: m.barColor, borderRadius: 2, transition: "width 1.5s ease" }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, textAlign: "right", fontSize: 8.5, color: "var(--text-muted)", fontWeight: 700, fontFamily: "monospace" }}>
        UPDATED: {iotDevice.updatedAt}
      </div>
    </Card>
  );
}

// ─── Shelter Readiness Card ───────────────────────────────────────────────────
function ShelterReadiness({ liveShelters }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? liveShelters : liveShelters.slice(0, SHELTER_PREVIEW);
  const hasMore = liveShelters.length > SHELTER_PREVIEW;

  return (
    <Card style={{ flex: 1, padding: "20px 22px", borderRadius: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: "var(--text)", textTransform: "uppercase", letterSpacing: ".5px" }}>
          Shelter Readiness
        </div>
        {liveShelters.length > 0 && (
          <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "var(--green-bg)", color: "var(--green)" }}>
            {liveShelters.length} ACTIVE
          </span>
        )}
      </div>

      {/* List */}
      {liveShelters.length === 0 ? (
        <div style={{ padding: "30px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
          No evacuation shelters registered in system.
        </div>
      ) : (
        <>
          {visible.map((z, i) => (
            <div
              key={z.id || i}
              className={`row-item ${i >= SHELTER_PREVIEW ? "shelter-extra" : ""}`}
            >
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "#f0fdf4", border: "1.5px solid #86efac", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShelterTypeIcon type={z.location_type} size={16} color="#16a34a" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{z.location_name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  {z.max_capacity && <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600 }}>{z.max_capacity} Max Cap</span>}
                  {z.max_capacity && <span style={{ color: "var(--border-mid)" }}>•</span>}
                  <span style={{ color: "var(--green)", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".4px" }}>{z.location_type}</span>
                </div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 7px var(--green)", flexShrink: 0 }} />
            </div>
          ))}

          {/* Show more / less toggle */}
          {hasMore && (
            <button className="show-more-btn" onClick={() => setExpanded(e => !e)}>
              {expanded
                ? <><ChevronUp size={13} /> Show less</>
                : <><ChevronDown size={13} /> Show {liveShelters.length - SHELTER_PREVIEW} more shelters</>
              }
            </button>
          )}
        </>
      )}
    </Card>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [isLoaded,       setIsLoaded]       = useState(false);
  const [criticalCount,  setCriticalCount]  = useState(0);
  const [liveAlerts,     setLiveAlerts]     = useState([]);
  const [totalShelters,  setTotalShelters]  = useState(0);
  const [liveShelters,   setLiveShelters]   = useState([]);
  const [iotDevice,      setIotDevice]      = useState(null);

  const { systemSettings } = useSettings();
  const isEmergency   = systemSettings.emergency_mode;
  const isMaintenance = systemSettings.maintenance_mode;

  const { current: toastItem, enqueue: enqueueToast, dismiss: dismissToast, pending: pendingToasts } = useToastQueue(TOAST_DURATION);
  const processedAlertIds = useRef(new Set());
  const rawStationData    = useStationData();

  useEffect(() => {
    const loadData = async () => {
      try {
        const res  = await fetchMasterDashboardData();
        const data = res.data;
        setCriticalCount(  data.critical_count  || 0);
        setLiveAlerts(     data.recent_alerts   || []);
        setTotalShelters(  data.total_shelters  || 0);
        setLiveShelters(   data.recent_shelters || []);

        try {
          const iotRes = await fetchLatestSensorReading();
          if (iotRes.data?.data) setIotDevice(iotRes.data.data);
        } catch (e) { console.warn("IoT sensor fetch failed:", e); }

        const criticals = (data.recent_alerts || []).filter(a => a.severity?.toLowerCase() === "critical");
        const newAlerts = criticals.filter(a => !processedAlertIds.current.has(a.id));
        if (newAlerts.length > 0) {
          newAlerts.forEach(a => processedAlertIds.current.add(a.id));
          enqueueToast(newAlerts);
          try { new Audio("/alert.mp3").play().catch(() => {}); } catch(e) {}
        }
      } catch(err) {
        console.error(err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
    const iv = setInterval(loadData, 30000);
    return () => clearInterval(iv);
  }, [enqueueToast]);

  useEffect(() => {
    if (!isLoaded || liveAlerts.length === 0) return;
    const criticals = liveAlerts.filter(a => a.severity?.toLowerCase() === "critical");
    const seenIds   = JSON.parse(sessionStorage.getItem("seenAlertIds") || "[]");
    const newAlerts = criticals.filter(a => !seenIds.includes(a.id));
    if (newAlerts.length > 0) {
      sessionStorage.setItem("seenAlertIds", JSON.stringify([...seenIds, ...newAlerts.map(a => a.id)]));
      enqueueToast(newAlerts);
      try { new Audio("/alert.mp3").play(); } catch(e) {}
    }
  }, [liveAlerts, isLoaded, enqueueToast]);

  const sensors = rawStationData.map(s => {
    const threshold   = STATION_THRESHOLDS[s.name] || 5.00;
    const computedPct = Math.min(100, Math.round((s.level / threshold) * 100));
    let uiColor = "var(--green)";
    if (s.status === "critical")     uiColor = "var(--red)";
    else if (s.status === "warning") uiColor = "var(--orange)";
    return { name: s.name, pct: computedPct, actualLevel: s.level, color: uiColor, coords: STATION_COORDS[s.name] || [6.55, 80.60], status: s.status, time: s.time };
  });

  const stats = [
    { label: "Active Sensors",  value: sensors.length < 10 ? `0${sensors.length}` : sensors.length, sub: "Kalu Ganga Basin Live", subColor: "var(--green)", icon: "📡" },
    { label: "Critical Alerts", value: criticalCount  < 10 ? `0${criticalCount}`  : criticalCount,  sub: "High Risk Priority",    subColor: "var(--red)",   valColor: "var(--red)", icon: "🚨" },
    {
      label: "Safe Locations",
      value: totalShelters < 10 ? `0${totalShelters}` : totalShelters,
      sub: "Registered Shelters",
      subColor: "var(--green)", valColor: "var(--green)",
      icon: <SafeShieldIcon size={64} color="var(--green)" />,
    },
  ];

  const getSeverityHelper = sev => {
    if (sev?.toLowerCase() === "critical") return { bg: "rgba(225,29,72,.08)", color: "#e11d48", icon: <WarningIcon size={18} color="#e11d48" /> };
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

  // ── Shimmer ──────────────────────────────────────────────────────────────────
  if (!isLoaded || rawStationData[0]?.loading) {
    return (
      <>
        <style>{proStyles}</style>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px 0" }}>
          <div className="shimmer-block" style={{ height: 60, width: "100%", borderRadius: 13 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="shimmer-block" style={{ height: 110, borderRadius: 16 }} />)}
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div className="shimmer-block" style={{ width: 360, height: 420, flexShrink: 0, borderRadius: 16 }} />
            <div className="shimmer-block" style={{ flex: 1, height: 420, borderRadius: 16 }} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div className="shimmer-block" style={{ flex: 1.5, height: 230, borderRadius: 16 }} />
            <div className="shimmer-block" style={{ flex: 1,   height: 230, borderRadius: 16 }} />
          </div>
        </div>
      </>
    );
  }

  const hasActiveCriticalAlerts = liveAlerts.some(a => a.severity?.toLowerCase() === "critical");

  return (
    <>
      <style>{globalCSS}</style>
      <style>{proStyles}</style>

      {toastItem && (
        <AlertToast item={toastItem} onDismiss={dismissToast} pending={pendingToasts} duration={TOAST_DURATION} />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Emergency bar */}
        {hasActiveCriticalAlerts && (
          <div className="fadeUp" style={{ background: "rgba(225,29,72,.06)", border: "1px solid rgba(225,29,72,.2)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="radar-emergency-node" style={{ width: 10, height: 10, borderRadius: "50%", display: "inline-block" }} />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--red)", textTransform: "uppercase", letterSpacing: ".6px" }}>Active Disaster Mitigation Protocol Engaged</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--red)", background: "rgba(225,29,72,.15)", padding: "2px 8px", borderRadius: 6 }}>
              {liveAlerts.filter(a => a.severity?.toLowerCase() === "critical").length} CRITICAL THREATS LIVE
            </span>
          </div>
        )}

        {isEmergency   && <BannerBase gradient="linear-gradient(90deg,#b91c1c,#7f1d1d)" glowColor="rgba(185,28,28,.20)" label="⚠ Emergency Mode Active"    message="All thresholds overridden. Broadcasting to all channels. Immediate action required." badge="EMERGENCY" />}
        {isMaintenance && <BannerBase gradient="linear-gradient(90deg,var(--orange),#92400e)" glowColor="rgba(224,120,0,.15)" label="⚠ Maintenance Mode Active" message="All alerts suppressed during scheduled maintenance." badge="MAINTENANCE" />}

        {/* Stat Cards */}
        <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
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

        {/* Map Row */}
        <div className="fadeUp" style={{ display: "flex", gap: 16 }}>
          <LeftSidebar sensors={sensors} iotDevice={iotDevice} />
          <Card style={{ flex: 1, padding: 0, overflow: "hidden", position: "relative", borderRadius: 16 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, color: "var(--text)", letterSpacing: ".5px" }}>
                <WarningIcon size={14} color="var(--orange)" />
                <span>AI PREDICTED FLOOD RISK AREAS</span>
              </div>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "var(--primary-bg)", color: "var(--primary)" }}>
                FORECAST OVERLAY
              </span>
            </div>
            <div style={{ height: "calc(100% - 49px)", minHeight: 380, position: "relative" }}>
              <Suspense fallback={<MapLoading />}>
                <AffectedMap layer="Map" />
              </Suspense>
            </div>
          </Card>
        </div>

        {/* Footer Row — Live Alerts + Shelter Readiness (graph removed) */}
        <div className="fadeUp" style={{ display: "flex", gap: 16 }}>

          {/* Live Alerts */}
          <Card style={{ flex: 1.5, padding: "20px 22px", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "var(--text)", textTransform: "uppercase", letterSpacing: ".6px" }}>
                Live Operational Alerts Stream
              </div>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "var(--green-bg)", color: "var(--green)" }}>LIVE FEED</span>
            </div>
            {liveAlerts.length === 0
              ? <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>No real-time database alerts triggered.</div>
              : liveAlerts.map((a, i) => {
                  const uiCfg = getSeverityHelper(a.severity);
                  return (
                    <div key={i} className="row-item">
                      <div className="icon-box" style={{ background: uiCfg.bg }}>{uiCfg.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{a.type}</span>
                          <span style={{ fontSize: 8.5, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: uiCfg.bg, color: uiCfg.color }}>{a.severity.toUpperCase()}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", background: "var(--primary-bg)", padding: "1px 6px", borderRadius: 5 }}>{a.area?.name || a.location || "Sector"}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{a.message}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", fontFamily: "monospace" }}>{new Date(a.detected_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                        <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 1, fontWeight: 600 }}>TRACKED</div>
                      </div>
                    </div>
                  );
                })
            }
          </Card>

          {/* Shelter Readiness — top 3 default, expand on click */}
          <ShelterReadiness liveShelters={liveShelters} />

        </div>
      </div>
    </>
  );
}