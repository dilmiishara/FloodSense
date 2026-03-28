// ─── Alerts.jsx ──────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  C,
  Card,
  Badge,
  Btn,
  Input,
  Select,
  globalCSS,
  Header,
  Sidebar,
  TabBar,
  ToggleRow,
} from "../shared.jsx";

export default function Alerts({ page, setPage }) {
  const [emergencyMode, setEmergencyMode] = useState(true);
  const [tab, setTab] = useState("active");

  const tabs = [
    { id: "active", label: "Active Alerts " },
    { id: "history", label: "Alert History" },
    { id: "thresholds", label: "Alert Thresholds" },
    { id: "recipients", label: "Notification Recipients" },
  ];

  const activeAlerts = [
    {
      dot: C.red,
      pulse: true,
      title: " Flood Threshold Exceeded",
      desc: "Water level 4.8m — threshold 5.2m (92%)",
      loc: "Imbulpe ",
      time: "14:32",
      badge: "critical",
      action: "Respond",
    },
    {
      dot: C.red,
      pulse: true,
      title: " River Overflow Risk",
      desc: "Kalu Ganga at 68% — banks at risk",
      loc: "Embilipitiya",
      time: "14:05",
      badge: "critical",
      action: "Respond",
    },
    {
      dot: C.orange,
      pulse: false,
      title: " Heavy Rainfall Warning",
      desc: "142mm expected in 6 hours — Kalawana ",
      loc: "Kalawana ",
      time: "13:55",
      badge: "high",
      action: "View",
    },
    {
      dot: C.orange,
      pulse: false,
      title: " Sensor Signal Degraded",
      desc: "Signal strength 42% — readings may be inaccurate",
      loc: "Ayagama",
      time: "13:20",
      badge: "high",
      action: "View",
    },
    {
      dot: C.yellow,
      pulse: false,
      title: " Elevated Water Level",
      desc: "Water at 38% — rising trend observed",
      loc: "Godakawela",
      time: "12:44",
      badge: "medium",
      action: "Monitor",
    },
  ];

  const historyAlerts = [
    {
      title: "Water Level Normalised",
      desc: "Level dropped to 2.1m — all clear",
      loc: "Nivithigala",
      time: "11:20",
      status: "active",
      dur: "3h 20m",
    },
    {
      title: "Rainfall Alert Cleared",
      desc: "Rainfall subsided — no further warnings",
      loc: "Godakawela",
      time: "09:45",
      status: "active",
      dur: "1h 55m",
    },
    {
      title: "Sensor Reconnected",
      desc: "Signal restored to 95%",
      loc: "Embilipitiya",
      time: "08:30",
      status: "active",
      dur: "25m",
    },
    {
      title: "Flash Flood Warning",
      desc: "Alert escalated to district authorities",
      loc: "Kolonna",
      time: "Yesterday 18:15",
      status: "warn",
      dur: "6h 40m",
    },
    {
      title: "River Level Stabilised",
      desc: "Mahaweli Ganga returned to normal",
      loc: "Ratnapura ",
      time: "Yesterday 14:00",
      status: "active",
      dur: "2h 10m",
    },
  ];

  const thresholds = [
    {
      name: "Water Level",
      sub: "Ratnapura",
      warn: "4.0m",
      crit: "5.2m",
      cur: "4.8m — CRITICAL",
      pct: 92,
      color: C.red,
    },
    {
      name: "Water Level",
      sub: "Godakawela",
      warn: "3.5m",
      crit: "4.8m",
      cur: "3.9m — HIGH",
      pct: 81,
      color: C.orange,
    },
    {
      name: "Rainfall Rate",
      sub: "Kolonna",
      warn: "80mm",
      crit: "120mm",
      cur: "142mm — EXCEEDED",
      pct: 100,
      color: C.red,
    },
    {
      name: "Rise Rate",
      sub: "All Sensors",
      warn: "0.2m/hr",
      crit: "0.35m/hr",
      cur: "0.22m/hr — MEDIUM",
      pct: 55,
      color: C.yellow,
    },
  ];

  const escalationSteps = [
    {
      num: 1,
      color: C.yellow,
      bg: C.yellowBg,
      title: " Medium Alert Triggered",
      desc: "Auto-notify: Field Officers via SMS + App · Response window: 30 minutes",
      badge: "medium",
      label: "AUTO",
    },
    {
      num: 2,
      color: C.orange,
      bg: C.orangeBg,
      title: " High Alert — No Response in 30 min",
      desc: "Escalate to: District Secretary + DMC Officer · Window: 15 minutes",
      badge: "high",
      label: "ESCALATE",
    },
    {
      num: 3,
      color: C.red,
      bg: C.redBg,
      title: " Critical Alert — Automatic Emergency",
      desc: "Immediate: Broadcast to all channels + DMC Director call + Public alert sirens",
      badge: "critical",
      label: "CRITICAL",
    },
    {
      num: 4,
      color: "#555",
      bg: "#f0f0f0",
      title: " National Emergency Level",
      desc: "Manual activation only · Requires authorisation from DMC Director · Presidential Secretariat notified",
      badge: "inactive",
      label: "MANUAL",
    },
  ];

  const actBtn = {
    padding: "4px 10px",
    borderRadius: 7,
    border: `1.5px solid ${C.border}`,
    background: "#fff",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };
  const locTag = {
    fontSize: 11,
    background: C.light,
    borderRadius: 6,
    padding: "3px 8px",
    fontWeight: 600,
  };

  const [officers, setOfficers] = useState([
    [
      "RK",
      "Ravi Kumara",
      "Senior Field Officer · Kuruwita",
      ["SMS", "Email", "App"],
      "#1a52cc",
    ],
    [
      "DK",
      "Dinesh Kumara",
      "Field Officer · Kahawaththa",
      ["SMS", "App"],
      "#883300",
    ],
    ["SP", "Saman Perera", "Field Officer · Kolonna", ["SMS", "Email"], "#555"],
    [
      "NP",
      "Nuwan Perera",
      "Field Officer · Balangoda ",
      ["SMS", "App"],
      "#0a7f5a",
    ],
    [
      "AS",
      "Anura Silva",
      "Field Officer · Embilipitiya",
      ["SMS", "Email"],
      "#cc5500",
    ],
    [
      "WS",
      "Wasana Senanayake",
      "Field Officer · Ratnapura",
      ["SMS", "App"],
      "#6a0dad",
    ],
  ]);

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
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.4 }}
                >
                  {" "}
                  Alerts
                </div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>
                  Monitor, manage and configure all system alerts
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                
                <Btn variant="red"> Broadcast Alert</Btn>
              </div>
            </div>

            {/* Summary cards */}
            <div
              className="fadeUp"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 10,
              }}
            >
              {[
                ["Critical", "3", "Ratnapura, Kahawatta, Balangoda ", C.red],
                ["High Alert", "4", "2 new in last hour", C.orange],
                ["Medium", "7", "Monitoring ongoing", C.yellow],
                ["Resolved Today", "5", "Last: Colombo 11:20", C.green],
              ].map(([label, val, sub, c], i) => (
                <div
                  key={i}
                  style={{
                    background: C.white,
                    borderRadius: 12,
                    padding: "14px 16px",
                    boxShadow: C.shadow,
                    borderLeft: `4px solid ${c}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#aaa",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: c,
                      marginTop: 4,
                    }}
                  >
                    {val}
                  </div>
                  <div style={{ fontSize: 11, color: C.mid, marginTop: 3 }}>
                    {sub}
                  </div>
                </div>
              ))}
            </div>

            <TabBar tabs={tabs} active={tab} onChange={setTab} />

            {/* ── Active Alerts ── */}
            {tab === "active" && (
              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <Input
                    placeholder=" Search alerts by location, type…"
                    style={{ flex: 1, padding: "8px 12px" }}
                  />
                  <Select style={{ width: 150 }}>
                    <option>All Severity</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                  </Select>
                  <Select style={{ width: 150 }}>
                    <option>All DS Divisions</option>
                    <option>Eheliyagoda </option>
                    <option>Kuruvita </option>
                    <option>Kiriella </option>
                    <option>Ratnapura</option>
                    <option>Imbulpe </option>
                    <option>Balangoda </option>
                    <option>Opanayake </option>
                    <option>Pelmadulla </option>
                    <option>Elapatha</option>
                    <option>Ayagama</option>
                    <option>Kalawana</option>
                    <option>Nivithigala</option>
                    <option>Kahawatta</option>
                    <option>Godakawela</option>
                    <option>Weligepola </option>
                    <option>Embilipitiya</option>
                    <option>Kolonna</option>
                  </Select>
                  <Select style={{ width: 140 }}>
                    <option>All Types</option>
                    <option>Water Level</option>
                    <option>Rainfall</option>
                    <option>Sensor</option>
                  </Select>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 20 }}></th>
                      <th>Alert</th>
                      <th>Location</th>
                      <th>Time</th>
                      <th>Severity</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAlerts.map((a, i) => (
                      <tr key={i}>
                        <td>
                          <span
                            className={a.pulse ? "pulse" : ""}
                            style={{
                              display: "inline-block",
                              width: 9,
                              height: 9,
                              borderRadius: "50%",
                              background: a.dot,
                            }}
                          />
                        </td>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>
                            {a.title}
                          </div>
                          <div
                            style={{ fontSize: 11, color: C.mid, marginTop: 2 }}
                          >
                            {a.desc}
                          </div>
                        </td>
                        <td>
                          <span style={locTag}>{a.loc}</span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 11,
                              color: C.mid,
                              fontFamily: "DM Mono",
                            }}
                          >
                            Today {a.time}
                          </span>
                        </td>
                        <td>
                          <Badge type={a.badge}>{a.badge.toUpperCase()}</Badge>
                        </td>
                        <td>
                          <button style={actBtn}>{a.action}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {/* ── Alert History ── */}
            {tab === "history" && (
              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <Input
                    placeholder=" Search history…"
                    style={{ flex: 1, padding: "8px 12px" }}
                  />
                  <Select style={{ width: 160 }}>
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </Select>
                  <Select style={{ width: 160 }}>
                    <option>All Types</option>
                    <option>Resolved</option>
                    <option>Dismissed</option>
                    <option>Escalated</option>
                  </Select>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Alert</th>
                      <th>Location</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyAlerts.map((a, i) => (
                      <tr key={i}>
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background:
                                a.status === "active" ? C.green : C.orange,
                            }}
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>
                            {a.title}
                          </div>
                          <div style={{ fontSize: 11, color: C.mid }}>
                            {a.desc}
                          </div>
                        </td>
                        <td>
                          <span style={locTag}>{a.loc}</span>
                        </td>
                        <td
                          style={{
                            fontSize: 11,
                            color: C.mid,
                            fontFamily: "DM Mono",
                          }}
                        >
                          {a.time}
                        </td>
                        <td>
                          <Badge
                            type={a.status === "active" ? "active" : "warn"}
                          >
                            {a.status === "active" ? "RESOLVED" : "ESCALATED"}
                          </Badge>
                        </td>
                        <td
                          style={{
                            fontSize: 11,
                            color: C.mid,
                            fontFamily: "DM Mono",
                          }}
                        >
                          {a.dur}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {/* ── Alert Thresholds ── */}
            {tab === "thresholds" && (
              <Card>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    Alert Threshold Configuration
                  </div>
                  <Btn style={{ fontSize: 12, padding: "7px 14px" }}>
                    + Add Threshold
                  </Btn>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Warning</th>
                      <th>Critical</th>
                      <th>Current Level</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {thresholds.map((t, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>
                            {t.name}
                          </div>
                          <div style={{ fontSize: 11, color: C.mid }}>
                            {t.sub}
                          </div>
                        </td>
                        <td style={{ fontFamily: "DM Mono", fontSize: 12 }}>
                          {t.warn}
                        </td>
                        <td
                          style={{
                            fontFamily: "DM Mono",
                            fontSize: 12,
                            color: C.red,
                            fontWeight: 700,
                          }}
                        >
                          {t.crit}
                        </td>
                        <td>
                          <div
                            style={{
                              height: 6,
                              background: "#f0f0f0",
                              borderRadius: 3,
                              width: 120,
                              overflow: "hidden",
                              marginBottom: 3,
                            }}
                          >
                            <div
                              style={{
                                width: `${t.pct}%`,
                                height: "100%",
                                background: t.color,
                                borderRadius: 3,
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: t.color,
                              fontWeight: 700,
                            }}
                          >
                            {t.cur}
                          </div>
                        </td>
                        <td>
                          <button style={actBtn}>Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {/* ── Notification Recipients ── */}
            {tab === "recipients" && (
              <div
                style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}
              >
                <Card>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 12,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    Ratnapura Field Officers
                    <Btn
                      variant="outline"
                      style={{ fontSize: 11, padding: "4px 10px" }}
                      onClick={() => {
                        const name = prompt("Enter Officer Name");
                        const area = prompt("Enter Area (e.g., Ratnapura-2A)");
                        if (name && area) {
                          setOfficers([
                            ...officers,
                            [
                              name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase(),
                              name,
                              `Field Officer · ${area}`,
                              ["SMS", "App"],
                              "#1a52cc",
                            ],
                          ]);
                        }
                      }}
                    >
                      + Add
                    </Btn>
                  </div>

                  {officers.map(([init, name, role, chs, color], i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 0",
                        borderBottom:
                          i < officers.length - 1
                            ? `1px solid #fafafa`
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {init}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {name}
                        </div>
                        <div style={{ fontSize: 11, color: C.mid }}>{role}</div>
                      </div>

                      <div style={{ display: "flex", gap: 4 }}>
                        {chs.map((ch) => (
                          <span
                            key={ch}
                            style={{
                              fontSize: 10,
                              background: C.light,
                              borderRadius: 5,
                              padding: "2px 7px",
                              fontWeight: 600,
                              color: C.mid,
                            }}
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </Card>
                <Card style={{ height: 200, overflowY: "auto" }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}
                  >
                    Alert Channels
                  </div>
                  {[
                    ["", "SMS Alert", "Dialog · Airtel · Hutch", "active"],
                    [
                      "",
                      "Push Notifications",
                      "FloodSense Mobile App",
                      "active",
                    ],
                  ].map(([icon, name, sub, status], i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 0",
                        borderBottom: i < 3 ? `1px solid #fafafa` : "none",
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {name}
                        </div>
                        <div style={{ fontSize: 11, color: C.mid }}>{sub}</div>
                      </div>
                      <Badge type={status}>
                        {status === "active" ? "ACTIVE" : "MANUAL"}
                      </Badge>
                    </div>
                  ))}
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}