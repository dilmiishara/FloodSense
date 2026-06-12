import { useState, useEffect, useRef, useCallback } from "react";
import { fetchStationHistory, fetchStationPredictions } from "../../api/services/waterLevelChartService";

const STATIONS = [
  { id: "ellagawa",   label: "Ellagawa",   river: "Kalu Ganga" },
  { id: "rathnapura", label: "Rathnapura", river: "Kalu Ganga" },
  { id: "putupaula",  label: "Putupaula",  river: "Kalu Ganga" },
];

const toHHMM = (ts) => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// For predicted line — color by risk
const riskColor = (status) => {
  const s = (status ?? "").toLowerCase();
  if (s.includes("major"))  return "#ef4444"; // red
  if (s.includes("minor"))  return "#f97316"; // orange
  if (s.includes("alert"))  return "#eab308"; // yellow
  return "#22c55e";                           // green — normal
};

// For past line — always blue regardless of status
const pastColor = () => "#4a9eff";

// ── Chart ─────────────────────────────────────────────────────────────────────
const Chart = ({ past, current, predictions }) => {
  const svgRef     = useRef(null);
  const tooltipRef = useRef(null);

const pastPoints = (past ?? []).map((p) => ({
    label:  toHHMM(p.recorded_at),
    value:  p.water_level,
    type:   "past",
    status: p.alert_status,
    color:  pastColor(),
  }));
 const currentPoint = current
    ? [{
        label:  toHHMM(current.recorded_at),
        value:  current.water_level,
        type:   "current",
       status: current.alert_status,
        color:  pastColor(),
      }]
    : [];
 const predPoints = (predictions ?? []).map((p) => ({
    label:  toHHMM(p.forcast_time),
    value:  p.predicted_water_level,
    type:   "pred",
    risk:   p.flood_risk_level,
    color:  riskColor(p.flood_risk_level),
  }));

  const allPoints = [...pastPoints, ...currentPoint, ...predPoints];

  if (allPoints.length === 0) return (
    <div style={{ height: 80, display: "flex", alignItems: "center",
                  justifyContent: "center", color: "var(--text-muted)", fontSize: 11 }}>
      No data
    </div>
  );

  // ── Dimensions ──────────────────────────────────────────────────────────────
  const W = 440, H = 95;
  const padL = 34, padR = 10, padT = 18, padB = 22;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const vals = allPoints.map((p) => p.value);
  const minV = Math.max(0, Math.min(...vals) - 0.3);
  const maxV = Math.max(...vals) + 0.3;
  const ty = (v) => padT + (1 - (v - minV) / (maxV - minV)) * chartH;

  // ── Fixed NOW at center ──────────────────────────────────────────────────────
  const nowX   = padL + chartW * 0.5;
  const leftW  = chartW * 0.5;
  const rightW = chartW * 0.5;
  const nPast  = pastPoints.length;
  const nPred  = predPoints.length;

  const txPast = (i) => nPast <= 1 ? padL : padL + (i / (nPast - 1)) * leftW;
  const txPred = (i) => nPred <= 0 ? nowX : nowX + ((i + 1) / nPred) * rightW;

  // ── Build paths ──────────────────────────────────────────────────────────────
  const pastAllPts = [
    ...pastPoints.map((p, i) => ({ ...p, x: txPast(i) })),
    ...(currentPoint.length ? [{ ...currentPoint[0], x: nowX }] : []),
  ];

  const pastPath = pastAllPts.length > 1
    ? pastAllPts.map((p, i) => {
        if (i === 0) return `M ${p.x},${ty(p.value)}`;
        const prev = pastAllPts[i - 1];
        const cpx1 = prev.x + (p.x - prev.x) / 2;
        const cpx2 = p.x - (p.x - prev.x) / 2;
        return `C ${cpx1},${ty(prev.value)} ${cpx2},${ty(p.value)} ${p.x},${ty(p.value)}`;
      }).join(" ")
    : null;

  const predStart  = currentPoint[0] ?? pastPoints[pastPoints.length - 1];
 const predAllPts = predStart
    ? [{ ...predStart, x: nowX, color: riskColor(predPoints[0]?.risk) }, ...predPoints.map((p, i) => ({ ...p, x: txPred(i) }))]
    : [];

  const predPath = predPoints.length > 0 && predAllPts.length > 1
    ? predAllPts.map((p, i) => {
        if (i === 0) return `M ${p.x},${ty(p.value)}`;
        const prev = predAllPts[i - 1];
        const cpx1 = prev.x + (p.x - prev.x) / 2;
        const cpx2 = p.x - (p.x - prev.x) / 2;
        return `C ${cpx1},${ty(prev.value)} ${cpx2},${ty(p.value)} ${p.x},${ty(p.value)}`;
      }).join(" ")
    : null;

  const lastPredX  = nPred > 0 ? txPred(nPred - 1) : nowX;
  const pastFill   = pastPath ? pastPath + ` L ${nowX},${padT + chartH} L ${padL},${padT + chartH} Z` : null;
  const predFill   = predPath ? predPath + ` L ${lastPredX},${padT + chartH} L ${nowX},${padT + chartH} Z` : null;

  // ── Threshold ────────────────────────────────────────────────────────────────
  const THRESHOLD = 5.2;
  const threshY   = ty(THRESHOLD);
  const showThr   = THRESHOLD >= minV && THRESHOLD <= maxV;

  // ── Tooltip ──────────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const svg = svgRef.current, tip = tooltipRef.current;
    if (!svg || !tip) return;
    const rect  = svg.getBoundingClientRect();
    const svgX  = ((e.clientX - rect.left) / rect.width) * W;
    // Find nearest point by x position
    const allPts = [
      ...pastAllPts,
      ...predAllPts.slice(1), // skip duplicated nowX start
    ];
    const nearest = allPts.reduce((best, p) =>
      Math.abs(p.x - svgX) < Math.abs(best.x - svgX) ? p : best, allPts[0]);
    if (!nearest) return;
    const tipX = (nearest.x / W) * rect.width;
    const tipY = (ty(nearest.value) / H) * rect.height;
    tip.style.display = "block";
    tip.style.left = `${Math.min(tipX + 8, rect.width - 120)}px`;
    tip.style.top  = `${Math.max(tipY - 55, 2)}px`;
    tip.innerHTML = `
      <div style="font-size:8px;color:#aaa;font-weight:700;margin-bottom:2px">
        ${nearest.type === "pred" ? "🔮 PREDICTED" : nearest.type === "current" ? "⬤ NOW" : "📊 PAST"} · ${nearest.label}
      </div>
      <div style="font-size:14px;font-weight:900;color:#fff;font-family:monospace">
        ${nearest.value.toFixed(2)}<span style="font-size:9px;color:#888;margin-left:2px">m</span>
      </div>
      ${nearest.risk ? `<div style="font-size:8px;color:${nearest.risk==="High"?"var(--red)":nearest.risk==="Medium"?"var(--orange)":"var(--green)"};margin-top:1px;font-weight:700">Risk: ${nearest.risk}</div>` : ""}
    `;
  }, [pastAllPts, predAllPts]);

  const handleMouseLeave = () => { if (tooltipRef.current) tooltipRef.current.style.display = "none"; };

  // ── X-axis labels ────────────────────────────────────────────────────────────
  const xLabels = [
    ...(nPast > 0 ? [{ x: txPast(0), label: pastPoints[0].label, type: "past" }] : []),
    ...(nPast > 2 ? [{ x: txPast(Math.floor(nPast / 2)), label: pastPoints[Math.floor(nPast / 2)].label, type: "past" }] : []),
    ...(currentPoint.length > 0 ? [{ x: nowX, label: currentPoint[0].label, type: "current" }] : []),
    ...(nPred > 0 ? [{ x: txPred(Math.floor(nPred / 2)), label: predPoints[Math.floor(nPred / 2)].label, type: "pred" }] : []),
    ...(nPred > 1 ? [{ x: txPred(nPred - 1), label: predPoints[nPred - 1].label, type: "pred" }] : []),
  ];

  return (
    <div style={{ position: "relative" }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
           style={{ width: "100%", display: "block", overflow: "visible", cursor: "crosshair" }}>
        <defs>
          <linearGradient id="gPred" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--red)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--red)" stopOpacity="0"    />
          </linearGradient>
          <linearGradient id="gPast" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#4a9eff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#4a9eff" stopOpacity="0"    />
          </linearGradient>
        </defs>

        {/* Y grid + labels */}
        {Array.from({ length: 4 }, (_, i) => {
          const v = minV + ((maxV - minV) * i) / 3;
          const y = ty(v);
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y}
                    stroke="rgba(128,128,128,0.08)" strokeWidth="0.7" />
              <text x={padL - 3} y={y + 3} fontSize="6" fill="var(--text-muted)"
                    textAnchor="end" fontFamily="DM Mono">{v.toFixed(1)}m</text>
            </g>
          );
        })}

        {/* Threshold line */}
        {showThr && (
          <>
            <line x1={padL} y1={threshY} x2={W - padR} y2={threshY}
                  stroke="var(--red)" strokeWidth="0.7" strokeDasharray="3,3" opacity=".5" />
            <text x={W - padR + 1} y={threshY - 2} fontSize="5.5"
                  fill="var(--red)" fontWeight="700">{THRESHOLD}m</text>
          </>
        )}

        {/* NOW divider */}
        <line x1={nowX} y1={padT} x2={nowX} y2={padT + chartH}
              stroke="var(--text-mid)" strokeWidth="1" strokeDasharray="3,3" opacity=".4" />
        <rect x={nowX - 11} y={padT - 12} width="22" height="9" rx="2"
              fill="var(--text)" opacity=".85" />
        <text x={nowX} y={padT - 5} fontSize="5.5" fill="var(--surface)"
              textAnchor="middle" fontWeight="700" fontFamily="DM Mono">NOW</text>

        {/* Section labels */}
        <text x={padL + 6} y={padT + 9} fontSize="6.5" fill="#4a9eff"
              fontWeight="700" opacity=".6">← Past 12H</text>
        {nPred > 0 && (
          <text x={nowX + 6} y={padT + 9} fontSize="6.5" fill="var(--red)"
                fontWeight="700" opacity=".6">Next 12H →</text>
        )}

        {/* Area fills */}
        {pastFill && <path d={pastFill} fill="url(#gPast)" />}
        {predFill && <path d={predFill} fill="url(#gPred)" />}

{/* Past line — segmented by risk color */}
        {pastAllPts.slice(0, -1).map((p, i) => {
          const next = pastAllPts[i + 1];
          const cpx1 = p.x + (next.x - p.x) / 2;
          const cpx2 = next.x - (next.x - p.x) / 2;
          return (
            <path key={"ps" + i}
              d={`M ${p.x},${ty(p.value)} C ${cpx1},${ty(p.value)} ${cpx2},${ty(next.value)} ${next.x},${ty(next.value)}`}
              fill="none" stroke={p.color ?? "#22c55e"}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          );
        })}

        {/* Predicted line — segmented by risk color */}
        {predAllPts.slice(0, -1).map((p, i) => {
          const next = predAllPts[i + 1];
          const cpx1 = p.x + (next.x - p.x) / 2;
          const cpx2 = next.x - (next.x - p.x) / 2;
          return (
            <path key={"pr" + i}
              d={`M ${p.x},${ty(p.value)} C ${cpx1},${ty(p.value)} ${cpx2},${ty(next.value)} ${next.x},${ty(next.value)}`}
              fill="none" stroke={p.color ?? "#22c55e"}
              strokeWidth="1.8" strokeDasharray="5,3"
              strokeLinecap="round" strokeLinejoin="round" />
          );
        })}

        {/* Current dot */}
        {currentPoint.length > 0 && (
          <>
            <circle cx={nowX} cy={ty(currentPoint[0].value)} r="5"
                    fill="#4a9eff" opacity=".15" />
           <circle cx={nowX} cy={ty(currentPoint[0].value)} r="3"
                    fill={currentPoint[0].color ?? "#22c55e"} stroke="var(--surface)" strokeWidth="1.2" />
          </>
        )}

        {/* X-axis labels */}
        {xLabels.map(({ x, label, type }, i) => (
          <text key={i} x={x} y={H - 4} fontSize="6"
                fill={type === "current" ? "var(--text)" : type === "pred" ? "var(--red)" : "var(--text-muted)"}
                textAnchor="middle" fontFamily="DM Mono"
                fontWeight={type === "current" ? "700" : "400"}>
            {label}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      <div ref={tooltipRef} style={{
        display: "none", position: "absolute", background: "rgba(15,15,30,0.95)",
        color: "#fff", padding: "6px 10px", borderRadius: 7, fontSize: 11,
        pointerEvents: "none", zIndex: 20, minWidth: 100,
        boxShadow: "0 4px 16px rgba(0,0,0,.4)",
        border: "1px solid rgba(255,255,255,.08)",
      }} />
    </div>
  );
};

// ── Stats Panel ───────────────────────────────────────────────────────────────
const StatsPanel = ({ current, predictions }) => (
  <div style={{
    display: "flex", flexDirection: "column", justifyContent: "center",
    gap: 12, paddingLeft: 16, minWidth: 120,
    borderLeft: "1px solid var(--border)",
  }}>
    {[
      { label: "Current Level", value: current ? `${current.water_level.toFixed(2)} m` : "—", color: "#4a9eff"         },
      { label: "Last Updated",  value: current ? toHHMM(current.recorded_at) : "—",            color: "var(--text-mid)" },
      { label: "Predictions",   value: `${predictions?.length ?? 0} pts (next 12H)`,            color: "var(--red)"     },
    ].map(({ label, value, color }) => (
      <div key={label}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: 0.6, color: "var(--text-muted)", marginBottom: 3 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 900, color, fontFamily: "DM Mono" }}>
          {value}
        </div>
      </div>
    ))}
  </div>
);

// ── Legend ────────────────────────────────────────────────────────────────────
const Legend = () => (
  <div style={{ display: "flex", gap: 14, marginBottom: 8, flexWrap: "wrap" }}>
    {[
      ["#4a9eff", "Past level", "solid" ],
      ["#22c55e", "Normal",     "dashed"],
      ["#eab308", "Alert",      "dashed"],
      ["#f97316", "Minor",      "dashed"],
      ["#ef4444", "Major",      "dashed"],
    ].map(([c, l, s], i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <svg width="16" height="6">
          <line x1="0" y1="3" x2="16" y2="3" stroke={c} strokeWidth="2"
                strokeDasharray={s === "dashed" ? "3,2" : "0"} />
        </svg>
        <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{l}</span>
      </div>
    ))}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function WaterLevelSliderChart() {
  const [activeIdx, setActiveIdx]     = useState(0);
  const [stationData, setStationData] = useState({});
  const [loading, setLoading]         = useState({});
  const [error, setError]             = useState({});

  const station = STATIONS[activeIdx];

  useEffect(() => {
    const sid = station.id;
    if (stationData[sid]) return;
    setLoading((l) => ({ ...l, [sid]: true  }));
    setError((e)   => ({ ...e, [sid]: null  }));
    Promise.all([
      fetchStationHistory(station.label),
      fetchStationPredictions(station.label),
    ])
      .then(([h, p]) => setStationData((d) => ({
        ...d, [sid]: { past: h.past, current: h.current, predictions: p.predictions },
      })))
      .catch((err) => setError((e) => ({ ...e, [sid]: err.message })))
      .finally(()  => setLoading((l) => ({ ...l, [sid]: false })));
  }, [activeIdx]);

  const data      = stationData[station.id];
  const isLoading = loading[station.id];
  const isError   = error[station.id];

  return (
<div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 14, padding: "14px 16px",
      width: "100%", boxSizing: "border-box",
    }}>   

      {/* ── Title ── */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
          Water Level — Past 12H + Next 12H
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
          Kalu Ganga basin · FloodSense ML · Hover for details
        </div>
      </div>

      {/* ── Station slider — centered ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setActiveIdx((i) => (i - 1 + STATIONS.length) % STATIONS.length)}
            style={{
              width: 26, height: 26, borderRadius: "50%", border: "1px solid var(--border)",
              background: "var(--surface-alt)", color: "var(--text)", fontSize: 15,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>‹</button>

          <div style={{
            background: "rgba(59,130,246,0.12)",
            border: "1.5px solid var(--primary)",
            borderRadius: 8, padding: "5px 18px", textAlign: "center", minWidth: 110,
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--primary)" }}>
              {station.label}
            </div>
            <div style={{ fontSize: 8, color: "var(--text-muted)", marginTop: 1 }}>
              {station.river} · {activeIdx + 1}/{STATIONS.length}
            </div>
          </div>

          <button onClick={() => setActiveIdx((i) => (i + 1) % STATIONS.length)}
            style={{
              width: 26, height: 26, borderRadius: "50%", border: "1px solid var(--border)",
              background: "var(--surface-alt)", color: "var(--text)", fontSize: 15,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>›</button>
        </div>

        {/* Dot indicators */}
        <div style={{ display: "flex", gap: 4 }}>
          {STATIONS.map((_, i) => (
            <button key={i} onClick={() => setActiveIdx(i)} style={{
              width: i === activeIdx ? 14 : 5, height: 5, borderRadius: 3,
              border: "none", cursor: "pointer", padding: 0,
              background: i === activeIdx ? "var(--primary)" : "var(--border)",
              transition: "width .2s, background .2s",
            }} />
          ))}
        </div>
      </div>

  {/* ── Chart + Stats row ── */}
      <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>

        {/* Chart */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Legend />
          {isLoading && (
            <div style={{
              height: 120, background: "var(--surface-alt)", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "pulse 1.5s ease-in-out infinite",
              color: "var(--text-muted)", fontSize: 11,
            }}>Loading station data…</div>
          )}
          {isError && !isLoading && (
            <div style={{
              height: 95, display: "flex", alignItems: "center",
              justifyContent: "center", color: "var(--red)", fontSize: 11,
            }}>⚠ {isError}</div>
          )}
          {!isLoading && !isError && data && (
            <Chart past={data.past} current={data.current} predictions={data.predictions} />
          )}
        </div>

        {/* Stats */}
        {!isLoading && !isError && data?.current && (
          <StatsPanel current={data.current} predictions={data.predictions} />
        )}
      </div>
    </div>
  );
}