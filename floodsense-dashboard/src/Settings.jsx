// ─── Settings.jsx ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  C,
  Card,
  Badge,
  Btn,
  Input,
  Select,
  FormGroup,
  Toggle,
  ToggleRow,
  globalCSS,
  Header,
  Sidebar,
  Toast,
} from "./shared";

export default function Settings({ page, setPage }) {
  const [emergencyMode, setEmergencyMode] = useState(true);
  const [section, setSection] = useState("system");
  const [toast, setToast] = useState(null);

  const [tog, setTog] = useState({
    emergency: true,
    escalation: true,
    maintenance: false,
    api: true,
    sensorAlert: true,
    predictOffline: true,
    autoReconnect: false,
    sms: true,
    email: true,
    push: true,
    radio: false,
    siren: false,
    quiet: false,
    dedup: true,
    allclear: true,
    pins: true,
    safepins: true,
    shading: true,
    heat: false,
    borders: true,
    rivers: true,
    autoOpen: true,
    notify: true,
    capacity: true,
    autoClose: false,
  });
  const t = (k) => setTog((p) => ({ ...p, [k]: !p[k] }));
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const navItems = [
    { id: "system", label: "System Settings" },
    { id: "sensor", label: "Sensor Config" },
    { id: "alerts", label: "Alert & Notifications" },
    { id: "map", label: "Map & Location" },
    { id: "safezone", label: "Safe Zone Mgmt" },
    { id: "users", label: "User & Access" },
  ];

  const GroupLabel = ({ children }) => (
    <div
      style={{
        fontSize: 12,
        fontWeight: 800,
        color: C.mid,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        margin: "18px 0 12px",
        paddingBottom: 8,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      {children}
    </div>
  );

  const SaveFooter = ({ label = " Save Changes", onSave }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 18,
        paddingTop: 16,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <Btn variant="outline">Reset</Btn>
      <Btn
        onClick={() =>
          showToast(
            ` ${label.replace(" ", "").replace(" Changes", "")} saved!`,
          )
        }
      >
        {label}
      </Btn>
    </div>
  );

  const actBtn = {
    padding: "4px 9px",
    borderRadius: 7,
    border: `1.5px solid ${C.border}`,
    background: "#fff",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };

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
            <div className="fadeUp">
              <div
                style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.4 }}
              >
                 Settings
              </div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>
                Configure system, sensors, alerts, map, safe zones and users
              </div>
            </div>

            <div
              className="fadeUp"
              style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
            >
              {/* Settings Nav */}
              <div
                style={{
                  width: 200,
                  background: C.white,
                  borderRadius: 14,
                  padding: 8,
                  boxShadow: C.shadow,
                  flexShrink: 0,
                }}
              >
                {navItems.map((item, i) => (
                  <div key={item.id}>
                    {i === 5 && (
                      <div
                        style={{
                          height: 1,
                          background: C.border,
                          margin: "6px 0",
                        }}
                      />
                    )}
                    <div
                      onClick={() => setSection(item.id)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: section === item.id ? 700 : 500,
                        cursor: "pointer",
                        color: section === item.id ? "#fff" : C.mid,
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        marginBottom: 1,
                        background:
                          section === item.id ? C.dark : "transparent",
                        transition: "all .15s",
                      }}
                    >
                      <span
                        style={{ fontSize: 15, width: 18, textAlign: "center" }}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {/* ── SYSTEM SETTINGS ── */}
                {section === "system" && (
                  <Card>
                    <div
                      style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}
                    >
                      System Settings
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}
                    >
                      General portal configuration, timezone and display
                      preferences
                    </div>
                    <GroupLabel>Portal Identity</GroupLabel>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 14,
                        marginBottom: 4,
                      }}
                    >
                      <FormGroup label="System Name">
                        <Input defaultValue="FloodSense Portal" />
                      </FormGroup>
                      <FormGroup label="Organization / Authority Name">
                        <Input defaultValue="FloodSense.gov.lk" />
                      </FormGroup>
                    </div>
                    <GroupLabel>Regional Settings</GroupLabel>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 14,
                        marginBottom: 4,
                      }}
                    >
                      <FormGroup label="Time Zone">
                        <Select>
                          <option>Asia / Colombo (UTC+5:30)</option>
                          <option>UTC</option>
                        </Select>
                      </FormGroup>
                      {/* <FormGroup label="Language"><Select><option>English</option><option>සිංහල</option><option>தமிழ்</option></Select></FormGroup> */}
                      <FormGroup label="Date Format">
                        <Select>
                          <option>DD/MM/YYYY</option>
                          <option>MM/DD/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </Select>
                      </FormGroup>
                    </div>
                    <GroupLabel>Data & Performance</GroupLabel>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 14,
                        marginBottom: 4,
                      }}
                    >
                      <FormGroup label="Data Refresh Rate">
                        <Select>
                          <option>Every 30 seconds</option>
                          <option>Every 1 minute</option>
                          <option>Every 5 minutes</option>
                        </Select>
                      </FormGroup>
                      <FormGroup label="Default Map View">
                        <Select>
                          <option>Detailed Map</option>
                          <option>District Overview</option>
                          <option>Heatmap</option>
                        </Select>
                      </FormGroup>
                    </div>
                    <GroupLabel>System Features</GroupLabel>
                    <ToggleRow
                      name="Emergency Mode"
                      desc="Override all thresholds and broadcast to all channels"
                      on={tog.emergency}
                      onToggle={() => t("emergency")}
                    />
                    {/* <ToggleRow name="Auto-Escalation" desc="Automatically escalate unacknowledged critical alerts" on={tog.escalation} onToggle={() => t("escalation")}/> */}
                    <ToggleRow
                      name="Maintenance Mode"
                      desc="Suppress all alerts during scheduled maintenance"
                      on={tog.maintenance}
                      onToggle={() => t("maintenance")}
                    />
                    {/* <ToggleRow name="Public Data API" desc="Allow read-only access to sensor data via public API" on={tog.api} onToggle={() => t("api")}/> */}
                    <SaveFooter
                      label=" Save System Settings"
                      onSave={() => showToast("System settings saved!")}
                    />
                  </Card>
                )}

                {/* ── SENSOR CONFIG ── */}
                {section === "sensor" && (
                  <Card>
                    <div
                      style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}
                    >
                      Sensor Configuration
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}
                    >
                      Calibration, polling intervals and sensor-level settings
                    </div>
                    <GroupLabel>Global Sensor Defaults</GroupLabel>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 14,
                        marginBottom: 4,
                      }}
                    >
                      <FormGroup label="Default Poll Interval">
                        <Select>
                          <option>Every 30 seconds</option>
                          <option>Every 1 min</option>
                          <option>Every 5 min</option>
                        </Select>
                      </FormGroup>
                      <FormGroup label="Data Retention Period">
                        <Select>
                          <option>90 days</option>
                          <option>180 days</option>
                          <option>1 year</option>
                        </Select>
                      </FormGroup>
                      <FormGroup label="Signal Timeout (sec)">
                        <Input defaultValue="120" type="number" />
                      </FormGroup>
                    </div>
                    <GroupLabel>Per-Sensor Settings</GroupLabel>
                    <table>
                      <thead>
                        <tr>
                          <th>Sensor</th>
                          <th>Poll Rate</th>
                          <th>Calibration</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          [
                            "Ratnapura-A2",
                            "865213859621",
                            "30s",
                            "+0.05m",
                            "active",
                          ],
                          [
                            "Kalutara-B1",
                            "865213859548",
                            "30s",
                            "+0.00m",
                            "active",
                          ],
                          [
                            "Colombo-West",
                            "865213859302",
                            "1min",
                            "−0.02m",
                            "warn",
                          ],
                          [
                            "Kandy-Central",
                            "865213859410",
                            "30s",
                            "+0.01m",
                            "active",
                          ],
                          [
                            "Jaffna-North",
                            "865213859110",
                            "30s",
                            "+0.00m",
                            "active",
                          ],
                        ].map(([name, imei, poll, cal, status], i) => (
                          <tr key={i}>
                            <td>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>
                                {name}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: C.mid,
                                  fontFamily: "DM Mono",
                                }}
                              >
                                {imei}
                              </div>
                            </td>
                            <td style={{ fontFamily: "DM Mono", fontSize: 12 }}>
                              {poll}
                            </td>
                            <td style={{ fontFamily: "DM Mono", fontSize: 12 }}>
                              {cal}
                            </td>
                            <td>
                              <Badge type={status}>
                                {status === "active" ? "ACTIVE" : "WEAK SIG"}
                              </Badge>
                            </td>
                            <td>
                              <button style={actBtn}>⚙ Edit</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <GroupLabel>Offline Behaviour</GroupLabel>
                    <ToggleRow
                      name="Alert on Sensor Offline"
                      desc="Trigger alert if a sensor stops sending data for 2+ minutes"
                      on={tog.sensorAlert}
                      onToggle={() => t("sensorAlert")}
                    />
                    <ToggleRow
                      name="Predict Using Last Reading"
                      desc="Use last known value for forecasting when sensor is offline"
                      on={tog.predictOffline}
                      onToggle={() => t("predictOffline")}
                    />
                    <ToggleRow
                      name="Auto-Reconnect Attempts"
                      desc="Retry sensor connection every 60 seconds"
                      on={tog.autoReconnect}
                      onToggle={() => t("autoReconnect")}
                    />
                    <SaveFooter label=" Save Sensor Config" />
                  </Card>
                )}

                {/* ── ALERT & NOTIFICATIONS ── */}
                {section === "alerts" && (
                  <Card>
                    <div
                      style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}
                    >
                      {" "}
                      Alert & Notification Settings
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}
                    >
                      Configure how, when and to whom alerts are sent
                    </div>
                    <GroupLabel>Global Alert Thresholds</GroupLabel>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 14,
                        marginBottom: 4,
                      }}
                    >
                      <FormGroup
                        label="Warning Level (%)"
                        hint="Trigger yellow alert"
                      >
                        <Input defaultValue="60" type="number" />
                      </FormGroup>
                      <FormGroup
                        label="High Alert Level (%)"
                        hint="Trigger orange alert"
                      >
                        <Input defaultValue="75" type="number" />
                      </FormGroup>
                      <FormGroup
                        label="Critical Level (%)"
                        hint="Trigger red / emergency"
                      >
                        <Input defaultValue="88" type="number" />
                      </FormGroup>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 14,
                        marginBottom: 4,
                      }}
                    >
                      <FormGroup label="Rise Rate Warning (m/hr)">
                        <Input defaultValue="0.20" type="number" step="0.01" />
                      </FormGroup>
                      <FormGroup label="Rise Rate Critical (m/hr)">
                        <Input defaultValue="0.35" type="number" step="0.01" />
                      </FormGroup>
                      <FormGroup label="Repeat Alert Interval (min)">
                        <Input defaultValue="15" type="number" />
                      </FormGroup>
                    </div>
                    <GroupLabel>Notification Channels</GroupLabel>
                    {/* <ToggleRow name=" SMS Gateway" desc="Dialog · Airtel · Hutch — Send SMS to registered field officers" on={tog.sms} onToggle={() => t("sms")}/> */}
                    {/* <ToggleRow name=" Email Alerts" desc="alerts@floodsense.gov.lk — SMTP configured" on={tog.email} onToggle={() => t("email")}/> */}
                    <ToggleRow
                      name="App Push Notifications"
                      desc="Send to all logged-in FloodSense mobile app users"
                      on={tog.push}
                      onToggle={() => t("push")}
                    />
                    {/* <ToggleRow name=" Public Broadcast (Radio)" desc="SLBC · Sirasa FM — Manual approval required" on={tog.radio} onToggle={() => t("radio")}/> */}
                    {/* <ToggleRow name=" Emergency Siren Activation" desc="Trigger district siren network on critical alerts only" on={tog.siren} onToggle={() => t("siren")}/> */}
                    <GroupLabel>Alert Behaviour</GroupLabel>
                    <ToggleRow
                      name="Quiet Hours"
                      desc="Suppress non-critical notifications between 22:00 – 06:00"
                      on={tog.quiet}
                      onToggle={() => t("quiet")}
                    />
                    <ToggleRow
                      name="Alert Deduplication"
                      desc="Don't resend the same alert within the repeat interval"
                      on={tog.dedup}
                      onToggle={() => t("dedup")}
                    />
                    <ToggleRow
                      name="All-Clear Notification"
                      desc="Send notification when water levels return to safe range"
                      on={tog.allclear}
                      onToggle={() => t("allclear")}
                    />
                    <GroupLabel>Test & Diagnostics</GroupLabel>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[" Test Push", " Run Diagnostics"].map((l) => (
                        <button
                          key={l}
                          onClick={() => showToast(`✅ ${l} completed`)}
                          style={{
                            padding: "7px 14px",
                            borderRadius: 8,
                            border: `1.5px solid ${C.border}`,
                            background: "#fff",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    <SaveFooter label="💾 Save Alert Settings" />
                  </Card>
                )}

                {/* ── MAP & LOCATION ── */}
                {section === "map" && (
                  <Card>
                    <div
                      style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}
                    >
                      {" "}
                      Map & Location Settings
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}
                    >
                      Default map view, layers and display preferences
                    </div>

                    <GroupLabel>Visible Layers</GroupLabel>
                    <ToggleRow
                      name="Sensor Location Pins"
                      desc="Show active sensor pins on all map views"
                      on={tog.pins}
                      onToggle={() => t("pins")}
                    />
                    <ToggleRow
                      name="Safe Zone Markers"
                      desc="Show shelter and safe zone markers on maps"
                      on={tog.safepins}
                      onToggle={() => t("safepins")}
                    />
                    <ToggleRow
                      name="Affected Area Shading"
                      desc="Show colour-coded district shading by flood risk level"
                      on={tog.shading}
                      onToggle={() => t("shading")}
                    />
                    <ToggleRow
                      name="Risk Heatmap Overlay"
                      desc="Show heat blobs over high-risk areas"
                      on={tog.heat}
                      onToggle={() => t("heat")}
                    />
                    <ToggleRow
                      name="District Boundary Lines"
                      desc="Show administrative district borders"
                      on={tog.borders}
                      onToggle={() => t("borders")}
                    />
                    <ToggleRow
                      name="River / Water Body Labels"
                      desc="Label rivers and water bodies on map"
                      on={tog.rivers}
                      onToggle={() => t("rivers")}
                    />
                    <SaveFooter label=" Save Map Settings" />
                  </Card>
                )}

                {/* ── SAFE ZONE MGMT ── */}
                {section === "safezone" && (
                  <Card>
                    <div
                      style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}
                    >
                      {" "}
                      Safe Zone Management
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}
                    >
                      Configure defaults, capacity rules and activation triggers
                    </div>
                    <GroupLabel>Automatic Activation Rules</GroupLabel>
                    <ToggleRow
                      name="Auto-Open on Critical Alert"
                      desc="Automatically mark safe zones open when a Critical alert fires"
                      on={tog.autoOpen}
                      onToggle={() => t("autoOpen")}
                    />
                    <ToggleRow
                      name="Notify Contacts on Activation"
                      desc="Send SMS to safe zone contacts when activated"
                      on={tog.notify}
                      onToggle={() => t("notify")}
                    />

                    <SaveFooter label=" Save Safe Zone Settings" />
                  </Card>
                )}

                {/* ── USER & ACCESS ── */}
                {section === "users" && (
                  <Card>
                    <div
                      style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}
                    >
                      {" "}
                      User & Access Management
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}
                    >
                      Manage accounts, roles and access permissions
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginBottom: 12,
                      }}
                    >
                      <Btn
                        style={{ fontSize: 12, padding: "7px 14px" }}
                        onClick={() => showToast("✅ Invitation sent!")}
                      >
                        + Invite User
                      </Btn>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Last Login</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          [
                            "MR",
                            "Ravi Kumara",
                            "m.rajapaksa@floodsense.gov.lk",
                            "admin",
                            "21 Mar 14:32",
                            "active",
                            "#1a1a1a",
                          ],
                          [
                            "RK",
                            "Ravi Kumara",
                            "r.kumara@floodsense.gov.lk",
                            "officer",
                            "21 Mar 12:15",
                            "active",
                            "#1a52cc",
                          ],
                          [
                            "SM",
                            "Sarath Mendis",
                            "s.mendis@floodsense.gov.lk",
                            "officer",
                            "20 Mar 09:45",
                            "active",
                            "#883300",
                          ],
                          [
                            "AN",
                            "A. Navaratne",
                            "a.navaratne@dmc.gov.lk",
                            "view",
                            "19 Mar 16:00",
                            "active",
                            "#555",
                          ],
                          [
                            "NP",
                            "Nilantha Perera",
                            "n.perera@floodsense.gov.lk",
                            "officer",
                            "15 Mar 11:20",
                            "inactive",
                            "#aaa",
                          ],
                        ].map(
                          (
                            [init, name, email, role, login, status, color],
                            i,
                          ) => (
                            <tr key={i}>
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
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
                                  <div
                                    style={{ fontWeight: 700, fontSize: 13 }}
                                  >
                                    {name}
                                  </div>
                                </div>
                              </td>
                              <td
                                style={{
                                  fontFamily: "DM Mono",
                                  fontSize: 11,
                                  color: C.mid,
                                }}
                              >
                                {email}
                              </td>
                              <td>
                                <Badge
                                  type={
                                    role === "admin"
                                      ? "admin"
                                      : role === "officer"
                                        ? "officer"
                                        : "view"
                                  }
                                >
                                  {role.toUpperCase()}
                                </Badge>
                              </td>
                              <td
                                style={{
                                  fontFamily: "DM Mono",
                                  fontSize: 11,
                                  color: C.mid,
                                }}
                              >
                                {login}
                              </td>
                              <td>
                                <Badge type={status}>
                                  {status.toUpperCase()}
                                </Badge>
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: 5 }}>
                                  <button style={actBtn}>✏ Edit</button>
                                  {i > 0 && (
                                    <button
                                      style={{
                                        ...actBtn,
                                        color: C.red,
                                        border: "1.5px solid #ffd5cc",
                                      }}
                                    >
                                      🗑
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>

                    <GroupLabel>Role Permissions</GroupLabel>
                    <table>
                      <thead>
                        <tr>
                          <th>Permission</th>
                          <th style={{ textAlign: "center" }}>Admin</th>
                          <th style={{ textAlign: "center" }}>Officer</th>
                          <th style={{ textAlign: "center" }}>View Only</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["View Dashboard & Alerts", true, true, true],
                          [
                            "Acknowledge & Respond to Alerts",
                            true,
                            true,
                            false,
                          ],
                          ["Add / Remove Locations", true, true, false],
                          ["Broadcast Emergency Alert", true, false, false],
                          ["Modify System Settings", true, false, false],
                          ["Manage Users", true, false, false],
                        ].map(([perm, admin, off, view], i) => (
                          <tr key={i}>
                            <td>{perm}</td>
                            <td style={{ textAlign: "center" }}>
                              {admin ? "✅" : "❌"}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {off ? "✅" : "❌"}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {view ? "✅" : "❌"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast message={toast} />
    </>
  );
}
