import { useState, useEffect } from "react";
import { Card, Badge } from "../../shared.jsx";

const BASE = import.meta.env.VITE_API_URL ?? "https://floodsense-api-389447895642.asia-southeast1.run.app0/api";

const STATIONS = [
  { id: "ellagawa",   label: "Ellagawa",   river: "Kalu Ganga", thresholds: { alert: 10.00, minor: 10.70, major: 12.20 } },
  { id: "rathnapura", label: "Rathnapura", river: "Kalu Ganga", thresholds: { alert:  5.20, minor:  7.50, major:  9.50 } },
  { id: "putupaula",  label: "Putupaula",  river: "Kalu Ganga", thresholds: { alert:  3.00, minor:  4.00, major:  5.00 } },
];

const getRisk = (level) => {
  const s = (level ?? "normal").toLowerCase();
  if (s.includes("major")) return { color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.20)",  glow: "rgba(239,68,68,0.15)",  label: "Major Flood", short: "MAJOR",  icon: "🔴", badge: "critical", priority: 3 };
  if (s.includes("minor")) return { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.20)", glow: "rgba(249,115,22,0.15)", label: "Minor Flood", short: "MINOR",  icon: "⬆",  badge: "high",     priority: 2 };
  if (s.includes("alert")) return { color: "#eab308", bg: "rgba(234,179,8,0.08)",  border: "rgba(234,179,8,0.20)",  glow: "rgba(234,179,8,0.15)",  label: "Alert",       short: "ALERT",  icon: "⚠",  badge: "medium",   priority: 1 };
  return                          { color: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.20)",  glow: "rgba(34,197,94,0.15)",  label: "Normal",      short: "NORMAL", icon: "✓",  badge: "safe",     priority: 0 };
};

const toHHMM = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};

// ── 12H Risk Timeline bar ─────────────────────────────────────────────────────
const RiskTimeline = ({ rows }) => {
  const [hovered, setHovered] = useState(null);
  if (!rows?.length) return null;
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: 0.4, color: "var(--text-muted)", marginBottom: 6 }}>
        Hourly Risk · Next 12H
      </div>
      <div style={{ display: "flex", gap: 2, position: "relative" }}>
        {rows.map((r, i) => {
          const risk = getRisk(r.flood_risk_level);
          const isHov = hovered === i;
          return (
            <div key={i} style={{ flex: 1, position: "relative" }}
                 onMouseEnter={() => setHovered(i)}
                 onMouseLeave={() => setHovered(null)}>
              <div style={{
                height: 32, background: risk.color,
                borderRadius: i === 0 ? "6px 0 0 6px" : i === rows.length - 1 ? "0 6px 6px 0" : 0,
                opacity: isHov ? 1 : 0.65,
                transition: "opacity .15s, transform .15s",
                transform: isHov ? "scaleY(1.15)" : "scaleY(1)",
                cursor: "default",
              }} />
              {isHov && (
                <div style={{
                  position: "absolute", bottom: 38, left: "50%", transform: "translateX(-50%)",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 6, padding: "4px 8px", zIndex: 20, whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(0,0,0,.3)",
                }}>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "DM Mono" }}>{toHHMM(r.forecast_time)}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: risk.color }}>{risk.label}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "DM Mono" }}>{toHHMM(rows[0]?.forecast_time)}</span>
        <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "DM Mono" }}>{toHHMM(rows[Math.floor(rows.length/2)]?.forecast_time)}</span>
        <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "DM Mono" }}>{toHHMM(rows[rows.length-1]?.forecast_time)}</span>
      </div>
    </div>
  );
};

// ── Threshold progress bar ────────────────────────────────────────────────────
const ThreshBar = ({ label, threshold, peakLevel, color }) => {
  const pct      = Math.min(100, (peakLevel / threshold) * 100);
  const exceeded = peakLevel >= threshold;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 70, fontSize: 9, fontWeight: 700, color: exceeded ? color : "var(--text-muted)",
                    textTransform: "uppercase", letterSpacing: 0.4, flexShrink: 0 }}>
        {label}
      </div>
      <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 4, background: color,
          boxShadow: exceeded ? `0 0 8px ${color}` : "none",
          transition: "width 0.8s ease",
        }} />
      </div>
      <div style={{ width: 46, fontSize: 9, fontWeight: 700, fontFamily: "DM Mono",
                    color: exceeded ? color : "var(--text-muted)", textAlign: "right", flexShrink: 0 }}>
        {threshold}m {exceeded ? "⚠" : ""}
      </div>
    </div>
  );
};

// ── Station Card ──────────────────────────────────────────────────────────────
const StationCard = ({ station, rows }) => {
  if (!rows?.length) return (
    <div style={{
      background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)",
      borderRadius: 14, padding: 20, color: "var(--text-muted)", fontSize: 12,
    }}>
      No prediction data for {station.label}
    </div>
  );

  const thr = station.thresholds;
  const worstRisk = rows.reduce((best, r) => {
    const rr = getRisk(r.flood_risk_level);
    return rr.priority > best.priority ? rr : best;
  }, getRisk("Normal"));

  const peakLevel = Math.max(...rows.map((r) => r.predicted_water_level));

  const counts = {};
  rows.forEach((r) => {
    const lbl = getRisk(r.flood_risk_level).label;
    counts[lbl] = (counts[lbl] ?? 0) + 1;
  });

  return (
    <div style={{
      background: "rgba(59,130,246,0.06)",
      border: "1px solid rgba(59,130,246,0.18)",
      borderRadius: 14,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Top accent strip — always light blue */}
      <div style={{ height: 3, background: "rgba(59,130,246,0.5)" }} />

      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{station.label}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
              {station.river} · {rows.length} hourly forecasts
            </div>
          </div>
          <Badge type={worstRisk.badge}>{worstRisk.short}</Badge>
        </div>

        {/* ── MAIN: Risk Level + Water Level ── */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "20px 16px", gap: 6,
          background: "rgba(59,130,246,0.04)",
          border: "1px solid rgba(59,130,246,0.12)",
          borderRadius: 12,
        }}>
          {/* Risk icon */}
          {/* <div style={{ fontSize: 32, marginBottom: 2 }}>{worstRisk.icon}</div> */}

          {/* Risk label — big and bold, colored by risk */}
          <div style={{
            fontSize: 28, fontWeight: 900, color: worstRisk.color,
            letterSpacing: -0.5, lineHeight: 1, textAlign: "center",
          }}>
            {worstRisk.label}
          </div>

          {/* Sub label */}
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: 0.5, color: "var(--text-muted)" }}>
            Flood Risk · Next 12H
          </div>

          {/* Divider */}
          <div style={{ width: 40, height: 1, background: "var(--border)", margin: "6px 0" }} />

          {/* Water level — smaller, below risk */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase",
                          letterSpacing: 0.5, color: "var(--text-muted)", marginBottom: 3 }}>
              Peak Water Level
            </div>
            <div style={{
              fontSize: 20, fontWeight: 900, fontFamily: "DM Mono",
              color: worstRisk.color, letterSpacing: -0.5,
            }}>
              {peakLevel.toFixed(2)}
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginLeft: 3 }}>m</span>
            </div>
          </div>

          {/* Hour pills */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
            {Object.entries(counts).map(([label, count]) => {
              const r = getRisk(label);
              return (
                <span key={label} style={{
                  fontSize: 9, fontWeight: 700, color: r.color,
                  background: `${r.color}18`, border: `1px solid ${r.color}40`,
                  padding: "2px 8px", borderRadius: 20,
                }}>
                  {count}h {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── 12H Timeline ── */}
        {/* <RiskTimeline rows={rows} /> */}

        {/* ── Threshold bars ── */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: 0.4, color: "var(--text-muted)", marginBottom: 8 }}>
            Threshold Status
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <ThreshBar label="Alert"  threshold={thr.alert} peakLevel={peakLevel} color="#eab308" />
            <ThreshBar label="Minor"  threshold={thr.minor} peakLevel={peakLevel} color="#f97316" />
            <ThreshBar label="Major"  threshold={thr.major} peakLevel={peakLevel} color="#ef4444" />
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 10, borderTop: "1px solid rgba(59,130,246,0.15)",
        }}>
         
        </div>

      </div>
    </div>
  );
};

// ── Basin Summary Card ────────────────────────────────────────────────────────
const BasinSummary = ({ allData }) => {
  const allRows   = Object.values(allData).flat();
  const worstRisk = allRows.reduce((best, r) => {
    const rr = getRisk(r.flood_risk_level);
    return rr.priority > best.priority ? rr : best;
  }, getRisk("Normal"));

  const stationWorst = STATIONS.map((s) =>
    (allData[s.id] ?? []).reduce((best, r) => {
      const rr = getRisk(r.flood_risk_level);
      return rr.priority > best.priority ? rr : best;
    }, getRisk("Normal"))
  );

  // Total hour counts across all stations
  const totalCounts = { Normal: 0, Alert: 0, "Minor Flood": 0, "Major Flood": 0 };
  allRows.forEach((r) => {
    const lbl = getRisk(r.flood_risk_level).label;
    totalCounts[lbl] = (totalCounts[lbl] ?? 0) + 1;
  });

  return (
    <div className="fadeUp" style={{
      marginBottom: 14, padding: "16px 20px",
      background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.18)",
      borderRadius: 14,
    }}>
     
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FloodPredictionTab() {
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          STATIONS.map((s) =>
            fetch(`${BASE}/flood-predictions/${s.label}`)
              .then((r) => { if (!r.ok) throw new Error(`${s.label}: ${r.status}`); return r.json(); })
              .then((rows) => ({ id: s.id, rows }))
          )
        );
        const map = {};
        results.forEach(({ id, rows }) => { map[id] = rows; });
        setAllData(map);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ height: 90, background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 14, animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[1,2,3].map((i) => (
          <div key={i} style={{ height: 400, background: "var(--surface)", border: "1px solid var(--border)",
                                borderRadius: 14, animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    </div>
  );

  if (error) return (
    <Card style={{ padding: 20, color: "var(--red)", fontSize: 13 }}>
      ⚠ Failed to load flood predictions: {error}
    </Card>
  );

  return (
    <>
      
      <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {STATIONS.map((s) => (
          <StationCard key={s.id} station={s} rows={allData[s.id] ?? []} />
        ))}
      </div>
    </>
  );
}