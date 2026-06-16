// ─── Prediction.jsx ───────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import {
  Card, Badge, Btn, globalCSS, TabBar, ProbBar, SriLankaMap,
} from "../shared.jsx";

import { fetchRatnapuraWeather } from "../api/services/weatherService";
import { useStationData } from "../hooks/useStationData";
import WaterLevelSliderChart from "../components/prediction/WaterLevelSliderChart";
import FloodPredictionTab from "../components/prediction/FloodPredictionTab";


// ── Interactive SVG station chart with hover tooltip ──────────────────────────
const StationSVGChart = ({ id, data, max, color, times }) => {
  const tooltipRef = useRef(null);
  const dotRef     = useRef(null);
  const lineRef    = useRef(null);

  const W = 400, H = 80;
  const padL = 2, padR = 2, padT = 6, padB = 2;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const pts = data.length;

  const tx = (i) => padL + (i / (pts - 1)) * chartW;
  const ty = (v) => padT + (1 - v / max) * chartH;

  const linePath = data.map((v, i) => `${i === 0 ? "M" : "L"} ${tx(i)},${ty(v)}`).join(" ");
  const fillPath = linePath + ` L ${tx(pts - 1)},${H} L ${padL},${H} Z`;

  const handleMouseMove = (e) => {
    const svg  = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    const idx  = Math.min(pts - 1, Math.max(0, Math.round(pct * (pts - 1))));
    const svgX = (tx(idx) / W) * rect.width;
    const svgY = (ty(data[idx]) / H) * rect.height;

    if (dotRef.current)  { dotRef.current.setAttribute("cx", tx(idx)); dotRef.current.setAttribute("cy", ty(data[idx])); dotRef.current.style.display = "block"; }
    if (lineRef.current) { lineRef.current.setAttribute("x1", tx(idx)); lineRef.current.setAttribute("x2", tx(idx)); lineRef.current.style.display = "block"; }

    const tip = tooltipRef.current;
    if (tip) {
      tip.style.display = "block";
      tip.style.left    = `${Math.min(svgX + 8, rect.width - 112)}px`;
      tip.style.top     = `${Math.max(svgY - 58, 0)}px`;
      tip.innerHTML = `
        <div style="font-size:9px;color:#aaa;font-weight:700;letter-spacing:.4px;margin-bottom:3px">${times[idx]}</div>
        <div style="font-size:13px;font-weight:900;color:#fff;font-family:DM Mono,monospace">
          ${data[idx].toFixed(2)}<span style="font-size:10px;color:#888;margin-left:2px">m</span>
        </div>
        <div style="font-size:9px;margin-top:3px;font-weight:700;color:${data[idx] >= max * 0.75 ? "var(--red)" : data[idx] >= max * 0.5 ? "var(--orange)" : color}">
          ${data[idx] >= max * 0.75 ? "⚠ High" : data[idx] >= max * 0.5 ? "↑ Rising" : "✓ Normal"}
        </div>
      `;
    }
  };

  const handleMouseLeave = () => {
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
    if (dotRef.current)     dotRef.current.style.display     = "none";
    if (lineRef.current)    lineRef.current.style.display    = "none";
  };

  return (
      <div style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${W} ${H}`}
             style={{ width: "100%", display: "block", cursor: "crosshair", overflow: "visible" }}
             onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <defs>
            <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75, 1].map((f, i) => {
            const v = max * f, y = ty(v);
            return (
                <g key={i}>
                  <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(128,128,128,0.12)" strokeWidth="1" strokeDasharray="3,4" />
                  <text x={padL + 2} y={y - 2} fontSize="7" fill="var(--text-muted)" fontFamily="DM Mono">
                    {v % 1 === 0 ? v : v.toFixed(1)}m
                  </text>
                </g>
            );
          })}
          <path d={fillPath} fill={`url(#g-${id})`} />
          <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={tx(pts - 1)} cy={ty(data[pts - 1])} r="6"   fill={color} opacity=".15" />
          <circle cx={tx(pts - 1)} cy={ty(data[pts - 1])} r="3.5" fill={color} />
          <line ref={lineRef} x1="0" y1={padT} x2="0" y2={H} stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity=".6" style={{ display: "none" }} />
          <circle ref={dotRef} cx="0" cy="0" r="4" fill={color} stroke="#fff" strokeWidth="1.5" style={{ display: "none" }} />
        </svg>
        <div ref={tooltipRef} style={{
          display: "none", position: "absolute", background: "#1a1a2e",
          color: "#fff", padding: "6px 10px", borderRadius: 8,
          pointerEvents: "none", zIndex: 10, minWidth: 95,
          boxShadow: "0 4px 14px rgba(0,0,0,.3)",
          border: "1px solid rgba(255,255,255,.08)",
        }} />
      </div>
  );
};

// ── Water Level Prediction Chart ──────────────────────────────────────────────
const WaterLevelChart = () => {
  const svgRef     = useRef(null);
  const tooltipRef = useRef(null);

  const points = [
    [-6, 4.2, null, null], [-5, 4.35, null, null], [-4, 4.48, null, null],
    [-3, 4.55, null, null], [-2, 4.68, null, null], [-1, 4.75, null, null],
    [0, 4.82, 4.82, 46],  [1, null, 4.96, 55],   [2, null, 5.1, 64],
    [3, null, 5.28, 72],  [4, null, 5.4, 80],    [6, null, 5.52, 87],
    [9, null, 5.6, 92],   [12, null, 5.45, 88],  [18, null, 5.2, 74],
    [24, null, 4.9, 58],
  ];

  const W = 620, H = 160;
  const padL = 44, padR = 14, padT = 18, padB = 22;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const minH = 3.8, maxH = 6.2, minX = -6, maxX = 24;

  const tx    = (x) => padL + ((x - minX) / (maxX - minX)) * chartW;
  const ty    = (v) => padT + (1 - (v - minH) / (maxH - minH)) * chartH;
  const probY = (v) => padT + (1 - v / 100) * chartH;

  const threshY = ty(5.2);
  const nowX    = tx(0);

  const actualPts = points.filter((p) => p[1] !== null);
  const predPts   = points.filter((p) => p[2] !== null);
  const probPts   = points.filter((p) => p[3] !== null);

  const toPolyline = (arr, xi, yi) => arr.map((p) => `${tx(p[xi])},${ty(p[yi])}`).join(" ");

  const probPathD = () => {
    const line = probPts.map((p) => `${tx(p[0])},${probY(p[3])}`).join(" L ");
    const last = probPts[probPts.length - 1];
    const first = probPts[0];
    return `M ${line} L ${tx(last[0])},${padT + chartH} L ${tx(first[0])},${padT + chartH} Z`;
  };

  const predPathD = () => {
    const line = predPts.map((p) => `${tx(p[0])},${ty(p[2])}`).join(" L ");
    const last = predPts[predPts.length - 1];
    const first = predPts[0];
    return `M ${line} L ${tx(last[0])},${padT + chartH} L ${tx(first[0])},${padT + chartH} Z`;
  };

  const handleMouseMove = (e) => {
    const svg = svgRef.current;
    const tip = tooltipRef.current;
    if (!svg || !tip) return;
    const rect   = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const sx     = (e.clientX - rect.left) * scaleX;
    const xHour  = minX + ((sx - padL) / chartW) * (maxX - minX);
    const nearest = points.reduce((a, b) => Math.abs(b[0] - xHour) < Math.abs(a[0] - xHour) ? b : a);
    const isPast    = nearest[0] <= 0;
    const levelVal  = isPast ? nearest[1] : nearest[2];
    const prob      = nearest[3];
    const hourLabel = nearest[0] === 0 ? "Now" : nearest[0] > 0 ? `+${nearest[0]}H` : `${nearest[0]}H`;
    const tipX = (tx(nearest[0]) / W) * rect.width;
    const tipY = e.clientY - rect.top;
    tip.style.display = "block";
    tip.style.left    = `${Math.min(tipX + 12, rect.width - 145)}px`;
    tip.style.top     = `${Math.max(tipY - 75, 0)}px`;
    tip.innerHTML = `
      <div style="font-size:10px;color:#aaa;margin-bottom:4px;font-weight:700;letter-spacing:.4px">${hourLabel}</div>
      ${levelVal !== null ? `<div style="font-size:12px;font-weight:800;color:${isPast ? "#fff" : "var(--red)"}">
        ${isPast ? "Actual" : "Predicted"}: <span style="font-family:DM Mono">${levelVal.toFixed(2)}m</span></div>` : ""}
      ${prob !== null ? `<div style="font-size:11px;color:var(--orange);font-weight:700;margin-top:3px">Probability: ${prob}%</div>` : ""}
      <div style="font-size:9px;color:${levelVal !== null && levelVal >= 5.2 ? "var(--red)" : "#666"};margin-top:4px;font-weight:600">
        ${levelVal !== null ? (levelVal >= 5.2 ? "⚠ Above threshold" : "✓ Below threshold") : ""}
      </div>
    `;
  };

  const handleMouseLeave = () => { if (tooltipRef.current) tooltipRef.current.style.display = "none"; };

  return (
      <div style={{ position: "relative" }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", overflow: "visible", cursor: "crosshair" }}>
          <defs>
            <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="var(--red)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--red)" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {[3.8, 4.2, 4.6, 5.0, 5.4, 5.8, 6.2].map((v, i) => (
              <g key={i}>
                <line x1={padL} y1={ty(v)} x2={W - padR} y2={ty(v)} stroke="rgba(128,128,128,0.1)" strokeWidth="1" />
                <text x={padL - 4} y={ty(v) + 3} fontSize="8" fill="var(--text-muted)" textAnchor="end" fontFamily="DM Mono">{v}m</text>
              </g>
          ))}
          <line x1={padL} y1={threshY} x2={W - padR} y2={threshY} stroke="var(--red)" strokeWidth="1.2" strokeDasharray="5,4" opacity=".5" />
          <text x={W - padR + 2} y={threshY + 3} fontSize="8" fill="var(--red)" fontWeight="700">5.2m</text>
          <path d={probPathD()} fill="var(--orange)" opacity=".07" />
          <polyline points={probPts.map((p) => `${tx(p[0])},${probY(p[3])}`).join(" ")}
                    fill="none" stroke="var(--orange)" strokeWidth="1.5" strokeDasharray="4,3" opacity=".5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={predPathD()} fill="url(#predGrad)" />
          <polyline points={toPolyline(actualPts, 0, 1)} fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={toPolyline(predPts, 0, 2)} fill="none" stroke="var(--red)" strokeWidth="2.5" strokeDasharray="8,4" strokeLinecap="round" strokeLinejoin="round" />
          {actualPts.map((p, i) => <circle key={"a"+i} cx={tx(p[0])} cy={ty(p[1])} r="3" fill="var(--text)" opacity=".35" />)}
          {predPts.filter((p) => p[0] !== 0).map((p, i) => <circle key={"b"+i} cx={tx(p[0])} cy={ty(p[2])} r="3" fill="var(--red)" opacity=".35" />)}
          <line x1={nowX} y1={padT - 6} x2={nowX} y2={padT + chartH} stroke="var(--text-mid)" strokeWidth="1.5" strokeDasharray="4,3" opacity=".4" />
          <rect x={nowX - 22} y={padT - 14} width="44" height="13" rx="4" fill="var(--text)" />
          <text x={nowX} y={padT - 4} fontSize="8" fill="var(--surface)" textAnchor="middle" fontWeight="700">NOW</text>
          <circle cx={nowX}   cy={ty(4.82)} r="5"   fill="var(--text)" />
          <circle cx={nowX}   cy={ty(4.82)} r="2.5" fill="var(--surface)" />
          <circle cx={tx(9)}  cy={ty(5.6)}  r="4"   fill="var(--red)" />
          <rect x={tx(9) - 30} y={ty(5.6) - 16} width="60" height="13" rx="3" fill="var(--red)" />
          <text x={tx(9)} y={ty(5.6) - 6} fontSize="8" fill="#fff" textAnchor="middle" fontWeight="700">PEAK 5.6m</text>
          {[[-6,"-6H"],[-3,"-3H"],[0,"Now"],[3,"+3H"],[6,"+6H"],[9,"+9H"],[12,"+12H"],[18,"+18H"],[24,"+24H"]].map(([h,l],i) => (
              <text key={i} x={tx(h)} y={H - 4} fontSize="8" fill={h === 0 ? "var(--text)" : "var(--text-muted)"}
                    textAnchor="middle" fontFamily="DM Mono" fontWeight={h === 0 ? "700" : "400"}>{l}</text>
          ))}
        </svg>
        <div ref={tooltipRef} style={{
          display: "none", position: "absolute", background: "#1a1a2e",
          color: "#fff", padding: "8px 12px", borderRadius: 8, fontSize: 11,
          pointerEvents: "none", zIndex: 10, minWidth: 130,
          boxShadow: "0 4px 16px rgba(0,0,0,.3)",
          border: "1px solid rgba(255,255,255,.08)",
        }} />
      </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, valColor, sub, subColor, extra }) => (
    <Card style={{ padding: "16px 18px" }}>
      <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:0.4, color:"var(--text-muted)", marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:30, fontWeight:900, letterSpacing:-1, lineHeight:1, color: valColor || "var(--text)" }}>{value}</div>
      <div style={{ fontSize:11, color: subColor || "var(--text-mid)", marginTop:5, fontWeight:600 }}>{sub}</div>
      {extra}
    </Card>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Prediction() {
  const [tab, setTab]        = useState("waterlevel");
  const [timeRange, setTime] = useState("Next 6H");

  const [weather, setWeather]               = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError]     = useState(null);

  useEffect(() => {
    fetchRatnapuraWeather()
        .then((data) => { setWeather(data); setWeatherLoading(false); })
        .catch((err)  => { setWeatherError(err.message); setWeatherLoading(false); });
  }, []);

  const stationData = useStationData();

  const tabs = [
    { id: "waterlevel", label: " Water Level Forecast" },
    { id: "rainfall",   label: " Weather Forecast"  },
    { id: "floodpred",  label: " Flood Prediction"     },
    { id: "heatmap",    label: " Risk Heatmap"         },
  ];

  const districtForecasts = [
    { name:"Ratnapura", river:"Kalu Ganga · A2", cur:"4.8m", pred:"5.6m", pct:92, color:"var(--red)",    badge:"critical" },
    { name:"Kuruvita",  river:"Kalu Ganga · B1", cur:"3.9m", pred:"4.9m", pct:78, color:"#cc4400",       badge:"critical" },
    { name:"Galle",     river:"Gin Ganga · C3",  cur:"3.4m", pred:"4.1m", pct:65, color:"var(--orange)", badge:"high"     },
  ];

  const riskRankings = [
    ["Ratnapura",    92, "var(--red)",    "critical"],
    ["Kuruvita",     78, "#cc4400",       "critical"],
    ["Kiriella",     65, "var(--orange)", "high"    ],
    ["Imbulpe",      62, "var(--orange)", "high"    ],
    ["Balangoda",    60, "var(--orange)", "high"    ],
    ["Opanayake",    52, "var(--orange)", "high"    ],
    ["Pelmadulla",   40, "var(--yellow)", "medium"  ],
    ["Kalawana",     10, "var(--green)",  "safe"    ],
    ["Nivithigala",  52, "var(--orange)", "high"    ],
    ["Elapatha",     10, "var(--green)",  "safe"    ],
    ["Ayagama",      78, "#cc4400",       "critical"],
    ["Kahawatta",    10, "var(--green)",  "safe"    ],
    ["Godakawela",   92, "var(--red)",    "critical"],
    ["Embilipitiya", 52, "var(--orange)", "high"    ],
    ["Kolonna",      10, "var(--green)",  "safe"    ],
  ];

  return (
      <>
        <style>{globalCSS}</style>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
          <div style={{ display:"flex", margin:"12px 14px 14px" }}>
<div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:12, overflowY:"scroll", paddingRight:2, scrollbarWidth:"none" }}>              <div className="fadeUp" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:20, fontWeight:900, letterSpacing:-0.4, color:"var(--text)" }}>Prediction</div>
                  <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:3 }}>
                    AI-powered flood risk forecasting · FloodSense ML v2.1 · Last updated: 21 Mar 2026, 14:32 LKT
                  </div>
                </div>
                {/* <div style={{ display:"flex", gap:6 }}>
                  {["Next 12H"].map((t) => (
                      <button key={t} onClick={() => setTime(t)} style={{
                        padding:"7px 14px", borderRadius:20, fontSize:12, fontWeight:700, cursor:"pointer",
                        border:"1.5px solid var(--border)",
                        background: timeRange === t ? "var(--primary)"     : "var(--surface-alt)",
                        color:      timeRange === t ? "#fff"               : "var(--text-mid)",
                      }}>{t}</button>
                  ))}
                </div> */}
              </div>

              <TabBar tabs={tabs} active={tab} onChange={setTab} />

              {/* ══ WATER LEVEL FORECAST ══ */}
              {tab === "waterlevel" && (
                  <>
                    {/* Station header */}
                    <div className="fadeUp">
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>Kalu Ganga - Real-time Station Water Levels</div>
                          <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>Live sensor readings · Kalu Ganga basin · Auto-refresh 30s</div>
                        </div>
                        {/* <div style={{ display:"flex", gap:6 }}>
                          {["24H","48H","7D"].map((r) => (
                              <button key={r} style={{
                                padding:"5px 14px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer",
                                border:"1.5px solid var(--border)",
                                background: r === "48H" ? "var(--primary)"     : "var(--surface-alt)",
                                color:      r === "48H" ? "#fff"               : "var(--text-mid)",
                              }}>{r}</button>
                          ))}
                        </div> */}
                      </div>

                      {/* Live station cards */}
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
                        {stationData.map(({ id, name, time, level, max, status, color, data, times, loading, error }) => (
                            <Card key={id} style={{ padding:"16px 18px" }}>
                              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:4 }}>
                                <div>
                                  <div style={{ fontSize:14, fontWeight:800, color:"var(--text)" }}>{name}</div>
                                  <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:2 }}>
                                    {loading ? "Connecting..." : error ? "Connection error" : `Last updated: ${time}`}
                                  </div>
                                </div>
                                <Badge type={loading ? "safe" : status === "normal" ? "safe" : status === "warning" ? "medium" : "critical"}>
                                  {loading ? "..." : status.toUpperCase()}
                                </Badge>
                              </div>
                              {loading && (
                                  <div style={{ height:100, background:"var(--surface-alt)", borderRadius:8, animation:"pulse 1.5s ease-in-out infinite" }} />
                              )}
                              {error && !loading && (
                                  <div style={{ height:100, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)", fontSize:12 }}>
                                    ⚠ Could not load station data
                                  </div>
                              )}
                              {!loading && !error && (
                                  <>
                                    <div style={{ margin:"10px 0 12px" }}>
                                      <span style={{ fontSize:38, fontWeight:900, color:"var(--text)", letterSpacing:-2, lineHeight:1 }}>{level.toFixed(2)}</span>
                                      <span style={{ fontSize:14, color:"var(--text-muted)", fontWeight:600, marginLeft:4 }}>m</span>
                                    </div>
                                    <StationSVGChart id={id} data={data} max={max} color={color} times={times} />
                                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                                      {[times[0], times[7], times[15], times[23]].map((l, i) => (
                                          <span key={i} style={{ fontSize:9, color:"var(--text-muted)", fontFamily:"DM Mono" }}>{l}</span>
                                      ))}
                                    </div>
                                  </>
                              )}
                            </Card>
                        ))}
                      </div>
                    </div>


                     {/* Water level chart — full width */}
                    <WaterLevelSliderChart />

                   
                

                    {/* Live card + Recommended Actions */}
                    
                  </>
              )}

              {/* ══ RAINFALL PREDICTION ══ */}
              {tab === "rainfall" && (
                  <>
                    <div className="fadeUp" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }} />

                    {/* <Card className="fadeUp">
                      <div style={{ fontSize:14, fontWeight:700, marginBottom:4, color:"var(--text)" }}>Hourly Rainfall Forecast — Next 12 Hours</div>
                      <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:12 }}>mm/hr · South-West Region · Light blue = predicted</div>
                      <div style={{ display:"flex", gap:5, alignItems:"flex-end", height:80 }}>
                        {[[10,false],[13,false],[16,false],[18,false],[14,false],[12,false],
                          [38,true],[40,true],[32,true],[22,true],[16,true],[8,true]].map(([h, pred], i) => (
                            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                              <div style={{ fontSize:8, color: pred ? "var(--primary)" : "var(--text-muted)", fontWeight:700 }}>{h}</div>
                              <div style={{ width:"100%", height:`${(h / 40) * 100}%`, minHeight:4,
                                background: pred ? "var(--primary-bg)" : "var(--primary)",
                                borderRadius:"3px 3px 0 0",
                                border: pred ? "1.5px dashed var(--primary)" : "none" }} />
                            </div>
                        ))}
                      </div>
                      <div style={{ display:"flex", gap:5, marginTop:4 }}>
                        {["08:00","09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00","20:00","02:00"].map((l, i) => (
                            <div key={i} style={{ flex:1, fontSize:8, color: i >= 6 ? "var(--primary)" : "var(--text-muted)", textAlign:"center", fontFamily:"DM Mono", fontWeight: i === 7 ? "700" : "400" }}>{l}</div>
                        ))}
                      </div>
                    </Card> */}

                    <div className="fadeUp" style={{ display:"flex", gap:12, alignItems:"stretch" }}>
                      <Card style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, marginBottom:14, color:"var(--text)" }}>Current Conditions — Ratnapura</div>
                        {weatherLoading && <div style={{ color:"var(--text-muted)", fontSize:12 }}>Loading weather data…</div>}
                        {weatherError   && <div style={{ color:"var(--red)",        fontSize:12 }}>Error: {weatherError}</div>}
                        {weather && (
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                              {[
                                ["WIND",     weather.current.wind,     weather.current.windDir  ],
                                ["HUMIDITY", weather.current.humidity,  weather.current.pressure ],
                                ["RAIN",     weather.current.rain,      weather.current.cloud    ],
                                ["UV",       weather.current.uv,        weather.current.vis      ],
                              ].map(([label, val, sub], i) => (
                                  <div key={i} style={{ background:"var(--surface-alt)", borderRadius:12, padding:"14px 16px", border:"1px solid var(--border)" }}>
                                    <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, color:"var(--text-muted)", marginBottom:6 }}>{label}</div>
                                    <div style={{ fontSize:24, fontWeight:900, letterSpacing:-0.5, color:"var(--text)" }}>{val}</div>
                                    <div style={{ fontSize:11, color:"var(--text-mid)", marginTop:4 }}>{sub}</div>
                                  </div>
                              ))}
                            </div>
                        )}
                      </Card>

                      <Card style={{ flex:1.6 }}>
                        <div style={{ fontSize:13, fontWeight:700, marginBottom:14, textTransform:"uppercase", letterSpacing:0.5, color:"var(--text)" }}>3-Day Forecast</div>
                        {weatherLoading && <div style={{ color:"var(--text-muted)", fontSize:12 }}>Loading forecast…</div>}
                        {weatherError   && <div style={{ color:"var(--red)",        fontSize:12 }}>Error: {weatherError}</div>}
                        {weather && (
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                              {weather.forecast.map(({ label, icon, condition, max, min, rainChance, maxWind }, i) => (
                                  <div key={i} style={{ background:"var(--surface-alt)", borderRadius:12, padding:"14px 12px", border:"1px solid var(--border)", textAlign:"center" }}>
                                    <div style={{ fontSize:11, fontWeight:800, color:"var(--text)", marginBottom:10 }}>{label}</div>
                                    <div style={{ fontSize:32, marginBottom:8 }}>{icon}</div>
                                    <div style={{ fontSize:11, color:"var(--text-mid)", marginBottom:10, lineHeight:1.4 }}>{condition}</div>
                                    <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:8 }}>
                                      <span style={{ fontSize:13, fontWeight:800, color:"var(--red)"  }}>Max: {max}</span>
                                      <span style={{ fontSize:13, fontWeight:800, color:"var(--primary)" }}>Min: {min}</span>
                                    </div>
                                    <div style={{ fontSize:11, color:"var(--text-mid)" }}>Rain Chance: <strong style={{ color:"var(--text)" }}>{rainChance}</strong></div>
                                    <div style={{ fontSize:11, color:"var(--text-mid)", marginTop:2 }}>Max Wind: <strong style={{ color:"var(--text)" }}>{maxWind}</strong></div>
                                  </div>
                              ))}
                            </div>
                        )}
                      </Card>
                    </div>
                  </>
              )}

              {/* ══ RISK HEATMAP ══ */}
              {tab === "heatmap" && (
                  <div className="fadeUp" style={{ display:"flex", gap:12 }}>
                    <Card style={{ flex:1, padding:0, overflow:"hidden" }}>
                      <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)" }}>
                        <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>District Risk Heatmap</div>
                        <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>Flood probability — Next 6 Hours</div>
                      </div>
                      <SriLankaMap mode="heatmap" />
                    </Card>
                    {/* <Card style={{ width:280, display:"flex", flexDirection:"column" }}>
                      <div style={{ fontSize:14, fontWeight:700, marginBottom:4, color:"var(--text)" }}>District Risk Rankings</div>
                      <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:10 }}>Ratnapura District · All DSD areas</div>
                      <div style={{ overflowY:"auto", flex:1, maxHeight:280, paddingRight:2 }}>
                        <table style={{ width:"100%" }}>
                          <thead style={{ position:"sticky", top:0, background:"var(--surface)", zIndex:1 }}>
                          <tr><th>#</th><th>District</th><th>Probability</th><th>Risk</th></tr>
                          </thead>
                          <tbody>
                          {riskRankings.map(([name, pct, c, badge], i) => (
                              <tr key={i}>
                                <td style={{ fontWeight:900, color:c, fontSize:13 }}>{i + 1}</td>
                                <td style={{ fontWeight:700, fontSize:13 }}>{name}</td>
                                <td><ProbBar pct={pct} color={c} /></td>
                                <td><Badge type={badge}>{badge.toUpperCase()}</Badge></td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ fontSize:9, color:"var(--text-muted)", textAlign:"center", marginTop:8, letterSpacing:0.3 }}>↕ scroll to see all districts</div>
                    </Card> */}
                  </div>
              )}

              {/* ══ FLOOD PREDICTION ══ */}
           {tab === "floodpred" && (
  <FloodPredictionTab />
)}

            </div>
          </div>
        </div>
      </>
  );
}