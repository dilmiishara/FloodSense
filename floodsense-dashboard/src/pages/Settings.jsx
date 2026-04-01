// ─── Settings.jsx ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import {
  C, Card, Badge, Btn, Input, Select,
  FormGroup, Toggle, ToggleRow, globalCSS, Toast,
} from "../shared.jsx";
import { saveSettings } from "../api/settings";
import { useSettings } from "../context/SettingsContext";

export default function Settings() {
  const [section, setSection] = useState("system");
  const [toast, setToast] = useState(null);

  // ── Get global settings from context ──────────────────────────────
const { systemSettings, updateSystemSettings, toggleEmergencyMode } = useSettings();

  // ── Single formData state (no duplicates) ─────────────────────────
  const [formData, setFormData] = useState({
    system_name:      "FloodSense Portal",
    org_name:         "FloodSense.gov.lk",
    timezone:         "Asia/Colombo",
    date_format:      "DD/MM/YYYY",
    refresh_rate:     "Every 30 seconds",
    default_map_view: "Detailed Map",
  });

  // ── All toggles in one place ───────────────────────────────────────
  const [tog, setTog] = useState({
    emergency:      false,
    maintenance:    false,
    sensorAlert:    true,
    predictOffline: true,
    autoReconnect:  false,
    push:           true,
    quiet:          false,
    dedup:          true,
    allclear:       true,
    pins:           true,
    safepins:       true,
    shading:        true,
    heat:           false,
    borders:        true,
    rivers:         true,
    autoOpen:       true,
    notify:         true,
  });

  // ── Sync formData + toggles from context when context loads ───────
  useEffect(() => {
    if (!systemSettings) return;
    setFormData({
      system_name:      systemSettings.system_name      ?? "FloodSense Portal",
      org_name:         systemSettings.org_name         ?? "FloodSense.gov.lk",
      timezone:         systemSettings.timezone         ?? "Asia/Colombo",
      date_format:      systemSettings.date_format      ?? "DD/MM/YYYY",
      refresh_rate:     systemSettings.refresh_rate     ?? "Every 30 seconds",
      default_map_view: systemSettings.default_map_view ?? "Detailed Map",
    });
    setTog((prev) => ({
      ...prev,
      emergency:   systemSettings.emergency_mode   ?? false,
      maintenance: systemSettings.maintenance_mode ?? false,
    }));
  }, [systemSettings]);

  const t = (k) => setTog((p) => ({ ...p, [k]: !p[k] }));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Save system settings ───────────────────────────────────────────
  const handleSystemSave = async () => {
    try {
      await updateSystemSettings({
        ...formData,
        emergency_mode:   tog.emergency,
        maintenance_mode: tog.maintenance,
      });
      showToast("✅ System settings saved!");
    } catch (e) {
      showToast("❌ Failed to save. Check console.");
      console.error(e);
    }
  };

  // ── Nav items ──────────────────────────────────────────────────────
  const navItems = [
    { id: "system",   label: "System Settings" },
    { id: "sensor",   label: "Sensor Config" },
  ];

  const GroupLabel = ({ children }) => (
    <div style={{
      fontSize: 12, fontWeight: 800, color: C.mid,
      textTransform: "uppercase", letterSpacing: 0.5,
      margin: "18px 0 12px", paddingBottom: 8,
      borderBottom: `1px solid ${C.border}`,
    }}>
      {children}
    </div>
  );

  // ── FIX: SaveFooter now correctly calls onSave ─────────────────────
  const SaveFooter = ({ label = "Save Changes", onSave }) => (
    <div style={{
      display: "flex", justifyContent: "flex-end",
      gap: 10, marginTop: 18, paddingTop: 16,
      borderTop: `1px solid ${C.border}`,
    }}>
      <Btn variant="outline">Reset</Btn>
      <Btn onClick={onSave}>   {/* ✅ directly calls onSave */}
        {label}
      </Btn>
    </div>
  );

  const actBtn = {
    padding: "4px 9px", borderRadius: 7,
    border: `1.5px solid ${C.border}`,
    background: "#fff", fontSize: 11,
    fontWeight: 700, cursor: "pointer",
  };

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight: "100vh", background: C.bg }}>
        <div style={{ display: "flex", margin: "12px 14px 14px" }}>
          <div style={{
            flex: 1, minWidth: 0, display: "flex",
            flexDirection: "column", gap: 12,
            overflowY: "auto", maxHeight: "calc(100vh - 110px)", paddingRight: 2,
          }}>
            <div className="fadeUp">
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.4 }}>
                Settings
              </div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>
                Configure system, sensors, alerts, map, safe zones and users
              </div>
            </div>

            <div className="fadeUp" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>

              {/* ── Settings Nav ── */}
              <div style={{
                width: 200, background: C.white, borderRadius: 14,
                padding: 8, boxShadow: C.shadow, flexShrink: 0,
              }}>
                {navItems.map((item, i) => (
                  <div key={item.id}>
                    {i === 5 && <div style={{ height: 1, background: C.border, margin: "6px 0" }} />}
                    <div
                      onClick={() => setSection(item.id)}
                      style={{
                        padding: "10px 14px", borderRadius: 10, fontSize: 13,
                        fontWeight: section === item.id ? 700 : 500,
                        cursor: "pointer",
                        color: section === item.id ? "#fff" : C.mid,
                        display: "flex", alignItems: "center", gap: 9,
                        marginBottom: 1,
                        background: section === item.id ? C.dark : "transparent",
                        transition: "all .15s",
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Content ── */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

                {/* ── SYSTEM SETTINGS ── */}
                {section === "system" && (
                  <Card>
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
                      System Settings
                    </div>
                    <div style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>
                      General portal configuration, timezone and display preferences
                    </div>

                    <GroupLabel>Portal Identity</GroupLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 4 }}>

                      {/* ✅ FIX: each input is in its own FormGroup */}
                      <FormGroup label="System Name">
                        <Input
                          value={formData.system_name || ""}
                          onChange={(e) => setFormData(p => ({ ...p, system_name: e.target.value }))}
                        />
                      </FormGroup>

                      <FormGroup label="Organization / Authority Name">
                        <Input
                          value={formData.org_name || ""}
                          onChange={(e) => setFormData(p => ({ ...p, org_name: e.target.value }))}
                        />
                      </FormGroup>
                    </div>

                    <GroupLabel>Regional Settings</GroupLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 4 }}>
                      <FormGroup label="Time Zone">
                        <Select
                          value={formData.timezone || ""}
                          onChange={(e) => setFormData(p => ({ ...p, timezone: e.target.value }))}
                        >
                          <option value="Asia/Colombo">Asia / Colombo (UTC+5:30)</option>
                          <option value="UTC">UTC</option>
                        </Select>
                      </FormGroup>
                      <FormGroup label="Date Format">
                        <Select
                          value={formData.date_format || ""}
                          onChange={(e) => setFormData(p => ({ ...p, date_format: e.target.value }))}
                        >
                          <option>DD/MM/YYYY</option>
                          <option>MM/DD/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </Select>
                      </FormGroup>
                    </div>

                    <GroupLabel>Data & Performance</GroupLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 4 }}>
                      <FormGroup label="Data Refresh Rate">
                        <Select
                          value={formData.refresh_rate || ""}
                          onChange={(e) => setFormData(p => ({ ...p, refresh_rate: e.target.value }))}
                        >
                          <option>Every 30 seconds</option>
                          <option>Every 1 minute</option>
                          <option>Every 5 minutes</option>
                        </Select>
                      </FormGroup>
                      <FormGroup label="Default Map View">
                        <Select
                          value={formData.default_map_view || ""}
                          onChange={(e) => setFormData(p => ({ ...p, default_map_view: e.target.value }))}
                        >
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
                      on={systemSettings.emergency_mode}
                      onToggle={toggleEmergencyMode}
                    />
                  <ToggleRow
  name="Maintenance Mode"
  desc="Suppress all alerts during scheduled maintenance"
  on={systemSettings.maintenance_mode}
  onToggle={() => {
    updateSystemSettings({
      ...formData,
      emergency_mode:   systemSettings.emergency_mode,
      maintenance_mode: !systemSettings.maintenance_mode,
    });
  }}
/>

                    {/* ✅ FIX: onSave is correctly wired to handleSystemSave */}
                    <SaveFooter
                      label="Save System Settings"
                      onSave={handleSystemSave}
                    />
                  </Card>
                )}

                {/* ── SENSOR CONFIG ── */}
                {section === "sensor" && (
                  <Card>
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
                      Sensor Configuration
                    </div>
                    <div style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>
                      Calibration, polling intervals and sensor-level settings
                    </div>
                    <GroupLabel>Global Sensor Defaults</GroupLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 4 }}>
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
                          <th>Sensor</th><th>Poll Rate</th>
                          <th>Calibration</th><th>Status</th><th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Ratnapura-A2",  "865213859621", "30s",  "+0.05m", "active"],
                          ["Kalutara-B1",   "865213859548", "30s",  "+0.00m", "active"],
                          ["Colombo-West",  "865213859302", "1min", "−0.02m", "warn"],
                          ["Kandy-Central", "865213859410", "30s",  "+0.01m", "active"],
                          ["Jaffna-North",  "865213859110", "30s",  "+0.00m", "active"],
                        ].map(([name, imei, poll, cal, status], i) => (
                          <tr key={i}>
                            <td>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{name}</div>
                              <div style={{ fontSize: 10, color: C.mid, fontFamily: "DM Mono" }}>{imei}</div>
                            </td>
                            <td style={{ fontFamily: "DM Mono", fontSize: 12 }}>{poll}</td>
                            <td style={{ fontFamily: "DM Mono", fontSize: 12 }}>{cal}</td>
                            <td>
                              <Badge type={status}>{status === "active" ? "ACTIVE" : "WEAK SIG"}</Badge>
                            </td>
                            <td><button style={actBtn}>⚙ Edit</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <GroupLabel>Offline Behaviour</GroupLabel>
                    <ToggleRow name="Alert on Sensor Offline" desc="Trigger alert if a sensor stops sending data for 2+ minutes" on={tog.sensorAlert} onToggle={() => t("sensorAlert")} />
                    <ToggleRow name="Predict Using Last Reading" desc="Use last known value for forecasting when sensor is offline" on={tog.predictOffline} onToggle={() => t("predictOffline")} />
                    <ToggleRow name="Auto-Reconnect Attempts" desc="Retry sensor connection every 60 seconds" on={tog.autoReconnect} onToggle={() => t("autoReconnect")} />
                    <SaveFooter label="Save Sensor Config" onSave={() => showToast("✅ Sensor config saved!")} />
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