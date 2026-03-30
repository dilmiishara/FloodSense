import { useState, useEffect } from "react";
import {
  C,
  Card,
  Badge,
  Btn,
  Input,
  Select,
  globalCSS,
  TabBar,
  ToggleRow,
} from "../shared.jsx";
import { CheckCircle, X } from "lucide-react"; 

// ✅ සේවා සහ Components සම්බන්ධ කිරීම
import { fetchActiveAlerts, fetchAlertHistory, resolveAlertAPI } from "../api/services/alertService";
import { fetchAreas } from "../api/services/userService";
import ThresholdTable from "../components/ThresholdTable"; // 👈 අලුත් component එක

export default function Alerts() {
  const [tab, setTab] = useState("active");
  
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [historyAlerts, setHistoryAlerts] = useState([]);
  const [areas, setAreas] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selSeverity, setSelSeverity] = useState("All Severity");
  const [selDivision, setSelDivision] = useState("All DS Divisions");

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const tabs = [
    { id: "active", label: "Active Alerts" },
    { id: "history", label: "Alert History" },
    { id: "thresholds", label: "Alert Thresholds" },
    { id: "recipients", label: "Notification Recipients" },
  ];

  useEffect(() => {
    loadData();
    loadDivisions(); 
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [tab]);

  const loadData = async () => {
    try {
      if (tab === "active") {
        const res = await fetchActiveAlerts();
        setActiveAlerts(res.data);
      } else if (tab === "history") {
        const res = await fetchAlertHistory();
        setHistoryAlerts(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDivisions = async () => {
    try {
      const res = await fetchAreas();
      setAreas(res.data.data || res.data); 
    } catch (err) {
      console.error("Failed to fetch divisions:", err);
    }
  };

  const confirmResolve = async () => {
    setIsProcessing(true);
    try {
      await resolveAlertAPI(selectedAlert.id);
      setShowResolveModal(false);
      loadData();
    } catch (err) {
      console.error("Failed to resolve alert", err);
    } finally {
      setIsProcessing(false);
      setSelectedAlert(null);
    }
  };

  const filteredAlerts = activeAlerts.filter(a => {
    const matchesSearch = a.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selSeverity === "All Severity" || a.severity.toUpperCase() === selSeverity.toUpperCase();
    const matchesDivision = selDivision === "All DS Divisions" || a.location === selDivision;
    return matchesSearch && matchesSeverity && matchesDivision;
  });

  const getSeverityConfig = (sev) => {
    const s = sev?.toLowerCase();
    if (s === 'critical') return { color: C.red, badge: 'critical', pulse: true };
    if (s === 'high') return { color: C.orange, badge: 'high', pulse: false };
    return { color: C.yellow, badge: 'medium', pulse: false };
  };

  const actBtn = {
    padding: "4px 10px", borderRadius: 7, border: `1.5px solid ${C.border}`,
    background: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer",
  };
  
  const locTag = {
    fontSize: 11, background: C.light, borderRadius: 6, padding: "3px 8px", fontWeight: 600,
  };

  const [officers, setOfficers] = useState([
    ["RK", "Ravi Kumara", "Senior Field Officer · Kuruwita", ["SMS", "Email", "App"], "#1a52cc"],
    ["DK", "Dinesh Kumara", "Field Officer · Kahawaththa", ["SMS", "App"], "#883300"],
    ["SP", "Saman Perera", "Field Officer · Kolonna", ["SMS", "Email"], "#555"],
    ["NP", "Nuwan Perera", "Field Officer · Balangoda ", ["SMS", "App"], "#0a7f5a"],
    ["AS", "Anura Silva", "Field Officer · Embilipitiya", ["SMS", "Email"], "#cc5500"],
    ["WS", "Wasana Senanayake", "Field Officer · Ratnapura", ["SMS", "App"], "#6a0dad"],
  ]);

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight: "100vh", background: C.bg }}>
        <div style={{ display: "flex", margin: "12px 14px 14px" }}>
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
                <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.4 }}>Alerts</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>Monitor, manage and configure all system alerts</div>
              </div>
              <Btn variant="red"> Broadcast Alert</Btn>
            </div>

            <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[
                ["Critical", activeAlerts.filter(a => a.severity.toLowerCase() === 'critical').length, "Active critical threats", C.red],
                ["High Alert", activeAlerts.filter(a => a.severity.toLowerCase() === 'high').length, "Urgent attention required", C.orange],
                ["Medium", activeAlerts.filter(a => a.severity.toLowerCase() === 'medium').length, "Monitoring ongoing", C.yellow],
                ["Resolved Today", historyAlerts.length, "Successful resolutions", C.green],
              ].map(([label, val, sub, c], i) => (
                <div key={i} style={{ background: C.white, borderRadius: 12, padding: "14px 16px", boxShadow: C.shadow, borderLeft: `4px solid ${c}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: c, marginTop: 4 }}>{val}</div>
                  <div style={{ fontSize: 11, color: C.mid, marginTop: 3 }}>{sub}</div>
                </div>
              ))}
            </div>

            <TabBar tabs={tabs} active={tab} onChange={setTab} />

            {/* --- ACTIVE ALERTS TAB --- */}
            {tab === "active" && (
              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
                  <Input placeholder=" Search alerts by location, type…" style={{ flex: 1, padding: "8px 12px" }} onChange={(e) => setSearchTerm(e.target.value)} />
                  <Select value={selSeverity} onChange={(e) => setSelSeverity(e.target.value)} style={{ width: 150 }}>
                    <option value="All Severity">All Severity</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </Select>
                  <Select value={selDivision} onChange={(e) => setSelDivision(e.target.value)} style={{ width: 180 }}>
                    <option value="All DS Divisions">All DS Divisions</option>
                    {areas.map(area => <option key={area.id} value={area.name}>{area.name}</option>)}
                  </Select>
                </div>
                <table>
                  <thead>
                    <tr><th style={{ width: 20 }}></th><th>Alert</th><th>Location</th><th>Time</th><th>Severity</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map((a, i) => {
                      const cfg = getSeverityConfig(a.severity);
                      return (
                        <tr key={i} className="fadeUp">
                          <td><span className={cfg.pulse ? "pulse" : ""} style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: cfg.color }} /></td>
                          <td>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{a.type}</div>
                            <div style={{ fontSize: 11, color: C.mid, marginTop: 2 }}>{a.message}</div>
                          </td>
                          <td><span style={locTag}>{a.location}</span></td>
                          <td><span style={{ fontSize: 11, color: C.mid, fontFamily: "DM Mono" }}>{new Date(a.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></td>
                          <td><Badge type={cfg.badge}>{a.severity.toUpperCase()}</Badge></td>
                          <td><button onClick={() => { setSelectedAlert(a); setShowResolveModal(true); }} style={actBtn}>Respond</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}

            {/* --- HISTORY TAB --- */}
            {tab === "history" && (
              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
                  <Input placeholder=" Search history…" style={{ flex: 1, padding: "8px 12px" }} />
                  <Select style={{ width: 160 }}><option>Last 24 Hours</option></Select>
                </div>
                <table>
                  <thead>
                    <tr><th></th><th>Alert</th><th>Location</th><th>Time</th><th>Status</th><th>Resolved At</th></tr>
                  </thead>
                  <tbody>
                    {historyAlerts.map((a, i) => (
                      <tr key={i} className="fadeUp">
                        <td><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: C.green }} /></td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{a.type}</div>
                          <div style={{ fontSize: 11, color: C.mid }}>{a.message}</div>
                        </td>
                        <td><span style={locTag}>{a.location}</span></td>
                        <td style={{ fontSize: 11, color: C.mid, fontFamily: "DM Mono" }}>{new Date(a.detected_at).toLocaleDateString()}</td>
                        <td><Badge type="active">RESOLVED</Badge></td>
                        <td style={{ fontSize: 11, color: C.mid, fontFamily: "DM Mono" }}>{new Date(a.updated_at).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {/* --- THRESHOLDS TAB (Updated) --- */}
            {tab === "thresholds" && (
              <Card>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Alert Threshold Configuration</div>
                  <Btn style={{ fontSize: 12, padding: "7px 14px" }}>+ Add Threshold</Btn>
                </div>
                {/* ✅ වෙනම JSX file එකකින් එන Table එක */}
                <ThresholdTable /> 
              </Card>
            )}

            {/* --- RECIPIENTS TAB --- */}
            {tab === "recipients" && (
               <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
               <Card>
                 <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                   Ratnapura Field Officers
                   <Btn variant="outline" style={{ fontSize: 11, padding: "4px 10px" }}>+ Add</Btn>
                 </div>
                 {officers.map(([init, name, role, chs, color], i) => (
                   <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < officers.length - 1 ? `1px solid #fafafa` : "none" }}>
                     <div style={{ width: 32, height: 32, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{init}</div>
                     <div style={{ flex: 1 }}>
                       <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
                       <div style={{ fontSize: 11, color: C.mid }}>{role}</div>
                     </div>
                     <div style={{ display: "flex", gap: 4 }}>
                       {chs.map((ch) => <span key={ch} style={{ fontSize: 10, background: C.light, borderRadius: 5, padding: "2px 7px", fontWeight: 600, color: C.mid }}>{ch}</span>)}
                     </div>
                   </div>
                 ))}
               </Card>
               <Card style={{ height: 200, overflowY: "auto" }}>
                 <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Alert Channels</div>
                 {[["", "SMS Alert", "Dialog · Airtel · Hutch", "active"], ["", "Push Notifications", "FloodSense Mobile App", "active"]].map(([icon, name, sub, status], i) => (
                   <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 3 ? `1px solid #fafafa` : "none" }}>
                     <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div><div style={{ fontSize: 11, color: C.mid }}>{sub}</div></div>
                     <Badge type={status}>{status === "active" ? "ACTIVE" : "MANUAL"}</Badge>
                   </div>
                 ))}
               </Card>
             </div>
            )}
          </div>
        </div>
      </div>

      {/* --- RESOLVE MODAL --- */}
      {showResolveModal && (
        <div style={modalStyles.overlay}>
          <div className="fadeUp" style={modalStyles.modal}>
            <div style={modalStyles.iconCircle}>
                <CheckCircle size={32} color={C.green} />
            </div>
            
            <h2 style={{ fontWeight: 800, textAlign: 'center', marginBottom: 10 }}>Mark as Resolved?</h2>
            <p style={{ textAlign: 'center', color: '#666', fontSize: 14, lineHeight: 1.5, marginBottom: 25 }}>
                You are about to confirm that the alert for <strong style={{color: '#1a1a1a'}}>{selectedAlert?.location}</strong> has been handled. 
                This will move the record to history.
            </p>

            {isProcessing && (
                <div style={modalStyles.progressContainer}>
                    <div style={modalStyles.progressBar}></div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
                <Btn variant="outline" onClick={() => setShowResolveModal(false)} style={{ flex: 1 }} disabled={isProcessing}>
                    Cancel
                </Btn>
                <Btn variant="dark" onClick={confirmResolve} style={{ flex: 1, background: C.green, borderColor: C.green }} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Confirm Resolve"}
                </Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const modalStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { background: '#fff', width: '90%', maxWidth: '400px', padding: '40px 30px', borderRadius: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' },
  iconCircle: { width: 70, height: 70, background: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  progressContainer: { width: '100%', height: '4px', background: '#f0f0f0', borderRadius: '2px', marginBottom: '20px', overflow: 'hidden' },
  progressBar: { height: '100%', background: C.green, width: '100%', animation: 'loadingBar 1.5s infinite linear' },
};