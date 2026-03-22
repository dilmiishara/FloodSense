// ─── Dashboard.jsx ───────────────────────────────────────────────────────────
import { useState } from "react";
import { C, Card, Badge, Toggle, SriLankaMap, globalCSS, Header, Sidebar, Toast } from "./shared";

export default function Dashboard({ page, setPage }) {
  const [emergencyMode, setEmergencyMode] = useState(true);

  const stats = [
    { label: "Active Sensors",    value: "5",  sub: "● All Online",       subColor: C.green },
    { label: "Critical Alerts",   value: "3",  sub: "▲ +2 today",         subColor: C.red,    valColor: C.red },
    { label: "Affected Districts",value: "6",  sub: "▲ from 4 yesterday", subColor: C.orange, valColor: C.orange },
    { label: "Safe Locations",    value: "12", sub: "● 8 available",      subColor: C.green,  valColor: C.green },
  ];

  const recentAlerts = [
    { icon: "🚨", bg: C.redBg,    title: "Flood Threshold Exceeded — Ratnapura-A2",   desc: "Water level 4.8m — threshold 5.2m (92%)",          time: "14:32" },
    { icon: "⚠️", bg: C.redBg,    title: "Critical Rise Rate — Kalutara-B1",           desc: "Rising 0.4m/hr — predicted critical in 2.5hrs",    time: "14:18" },
    { icon: "🌧", bg: C.orangeBg, title: "Heavy Rainfall Warning — South-West Region", desc: "142mm expected in 6 hours",                        time: "13:55" },
    { icon: "📡", bg: C.yellowBg, title: "Sensor Signal Weak — Colombo-West",          desc: "Signal strength at 42% — check connectivity",      time: "13:20" },
  ];

  const sensors = [
    { name: "Ratnapura-A2",  imei: "865213859621", pct: 87, color: C.red,    pulse: true },
    { name: "Kalutara-B1",   imei: "865213859548", pct: 74, color: C.red,    pulse: true },
    { name: "Colombo-West",  imei: "865213859302", pct: 55, color: C.orange },
    { name: "Kandy-Central", imei: "865213859410", pct: 38, color: C.yellow },
    { name: "Jaffna-North",  imei: "865213859110", pct: 12, color: C.green },
  ];

  const safeZones = [
    { icon: "🏫", name: "Ratnapura Central School", cap: "240 cap", color: C.green },
    { icon: "🏟", name: "Kalutara District Ground",  cap: "500 cap", color: C.green },
    { icon: "🏥", name: "Colombo National Hospital", cap: "120 cap", color: C.yellow },
    { icon: "🕌", name: "Galle Fort Community Hall", cap: "180 cap", color: C.green },
  ];

  const gauges = [
    { label: "CPU", pct: 75, color: C.green, size: 90 },
    { label: "RAM", pct: 38, color: C.yellow, size: 72 },
  ];

  const healthRows = [
    { key: "Uptime",    val: "99.8%",  color: C.green },
    { key: "Last Sync", val: "14:30",  color: C.dark },
    { key: "Server",    val: "Online", color: C.green },
  ];

  const rainBars = [20, 35, 48, 62, 80, 100];
  const rainLabels = ["−5H", "−4H", "−3H", "−2H", "−1H", "Now"];

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight: "100vh", background: C.bg }}>
        <Header emergencyMode={emergencyMode} setEmergencyMode={setEmergencyMode} />
        <div style={{ display: "flex", margin: "12px 14px 14px" }}>
          <Sidebar page={page} setPage={setPage} />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: "calc(100vh - 110px)", paddingRight: 2 }}>

            {/* ── Alert Banner ── */}
            <div className="fadeUp" style={{ background: C.red, color: "#fff", borderRadius: 12, padding: "11px 18px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600 }}>
              <span>🚨</span>
              <span><strong>CRITICAL ALERT:</strong> Water levels in Ratnapura exceeding flood threshold — immediate action required</span>
              <span style={{ marginLeft: "auto", background: "rgba(255,255,255,.25)", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>3 ACTIVE</span>
            </div>

            {/* ── Stat Cards ── */}
            <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              {stats.map((s, i) => (
                <Card key={i} style={{ padding: "16px 18px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: .4, color: "#aaa", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, letterSpacing: -1, color: s.valColor || C.dark }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: s.subColor, marginTop: 5, fontWeight: 600 }}>{s.sub}</div>
                </Card>
              ))}
            </div>

            {/* ── Main Row ── */}
            <div className="fadeUp" style={{ display: "flex", gap: 12 }}>

              {/* Sensor Status */}
              <Card style={{ width: 210, flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "#aaa", marginBottom: 10 }}>Sensor Status</div>
                {sensors.map((s, i) => (
                  <div key={i} style={{ background: C.light, borderRadius: 9, padding: "9px 11px", marginBottom: 6, border: `1.5px solid ${C.border}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>
                      <span className={s.pulse ? "pulse" : ""} style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: s.color, marginRight: 5 }} />
                      {s.name}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                      <span style={{ fontSize: 10, color: "#aaa" }}>IMEI …{s.imei.slice(-6)}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: s.color }}>{s.pct}%</span>
                    </div>
                  </div>
                ))}
              </Card>

              {/* Map */}
              <Card style={{ flex: 1, padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>🗺 Live Overview — Sri Lanka</span>
                  <span style={{ fontSize: 11, background: C.redBg, color: C.red, borderRadius: 20, padding: "3px 10px", fontWeight: 700 }}>● 3 Critical Zones</span>
                </div>
                <SriLankaMap mode="sensor" />
              </Card>

              {/* System Health */}
              <Card style={{ width: 178, flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "#aaa", marginBottom: 10 }}>System Health</div>
                {gauges.map((g, i) => (
                  <div key={i} style={{ marginBottom: 12, display: "flex", justifyContent: "center", position: "relative" }}>
                    <svg width={g.size} height={g.size} viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f0f0f0" strokeWidth="10"/>
                      <circle cx="50" cy="50" r="40" fill="none" stroke={g.color} strokeWidth="10"
                        strokeDasharray={`${g.pct * 2.51} 251`} strokeDashoffset="63"
                        strokeLinecap="round" transform="rotate(-90 50 50)"/>
                    </svg>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                      <div style={{ fontSize: i === 0 ? 20 : 16, fontWeight: 900 }}>{g.pct}%</div>
                      <div style={{ fontSize: 9, color: "#aaa", fontWeight: 600 }}>{g.label}</div>
                    </div>
                  </div>
                ))}
                {healthRows.map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 2 ? `1px solid #fafafa` : "none", fontSize: 12 }}>
                    <span style={{ color: C.mid }}>{r.key}</span>
                    <span style={{ fontWeight: 700, color: r.color }}>{r.val}</span>
                  </div>
                ))}
              </Card>
            </div>

            {/* ── Bottom Row ── */}
            <div className="fadeUp" style={{ display: "flex", gap: 12 }}>

              {/* Recent Alerts */}
              <Card style={{ flex: 1.4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "#aaa", marginBottom: 10 }}>Recent Alerts</div>
                {recentAlerts.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < recentAlerts.length - 1 ? `1px solid #fafafa` : "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{a.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: C.mid, marginTop: 2 }}>{a.desc}</div>
                    </div>
                    <div style={{ fontSize: 10, color: "#bbb", fontFamily: "DM Mono", whiteSpace: "nowrap" }}>{a.time}</div>
                  </div>
                ))}
              </Card>

              {/* Rainfall Trend */}
              <Card style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "#aaa", marginBottom: 8 }}>Rainfall — 6H Trend</div>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 60 }}>
                  {rainBars.map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: `rgba(26,82,204,${.3 + i * .14})`, borderRadius: "3px 3px 0 0" }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                  {rainLabels.map((l, i) => (
                    <div key={i} style={{ flex: 1, fontSize: 9, color: "#bbb", textAlign: "center", fontFamily: "DM Mono" }}>{l}</div>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: C.mid }}>Peak: <strong style={{ color: "#1055aa" }}>142mm/hr</strong> · Ongoing</div>
              </Card>

              {/* Safe Zones */}
              <Card style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "#aaa", marginBottom: 8 }}>Safe Locations</div>
                {safeZones.map((z, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < safeZones.length - 1 ? `1px solid #fafafa` : "none", fontSize: 12 }}>
                    <span style={{ fontSize: 14 }}>{z.icon}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 11 }}>{z.name}</span>
                    <span style={{ color: C.mid, fontSize: 11 }}>{z.cap}</span>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: z.color, flexShrink: 0 }} />
                  </div>
                ))}
                <div style={{ marginTop: 8, fontSize: 11, color: C.mid }}>Total: <strong>12 locations</strong> · 8 available</div>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}