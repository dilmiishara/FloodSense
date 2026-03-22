// ─── Prediction.jsx ───────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { C, Card, Badge, Btn, globalCSS, Header, Sidebar, TabBar, ProbBar, SriLankaMap } from "./shared";

// ── Mini animated canvas chart for each station ──
const StationChart = ({ id, data, max, color, light }) => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    const pts = data.length;
    const toX = i => (i / (pts - 1)) * W;
    const toY = v => H - 4 - (v / max) * (H - 8);
    const steps = 4;
    const gridColor  = light ? "rgba(0,0,0,0.06)"  : "rgba(255,255,255,0.05)";
    const labelColor = light ? "#ccc"               : "#444";
    let progress = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let s = 0; s <= steps; s++) {
        const v = (max / steps) * s, y = toY(v);
        ctx.beginPath(); ctx.strokeStyle = gridColor; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
        ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = "8px monospace"; ctx.fillStyle = labelColor; ctx.textAlign = "left";
        ctx.fillText(v % 1 === 0 ? v : v.toFixed(1), 2, y - 2);
      }
      const endIdx = Math.floor(progress * (pts - 1));
      const gd = ctx.createLinearGradient(0,0,0,H);
      gd.addColorStop(0, color + (light ? "22" : "33"));
      gd.addColorStop(1, color + "00");
      ctx.beginPath();
      for (let i = 0; i <= endIdx; i++) { i===0?ctx.moveTo(toX(i),toY(data[i])):ctx.lineTo(toX(i),toY(data[i])); }
      ctx.lineTo(toX(endIdx),H); ctx.lineTo(0,H); ctx.closePath();
      ctx.fillStyle = gd; ctx.fill();
      ctx.beginPath();
      for (let i = 0; i <= endIdx; i++) { i===0?ctx.moveTo(toX(i),toY(data[i])):ctx.lineTo(toX(i),toY(data[i])); }
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.stroke();
      if (endIdx === pts - 1) {
        const lx = toX(pts-1), ly = toY(data[pts-1]);
        ctx.beginPath(); ctx.arc(lx,ly,3,0,Math.PI*2); ctx.fillStyle=color; ctx.fill();
      }
      if (progress < 1) { progress = Math.min(1, progress + 0.04); requestAnimationFrame(draw); }
    };
    draw();
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: 70, display: "block" }} />;
};

const StatCard = ({ label, value, valColor, sub, subColor, dark, extra }) => (
  <Card style={{ padding: "16px 18px", background: dark ? C.dark : C.white, color: dark ? "#fff" : C.dark }}>
    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: .4, color: dark ? "#888" : "#aaa", marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -1, lineHeight: 1, color: valColor || (dark ? "#fff" : C.dark) }}>{value}</div>
    <div style={{ fontSize: 11, color: subColor || (dark ? "#aaa" : C.mid), marginTop: 5, fontWeight: 600 }}>{sub}</div>
    {extra}
  </Card>
);

export default function Prediction({ page, setPage }) {
  const [emergencyMode, setEmergencyMode] = useState(true);
  const [tab, setTab]       = useState("waterlevel");
  const [timeRange, setTime] = useState("Next 6H");

  const tabs = [
    { id: "waterlevel", label: "💧 Water Level Forecast" },
    { id: "rainfall",   label: "🌧 Rainfall Prediction" },
    { id: "heatmap",    label: "🔥 Risk Heatmap" },
    { id: "historical", label: "📅 Historical Comparison" },
    // { id: "accuracy",   label: "🎯 Model Accuracy" },
  ];

  const districtForecasts = [
    { name:"Ratnapura", river:"Kalu Ganga · A2", cur:"4.8m", pred:"5.6m", pct:92, color:C.red,    badge:"critical" },
    { name:"Kalutara",  river:"Kalu Ganga · B1", cur:"3.9m", pred:"4.9m", pct:78, color:"#cc4400", badge:"critical" },
    { name:"Galle",     river:"Gin Ganga · C3",  cur:"3.4m", pred:"4.1m", pct:65, color:C.orange,  badge:"high" },
    { name:"Colombo",   river:"Kelani River · W", cur:"2.1m", pred:"3.2m", pct:60, color:C.orange,  badge:"high" },
    { name:"Kandy",     river:"Mahaweli · Ctr",  cur:"1.8m", pred:"2.4m", pct:40, color:C.yellow,  badge:"medium" },
    { name:"Jaffna",    river:"Lagoon · North",  cur:"0.6m", pred:"0.7m", pct:10, color:C.green,   badge:"safe" },
  ];

  const riskRankings = [
    ["Ratnapura",92,C.red,"critical"],["Kalutara",78,"#cc4400","critical"],["Galle",65,C.orange,"high"],
    ["Matara",62,C.orange,"high"],["Colombo",60,C.orange,"high"],["Kegalle",52,"#e07800","high"],
    ["Kandy",40,C.yellow,"medium"],["Jaffna",10,C.green,"safe"],
  ];

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight: "100vh", background: C.bg }}>
        <Header emergencyMode={emergencyMode} setEmergencyMode={setEmergencyMode} />
        <div style={{ display: "flex", margin: "12px 14px 14px" }}>
          <Sidebar page={page} setPage={setPage} />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: "calc(100vh - 110px)", paddingRight: 2 }}>

            {/* Page header */}
            <div className="fadeUp" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -.4 }}>🔮 Prediction</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>AI-powered flood risk forecasting · FloodSense ML v2.1 · Last updated: 21 Mar 2026, 14:32 LKT</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["Next 6H","24H","48H","7 Days"].map(t => (
                  <button key={t} onClick={() => setTime(t)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${C.border}`, background: timeRange === t ? C.dark : "#fff", color: timeRange === t ? "#fff" : C.mid }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Model info bar */}
            {/* <Card style={{ padding: "11px 18px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              {[["Model","FloodSense ML v2.1"],["Sensors","5 Active"],["Rainfall API","Connected"],["Accuracy","91.4%"],["Next Refresh","14:47 LKT"]].map(([k,v],i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.mid }}>
                  {i === 0 && <div className="blink" style={{ width: 7, height: 7, borderRadius: "50%", background: C.green }} />}
                  {k}: <strong style={{ color: k === "Accuracy" ? C.green : C.dark, marginLeft: 2 }}>{v}</strong>
                </div>
              ))}
            </Card> */}

            <TabBar tabs={tabs} active={tab} onChange={setTab} />

            {/* ── WATER LEVEL FORECAST ── */}
            {tab === "waterlevel" && (
              <>
                <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 12 }}>

                  {/* Card 1 — Overall Risk Index (unchanged) */}
                  <StatCard label="Overall Risk Index" value="HIGH" valColor={C.red} sub="▲ +18% from yesterday" subColor={C.red}
                    extra={
                      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                        <svg width={70} height={70} viewBox="0 0 80 80">
                          <circle cx="40" cy="40" r="32" fill="none" stroke="#f0f0f0" strokeWidth="9"/>
                          <circle cx="40" cy="40" r="32" fill="none" stroke={C.red} strokeWidth="9" strokeDasharray="144 201" strokeDashoffset="50" strokeLinecap="round" transform="rotate(-90 40 40)"/>
                          <text x="40" y="45" fontSize="14" fill={C.dark} textAnchor="middle" fontWeight="900">72%</text>
                        </svg>
                      </div>
                    }
                  />

                  {/* Card 2 — Expected Rainfall (unchanged) */}
                  <StatCard label="Expected Rainfall (6H)" value="142mm" valColor={C.blue} sub="▲ Heavy rainfall alert active" subColor={C.red}
                    extra={
                      <div style={{ display: "flex", gap: 3, marginTop: 8, alignItems: "flex-end", height: 24 }}>
                        {[30,45,60,78,90,100].map((h,i) => (
                          <div key={i} style={{ flex: 1, height: `${h}%`, background: `rgba(26,82,204,${.3+i*.14})`, borderRadius: "2px 2px 0 0" }}/>
                        ))}
                      </div>
                    }
                  />

                  {/* Card 3 — Real-time River Level Chart */}
                  <Card style={{ padding: "16px 18px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>Kalu Ganga — Real-time Water Level</div>
                        <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Sensor A2 · Ratnapura · Updates every 30s</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: C.green, background: "#e5f8ee", padding: "4px 10px", borderRadius: 20 }}>
                        <div className="blink" style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }}/>
                        LIVE
                      </div>
                    </div>
                    <canvas id="riverCanvas" style={{ width: "100%", height: 90, display: "block" }}/>
                    <div style={{ display: "flex", gap: 20, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                      {[["Current","4.82m",C.red,"curVal"],["Threshold","5.20m","#aaa",null],["Rise Rate","+0.12m/hr",C.orange,null],["Time to Critical","~2.5 hrs",C.orange,null],["Status","Rising ▲",C.red,null]].map(([lbl,val,c,id],i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: .4, color: "#aaa" }}>{lbl}</span>
                          <span id={id||undefined} style={{ fontSize: 13, fontWeight: 800, fontFamily: "DM Mono", color: c }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                </div>

                {/* Water level chart + Recommended Actions — same row */}
                <div className="fadeUp" style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
                  <Card style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Water Level Prediction — Next 6 Hours</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 10 }}>Kalu Ganga at Ratnapura-A2 sensor</div>
                    <svg viewBox="0 0 720 175" style={{ width: "100%", overflow: "visible" }}>
                      {[20,52,84,116,148].map(y => <line key={y} x1="60" y1={y} x2="700" y2={y} stroke="#f0f0f0" strokeWidth="1"/>)}
                      {["6.0m","5.5m","5.0m","4.5m","4.0m"].map((l,i) => <text key={i} x="52" y={24+i*32} fontSize="9" fill="#bbb" textAnchor="end" fontFamily="DM Mono">{l}</text>)}
                      <line x1="60" y1="40" x2="700" y2="40" stroke={C.red} strokeWidth="1.5" strokeDasharray="6,4" opacity=".5"/>
                      <text x="702" y="43" fontSize="9" fill={C.red} fontWeight="700">5.2m</text>
                      <path d="M390,100 L460,82 L530,60 L600,36 L670,18 L670,32 L600,52 L530,76 L460,96 L390,112 Z" fill={C.red} opacity=".07"/>
                      <polyline points="60,148 130,140 200,132 270,122 340,110 390,100" fill="none" stroke={C.dark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="390,100 460,82 530,60 600,36 670,18" fill="none" stroke={C.red} strokeWidth="2.5" strokeDasharray="8,4" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="390" y1="12" x2="390" y2="160" stroke="#555" strokeWidth="1.5" strokeDasharray="4,3" opacity=".4"/>
                      <rect x="368" y="4" width="44" height="14" rx="4" fill={C.dark}/>
                      <text x="390" y="14" fontSize="8" fill="#fff" textAnchor="middle" fontWeight="700">NOW</text>
                      {[["60","−3H","#bbb"],["200","−2H","#bbb"],["340","−1H","#bbb"],["390","14:32","#333"],["460","+1H",C.red],["530","+2H",C.red],["600","+4H",C.red],["670","+6H",C.red]].map(([x,l,c],i) => (
                        <text key={i} x={x} y="170" fontSize="9" fill={c} textAnchor="middle" fontFamily="DM Mono">{l}</text>
                      ))}
                      <circle cx="390" cy="100" r="5" fill={C.dark}/>
                      {[["460","82"],["530","60"],["600","36"],["670","18"]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r="4" fill={C.red}/>)}
                    </svg>
                  </Card>

                  {/* Recommended Actions */}
                  <div style={{ width: 220, background: C.dark, borderRadius: 14, padding: 18, color: "#fff", boxShadow: C.shadow, display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "#888", marginBottom: 14 }}>⚡ Recommended Actions</div>
                    {[["🚨","Activate Emergency Alert","Issue public warnings for Ratnapura & Kalutara."],["🏠","Open Safe Zones","Activate 4 shelters in southern province."],["🌉","Road Closures","Pre-emptively close A8 & B403 routes."],["📡","Deploy Field Teams","Inspect Kalu Ganga banks — sensor A2 surge."]].map(([icon,head,body],i) => (
                      <div key={i} style={{ display:"flex", gap:10, marginBottom:14 }}>
                        <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
                        <div><div style={{ fontSize:13, fontWeight:700 }}>{head}</div><div style={{ fontSize:11, color:"#bbb", marginTop:3, lineHeight:1.5 }}>{body}</div></div>
                      </div>
                    ))}
                    <button style={{ marginTop:"auto", width:"100%", padding:11, background:C.red, color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer" }}>🚨 Broadcast Alert</button>
                  </div>
                </div>

{/* ── REAL-TIME STATION MONITORING ── */}
<div className="fadeUp">
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>Real-time Station Water Levels</div>
      <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Live sensor readings · Kalu Ganga basin · Auto-refresh 30s</div>
    </div>
    <div style={{ display: "flex", gap: 6 }}>
      {["24H","48H","7D"].map(r => (
        <button key={r} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${C.border}`, background: r === "48H" ? C.dark : "#fff", color: r === "48H" ? "#fff" : C.mid }}>{r}</button>
      ))}
    </div>
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
    {[
      { id:"s1", name:"Ellagawa",   time:"09:30", level:4.30, max:10, status:"normal",   color:C.green,  data:[4.1,4.0,4.05,4.1,4.2,4.15,4.3,4.25,4.4,4.6,5.2,6.8,7.1,6.4,5.8,5.1,4.6,4.2,4.1,4.0,4.05,4.1,4.2,4.3] },
      { id:"s2", name:"Putupaula",  time:"09:30", level:0.17, max:2,  status:"normal",   color:C.green,  data:[0.5,0.48,0.5,0.52,0.55,0.6,0.58,0.7,0.8,0.9,1.1,1.4,1.7,1.9,1.6,1.2,0.9,0.6,0.4,0.3,0.2,0.18,0.17,0.17] },
      { id:"s3", name:"Rathnapura", time:"09:30", level:0.87, max:8,  status:"normal",   color:C.green,  data:[0.4,0.4,0.5,0.6,0.5,0.4,0.5,0.6,0.5,0.4,1.8,3.2,4.1,3.8,3.0,2.1,1.4,0.9,0.6,0.5,0.5,0.6,0.8,0.87] },
      // { id:"s4", name:"Kiriella",   time:"09:30", level:2.14, max:6,  status:"warning",  color:C.orange, data:[1.2,1.3,1.4,1.5,1.6,1.8,2.0,2.1,2.2,2.4,2.6,2.8,3.1,3.4,3.2,2.9,2.6,2.4,2.3,2.2,2.1,2.1,2.1,2.14] },
      // { id:"s5", name:"Kalutara",   time:"09:30", level:3.91, max:6,  status:"critical", color:C.red,    data:[2.1,2.2,2.4,2.6,2.8,3.0,3.1,3.2,3.3,3.4,3.5,3.6,3.7,3.8,3.85,3.88,3.9,3.91,3.91,3.92,3.91,3.92,3.91,3.91] },
      // { id:"s6", name:"Millawa",    time:"09:30", level:1.05, max:4,  status:"normal",   color:C.green,  data:[0.8,0.85,0.9,0.88,0.9,0.92,0.95,1.0,1.02,1.05,1.08,1.1,1.08,1.06,1.05,1.04,1.04,1.05,1.05,1.04,1.05,1.05,1.05,1.05] },
    ].map(({ id, name, time, level, max, status, color, data }) => (
      <Card key={id} style={{ padding: "16px 18px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{name}</div>
            <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>Last updated: {time}</div>
          </div>
          <Badge type={status === "normal" ? "safe" : status === "warning" ? "medium" : "critical"}>
            {status === "normal" ? "NORMAL" : status === "warning" ? "WARNING" : "CRITICAL"}
          </Badge>
        </div>

        {/* Big level number */}
        <div style={{ margin: "10px 0 12px" }}>
          <span style={{ fontSize: 38, fontWeight: 900, color: C.dark, letterSpacing: -2, lineHeight: 1 }}>{level.toFixed(2)}</span>
          <span style={{ fontSize: 14, color: "#bbb", fontWeight: 600, marginLeft: 4 }}>m</span>
        </div>

        {/* Chart — light background version */}
        <StationChart id={id} data={data} max={max} color={color} light />

        {/* X-axis labels */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {["18:30","09:30","18:30","09:30"].map((l,i) => (
            <span key={i} style={{ fontSize: 9, color: "#ccc", fontFamily: "DM Mono" }}>{l}</span>
          ))}
        </div>
      </Card>
    ))}
  </div>
</div>

              </>
            )}

            {/* ── RAINFALL PREDICTION ── */}
            {tab === "rainfall" && (
              <>
                {/* Stat cards row — unchanged */}
                <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                  {/* <StatCard label="Total Expected (6H)" value="142mm" valColor={C.blue} sub="▲ +64mm above normal" subColor={C.red}/>
                  <StatCard label="Peak Intensity" value="38mm/hr" valColor={C.red} sub="Expected at 16:00–17:00"/> */}
                  {/* <StatCard label="Storm Duration" value="6.5 hrs" sub="Ongoing · Subsiding by 21:00"/>
                  <StatCard label="Affected Districts" value="8" valColor={C.orange} sub="South-West monsoon cell"/> */}
                </div>

                {/* Hourly bar chart — unchanged */}
                <Card className="fadeUp">
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Hourly Rainfall Forecast — Next 12 Hours</div>
                  <div style={{ fontSize:11, color:"#aaa", marginBottom:12 }}>mm/hr · South-West Region · Light blue = predicted</div>
                  <div style={{ display:"flex", gap:5, alignItems:"flex-end", height:80 }}>
                    {[[10,false],[13,false],[16,false],[18,false],[14,false],[12,false],[38,true],[40,true],[32,true],[22,true],[16,true],[8,true]].map(([h,pred],i) => (
                      <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                        <div style={{ fontSize:8, color:pred?C.blue:"#bbb", fontWeight:700 }}>{h}</div>
                        <div style={{ width:"100%", height:`${(h/40)*100}%`, minHeight:4, background:pred?"#9ec4ee":"#4a8ee0", borderRadius:"3px 3px 0 0", border:pred?`1.5px dashed #4a8ee0`:"none" }}/>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:5, marginTop:4 }}>
                    {["08:00","09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00","20:00","02:00"].map((l,i) => (
                      <div key={i} style={{ flex:1, fontSize:8, color:i>=6?C.blue:"#bbb", textAlign:"center", fontFamily:"DM Mono", fontWeight:i===7?"700":"400" }}>{l}</div>
                    ))}
                  </div>
                </Card>

                {/* ── NEW: Current Conditions + 3-Day Forecast ── */}
                <div className="fadeUp" style={{ display: "flex", gap: 12, alignItems: "stretch" }}>

                  {/* Current Conditions */}
                  <Card style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: C.dark }}>Current Conditions — Ratnapura</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        ["WIND",     "4 kph",  "Dir: WSW",      "💨"],
                        ["HUMIDITY", "39%",    "Press: 1011 mb", "💧"],
                        ["RAIN",     "0 mm",   "Cloud: 18%",    "🌧"],
                        ["UV",       "13.3",   "Vis: 10 km",    "☀️"],
                      ].map(([label, val, sub, icon], i) => (
                        <div key={i} style={{ background: C.bg, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "#aaa", marginBottom: 6 }}>{label}</div>
                          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, color: C.dark }}>{val}</div>
                          <div style={{ fontSize: 11, color: C.mid, marginTop: 4 }}>{sub}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* 3-Day Forecast */}
                  <Card style={{ flex: 1.6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: .5, color: C.dark }}>3-Day Forecast</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      {[
                        ["Sunday, Mar 22",  "🌦", "Patchy rain nearby", "34.5°", "19°",   "93%", "5 kph"],
                        ["Monday, Mar 23",  "🌦", "Patchy rain nearby", "34.7°", "18.5°", "88%", "9 kph"],
                        ["Tuesday, Mar 24", "🌦", "Patchy rain nearby", "34.5°", "18.9°", "88%", "7.9 kph"],
                      ].map(([day, icon, desc, max, min, rain, wind], i) => (
                        <div key={i} style={{ background: C.bg, borderRadius: 12, padding: "14px 12px", border: `1px solid ${C.border}`, textAlign: "center" }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: C.dark, marginBottom: 10 }}>{day}</div>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
                          <div style={{ fontSize: 11, color: C.mid, marginBottom: 10, lineHeight: 1.4 }}>{desc}</div>
                          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: C.red }}>Max: {max}</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: C.blue }}>Min: {min}</span>
                          </div>
                          <div style={{ fontSize: 11, color: C.mid }}>Rain Chance: <strong style={{ color: C.dark }}>{rain}</strong></div>
                          <div style={{ fontSize: 11, color: C.mid, marginTop: 2 }}>Max Wind: <strong style={{ color: C.dark }}>{wind}</strong></div>
                        </div>
                      ))}
                    </div>
                  </Card>

                </div>

                {/* <Card className="fadeUp">
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>District Rainfall Forecast (6H)</div>
                  {[["Ratnapura","185mm",100,C.red],["Kalutara","162mm",87,"#cc4400"],["Galle","140mm",76,C.orange],["Colombo","92mm",50,C.yellow],["Kandy","68mm",37,"#d4a017"],["Jaffna","12mm",8,C.green]].map(([dist,mm,pct,c],i) => (
                    <div key={i} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:600, marginBottom:3 }}><span>{dist}</span><span style={{ color:c, fontWeight:700 }}>{mm}</span></div>
                      <div style={{ background:"#f0f0f0", height:7, borderRadius:4, overflow:"hidden" }}><div style={{ width:`${pct}%`, height:"100%", background:c, borderRadius:4 }}/></div>
                    </div>
                  ))}
                </Card> */}
              </>
            )}

            {/* ── RISK HEATMAP ── */}
            {tab === "heatmap" && (
              <div className="fadeUp" style={{ display:"flex", gap:12 }}>
                <Card style={{ flex:1, padding:0, overflow:"hidden" }}>
                  <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:13, fontWeight:700 }}>🔥 District Risk Heatmap</div>
                    <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>Flood probability — Next 6 Hours</div>
                  </div>
                  <SriLankaMap mode="heatmap"/>
                </Card>
                <Card style={{ width:280 }}>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>District Risk Rankings</div>
                  <table>
                    <thead><tr><th>#</th><th>District</th><th>Probability</th><th>Risk</th></tr></thead>
                    <tbody>
                      {riskRankings.map(([name,pct,c,badge],i) => (
                        <tr key={i}>
                          <td style={{ fontWeight:900, color:c, fontSize:13 }}>{i+1}</td>
                          <td style={{ fontWeight:700, fontSize:13 }}>{name}</td>
                          <td><ProbBar pct={pct} color={c}/></td>
                          <td><Badge type={badge}>{badge.toUpperCase()}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}

            {/* ── HISTORICAL COMPARISON ── */}
            {tab === "historical" && (
              <>
                <div className="fadeUp" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                  <StatCard label="Worst Flood Year" value="2017" sub="297 deaths · 500K displaced"/>
                  <StatCard label="Current vs. 2017" value="68%" valColor={C.orange} sub="Similar rainfall pattern"/>
                  <StatCard label="Avg. Annual Events" value="3.2" sub="Major floods per year"/>
                  <StatCard label="This Year (2026)" value="2" valColor={C.red} sub="Major events so far"/>
                </div>
                <Card className="fadeUp">
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Annual Flood Events — 10 Year Comparison</div>
                  <div style={{ display:"flex", gap:5, alignItems:"flex-end", height:100, marginBottom:6 }}>
                    {[["2016",2,"#d0c8c0"],["2017",8,C.red],["2018",6,C.orange],["2019",4,C.yellow],["2020",3,C.yellow],["2021",2,"#d0c8c0"],["2022",4,C.yellow],["2023",3,C.yellow],["2024",6,C.orange],["2025",4,C.yellow],["2026*",2,C.red]].map(([yr,count,c],i) => (
                      <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                        <div style={{ fontSize:8, fontWeight:700, color:c }}>{count}</div>
                        <div style={{ width:"100%", height:`${(count/8)*100}%`, background:c, borderRadius:"3px 3px 0 0", opacity:yr==="2026*"?.6:1 }}/>
                        <div style={{ fontSize:7, color:yr==="2017"||yr==="2026*"?c:"#bbb", fontFamily:"DM Mono", whiteSpace:"nowrap", fontWeight:yr==="2017"||yr==="2026*"?"700":"400" }}>{yr}</div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="fadeUp">
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Current Event vs. Historical Parallels</div>
                  <table>
                    <thead><tr><th>Year / Event</th><th>Peak Rainfall</th><th>Max Water Lv</th><th>Duration</th><th>Similarity</th></tr></thead>
                    <tbody>
                      {[["May 2017 — SW Monsoon","Worst on record","320mm","6.1m","18hrs",68,C.orange],["Oct 2022 — NE Monsoon","Eastern flood","280mm","5.8m","12hrs",54,C.yellow],["Jun 2024 — SW Monsoon","Southern flood","210mm","5.3m","9hrs",72,C.orange],["Mar 2026 — Current","Active event","142mm+","4.8m ▲","Ongoing",0,C.blue]].map(([yr,sub,rain,wl,dur,sim,c],i) => (
                        <tr key={i} style={{ background:i===3?C.blueBg:"" }}>
                          <td><div style={{ fontWeight:700, fontSize:13, color:i===3?C.blue:i===0?C.red:C.dark }}>{yr}</div><div style={{ fontSize:10, color:C.mid }}>{sub}</div></td>
                          <td style={{ fontFamily:"DM Mono", fontSize:12 }}>{rain}</td>
                          <td style={{ fontFamily:"DM Mono", fontSize:12, fontWeight:i===3?"700":"400", color:i===3?C.red:C.dark }}>{wl}</td>
                          <td style={{ fontFamily:"DM Mono", fontSize:12 }}>{dur}</td>
                          <td>{i===3?<span style={{ fontSize:11, fontWeight:700, color:C.blue }}>— Live</span>:<ProbBar pct={sim} color={c}/>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </>
            )}

            {/* ── MODEL ACCURACY ── */}
            {/* {tab === "accuracy" && (
              <>
                <div className="fadeUp" style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
                  {[["Overall Accuracy","91.4%",C.green,"▲ +2.1% vs last month"],["Precision","89.2%",C.blue,"True positive rate"],["Recall","93.7%",C.blue,"Flood detection rate"],["False Alarms","6.3%",C.yellow,"▼ −1.4% improving"],["Avg. Lead Time","4.2 hrs",C.dark,"Before flood event"]].map(([label,val,c,sub],i) => (
                    <Card key={i} style={{ padding:"16px 18px", borderTop:`3px solid ${c}` }}>
                      <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:.4, color:"#aaa", marginBottom:8 }}>{label}</div>
                      <div style={{ fontSize:28, fontWeight:900, color:c, letterSpacing:-1 }}>{val}</div>
                      <div style={{ fontSize:11, color:C.mid, marginTop:4 }}>{sub}</div>
                    </Card>
                  ))}
                </div>
                <div className="fadeUp" style={{ display:"flex", gap:12 }}>
                  <Card style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Per-District Model Accuracy</div>
                    {[["Ratnapura",95.2,C.green],["Kalutara",93.8,C.green],["Kandy",92.1,C.green],["Galle",91.5,"#2a8a5a"],["Jaffna",84.3,C.yellow],["Colombo",82.7,"#d4a017"]].map(([dist,pct,c],i) => (
                      <div key={i} style={{ marginBottom:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:600, marginBottom:3 }}><span>{dist}</span><span style={{ color:c, fontWeight:700 }}>{pct}%</span></div>
                        <div style={{ background:"#f0f0f0", height:7, borderRadius:4, overflow:"hidden" }}><div style={{ width:`${pct}%`, height:"100%", background:c, borderRadius:4 }}/></div>
                      </div>
                    ))}
                  </Card>
                  <Card style={{ width:280 }}>
                    <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Confusion Matrix</div>
                    <div style={{ fontSize:11, color:"#aaa", marginBottom:12 }}>Last 30 days · 248 predictions</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      {[["218","True Positive","Correctly predicted flood",C.greenBg,C.green],["14","False Positive","Alert, no flood occurred",C.redBg,C.red],["8","False Negative","Missed flood event",C.orangeBg,C.orange],["8","True Negative","Correctly predicted safe","#f0f0f0","#888"]].map(([val,label,desc,bg,c],i) => (
                        <div key={i} style={{ background:bg, borderRadius:10, padding:12, textAlign:"center" }}>
                          <div style={{ fontSize:24, fontWeight:900, color:c }}>{val}</div>
                          <div style={{ fontSize:9, color:"#888", marginTop:3, textTransform:"uppercase", letterSpacing:.3 }}>{label}</div>
                          <div style={{ fontSize:9, color:c, fontWeight:700, marginTop:2 }}>{desc}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
                <Card className="fadeUp">
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Feature Importance — What Drives the Model</div>
                  {[["💧 Real-time Water Level","38%","38%",C.blue],["🌧 Rainfall Accumulation (6H)","27%","27%","#2a7acc"],["📈 Water Rise Rate","18%","18%","#4a9aee"],["🌡 Soil Moisture Index","9%","9%","#7abcf5"],["🗓 Historical Patterns","5%","5%","#aad4fa"],["🌬 Wind / Other","3%","3%","#cce5ff"]].map(([label,pctLabel,pct,c],i) => (
                    <div key={i} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:600, marginBottom:3 }}><span>{label}</span><span style={{ fontWeight:700 }}>{pctLabel}</span></div>
                      <div style={{ background:"#f0f0f0", height:9, borderRadius:4, overflow:"hidden" }}><div style={{ width:pct, height:"100%", background:c, borderRadius:4 }}/></div>
                    </div>
                  ))}
                </Card>
              </>
            )} */}

          </div>
        </div>
      </div>
    </>
  );
}