import { useState, useEffect } from "react";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const STATIONS = [
  { id: "ellagawa",   label: "Ellagawa",   river: "Kalu Ganga", thresholds: { alert: 10.00, minor: 10.70, major: 12.20 } },
  { id: "rathnapura", label: "Rathnapura", river: "Kalu Ganga", thresholds: { alert:  5.20, minor:  7.50, major:  9.50 } },
  { id: "putupaula",  label: "Putupaula",  river: "Kalu Ganga", thresholds: { alert:  3.00, minor:  4.00, major:  5.00 } },
];

const getRisk = (level) => {
  const s = (level ?? "normal").toLowerCase();
  if (s.includes("major")) return { color: "#ef4444", bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.25)",  label: "Major Flood", icon: "🔴", priority: 3 };
  if (s.includes("minor")) return { color: "#f97316", bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.25)", label: "Minor Flood", icon: "↑",  priority: 2 };
  if (s.includes("alert")) return { color: "#eab308", bg: "rgba(234,179,8,0.10)",  border: "rgba(234,179,8,0.25)",  label: "Alert",       icon: "⚠",  priority: 1 };
  return                          { color: "#22c55e", bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.25)",  label: "Normal",      icon: "✓",  priority: 0 };
};

const toHHMM = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};

// ── Risk Timeline (12 hourly rows as colored blocks) ─────────────────────────
const RiskTimeline = ({ rows }) => {
  if (!rows?.length) return null;
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: 0.5, color: "var(--text-muted)", marginBottom: 6 }}>
        12-Hour Risk Timeline
      </div>
      <div style={{ display: "flex", gap: 2, borderRadius: 8, overflow: "hidden" }}>
        {rows.map((r, i) => {
          const risk = getRisk(r.flood_risk_level);
          return (
            <div key={i} title={`${toHHMM(r.forecast_time)} — ${risk.label}`}
                 style={{
                   flex: 1, height: 28, background: risk.color,
                   opacity: 0.75 + (i / rows.length) * 0.25,
                   display: "flex", alignItems: "center", justifyContent: "center",
                   cursor: "default",
                 }}>
            </div>
          );
        })}
      </div>
      {/* Time labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 8, color: "var(--text-muted)", fontFamily: "DM Mono" }}>
          {toHHMM(rows[0]?.forecast_time)}
        </span>
        <span style={{ fontSize: 8, color: "var(--text-muted)", fontFamily: "DM Mono" }}>
          {toHHMM(rows[Math.floor(rows.length / 2)]?.forecast_time)}
        </span>
        <span style={{ fontSize: 8, color: "var(--text-muted)", fontFamily: "DM Mono" }}>
          {toHHMM(rows[rows.length - 1]?.forecast_time)}
        </span>
      </div>
    </div>
  );
};

// ── Threshold Bar ─────────────────────────────────────────────────────────────
const ThresholdBar = ({ label, threshold, peakLevel, color }) => {
  const pct      = Math.min(100, (peakLevel / threshold) * 100);
  const exceeded = peakLevel >= threshold;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: exceeded ? color : "var(--text-muted)",
                       textTransform: "uppercase", letterSpacing: 0.4 }}>
          {label}
        </span>
        <span style={{ fontSize: 9, fontWeight: 800, fontFamily: "DM Mono",
                       color: exceeded ? color : "var(--text-muted)" }}>
          {threshold}m {exceeded ? "⚠" : `· ${pct.toFixed(0)}%`}
        </span>
      </div>
      <div style={{ height: 5, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 4,
          background: color,
          boxShadow: exceeded ? `0 0 6px ${color}` : "none",
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
};

// ── Station Card ──────────────────────────────────────────────────────────────
const StationCard = ({ station, rows }) => {
  if (!rows?.length) return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 14, padding: 20, color: "var(--text-muted)", fontSize: 12 }}>
      No prediction data for {station.label}
    </div>
  );

  const thr = station.thresholds;

  // Worst risk across all 12 rows
  const worstRisk = rows.reduce((best, r) => {
    const rr = getRisk(r.flood_risk_level);
    return rr.priority > best.priority ? rr : best;
  }, getRisk("Normal"));

  // Latest row (last forecast hour)
  const latestRow = rows[rows.length - 1];
  const latestRisk = getRisk(latestRow?.flood_risk_level);

  // Peak predicted level
  const peakLevel = Math.max(...rows.map((r) => r.predicted_water_level));

  

  // Count hours per risk
  const counts = { Normal: 0, Alert: 0, "Minor Flood": 0, "Major Flood": 0 };
  rows.forEach((r) => { counts[getRisk(r.flood_risk_level).label] = (counts[getRisk(r.flood_risk_level).label] ?? 0) + 1; });

  return (
    <div style={{
      background: "var(--surface)",
      border: `1.5px solid ${worstRisk.border}`,
      borderRadius: 16, padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: 14,
      boxShadow: `0 4px 24px ${worstRisk.bg}`,
    }}>

      {/* ── Station name + badge ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "var(--text)" }}>{station.label}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
            {station.river} · {rows.length} hour forecast
          </div>
        </div>
        {/* Big risk badge */}
        <div style={{
          padding: "8px 16px", borderRadius: 12,
          background: worstRisk.bg, border: `1.5px solid ${worstRisk.border}`,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 20 }}>{worstRisk.icon}</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: worstRisk.color, marginTop: 2 }}>
            {worstRisk.label}
          </div>
        </div>
      </div>

      {/* ── Peak predicted level ── */}
      <div style={{
        background: worstRisk.bg, border: `1px solid ${worstRisk.border}`,
        borderRadius: 12, padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: 0.5, color: "var(--text-muted)", marginBottom: 4 }}>
            Peak Predicted Level (12H)
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: worstRisk.color,
                        fontFamily: "DM Mono", letterSpacing: -1, lineHeight: 1 }}>
            {peakLevel.toFixed(3)}
            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600, marginLeft: 4 }}>m</span>
          </div>
        </div>
        {/* Hour count pills */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
          {Object.entries(counts).filter(([, v]) => v > 0).map(([label, count]) => {
            const r = getRisk(label);
            return (
              <div key={label} style={{
                fontSize: 9, fontWeight: 700, color: r.color,
                background: r.bg, border: `1px solid ${r.border}`,
                padding: "2px 8px", borderRadius: 20,
              }}>
                {count}h {label}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 12H Risk Timeline ── */}
      <RiskTimeline rows={rows} />

      {/* ── Threshold bars ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: 0.5, color: "var(--text-muted)", marginBottom: 2 }}>
          Threshold Status
        </div>
        <ThresholdBar label="Alert"       threshold={thr.alert} peakLevel={peakLevel} color="#eab308" />
        <ThresholdBar label="Minor Flood" threshold={thr.minor} peakLevel={peakLevel} color="#f97316" />
        <ThresholdBar label="Major Flood" threshold={thr.major} peakLevel={peakLevel} color="#ef4444" />
      </div>

      {/* ── Forecast window ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: 10, borderTop: "1px solid var(--border)",
      }}>
        <div style={{ fontSize: 9, color: "var(--text-muted)" }}>
          Forecast window
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text)", fontFamily: "DM Mono" }}>
          {toHHMM(rows[0]?.forecast_time)} → {toHHMM(rows[rows.length-1]?.forecast_time)}
        </div>
      </div>
    </div>
  );
};

// ── Basin Summary ─────────────────────────────────────────────────────────────
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

  return (
    <div style={{
      background: "var(--surface)", border: `1.5px solid ${worstRisk.border}`,
      borderRadius: 14, padding: "16px 20px", marginBottom: 16,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 12,
      boxShadow: `0 2px 20px ${worstRisk.bg}`,
    }}>
      {/* Left: overall status */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: worstRisk.bg, border: `2px solid ${worstRisk.border}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
        }}>
          {worstRisk.icon}
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: 0.5, color: "var(--text-muted)", marginBottom: 3 }}>
            Basin-wide Flood Risk · Next 12 Hours
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: worstRisk.color, lineHeight: 1 }}>
            {worstRisk.label}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
            Kalu Ganga Basin · {STATIONS.length} stations monitored
          </div>
        </div>
      </div>

      {/* Right: per-station quick status */}
      <div style={{ display: "flex", gap: 8 }}>
        {STATIONS.map((s, i) => {
          const r = stationWorst[i];
          return (
            <div key={s.id} style={{
              padding: "10px 16px", borderRadius: 12, textAlign: "center",
              background: r.bg, border: `1.5px solid ${r.border}`, minWidth: 95,
            }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{r.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text)", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: r.color }}>{r.label}</div>
            </div>
          );
        })}
      </div>
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
      <div style={{ height: 82, background: "var(--surface-alt)", borderRadius: 14,
                    animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[1,2,3].map((i) => (
          <div key={i} style={{ height: 380, background: "var(--surface-alt)", borderRadius: 16,
                                animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div style={{ padding: 20, color: "var(--red)", fontSize: 13,
                  background: "var(--surface)", borderRadius: 14, border: "1px solid var(--border)" }}>
      ⚠ Failed to load: {error}
    </div>
  );

  return (
    <div className="fadeUp">
      <BasinSummary allData={allData} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {STATIONS.map((s) => (
          <StationCard key={s.id} station={s} rows={allData[s.id] ?? []} />
        ))}
      </div>
    </div>
  );
}