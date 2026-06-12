import { useState, useEffect, useRef, useCallback } from "react";
import { fetchStationHistory, fetchStationPredictions } from "../../api/services/waterLevelChartService";

// ── Stations list ─────────────────────────────────────────────────────────────
const STATIONS = [
  { id: "ellagawa",   label: "Ellagawa",   river: "Kalu Ganga" },
  { id: "rathnapura", label: "Rathnapura", river: "Kalu Ganga" },
  { id: "putupaula",  label: "Putupaula",  river: "Kalu Ganga" },
];

// ── Tiny helper: format a timestamp → "HH:MM" ─────────────────────────────────
const toHHMM = (ts) => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// ── SVG Chart ─────────────────────────────────────────────────────────────────
const Chart = ({ past, current, predictions }) => {
  const svgRef     = useRef(null);
  const tooltipRef = useRef(null);

  // Merge all points into one timeline
  // past: [{recorded_at, water_level}]  → x = index,  type = "past"
  // current: {recorded_at, water_level}  → type = "current"
  // predictions: [{forcast_time, predicted_water_level, flood_risk_level}] → type = "pred"

  const pastPoints = (past ?? []).map((p, i) => ({
    label:  toHHMM(p.recorded_at),
    value:  p.water_level,
    type:   "past",
    raw:    p,
  }));

  const currentPoint = current
    ? [{ label: toHHMM(current.recorded_at), value: current.water_level, type: "current", raw: current }]
    : [];

  const predPoints = (predictions ?? []).map((p) => ({
    label: toHHMM(p.forcast_time),
    value: p.predicted_water_level,
    type:  "pred",
    risk:  p.flood_risk_level,
    raw:   p,
  }));

  const allPoints = [...pastPoints, ...currentPoint, ...predPoints];

  if (allPoints.length === 0) {
    return (
      <div style={{ height: 200, display: "flex", alignItems: "center",
                    justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
        No data available
      </div>
    );
  }

  // ── SVG dimensions ──────────────────────────────────────────────────────────
  const W = 560, H = 160;
  const padL = 46, padR = 20, padT = 20, padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = allPoints.length;

  const allValues = allPoints.map((p) => p.value);
  const minV = Math.max(0, Math.min(...allValues) - 0.5);
  const maxV = Math.max(...allValues) + 0.5;

  const tx = (i) => padL + (i / (n - 1)) * chartW;
  const ty = (v) => padT + (1 - (v - minV) / (maxV - minV)) * chartH;

  // Current point index
  const curIdx = pastPoints.length; // index in allPoints where current sits

  // Build path strings
  const pastPath = pastPoints.length > 0
    ? [...pastPoints, ...(currentPoint.length ? currentPoint : [])]
        .map((p, i) => `${i === 0 ? "M" : "L"} ${tx(i)},${ty(p.value)}`)
        .join(" ")
    : null;

  const predStartIdx = curIdx; // current point is shared start of pred line
  const predPath = predPoints.length > 0
    ? [currentPoint[0] ?? pastPoints[pastPoints.length - 1], ...predPoints]
        .map((p, i) => `${i === 0 ? "M" : "L"} ${tx(predStartIdx + i)},${ty(p.value)}`)
        .join(" ")
    : null;

  // Fill under predicted area
  const predFillPath = predPath
    ? predPath
        + ` L ${tx(n - 1)},${padT + chartH} L ${tx(predStartIdx)},${padT + chartH} Z`
    : null;

  // Threshold line (5.2m — adjust to your basin threshold)
  const THRESHOLD = 5.2;
  const threshY = ty(THRESHOLD);
  const showThreshold = THRESHOLD >= minV && THRESHOLD <= maxV;

  // ── Tooltip ─────────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const svg = svgRef.current;
    const tip = tooltipRef.current;
    if (!svg || !tip || n === 0) return;
    const rect  = svg.getBoundingClientRect();
    const pct   = (e.clientX - rect.left) / rect.width;
    const idx   = Math.min(n - 1, Math.max(0, Math.round(pct * (n - 1))));
    const pt    = allPoints[idx];
    const tipX  = (tx(idx) / W) * rect.width;
    const tipY  = (ty(pt.value) / H) * rect.height;

    const riskColor =
      pt.risk === "High"   ? "var(--red)"    :
      pt.risk === "Medium" ? "var(--orange)" :
      pt.risk === "Low"    ? "var(--green)"  : null;

    tip.style.display = "block";
    tip.style.left    = `${Math.min(tipX + 10, rect.width - 150)}px`;
    tip.style.top     = `${Math.max(tipY - 70, 4)}px`;
    tip.innerHTML = `
      <div style="font-size:9px;color:#aaa;font-weight:700;letter-spacing:.5px;margin-bottom:3px">
        ${pt.type === "pred" ? "🔮 PREDICTED" : pt.type === "current" ? "⬤ CURRENT" : "📊 PAST"} · ${pt.label}
      </div>
      <div style="font-size:15px;font-weight:900;color:#fff;font-family:DM Mono,monospace">
        ${pt.value.toFixed(2)}<span style="font-size:10px;color:#888;margin-left:2px">m</span>
      </div>
      ${pt.risk ? `<div style="font-size:10px;font-weight:700;color:${riskColor};margin-top:3px">Risk: ${pt.risk}</div>` : ""}
      <div style="font-size:9px;color:${pt.value >= THRESHOLD ? "var(--red)" : "#666"};margin-top:3px;font-weight:600">
        ${pt.value >= THRESHOLD ? "⚠ Above threshold" : "✓ Below threshold"}
      </div>
    `;
  }, [allPoints, n]);

  const handleMouseLeave = () => {
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
  };

  // X-axis labels: show every ~3rd point to avoid crowding
  const xLabels = allPoints
    .map((p, i) => ({ i, label: p.label, type: p.type }))
    .filter((_, i) => i === 0 || i === curIdx || i === n - 1 || i % 3 === 0);

  return (
   <div style={{ position: "relative", width: "100%", overflowX: "hidden" }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
           style={{ width: "100%", display: "block", overflow: "visible", cursor: "crosshair" }}>
        <defs>
          <linearGradient id="predFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--red)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--red)" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="pastFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#4a9eff" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#4a9eff" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid lines + Y-axis labels */}
        {Array.from({ length: 5 }, (_, i) => {
          const v = minV + ((maxV - minV) * i) / 4;
          const y = ty(v);
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y}
                    stroke="rgba(128,128,128,0.10)" strokeWidth="1" />
              <text x={padL - 4} y={y + 3} fontSize="8" fill="var(--text-muted)"
                    textAnchor="end" fontFamily="DM Mono">{v.toFixed(1)}m</text>
            </g>
          );
        })}

        {/* Threshold line */}
        {showThreshold && (
          <>
            <line x1={padL} y1={threshY} x2={W - padR} y2={threshY}
                  stroke="var(--red)" strokeWidth="1.2" strokeDasharray="5,4" opacity=".55" />
            <text x={W - padR + 2} y={threshY + 3} fontSize="8"
                  fill="var(--red)" fontWeight="700">{THRESHOLD}m ⚠</text>
          </>
        )}

        {/* Divider: NOW line */}
        {currentPoint.length > 0 && (
          <>
            <line x1={tx(curIdx)} y1={padT - 8} x2={tx(curIdx)} y2={padT + chartH}
                  stroke="var(--text-mid)" strokeWidth="1.5" strokeDasharray="4,3" opacity=".45" />
            <rect x={tx(curIdx) - 18} y={padT - 18} width="36" height="13" rx="4" fill="var(--text)" />
            <text x={tx(curIdx)} y={padT - 7} fontSize="8" fill="var(--surface)"
                  textAnchor="middle" fontWeight="700">NOW</text>
          </>
        )}

        {/* Past area fill */}
        {pastPath && (
          <path
            d={pastPath + ` L ${tx(curIdx)},${padT + chartH} L ${tx(0)},${padT + chartH} Z`}
            fill="url(#pastFill)"
          />
        )}

        {/* Predicted area fill */}
        {predFillPath && <path d={predFillPath} fill="url(#predFill)" />}

        {/* Past line */}
        {pastPath && (
          <path d={pastPath} fill="none" stroke="#4a9eff"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Predicted line */}
        {predPath && (
          <path d={predPath} fill="none" stroke="var(--red)"
                strokeWidth="2.5" strokeDasharray="8,4"
                strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Past dots (sparse) */}
        {pastPoints.filter((_, i) => i % 3 === 0).map((p, i) => (
          <circle key={"pd" + i} cx={tx(i * 3)} cy={ty(p.value)}
                  r="2.5" fill="#4a9eff" opacity=".45" />
        ))}

        {/* Predicted dots (sparse) */}
        {predPoints.filter((_, i) => i % 3 === 0).map((p, i) => (
          <circle key={"rd" + i} cx={tx(curIdx + 1 + i * 3)} cy={ty(p.value)}
                  r="2.5" fill="var(--red)" opacity=".4" />
        ))}

        {/* Current dot — prominent */}
        {currentPoint.length > 0 && (
          <>
            <circle cx={tx(curIdx)} cy={ty(currentPoint[0].value)} r="7"
                    fill="#4a9eff" opacity=".18" />
            <circle cx={tx(curIdx)} cy={ty(currentPoint[0].value)} r="4.5"
                    fill="#4a9eff" stroke="#fff" strokeWidth="1.5" />
          </>
        )}

        {/* X-axis labels */}
        {xLabels.map(({ i, label, type }) => (
          <text key={"xl" + i} x={tx(i)} y={H - 4} fontSize="8"
                fill={type === "current" ? "var(--text)" : type === "pred" ? "var(--red)" : "var(--text-muted)"}
                textAnchor="middle" fontFamily="DM Mono"
                fontWeight={type === "current" ? "700" : "400"}>
            {label}
          </text>
        ))}

        {/* Section labels */}
        <text x={padL + 10} y={padT + 10} fontSize="9" fill="#4a9eff"
              fontWeight="700" opacity=".7">← PAST 12H</text>
        {predPoints.length > 0 && (
          <text x={tx(curIdx + 1) + 6} y={padT + 10} fontSize="9"
                fill="var(--red)" fontWeight="700" opacity=".7">NEXT 12H →</text>
        )}
      </svg>

      {/* Tooltip */}
      <div ref={tooltipRef} style={{
        display: "none", position: "absolute",
        background: "#1a1a2e", color: "#fff",
        padding: "8px 12px", borderRadius: 8, fontSize: 11,
        pointerEvents: "none", zIndex: 10, minWidth: 140,
        boxShadow: "0 4px 16px rgba(0,0,0,.35)",
        border: "1px solid rgba(255,255,255,.09)",
      }} />
    </div>
  );
};

// ── Legend ────────────────────────────────────────────────────────────────────
const Legend = () => (
  <div style={{ display: "flex", gap: 18, marginBottom: 10 }}>
    {[
      ["#4a9eff", "Past water level",      "solid" ],
      ["var(--red)", "Predicted level",    "dashed"],
      ["var(--text-mid)", "NOW marker",    "dashed"],
    ].map(([c, l, s], i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <svg width="22" height="8">
          <line x1="0" y1="4" x2="22" y2="4" stroke={c} strokeWidth="2"
                strokeDasharray={s === "dashed" ? "5,3" : "0"} />
        </svg>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{l}</span>
      </div>
    ))}
  </div>
);

// ── Main exported component ───────────────────────────────────────────────────
export default function WaterLevelSliderChart() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [stationData, setStationData]   = useState({}); // keyed by station id
  const [loading, setLoading]           = useState({});
  const [error, setError]               = useState({});

  const station = STATIONS[activeIdx];

  // Fetch when station changes
  useEffect(() => {
    const sid = station.id;
    if (stationData[sid]) return; // already loaded, use cache

    setLoading((l) => ({ ...l, [sid]: true }));
    setError((e)   => ({ ...e, [sid]: null  }));

    Promise.all([
      fetchStationHistory(station.label),      // pass station_name as stored in DB
      fetchStationPredictions(station.label),
    ])
      .then(([histRes, predRes]) => {
        setStationData((d) => ({
          ...d,
          [sid]: {
            past:        histRes.past,
            current:     histRes.current,
            predictions: predRes.predictions,
          },
        }));
      })
      .catch((err) => setError((e) => ({ ...e, [sid]: err.message })))
      .finally(()  => setLoading((l) => ({ ...l, [sid]: false })));
  }, [activeIdx]);

  const data    = stationData[station.id];
  const isLoading = loading[station.id];
  const isError   = error[station.id];

  return (
<div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 14, padding: "20px 22px",
      width: "100%", boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
          Water Level — Past 12H + Next 12H Prediction
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
          Kalu Ganga basin · FloodSense ML · Hover chart for details
        </div>
      </div>

      {/* Station Slider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        {/* Left arrow */}
        <button
          onClick={() => setActiveIdx((i) => (i - 1 + STATIONS.length) % STATIONS.length)}
          style={{
            width: 34, height: 34, borderRadius: "50%", border: "1.5px solid var(--border)",
            background: "var(--surface-alt)", color: "var(--text)", fontSize: 16,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >‹</button>

        {/* Station name pill */}
        <div style={{
          flex: 1, background: "var(--surface-alt)", border: "1.5px solid var(--border)",
          borderRadius: 10, padding: "10px 16px", textAlign: "center",
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>
            {station.label}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
            {station.river} · Station {activeIdx + 1} of {STATIONS.length}
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={() => setActiveIdx((i) => (i + 1) % STATIONS.length)}
          style={{
            width: 34, height: 34, borderRadius: "50%", border: "1.5px solid var(--border)",
            background: "var(--surface-alt)", color: "var(--text)", fontSize: 16,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >›</button>
      </div>

      {/* Dot indicator */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
        {STATIONS.map((_, i) => (
          <button key={i} onClick={() => setActiveIdx(i)} style={{
            width: i === activeIdx ? 18 : 7,
            height: 7, borderRadius: 4, border: "none", cursor: "pointer",
            background: i === activeIdx ? "var(--primary)" : "var(--border)",
            transition: "width .25s ease, background .2s",
            padding: 0,
          }} />
        ))}
      </div>

      {/* Chart area */}
      <Legend />

      {isLoading && (
        <div style={{
          height: 180, background: "var(--surface-alt)", borderRadius: 10,
          animation: "pulse 1.5s ease-in-out infinite",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--text-muted)", fontSize: 12,
        }}>
          Loading station data…
        </div>
      )}

      {isError && !isLoading && (
        <div style={{
          height: 180, display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--red)", fontSize: 12,
        }}>
          ⚠ {isError}
        </div>
      )}

      {!isLoading && !isError && data && (
        <Chart
          past={data.past}
          current={data.current}
          predictions={data.predictions}
        />
      )}

      {/* Current level pill */}
      {data?.current && (
        <div style={{
          marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap",
        }}>
          {[
            ["Current Level", `${data.current.water_level.toFixed(2)} m`, "#4a9eff"],
            ["Last Updated",  toHHMM(data.current.recorded_at), "var(--text-mid)"],
            ["Predictions",   `${data.predictions?.length ?? 0} pts (next 12H)`, "var(--red)"],
          ].map(([lbl, val, c]) => (
            <div key={lbl} style={{
              background: "var(--surface-alt)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "8px 14px",
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                            letterSpacing: 0.5, color: "var(--text-muted)", marginBottom: 3 }}>
                {lbl}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: c, fontFamily: "DM Mono" }}>
                {val}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}