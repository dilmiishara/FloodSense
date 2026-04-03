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
} from "../shared.jsx";
import { CheckCircle, AlertTriangle, ShieldAlert, Activity } from "lucide-react"; 


import { fetchActiveAlerts, fetchAlertHistory, resolveAlertAPI } from "../api/services/alertService";
import { fetchAreas } from "../api/services/userService";
import ThresholdTable from "../components/ThresholdTable"; 
import NotificationRecipients from "../components/NotificationRecipients";

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
    const initialLoad = async () => {
        
        await Promise.all([loadData(), loadDivisions()]);
        setLoading(false); 
    };
    
    initialLoad();

    const interval = setInterval(() => {
        loadData();
    }, 30000);

    return () => clearInterval(interval);
}, [tab]);


const loadData = async () => {
    try {
        if (tab === "active") {
            const res = await fetchActiveAlerts();
            
            setActiveAlerts(res.data.data || res.data || []);
        } else if (tab === "history") {
            const res = await fetchAlertHistory();
            const historyData = res.data.data || res.data || [];
            setHistoryAlerts(historyData);
        }
    } catch (err) {
        console.error("Failed to fetch alerts:", err);
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

  const filteredAlerts = (activeAlerts || []).filter(a => {
  
  const searchLower = (searchTerm || "").toLowerCase();
  
  
  const locationText = (a?.location || "").toLowerCase();
  const typeText = (a?.type || "").toLowerCase();

  const matchesSearch = locationText.includes(searchLower) || 
                        typeText.includes(searchLower);

 
  const alertSeverity = (a?.severity || "").toUpperCase();
  const selectedSev = (selSeverity || "All Severity").toUpperCase();
  
  const matchesSeverity = selSeverity === "All Severity" || 
                          alertSeverity === selectedSev;

  const matchesDivision = selDivision === "All DS Divisions" || 
                          a?.location === selDivision;


  return matchesSearch && matchesSeverity && matchesDivision;
});

  const getSeverityConfig = (sev) => {
    const s = sev?.toLowerCase();
    if (s === 'critical') return { color: C.red, badge: 'critical', pulse: true, icon: <ShieldAlert size={16}/> };
    if (s === 'high') return { color: C.orange, badge: 'high', icon: <AlertTriangle size={16}/> };
    return { color: C.yellow, badge: 'medium', icon: <Activity size={16}/> };
  };

  const actBtn = {
    padding: "4px 12px", borderRadius: 8, border: `1.5px solid ${C.border}`,
    background: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer",
  };
  
  const locTag = {
    fontSize: 11, background: C.light, borderRadius: 6, padding: "3px 8px", fontWeight: 700,
  };

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight: "100vh", background: C.bg }}>
        <div style={{ display: "flex", margin: "12px 14px 14px" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: "calc(100vh - 110px)", paddingRight: 2 }}>
            
            {/* --- PAGE HEADER --- */}
            <div className="fadeUp" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.6, margin: 0 }}>Incident Console</h1>
                <p style={{ fontSize: 12, color: C.mid, margin: '4px 0 0' }}>Real-time flood risk monitoring & management</p>
              </div>
              <Btn variant="red" style={{ borderRadius: 10, padding: '10px 20px' }}>Broadcast Alert</Btn>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "Critical Alerts", val: activeAlerts.filter(a => a.severity.toLowerCase() === 'critical').length, sub: "Immediate threats", color: C.red, icon: <ShieldAlert/> },
                { label: "High Priority", val: activeAlerts.filter(a => a.severity.toLowerCase() === 'high').length, sub: "Urgent attention", color: C.orange, icon: <AlertTriangle/> },
                { label: "Monitoring", val: activeAlerts.filter(a => a.severity.toLowerCase() === 'medium').length, sub: "Routine checks", color: C.yellow, icon: <Activity/> },
              ].map((stat, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 12, padding: "20px", boxShadow: C.shadow, borderLeft: `5px solid ${stat.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.mid, textTransform: "uppercase" }}>{stat.label}</div>
                    <div style={{ fontSize: 32, fontWeight: 950, color: '#1a1a1a', marginTop: 4 }}>{stat.val}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{stat.sub}</div>
                  </div>
                  <div style={{ color: stat.color, opacity: 0.1 }}>{stat.icon}</div>
                </div>
              ))}
            </div>

            <TabBar tabs={tabs} active={tab} onChange={setTab} />

            {/* --- ACTIVE ALERTS TAB --- */}
            {tab === "active" && (
              <Card style={{ padding: 0, overflow: "hidden", borderRadius: 12 }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10, background: '#fcfcfc' }}>
                  <Input placeholder="Search alerts by location, type…" style={{ flex: 1, height: 40 }} onChange={(e) => setSearchTerm(e.target.value)} />
                  <Select value={selSeverity} onChange={(e) => setSelSeverity(e.target.value)} style={{ width: 150, height: 40 }}>
                    <option value="All Severity">All Levels</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </Select>
                  <Select value={selDivision} onChange={(e) => setSelDivision(e.target.value)} style={{ width: 180, height: 40 }}>
                    <option value="All DS Divisions">All Areas</option>
                    {areas.map(area => <option key={area.id} value={area.name}>{area.name}</option>)}
                  </Select>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', background: '#f8f9fa' }}>
                      <th style={{ padding: '14px', width: 40 }}></th>
                      <th style={{ fontSize: 11, fontWeight: 800, color: C.mid }}>INCIDENT</th>
                      <th style={{ fontSize: 11, fontWeight: 800, color: C.mid }}>LOCATION</th>
                      <th style={{ fontSize: 11, fontWeight: 800, color: C.mid }}>TIME</th>
                      <th style={{ fontSize: 11, fontWeight: 800, color: C.mid }}>SEVERITY</th>
                      <th style={{ fontSize: 11, fontWeight: 800, color: C.mid }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map((a, i) => {
                      const cfg = getSeverityConfig(a.severity);
                      return (
                        <tr key={i} className="fadeUp" style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '14px' }}>
                            <div className={cfg.pulse ? "pulse" : ""} style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
                          </td>
                          <td style={{ padding: '14px' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#222' }}>{a.type}</div>
                            <div style={{ fontSize: 11, color: C.mid, marginTop: 2 }}>{a.message}</div>
                          </td>
                          <td style={{ padding: '14px' }}><span style={locTag}>{a.location}</span></td>
                          <td style={{ padding: '14px', fontSize: 12, color: '#555', fontFamily: 'monospace' }}>
                            {new Date(a.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '14px' }}><Badge type={cfg.badge}>{a.severity.toUpperCase()}</Badge></td>
                          <td style={{ padding: '14px' }}>
                            <button onClick={() => { setSelectedAlert(a); setShowResolveModal(true); }} style={actBtn}>Respond</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}

           {/* --- HISTORY TAB --- */}
{tab === "history" && (
    <Card style={{ padding: 0, overflow: "hidden", minHeight: '200px' }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
            <Input 
                placeholder="Search history…" 
                style={{ flex: 1 }} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <Select style={{ width: 160 }}><option>Last 24 Hours</option></Select>
        </div>

        {loading && historyAlerts.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.mid }}>Loading history records...</div>
        ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                        <th style={{ padding: '14px', width: 40 }}></th>
                        <th style={{ fontSize: 11, fontWeight: 800, color: C.mid }}>ALERT</th>
                        <th style={{ fontSize: 11, fontWeight: 800, color: C.mid }}>LOCATION</th>
                        <th style={{ fontSize: 11, fontWeight: 800, color: C.mid }}>STATUS</th>
                        <th style={{ fontSize: 11, fontWeight: 800, color: C.mid }}>RESOLVED AT</th>
                    </tr>
                </thead>
                <tbody>
                    {historyAlerts.length > 0 ? historyAlerts.map((a, i) => (
                        <tr key={i} className="fadeUp" style={{ borderBottom: `1px solid ${C.border}` }}>
                            <td style={{ padding: '14px' }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} /></td>
                            <td style={{ padding: '14px' }}>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>{a.type}</div>
                                <div style={{ fontSize: 11, color: C.mid }}>{a.message}</div>
                            </td>
                            <td style={{ padding: '14px' }}><Badge type="outline" style={{ fontWeight: 700 }}>{a.location}</Badge></td>
                            <td style={{ padding: '14px' }}><Badge type="active">RESOLVED</Badge></td>
                            <td style={{ padding: '14px', fontSize: 11, color: '#555', fontFamily: 'monospace' }}>
                                {new Date(a.updated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5" style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>No history records found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        )}
    </Card>
)}

            {/* --- THRESHOLDS TAB --- */}
            {tab === "thresholds" && (
              <Card style={{ padding: 20 }}><ThresholdTable /></Card>
            )}

            {/* --- RECIPIENTS TAB --- */}
            {tab === "recipients" && (
              <div className="fadeUp">
                <NotificationRecipients /> 
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
            <h2 style={{ fontWeight: 900, textAlign: 'center', marginBottom: 10, letterSpacing: -0.5 }}>Mark as Resolved?</h2>
            <p style={{ textAlign: 'center', color: '#666', fontSize: 14, lineHeight: 1.5, marginBottom: 25 }}>
                Confirm handling of <strong style={{color: '#1a1a1a'}}>{selectedAlert?.location}</strong> incident.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
                <Btn variant="outline" onClick={() => setShowResolveModal(false)} style={{ flex: 1 }} disabled={isProcessing}>Cancel</Btn>
                <Btn variant="dark" onClick={confirmResolve} style={{ flex: 1, background: C.green, border: 'none' }} disabled={isProcessing}>
                    {isProcessing ? "Finalizing..." : "Confirm Resolve"}
                </Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const modalStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { background: '#fff', width: '90%', maxWidth: '380px', padding: '35px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  iconCircle: { width: 64, height: 64, background: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
};