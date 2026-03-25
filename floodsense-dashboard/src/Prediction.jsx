// ─── Prediction.jsx ───────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import {
  C,
  Card,
  Badge,
  Btn,
  globalCSS,
  Header,
  Sidebar,
  TabBar,
  ProbBar,
  SriLankaMap,
} from "./shared";

// ── Interactive SVG station chart with hover tooltip ──
const StationSVGChart = ({ id, data, max, color, times }) => {
  const tooltipRef = useRef(null);
  const dotRef = useRef(null);
  const lineRef = useRef(null);

  const W = 400,
    H = 80;
  const padL = 2,
    padR = 2,
    padT = 6,
    padB = 2;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const pts = data.length;

  const tx = (i) => padL + (i / (pts - 1)) * chartW;
  const ty = (v) => padT + (1 - v / max) * chartH;

  const linePath = data
    .map((v, i) => `${i === 0 ? "M" : "L"} ${tx(i)},${ty(v)}`)
    .join(" ");
  const fillPath = linePath + ` L ${tx(pts - 1)},${H} L ${padL},${H} Z`;

  const handleMouseMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const idx = Math.min(pts - 1, Math.max(0, Math.round(pct * (pts - 1))));

    const svgX = (tx(idx) / W) * rect.width;
    const svgY = (ty(data[idx]) / H) * rect.height;

    if (dotRef.current) {
      dotRef.current.setAttribute("cx", tx(idx));
      dotRef.current.setAttribute("cy", ty(data[idx]));
      dotRef.current.style.display = "block";
    }
    if (lineRef.current) {
      lineRef.current.setAttribute("x1", tx(idx));
      lineRef.current.setAttribute("x2", tx(idx));
      lineRef.current.style.display = "block";
    }

    const tip = tooltipRef.current;
    if (tip) {
      tip.style.display = "block";
      tip.style.left = `${Math.min(svgX + 8, rect.width - 112)}px`;
      tip.style.top = `${Math.max(svgY - 58, 0)}px`;
      tip.innerHTML = `
        <div style="font-size:9px;color:#aaa;font-weight:700;letter-spacing:.4px;margin-bottom:3px">${times[idx]}</div>
        <div style="font-size:13px;font-weight:900;color:#fff;font-family:DM Mono,monospace">
          ${data[idx].toFixed(2)}<span style="font-size:10px;color:#888;margin-left:2px">m</span>
        </div>
        <div style="font-size:9px;margin-top:3px;font-weight:700;color:${data[idx] >= max * 0.75 ? "#e03030" : data[idx] >= max * 0.5 ? "#e07800" : color}">
          ${data[idx] >= max * 0.75 ? "⚠ High" : data[idx] >= max * 0.5 ? "↑ Rising" : "✓ Normal"}
        </div>
      `;
    }
  };

  const handleMouseLeave = () => {
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
    if (dotRef.current) dotRef.current.style.display = "none";
    if (lineRef.current) lineRef.current.style.display = "none";
  };

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: "100%",
          display: "block",
          cursor: "crosshair",
          overflow: "visible",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((f, i) => {
          const v = max * f,
            y = ty(v);
          return (
            <g key={i}>
              <line
                x1={padL}
                y1={y}
                x2={W - padR}
                y2={y}
                stroke="rgba(0,0,0,0.05)"
                strokeWidth="1"
                strokeDasharray="3,4"
              />
              <text
                x={padL + 2}
                y={y - 2}
                fontSize="7"
                fill="#ccc"
                fontFamily="DM Mono"
              >
                {v % 1 === 0 ? v : v.toFixed(1)}m
              </text>
            </g>
          );
        })}

        {/* Fill + line */}
        <path d={fillPath} fill={`url(#g-${id})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Latest dot with pulse */}
        <circle
          cx={tx(pts - 1)}
          cy={ty(data[pts - 1])}
          r="6"
          fill={color}
          opacity=".15"
        />
        <circle cx={tx(pts - 1)} cy={ty(data[pts - 1])} r="3.5" fill={color} />

        {/* Hover vertical line */}
        <line
          ref={lineRef}
          x1="0"
          y1={padT}
          x2="0"
          y2={H}
          stroke={color}
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity=".6"
          style={{ display: "none" }}
        />

        {/* Hover dot */}
        <circle
          ref={dotRef}
          cx="0"
          cy="0"
          r="4"
          fill={color}
          stroke="#fff"
          strokeWidth="1.5"
          style={{ display: "none" }}
        />
      </svg>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          display: "none",
          position: "absolute",
          background: "#1a1a2e",
          color: "#fff",
          padding: "6px 10px",
          borderRadius: 8,
          pointerEvents: "none",
          zIndex: 10,
          minWidth: 95,
          boxShadow: "0 4px 14px rgba(0,0,0,.2)",
          border: "1px solid rgba(255,255,255,.08)",
        }}
      />
    </div>
  );
};

// ── Mini animated canvas chart for each station ──
const StationChart = ({ id, data, max, color, light }) => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const W = canvas.offsetWidth,
      H = canvas.offsetHeight;
    const pts = data.length;
    const toX = (i) => (i / (pts - 1)) * W;
    const toY = (v) => H - 4 - (v / max) * (H - 8);
    const steps = 4;
    const gridColor = light ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)";
    const labelColor = light ? "#ccc" : "#444";
    let progress = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let s = 0; s <= steps; s++) {
        const v = (max / steps) * s,
          y = toY(v);
        ctx.beginPath();
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "8px monospace";
        ctx.fillStyle = labelColor;
        ctx.textAlign = "left";
        ctx.fillText(v % 1 === 0 ? v : v.toFixed(1), 2, y - 2);
      }
      const endIdx = Math.floor(progress * (pts - 1));
      const gd = ctx.createLinearGradient(0, 0, 0, H);
      gd.addColorStop(0, color + (light ? "22" : "33"));
      gd.addColorStop(1, color + "00");
      ctx.beginPath();
      for (let i = 0; i <= endIdx; i++) {
        i === 0
          ? ctx.moveTo(toX(i), toY(data[i]))
          : ctx.lineTo(toX(i), toY(data[i]));
      }
      ctx.lineTo(toX(endIdx), H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = gd;
      ctx.fill();
      ctx.beginPath();
      for (let i = 0; i <= endIdx; i++) {
        i === 0
          ? ctx.moveTo(toX(i), toY(data[i]))
          : ctx.lineTo(toX(i), toY(data[i]));
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();
      if (endIdx === pts - 1) {
        const lx = toX(pts - 1),
          ly = toY(data[pts - 1]);
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
      if (progress < 1) {
        progress = Math.min(1, progress + 0.04);
        requestAnimationFrame(draw);
      }
    };
    draw();
  }, []);
  return (
    <canvas ref={ref} style={{ width: "100%", height: 70, display: "block" }} />
  );
};

// ── Interactive water level + prediction chart with hover tooltip ──
const WaterLevelChart = ({ C }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  const points = [
    [-6, 4.2, null, null],
    [-5, 4.35, null, null],
    [-4, 4.48, null, null],
    [-3, 4.55, null, null],
    [-2, 4.68, null, null],
    [-1, 4.75, null, null],
    [0, 4.82, 4.82, 46],
    [1, null, 4.96, 55],
    [2, null, 5.1, 64],
    [3, null, 5.28, 72],
    [4, null, 5.4, 80],
    [6, null, 5.52, 87],
    [9, null, 5.6, 92],
    [12, null, 5.45, 88],
    [18, null, 5.2, 74],
    [24, null, 4.9, 58],
  ];

  const W = 620,
    H = 160;
  const padL = 44,
    padR = 14,
    padT = 18,
    padB = 22;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const minH = 3.8,
    maxH = 6.2,
    minX = -6,
    maxX = 24;

  const tx = (x) => padL + ((x - minX) / (maxX - minX)) * chartW;
  const ty = (v) => padT + (1 - (v - minH) / (maxH - minH)) * chartH;
  const probY = (v) => padT + (1 - v / 100) * chartH;

  const threshY = ty(5.2);
  const nowX = tx(0);

  const actualPts = points.filter((p) => p[1] !== null);
  const predPts = points.filter((p) => p[2] !== null);
  const probPts = points.filter((p) => p[3] !== null);

  const toPolyline = (arr, xi, yi) =>
    arr.map((p) => `${tx(p[xi])},${ty(p[yi])}`).join(" ");

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
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const sx = (e.clientX - rect.left) * scaleX;

    const xHour = minX + ((sx - padL) / chartW) * (maxX - minX);
    const nearest = points.reduce((a, b) =>
      Math.abs(b[0] - xHour) < Math.abs(a[0] - xHour) ? b : a,
    );

    const isPast = nearest[0] <= 0;
    const levelVal = isPast ? nearest[1] : nearest[2];
    const prob = nearest[3];
    const hourLabel =
      nearest[0] === 0
        ? "Now"
        : nearest[0] > 0
          ? `+${nearest[0]}H`
          : `${nearest[0]}H`;

    const tipX = (tx(nearest[0]) / W) * rect.width;
    const tipY = e.clientY - rect.top;

    tip.style.display = "block";
    tip.style.left = `${Math.min(tipX + 12, rect.width - 145)}px`;
    tip.style.top = `${Math.max(tipY - 75, 0)}px`;
    tip.innerHTML = `
      <div style="font-size:10px;color:#aaa;margin-bottom:4px;font-weight:700;letter-spacing:.4px">${hourLabel}</div>
      ${
        levelVal !== null
          ? `<div style="font-size:12px;font-weight:800;color:${isPast ? "#fff" : C.red}">
             ${isPast ? "Actual" : "Predicted"}:
             <span style="font-family:DM Mono">${levelVal.toFixed(2)}m</span>
           </div>`
          : ""
      }
      ${
        prob !== null
          ? `<div style="font-size:11px;color:${C.orange};font-weight:700;margin-top:3px">Probability: ${prob}%</div>`
          : ""
      }
      <div style="font-size:9px;color:${levelVal !== null && levelVal >= 5.2 ? C.red : "#666"};margin-top:4px;font-weight:600">
        ${levelVal !== null ? (levelVal >= 5.2 ? "⚠ Above threshold" : "✓ Below threshold") : ""}
      </div>
    `;
  };

  const handleMouseLeave = () => {
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
  };

  return (
    <div
      style={{ position: "relative" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", overflow: "visible", cursor: "crosshair" }}
      >
        <defs>
          <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.red} stopOpacity="0.12" />
            <stop offset="100%" stopColor={C.red} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {[3.8, 4.2, 4.6, 5.0, 5.4, 5.8, 6.2].map((v, i) => (
          <g key={i}>
            <line
              x1={padL}
              y1={ty(v)}
              x2={W - padR}
              y2={ty(v)}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
            <text
              x={padL - 4}
              y={ty(v) + 3}
              fontSize="8"
              fill="#bbb"
              textAnchor="end"
              fontFamily="DM Mono"
            >
              {v}m
            </text>
          </g>
        ))}

        <line
          x1={padL}
          y1={threshY}
          x2={W - padR}
          y2={threshY}
          stroke={C.red}
          strokeWidth="1.2"
          strokeDasharray="5,4"
          opacity=".5"
        />
        <text
          x={W - padR + 2}
          y={threshY + 3}
          fontSize="8"
          fill={C.red}
          fontWeight="700"
        >
          5.2m
        </text>

        <path d={probPathD()} fill={C.orange} opacity=".07" />
        <polyline
          points={probPts.map((p) => `${tx(p[0])},${probY(p[3])}`).join(" ")}
          fill="none"
          stroke={C.orange}
          strokeWidth="1.5"
          strokeDasharray="4,3"
          opacity=".5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path d={predPathD()} fill="url(#predGrad)" />

        <polyline
          points={toPolyline(actualPts, 0, 1)}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <polyline
          points={toPolyline(predPts, 0, 2)}
          fill="none"
          stroke={C.red}
          strokeWidth="2.5"
          strokeDasharray="8,4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {actualPts.map((p, i) => (
          <circle
            key={"a" + i}
            cx={tx(p[0])}
            cy={ty(p[1])}
            r="3"
            fill="#1a1a2e"
            opacity=".35"
          />
        ))}
        {predPts
          .filter((p) => p[0] !== 0)
          .map((p, i) => (
            <circle
              key={"b" + i}
              cx={tx(p[0])}
              cy={ty(p[2])}
              r="3"
              fill={C.red}
              opacity=".35"
            />
          ))}

        <line
          x1={nowX}
          y1={padT - 6}
          x2={nowX}
          y2={padT + chartH}
          stroke="#555"
          strokeWidth="1.5"
          strokeDasharray="4,3"
          opacity=".4"
        />
        <rect
          x={nowX - 22}
          y={padT - 14}
          width="44"
          height="13"
          rx="4"
          fill="#1a1a2e"
        />
        <text
          x={nowX}
          y={padT - 4}
          fontSize="8"
          fill="#fff"
          textAnchor="middle"
          fontWeight="700"
        >
          NOW
        </text>
        <circle cx={nowX} cy={ty(4.82)} r="5" fill="#1a1a2e" />
        <circle cx={nowX} cy={ty(4.82)} r="2.5" fill="#fff" />

        <circle cx={tx(9)} cy={ty(5.6)} r="4" fill={C.red} />
        <rect
          x={tx(9) - 30}
          y={ty(5.6) - 16}
          width="60"
          height="13"
          rx="3"
          fill={C.red}
        />
        <text
          x={tx(9)}
          y={ty(5.6) - 6}
          fontSize="8"
          fill="#fff"
          textAnchor="middle"
          fontWeight="700"
        >
          PEAK 5.6m
        </text>

        {[
          [-6, "-6H"],
          [-3, "-3H"],
          [0, "Now"],
          [3, "+3H"],
          [6, "+6H"],
          [9, "+9H"],
          [12, "+12H"],
          [18, "+18H"],
          [24, "+24H"],
        ].map(([h, l], i) => (
          <text
            key={i}
            x={tx(h)}
            y={H - 4}
            fontSize="8"
            fill={h === 0 ? "#333" : "#bbb"}
            textAnchor="middle"
            fontFamily="DM Mono"
            fontWeight={h === 0 ? "700" : "400"}
          >
            {l}
          </text>
        ))}
      </svg>

      <div
        ref={tooltipRef}
        style={{
          display: "none",
          position: "absolute",
          background: "#1a1a2e",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: 8,
          fontSize: 11,
          pointerEvents: "none",
          zIndex: 10,
          minWidth: 130,
          boxShadow: "0 4px 16px rgba(0,0,0,.2)",
          border: "1px solid rgba(255,255,255,.08)",
        }}
      />
    </div>
  );
};

const StatCard = ({ label, value, valColor, sub, subColor, dark, extra }) => (
  <Card
    style={{
      padding: "16px 18px",
      background: dark ? C.dark : C.white,
      color: dark ? "#fff" : C.dark,
    }}
  >
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.4,
        color: dark ? "#888" : "#aaa",
        marginBottom: 8,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 30,
        fontWeight: 900,
        letterSpacing: -1,
        lineHeight: 1,
        color: valColor || (dark ? "#fff" : C.dark),
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: 11,
        color: subColor || (dark ? "#aaa" : C.mid),
        marginTop: 5,
        fontWeight: 600,
      }}
    >
      {sub}
    </div>
    {extra}
  </Card>
);

export default function Prediction({ page, setPage }) {
  const [emergencyMode, setEmergencyMode] = useState(true);
  const [tab, setTab] = useState("waterlevel");
  const [timeRange, setTime] = useState("Next 6H");

  const tabs = [
    { id: "waterlevel", label: " Water Level Forecast" },
    { id: "rainfall", label: " Rainfall Prediction" },
    { id: "floodpred", label: " Flood Prediction" },
    { id: "heatmap", label: " Risk Heatmap" },
  ];

  const districtForecasts = [
    {
      name: "Ratnapura",
      river: "Kalu Ganga · A2",
      cur: "4.8m",
      pred: "5.6m",
      pct: 92,
      color: C.red,
      badge: "critical",
    },
    {
      name: "Kuruvita ",
      river: "Kalu Ganga · B1",
      cur: "3.9m",
      pred: "4.9m",
      pct: 78,
      color: "#cc4400",
      badge: "critical",
    },
    {
      name: "Galle",
      river: "Gin Ganga · C3",
      cur: "3.4m",
      pred: "4.1m",
      pct: 65,
      color: C.orange,
      badge: "high",
    },
  ];

  const riskRankings = [
    ["Ratnapura", 92, C.red, "critical"],
    ["Kuruvita ", 78, "#cc4400", "critical"],
    ["Kiriella ", 65, C.orange, "high"],
    ["Imbulpe ", 62, C.orange, "high"],
    ["Balangoda ", 60, C.orange, "high"],
    ["Opanayake ", 52, "#e07800", "high"],
    ["Pelmadulla", 40, C.yellow, "medium"],
    ["Kalawana", 10, C.green, "safe"],
    ["Nivithigala", 52, "#e07800", "high"],
    ["Elapatha", 10, C.green, "safe"],
    ["Ayagama", 78, "#cc4400", "critical"],
    ["Kahawatta", 10, C.green, "safe"],
    ["Godakawela", 92, C.red, "critical"],
    ["Embilipitiya", 52, "#e07800", "high"],
    ["Kolonna", 10, C.green, "safe"],
  ];

  const stationData = [
    {
      id: "s1",
      name: "Ellagawa",
      time: "09:30",
      level: 4.3,
      max: 10,
      status: "normal",
      color: C.green,
      data: [
        4.1, 4.0, 4.05, 4.1, 4.2, 4.15, 4.3, 4.25, 4.4, 4.6, 5.2, 6.8, 7.1, 6.4,
        5.8, 5.1, 4.6, 4.2, 4.1, 4.0, 4.05, 4.1, 4.2, 4.3,
      ],
      times: [
        "18:30",
        "19:30",
        "20:30",
        "21:30",
        "22:30",
        "23:30",
        "00:30",
        "01:30",
        "02:30",
        "03:30",
        "04:30",
        "05:30",
        "06:30",
        "07:30",
        "08:00",
        "08:10",
        "08:20",
        "08:30",
        "08:40",
        "08:50",
        "09:00",
        "09:10",
        "09:20",
        "09:30",
      ],
    },
    {
      id: "s2",
      name: "Putupaula",
      time: "09:30",
      level: 0.17,
      max: 2,
      status: "normal",
      color: C.green,
      data: [
        0.5, 0.48, 0.5, 0.52, 0.55, 0.6, 0.58, 0.7, 0.8, 0.9, 1.1, 1.4, 1.7,
        1.9, 1.6, 1.2, 0.9, 0.6, 0.4, 0.3, 0.2, 0.18, 0.17, 0.17,
      ],
      times: [
        "18:30",
        "19:30",
        "20:30",
        "21:30",
        "22:30",
        "23:30",
        "00:30",
        "01:30",
        "02:30",
        "03:30",
        "04:30",
        "05:30",
        "06:30",
        "07:30",
        "08:00",
        "08:10",
        "08:20",
        "08:30",
        "08:40",
        "08:50",
        "09:00",
        "09:10",
        "09:20",
        "09:30",
      ],
    },
    {
      id: "s3",
      name: "Rathnapura",
      time: "09:30",
      level: 0.87,
      max: 8,
      status: "normal",
      color: C.green,
      data: [
        0.4, 0.4, 0.5, 0.6, 0.5, 0.4, 0.5, 0.6, 0.5, 0.4, 1.8, 3.2, 4.1, 3.8,
        3.0, 2.1, 1.4, 0.9, 0.6, 0.5, 0.5, 0.6, 0.8, 0.87,
      ],
      times: [
        "18:30",
        "19:30",
        "20:30",
        "21:30",
        "22:30",
        "23:30",
        "00:30",
        "01:30",
        "02:30",
        "03:30",
        "04:30",
        "05:30",
        "06:30",
        "07:30",
        "08:00",
        "08:10",
        "08:20",
        "08:30",
        "08:40",
        "08:50",
        "09:00",
        "09:10",
        "09:20",
        "09:30",
      ],
    },
  ];

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight: "100vh", background: C.bg }}>
        <Header
          emergencyMode={emergencyMode}
          setEmergencyMode={setEmergencyMode}
        />
        <div style={{ display: "flex", margin: "12px 14px 14px" }}>
          <Sidebar page={page} setPage={setPage} />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              overflowY: "auto",
              maxHeight: "calc(100vh - 110px)",
              paddingRight: 2,
            }}
          >
            {/* Page header */}
            <div
              className="fadeUp"
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.4 }}
                >
                  Prediction
                </div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>
                  AI-powered flood risk forecasting · FloodSense ML v2.1 · Last
                  updated: 21 Mar 2026, 14:32 LKT
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["Next 6H", "24H", "48H", "7 Days"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: `1.5px solid ${C.border}`,
                      background: timeRange === t ? C.dark : "#fff",
                      color: timeRange === t ? "#fff" : C.mid,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <TabBar tabs={tabs} active={tab} onChange={setTab} />

            {/* ── WATER LEVEL FORECAST ── */}
            {tab === "waterlevel" && (
              <>
                {/* ── REAL-TIME STATION MONITORING ── */}
                <div className="fadeUp">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>
                        Real-time Station Water Levels
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}
                      >
                        Live sensor readings · Kalu Ganga basin · Auto-refresh
                        30s
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["24H", "48H", "7D"].map((r) => (
                        <button
                          key={r}
                          style={{
                            padding: "5px 14px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            border: `1.5px solid ${C.border}`,
                            background: r === "48H" ? C.dark : "#fff",
                            color: r === "48H" ? "#fff" : C.mid,
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 12,
                    }}
                  >
                    {stationData.map(
                      ({
                        id,
                        name,
                        time,
                        level,
                        max,
                        status,
                        color,
                        data,
                        times,
                      }) => (
                        <Card key={id} style={{ padding: "16px 18px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 800,
                                  color: C.dark,
                                }}
                              >
                                {name}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "#bbb",
                                  marginTop: 2,
                                }}
                              >
                                Last updated: {time}
                              </div>
                            </div>
                            <Badge
                              type={
                                status === "normal"
                                  ? "safe"
                                  : status === "warning"
                                    ? "medium"
                                    : "critical"
                              }
                            >
                              {status === "normal"
                                ? "NORMAL"
                                : status === "warning"
                                  ? "WARNING"
                                  : "CRITICAL"}
                            </Badge>
                          </div>
                          <div style={{ margin: "10px 0 12px" }}>
                            <span
                              style={{
                                fontSize: 38,
                                fontWeight: 900,
                                color: C.dark,
                                letterSpacing: -2,
                                lineHeight: 1,
                              }}
                            >
                              {level.toFixed(2)}
                            </span>
                            <span
                              style={{
                                fontSize: 14,
                                color: "#bbb",
                                fontWeight: 600,
                                marginLeft: 4,
                              }}
                            >
                              m
                            </span>
                          </div>
                          <StationSVGChart
                            id={id}
                            data={data}
                            max={max}
                            color={color}
                            times={times}
                          />
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginTop: 4,
                            }}
                          >
                            {["18:30", "09:30", "18:30", "09:30"].map(
                              (l, i) => (
                                <span
                                  key={i}
                                  style={{
                                    fontSize: 9,
                                    color: "#ccc",
                                    fontFamily: "DM Mono",
                                  }}
                                >
                                  {l}
                                </span>
                              ),
                            )}
                          </div>
                        </Card>
                      ),
                    )}
                  </div>
                </div>

                {/* Water level chart — full width */}
                <Card className="fadeUp">
                  <div
                    style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}
                  >
                    Water Level Prediction — Next 6 Hours
                  </div>
                  <div
                    style={{ fontSize: 11, color: "#aaa", marginBottom: 10 }}
                  >
                    Kalu Ganga at Ratnapura-A2 sensor
                  </div>
                  <svg
                    viewBox="0 0 720 175"
                    style={{ width: "100%", overflow: "visible" }}
                  >
                    {[20, 52, 84, 116, 148].map((y) => (
                      <line
                        key={y}
                        x1="60"
                        y1={y}
                        x2="700"
                        y2={y}
                        stroke="#f0f0f0"
                        strokeWidth="1"
                      />
                    ))}
                    {["6.0m", "5.5m", "5.0m", "4.5m", "4.0m"].map((l, i) => (
                      <text
                        key={i}
                        x="52"
                        y={24 + i * 32}
                        fontSize="9"
                        fill="#bbb"
                        textAnchor="end"
                        fontFamily="DM Mono"
                      >
                        {l}
                      </text>
                    ))}
                    <line
                      x1="60"
                      y1="40"
                      x2="700"
                      y2="40"
                      stroke={C.red}
                      strokeWidth="1.5"
                      strokeDasharray="6,4"
                      opacity=".5"
                    />
                    <text
                      x="702"
                      y="43"
                      fontSize="9"
                      fill={C.red}
                      fontWeight="700"
                    >
                      5.2m
                    </text>
                    <path
                      d="M390,100 L460,82 L530,60 L600,36 L670,18 L670,32 L600,52 L530,76 L460,96 L390,112 Z"
                      fill={C.red}
                      opacity=".07"
                    />
                    <polyline
                      points="60,148 130,140 200,132 270,122 340,110 390,100"
                      fill="none"
                      stroke={C.dark}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="390,100 460,82 530,60 600,36 670,18"
                      fill="none"
                      stroke={C.red}
                      strokeWidth="2.5"
                      strokeDasharray="8,4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="390"
                      y1="12"
                      x2="390"
                      y2="160"
                      stroke="#555"
                      strokeWidth="1.5"
                      strokeDasharray="4,3"
                      opacity=".4"
                    />
                    <rect
                      x="368"
                      y="4"
                      width="44"
                      height="14"
                      rx="4"
                      fill={C.dark}
                    />
                    <text
                      x="390"
                      y="14"
                      fontSize="8"
                      fill="#fff"
                      textAnchor="middle"
                      fontWeight="700"
                    >
                      NOW
                    </text>
                    {[
                      ["60", "−3H", "#bbb"],
                      ["200", "−2H", "#bbb"],
                      ["340", "−1H", "#bbb"],
                      ["390", "14:32", "#333"],
                      ["460", "+1H", C.red],
                      ["530", "+2H", C.red],
                      ["600", "+4H", C.red],
                      ["670", "+6H", C.red],
                    ].map(([x, l, c], i) => (
                      <text
                        key={i}
                        x={x}
                        y="170"
                        fontSize="9"
                        fill={c}
                        textAnchor="middle"
                        fontFamily="DM Mono"
                      >
                        {l}
                      </text>
                    ))}
                    <circle cx="390" cy="100" r="5" fill={C.dark} />
                    {[
                      ["460", "82"],
                      ["530", "60"],
                      ["600", "36"],
                      ["670", "18"],
                    ].map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r="4" fill={C.red} />
                    ))}
                  </svg>
                </Card>

                {/* Live card + Recommended Actions — same row below the chart */}
                <div
                  className="fadeUp"
                  style={{ display: "flex", gap: 12, alignItems: "stretch" }}
                >
                  {/* Kalu Ganga real-time live card */}
                  <Card
                    style={{
                      flex: 1,
                      padding: "16px 18px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>
                          Kalu Ganga — Real-time Water Level
                        </div>
                        <div
                          style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}
                        >
                          Sensor A2 · Ratnapura · Updates every 30s
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 10,
                          fontWeight: 700,
                          color: C.green,
                          background: "#e5f8ee",
                          padding: "4px 10px",
                          borderRadius: 20,
                        }}
                      >
                        <div
                          className="blink"
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: C.green,
                          }}
                        />
                        LIVE
                      </div>
                    </div>
                    <canvas
                      id="riverCanvas"
                      style={{ width: "100%", height: 80, display: "block" }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: 20,
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: `1px solid ${C.border}`,
                      }}
                    >
                      {[
                        ["Current", "4.82m", C.red, "curVal"],
                        ["Threshold", "5.20m", "#aaa", null],
                        ["Rise Rate", "+0.12m/hr", C.orange, null],
                        ["Time to Critical", "~2.5 hrs", C.orange, null],
                        ["Status", "Rising ▲", C.red, null],
                      ].map(([lbl, val, c, id], i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: 0.4,
                              color: "#aaa",
                            }}
                          >
                            {lbl}
                          </span>
                          <span
                            id={id || undefined}
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              fontFamily: "DM Mono",
                              color: c,
                            }}
                          >
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Recommended Actions */}
                  <div
                    style={{
                      width: 400,
                      background: C.dark,
                      borderRadius: 14,
                      padding: 18,
                      color: "#fff",
                      boxShadow: C.shadow,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        color: "#888",
                        marginBottom: 14,
                      }}
                    >
                      ⚡ Recommended Actions
                    </div>
                    {[
                      [
                        "Activate Emergency Alert",
                        "Issue public warnings for Ratnapura & Kalutara.",
                      ],
                      [
                        "Open Safe Zones",
                        "Activate 4 shelters in southern province.",
                      ],
                      [
                        "Road Closures",
                        "Pre-emptively close A8 & B403 routes.",
                      ],
                      [
                        "Deploy Field Teams",
                        "Inspect Kalu Ganga banks — sensor A2 surge.",
                      ],
                    ].map(([icon, head, body], i) => (
                      <div
                        key={i}
                        style={{ display: "flex", gap: 10, marginBottom: 12 }}
                      >
                        <span
                          style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}
                        >
                          {icon}
                        </span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>
                            {head}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "#bbb",
                              marginTop: 3,
                              lineHeight: 1.5,
                            }}
                          >
                            {body}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      style={{
                        marginTop: "auto",
                        width: "100%",
                        padding: 10,
                        background: C.red,
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                    Broadcast Alert
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── RAINFALL PREDICTION ── */}
            {tab === "rainfall" && (
              <>
                <div
                  className="fadeUp"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 12,
                  }}
                ></div>

                <Card className="fadeUp">
                  <div
                    style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}
                  >
                    Hourly Rainfall Forecast — Next 12 Hours
                  </div>
                  <div
                    style={{ fontSize: 11, color: "#aaa", marginBottom: 12 }}
                  >
                    mm/hr · South-West Region · Light blue = predicted
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      alignItems: "flex-end",
                      height: 80,
                    }}
                  >
                    {[
                      [10, false],
                      [13, false],
                      [16, false],
                      [18, false],
                      [14, false],
                      [12, false],
                      [38, true],
                      [40, true],
                      [32, true],
                      [22, true],
                      [16, true],
                      [8, true],
                    ].map(([h, pred], i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 8,
                            color: pred ? C.blue : "#bbb",
                            fontWeight: 700,
                          }}
                        >
                          {h}
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: `${(h / 40) * 100}%`,
                            minHeight: 4,
                            background: pred ? "#9ec4ee" : "#4a8ee0",
                            borderRadius: "3px 3px 0 0",
                            border: pred ? `1.5px dashed #4a8ee0` : "none",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                    {[
                      "08:00",
                      "09:00",
                      "10:00",
                      "11:00",
                      "12:00",
                      "14:00",
                      "15:00",
                      "16:00",
                      "17:00",
                      "18:00",
                      "20:00",
                      "02:00",
                    ].map((l, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          fontSize: 8,
                          color: i >= 6 ? C.blue : "#bbb",
                          textAlign: "center",
                          fontFamily: "DM Mono",
                          fontWeight: i === 7 ? "700" : "400",
                        }}
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                </Card>

                <div
                  className="fadeUp"
                  style={{ display: "flex", gap: 12, alignItems: "stretch" }}
                >
                  <Card style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        marginBottom: 14,
                        color: C.dark,
                      }}
                    >
                      Current Conditions — Ratnapura
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      {[
                        ["WIND", "4 kph", "Dir: WSW", ],
                        ["HUMIDITY", "39%", "Press: 1011 mb",],
                        ["RAIN", "0 mm", "Cloud: 18%", ],
                        ["UV", "13.3", "Vis: 10 km", ],
                      ].map(([label, val, sub, icon], i) => (
                        <div
                          key={i}
                          style={{
                            background: C.bg,
                            borderRadius: 12,
                            padding: "14px 16px",
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              color: "#aaa",
                              marginBottom: 6,
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              fontSize: 24,
                              fontWeight: 900,
                              letterSpacing: -0.5,
                              color: C.dark,
                            }}
                          >
                            {val}
                          </div>
                          <div
                            style={{ fontSize: 11, color: C.mid, marginTop: 4 }}
                          >
                            {sub}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card style={{ flex: 1.6 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        marginBottom: 14,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        color: C.dark,
                      }}
                    >
                      3-Day Forecast
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 10,
                      }}
                    >
                      {[
                        [
                          "Sunday, Mar 22",
                          "🌦",
                          "Patchy rain nearby",
                          "34.5°",
                          "19°",
                          "93%",
                          "5 kph",
                        ],
                        [
                          "Monday, Mar 23",
                          "🌦",
                          "Patchy rain nearby",
                          "34.7°",
                          "18.5°",
                          "88%",
                          "9 kph",
                        ],
                        [
                          "Tuesday, Mar 24",
                          "🌦",
                          "Patchy rain nearby",
                          "34.5°",
                          "18.9°",
                          "88%",
                          "7.9 kph",
                        ],
                      ].map(([day, icon, desc, max, min, rain, wind], i) => (
                        <div
                          key={i}
                          style={{
                            background: C.bg,
                            borderRadius: 12,
                            padding: "14px 12px",
                            border: `1px solid ${C.border}`,
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: C.dark,
                              marginBottom: 10,
                            }}
                          >
                            {day}
                          </div>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>
                            {icon}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: C.mid,
                              marginBottom: 10,
                              lineHeight: 1.4,
                            }}
                          >
                            {desc}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 8,
                              marginBottom: 8,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: C.red,
                              }}
                            >
                              Max: {max}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: C.blue,
                              }}
                            >
                              Min: {min}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: C.mid }}>
                            Rain Chance:{" "}
                            <strong style={{ color: C.dark }}>{rain}</strong>
                          </div>
                          <div
                            style={{ fontSize: 11, color: C.mid, marginTop: 2 }}
                          >
                            Max Wind:{" "}
                            <strong style={{ color: C.dark }}>{wind}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* ── RISK HEATMAP ── */}
            {tab === "heatmap" && (
              <div className="fadeUp" style={{ display: "flex", gap: 12 }}>
                <Card style={{ flex: 1, padding: 0, overflow: "hidden" }}>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      District Risk Heatmap
                    </div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
                      Flood probability — Next 6 Hours
                    </div>
                  </div>
                  <SriLankaMap mode="heatmap" />
                </Card>
              <Card style={{ width: 280, display: "flex", flexDirection: "column" }}>
  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
    District Risk Rankings 
  </div>
  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 10 }}>
    Ratnapura District · All DSD areas
  </div>
  <div
    style={{
      overflowY: "auto",
      flex: 1,
      maxHeight: 280,
      paddingRight: 2,
    }}
  >
    <table style={{ width: "100%" }}>
      <thead
        style={{
          position: "sticky",
          top: 0,
          background: "#fff",
          zIndex: 1,
        }}
      >
        <tr>
          <th>#</th>
          <th>District</th>
          <th>Probability</th>
          <th>Risk</th>
        </tr>
      </thead>
      <tbody>
        {riskRankings.map(([name, pct, c, badge], i) => (
          <tr key={i}>
            <td style={{ fontWeight: 900, color: c, fontSize: 13 }}>
              {i + 1}
            </td>
            <td style={{ fontWeight: 700, fontSize: 13 }}>
              {name}
            </td>
            <td>
              <ProbBar pct={pct} color={c} />
            </td>
            <td>
              <Badge type={badge}>{badge.toUpperCase()}</Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  <div
    style={{
      fontSize: 9,
      color: "#ccc",
      textAlign: "center",
      marginTop: 8,
      letterSpacing: 0.3,
    }}
  >
    ↕ scroll to see all districts
  </div>
</Card>
              </div>
            )}

            {/* ── FLOOD PREDICTION ── */}
            {tab === "floodpred" && (
              <>
                <div
                  className="fadeUp"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 12,
                  }}
                >
                  <StatCard
                    label="Flood Probability (6H)"
                    value="78%"
                    valColor={C.red}
                    sub="▲ High risk — rising fast"
                    subColor={C.red}
                    extra={
                      <div style={{ marginTop: 8 }}>
                        <div
                          style={{
                            background: "#f0f0f0",
                            height: 7,
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: "78%",
                              background: `linear-gradient(90deg,${C.orange},${C.red})`,
                              height: "100%",
                              borderRadius: 4,
                            }}
                          />
                        </div>
                      </div>
                    }
                  />
                  <StatCard
                    label="Predicted Peak Level"
                    value="5.6m"
                    valColor={C.red}
                    sub="▲ Exceeds 5.2m threshold"
                    subColor={C.red}
                    extra={
                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            background: "#f0f0f0",
                            height: 7,
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: "92%",
                              background: C.red,
                              height: "100%",
                              borderRadius: 4,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            color: C.red,
                            fontWeight: 700,
                          }}
                        >
                          92%
                        </span>
                      </div>
                    }
                  />
                  <StatCard
                    label="Expected Flood Onset"
                    value="~3 hrs"
                    valColor={C.orange}
                    sub="17:00–17:30 LKT window"
                  />
                  <StatCard
                    label="Affected Population"
                    value="12,400"
                    valColor={C.dark}
                    sub="Ratnapura + Kalutara zones"
                  />
                </div>

                <div
                  className="fadeUp"
                  style={{ display: "flex", gap: 12, alignItems: "stretch" }}
                >
                  <Card style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}
                    >
                      Water Level &amp; Flood Probability — Next 24 Hours
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}
                    >
                      Kalu Ganga basin · FloodSense ML v2.1 · Hover for details
                    </div>
                    <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                      {[
                        ["#1a1a2e", "Actual Level", "solid"],
                        [C.red, "Predicted Level", "dashed"],
                        [C.orange, "Flood Probability", "dashed"],
                      ].map(([c, l, s], i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <svg width="20" height="8">
                            <line
                              x1="0"
                              y1="4"
                              x2="20"
                              y2="4"
                              stroke={c}
                              strokeWidth="2"
                              strokeDasharray={s === "dashed" ? "4,3" : "0"}
                            />
                          </svg>
                          <span style={{ fontSize: 10, color: "#aaa" }}>
                            {l}
                          </span>
                        </div>
                      ))}
                    </div>
                    <WaterLevelChart C={C} />
                  </Card>

                  <Card
                    style={{
                      width: 280,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}
                    >
                      District Flood Risk
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#aaa", marginBottom: 10 }}
                    >
                      Ratnapura District · All DSD areas
                    </div>
                    <div
                      style={{
                        overflowY: "auto",
                        flex: 1,
                        maxHeight: 280,
                        paddingRight: 2,
                      }}
                    >
                      <table style={{ width: "100%" }}>
                        <thead
                          style={{
                            position: "sticky",
                            top: 0,
                            background: "#fff",
                            zIndex: 1,
                          }}
                        >
                          <tr>
                            <th>Division</th>
                            <th>Probability</th>
                            <th>Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ["Ratnapura", 92, C.red, "critical"],
                            ["Eheliyagoda", 90, C.red, "critical"],
                            ["Kuruvita", 78, "#cc4400", "critical"],
                            ["Kiriella", 65, C.orange, "high"],
                            ["Imbulpe", 60, C.orange, "high"],
                            ["Balangoda", 48, C.yellow, "medium"],
                            ["Opanayake", 40, C.yellow, "medium"],
                            ["Pelmadulla", 22, C.yellow, "medium"],
                            ["Elapatha", 15, C.green, "safe"],
                            ["Ayagama", 12, C.green, "safe"],
                            ["Kalawana", 10, C.green, "safe"],
                            ["Nivithigala", 10, C.green, "safe"],
                            ["Kahawatta", 8, C.green, "safe"],
                            ["Weligepola", 8, C.green, "safe"],
                            ["Embilipitiya", 6, C.green, "safe"],
                            ["Kolonna", 5, C.green, "safe"],
                          ].map(([name, pct, c, badge], i) => (
                            <tr key={i}>
                              <td
                                style={{
                                  fontWeight: 700,
                                  fontSize: 11,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {name}
                              </td>
                              <td>
                                <ProbBar pct={pct} color={c} />
                              </td>
                              <td>
                                <Badge type={badge}>
                                  {badge.toUpperCase()}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#ccc",
                        textAlign: "center",
                        marginTop: 8,
                        letterSpacing: 0.3,
                      }}
                    >
                      ↕ scroll to see all divisions
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
