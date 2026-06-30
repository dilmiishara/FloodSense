import { useState, useEffect } from "react";
import {
    Card, Badge, Btn, Input, Select, globalCSS, TabBar,
} from "../shared.jsx";
import { CheckCircle, AlertTriangle, ShieldAlert, Activity, Brain } from "lucide-react";

import { fetchActiveAlerts, fetchAlertHistory, resolveAlertAPI, fetchPredictionAlerts } from "../api/services/alertService";
import { fetchAreas } from "../api/services/userService";
import ThresholdTable from "../components/ThresholdTable";
import { useToast } from "../context/ToastContext";
import NotificationRecipients from "../components/NotificationRecipients";
import PredictionTable from "../components/PredictionTable";

// Only these risk levels count as an actual "predicted risk".
// "Normal" forecasts are excluded — they're not a risk.
const RELEVANT_RISK_LEVELS = ["major flood", "minor flood", "alert"];

// Local-date (not UTC) helper — keeps this in sync with PredictionTable's
// "Today" filter, so the stat card and the table default view always match.
const toLocalDateStr = (dateInput) => {
    const d = new Date(dateInput);
    const offsetMs = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - offsetMs);
    return local.toISOString().slice(0, 10);
};

const todayStr = () => toLocalDateStr(new Date());

export default function Alerts() {
    const toast = useToast();
    const [tab, setTab] = useState("predictions");
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [historyAlerts, setHistoryAlerts] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cardsLoading, setCardsLoading] = useState(true);
    const [predictedAlerts, setPredictedAlerts] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selSeverity, setSelSeverity] = useState("All Severity");
    const [selDivision, setSelDivision] = useState("All DS Divisions");

    const [showResolveModal, setShowResolveModal] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [dataFetched, setDataFetched] = useState({
        active: false,
        history: false,
        predictions: false,
    });
    const [predictions, setPredictions] = useState([]);

    const tabs = [
        { id: "predictions", label: "Predictive Alerts"       },
        { id: "active",      label: "Active Alerts"          },
        { id: "history",     label: "Alert History"           },
        { id: "thresholds",  label: "Alert Thresholds"        },
        { id: "recipients",  label: "Notification Recipients" },
    ];

    // ── Initial load on mount — populate stat cards ───────────────────────────
    useEffect(() => {
        loadInitialCards();
    }, []);

    const loadInitialCards = async () => {
    setCardsLoading(true);
    try {
        // ✅ Fetch both active alerts AND predictions together on mount
        const [activeRes, predictRes] = await Promise.all([
            fetchActiveAlerts(),
            fetchPredictionAlerts(),
        ]);

        const activeData  = activeRes.data.data || activeRes.data || [];
        const predictData = predictRes.data || [];

        setActiveAlerts(activeData);
        setPredictions(predictData);
        setPredictedAlerts(predictData);

        setDataFetched(prev => ({ 
            ...prev, 
            active: true,
            predictions: true, 
        }));

    } catch (err) {
        console.error("Failed to load initial card data:", err);
    } finally {
        setCardsLoading(false);
    }
};

    // ── Tab change effect ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!dataFetched[tab]) {
            setLoading(true);
            loadData();
        } else {
            setLoading(false);
        }
    }, [tab]);

    // ── Data fetcher ──────────────────────────────────────────────────────────
    const loadData = async () => {
        setLoading(true);
        try {
            if (tab === "active") {
                const res = await fetchActiveAlerts();
                const data = res.data.data || res.data || [];
                setActiveAlerts(data);
                setDataFetched(prev => ({ ...prev, active: true }));

            } else if (tab === "history") {
                const res = await fetchAlertHistory();
                setHistoryAlerts(res.data.data || res.data || []);
                setDataFetched(prev => ({ ...prev, history: true }));

            } else if (tab === "predictions") {
                const res = await fetchPredictionAlerts();
                const data = res.data || [];
                setPredictions(data);
                setPredictedAlerts(data);
                setDataFetched(prev => ({ ...prev, predictions: true }));
            }
        } catch (err) {
            console.error("Failed to fetch alerts:", err);
        } finally {
            setLoading(false);
        }
    };

    // ── Resolve alert ─────────────────────────────────────────────────────────
    const confirmResolve = async () => {
        setIsProcessing(true);
        const locationName = selectedAlert?.area?.name || selectedAlert?.location || "Incident";
        try {
            await resolveAlertAPI(selectedAlert.id);
            setShowResolveModal(false);
            toast.success(
                "Incident Resolved",
                `The active alert for ${locationName} has been successfully closed and archived.`,
                4000
            );
            loadData();
        } catch (err) {
            console.error("Failed to resolve alert", err);
            toast.error(
                "Action Failed",
                `Could not resolve the incident for ${locationName}. Please try again.`
            );
        } finally {
            setIsProcessing(false);
            setSelectedAlert(null);
        }
    };

    // ── Filtered active alerts ────────────────────────────────────────────────
    const filteredAlerts = (activeAlerts || []).filter(a => {
        const searchLower = (searchTerm || "").toLowerCase();
        const areaName    = a?.area?.name || a?.location || "";
        const typeText    = (a?.type || "").toLowerCase();
        const matchesSearch   = areaName.toLowerCase().includes(searchLower) || typeText.includes(searchLower);
        const alertSeverity   = (a?.severity || "").toUpperCase();
        const matchesSeverity = selSeverity === "All Severity" || alertSeverity === selSeverity.toUpperCase();
        const matchesDivision = selDivision === "All DS Divisions" || areaName === selDivision;
        return matchesSearch && matchesSeverity && matchesDivision;
    });

    // ── Predicted risks count ──────────────────────────────────────────────────
    // Matches the Predictive Alerts table's DEFAULT view (Today, All Stations,
    // All Levels, Major/Minor/Alert only) — so the stat card and the table
    // always agree with each other.
    const predictedRiskCount = (predictedAlerts || []).filter(p => {
        const level = (p.flood_risk_level || "").toLowerCase();
        if (!RELEVANT_RISK_LEVELS.includes(level)) return false;

        if (p.forecast_time) {
            const rowDate = toLocalDateStr(p.forecast_time);
            if (rowDate !== todayStr()) return false;
        }

        return true;
    }).length;

    // ── Shared loading spinner row ────────────────────────────────────────────
    const LoadingView = ({ colSpan }) => (
        <tr>
            <td colSpan={colSpan} style={{ padding: "80px 40px", textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 32, height: 32,
                        border: "4px solid var(--border)",
                        borderTop: "4px solid var(--primary)",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                    }} />
                    <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: "var(--text-muted)", letterSpacing: '0.8px',
                    }}>
                        SYNCHRONIZING INCIDENT DATA...
                    </div>
                </div>
            </td>
        </tr>
    );

    // ── Severity config ───────────────────────────────────────────────────────
    const getSeverityConfig = (sev) => {
        const s = sev?.toLowerCase();
        if (s === 'critical') return { color: "var(--red)",    badge: 'critical', pulse: true, icon: <ShieldAlert size={16}/> };
        if (s === 'high')     return { color: "var(--orange)", badge: 'high',                  icon: <AlertTriangle size={16}/> };
        return                       { color: "var(--yellow)", badge: 'medium',                icon: <Activity size={16}/> };
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{globalCSS}</style>
            <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
                <div style={{ display: "flex", margin: "12px 14px 14px" }}>
                    <div style={{
                        flex: 1, minWidth: 0,
                        display: "flex", flexDirection: "column", gap: 12,
                        overflowY: "auto", maxHeight: "calc(100vh - 110px)", paddingRight: 2,
                    }}>

                        {/* ── Page Header ── */}
                        <div className="fadeUp" style={{
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between", marginBottom: 5,
                        }}>
                            <div>
                                <h1 style={{
                                    fontSize: 22, fontWeight: 950,
                                    letterSpacing: -0.6, margin: 0, color: "var(--text)",
                                }}>
                                    Incident Console
                                </h1>
                                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: '4px 0 0' }}>
                                    Real-time flood risk monitoring &amp; management
                                </p>
                            </div>
                        </div>

                        {/* ── Stat Cards ── */}
                        <div className="fadeUp" style={{
                            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
                        }}>
                            {[
                                {
                                    label: "Critical Alerts",
                                    val:   activeAlerts.filter(a => (a.severity || "").toLowerCase() === 'critical').length,
                                    sub:   "Immediate threats",
                                    color: "var(--red)",
                                    icon:  <ShieldAlert />,
                                },
                                {
                                    label: "High Priority",
                                    val:   activeAlerts.filter(a => (a.severity || "").toLowerCase() === 'high').length,
                                    sub:   "Urgent attention",
                                    color: "var(--orange)",
                                    icon:  <AlertTriangle />,
                                },
                                {
                                    label: "Predicted Risks",
                                    val:   predictedRiskCount,
                                    sub:   "AI-forecasted events (today)",
                                    color: "var(--purple)",
                                    icon:  <Brain />,
                                },
                            ].map((stat, i) => (
                                <div key={i} style={{
                                    background: "var(--surface)", borderRadius: 14, padding: 20,
                                    boxShadow: "var(--shadow)", border: "1px solid var(--border)",
                                    borderLeft: `5px solid ${stat.color}`,
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                }}>
                                    <div>
                                        <div style={{
                                            fontSize: 11, fontWeight: 800,
                                            color: "var(--text-muted)",
                                            textTransform: "uppercase", letterSpacing: 0.5,
                                        }}>
                                            {stat.label}
                                        </div>
                                        <div style={{
                                            fontSize: cardsLoading ? 16 : 32,
                                            fontWeight: cardsLoading ? 600 : 950,
                                            color: cardsLoading ? "var(--text-muted)" : stat.color,
                                            marginTop: cardsLoading ? 10 : 4,
                                            fontFamily: cardsLoading ? "inherit" : "'DM Mono', monospace",
                                            transition: "all 0.3s ease",
                                        }}>
                                            {cardsLoading ? "Loading..." : stat.val}
                                        </div>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                                            {stat.sub}
                                        </div>
                                    </div>
                                    <div style={{ color: stat.color, opacity: 0.15 }}>{stat.icon}</div>
                                </div>
                            ))}
                        </div>

                        <TabBar tabs={tabs} active={tab} onChange={setTab} />


                        

                        {/* ══ ACTIVE ALERTS TAB ══ */}
                        {tab === "active" && (
                            <Card style={{ padding: 0, overflow: "hidden", borderRadius: 12 }}>
                                <div style={{
                                    padding: "12px 16px", borderBottom: "1px solid var(--border)",
                                    display: "flex", gap: 10, background: "var(--surface-alt)",
                                }}>
                                    <Input
                                        placeholder="Search alerts by location, type…"
                                        style={{ flex: 1, height: 40 }}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <Select
                                        value={selSeverity}
                                        onChange={e => setSelSeverity(e.target.value)}
                                        style={{ width: 150, height: 40 }}
                                    >
                                        <option value="All Severity">All Levels</option>
                                        <option value="CRITICAL">Critical</option>
                                        <option value="HIGH">High</option>
                                        <option value="MEDIUM">Medium</option>
                                    </Select>
                                    <Select
                                        value={selDivision}
                                        onChange={e => setSelDivision(e.target.value)}
                                        style={{ width: 180, height: 40 }}
                                    >
                                        <option value="All DS Divisions">All Areas</option>
                                        {areas.map(area => (
                                            <option key={area.id} value={area.name}>{area.name}</option>
                                        ))}
                                    </Select>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', background: "var(--surface-alt)" }}>
                                            <th style={{ padding: '14px', width: 40 }}></th>
                                            <th style={thCell}>INCIDENT</th>
                                            <th style={thCell}>LOCATION</th>
                                            <th style={thCell}>TIME</th>
                                            <th style={thCell}>SEVERITY</th>
                                            <th style={thCell}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <LoadingView colSpan={6} />
                                        ) : filteredAlerts.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} style={{
                                                    padding: 40, textAlign: 'center',
                                                    color: "var(--text-muted)", fontStyle: 'italic',
                                                }}>
                                                    No active incidents found.
                                                </td>
                                            </tr>
                                        ) : filteredAlerts.map((a, i) => {
                                            const cfg = getSeverityConfig(a.severity);
                                            return (
                                                <tr key={i} className="fadeUp" style={{ borderBottom: "1px solid var(--border)" }}>
                                                    <td style={{ padding: '14px' }}>
                                                        <div
                                                            className={cfg.pulse ? "pulse" : ""}
                                                            style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '14px' }}>
                                                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{a.type}</div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{a.message}</div>
                                                    </td>
                                                    <td style={{ padding: '14px' }}>
                                                        <span style={{
                                                            fontSize: 11, background: "var(--primary-bg)", color: "var(--primary)",
                                                            borderRadius: 6, padding: "3px 8px", fontWeight: 700,
                                                        }}>
                                                            {a.area?.name || a.location || "Unknown"}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px', fontSize: 12, color: "var(--text-mid)", fontFamily: 'monospace' }}>
                                                        {new Date(a.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td style={{ padding: '14px' }}>
                                                        <Badge type={cfg.badge}>{a.severity.toUpperCase()}</Badge>
                                                    </td>
                                                    <td style={{ padding: '14px' }}>
                                                        <button
                                                            onClick={() => { setSelectedAlert(a); setShowResolveModal(true); }}
                                                            style={{
                                                                padding: "5px 14px", borderRadius: 8,
                                                                border: "1.5px solid var(--border)",
                                                                background: "var(--surface-alt)", color: "var(--text-mid)",
                                                                fontSize: 11, fontWeight: 800, cursor: "pointer",
                                                                transition: "all .15s",
                                                            }}
                                                        >
                                                            Respond
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </Card>
                        )}

                        {/* ══ HISTORY TAB ══ */}
                        {tab === "history" && (
                            <Card style={{ padding: 0, overflow: "hidden", minHeight: '200px' }}>
                                <div style={{
                                    padding: "12px 16px", borderBottom: "1px solid var(--border)",
                                    display: "flex", gap: 10,
                                }}>
                                    <Input
                                        placeholder="Search history…"
                                        style={{ flex: 1 }}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <Select style={{ width: 160 }}>
                                        <option>Last 24 Hours</option>
                                    </Select>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: "var(--surface-alt)", textAlign: 'left' }}>
                                            <th style={{ padding: '14px', width: 40 }}></th>
                                            <th style={thCell}>ALERT</th>
                                            <th style={thCell}>LOCATION</th>
                                            <th style={thCell}>STATUS</th>
                                            <th style={thCell}>RESOLVED AT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <LoadingView colSpan={5} />
                                        ) : historyAlerts.length > 0 ? (
                                            historyAlerts.map((a, i) => (
                                                <tr key={i} className="fadeUp" style={{ borderBottom: "1px solid var(--border)" }}>
                                                    <td style={{ padding: '14px' }}>
                                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
                                                    </td>
                                                    <td style={{ padding: '14px' }}>
                                                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{a.type}</div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.message}</div>
                                                    </td>
                                                    <td style={{ padding: '14px' }}>
                                                        <Badge type="outline" style={{ fontWeight: 700 }}>
                                                            {a.area?.name || a.location || "N/A"}
                                                        </Badge>
                                                    </td>
                                                    <td style={{ padding: '14px' }}>
                                                        <Badge type="active">RESOLVED</Badge>
                                                    </td>
                                                    <td style={{ padding: '14px', fontSize: 11, color: "var(--text-muted)", fontFamily: 'monospace' }}>
                                                        {new Date(a.updated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{ padding: 40, textAlign: 'center', color: "var(--text-muted)" }}>
                                                    No history records found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </Card>
                        )}

                        {/* ══ PREDICTION TAB ══ */}
                        {tab === "predictions" && (
                            <Card style={{ padding: 0, overflow: "hidden" }}>
                                <PredictionTable data={predictions} loading={loading} />
                            </Card>
                        )}

                        {/* ══ THRESHOLDS TAB ══ */}
                        {tab === "thresholds" && (
                            <Card style={{ padding: 20 }}>
                                <ThresholdTable />
                            </Card>
                        )}

                        {/* ══ RECIPIENTS TAB ══ */}
                        {tab === "recipients" && (
                            <div className="fadeUp">
                                <NotificationRecipients />
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* ── Resolve Modal ── */}
            {showResolveModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15,27,61,0.5)',
                    backdropFilter: 'blur(8px)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 2000,
                }}>
                    <div className="fadeUp" style={{
                        background: "var(--surface)", width: '90%', maxWidth: '380px',
                        padding: '35px', borderRadius: 24,
                        boxShadow: "var(--shadow-md)", border: "1px solid var(--border)",
                    }}>
                        <div style={{
                            width: 64, height: 64, background: "var(--green-bg)",
                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 20px',
                        }}>
                            <CheckCircle size={32} color="var(--green)" />
                        </div>
                        <h2 style={{
                            fontWeight: 900, textAlign: 'center',
                            marginBottom: 10, letterSpacing: -0.5, color: "var(--text)",
                        }}>
                            Mark as Resolved?
                        </h2>
                        <p style={{
                            textAlign: 'center', color: "var(--text-muted)",
                            fontSize: 14, lineHeight: 1.5, marginBottom: 25,
                        }}>
                            Confirm handling of{" "}
                            <strong style={{ color: "var(--text)" }}>{selectedAlert?.location}</strong> incident.
                        </p>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Btn
                                variant="outline"
                                onClick={() => setShowResolveModal(false)}
                                style={{ flex: 1 }}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Btn>
                            <Btn
                                variant="green"
                                onClick={confirmResolve}
                                style={{ flex: 1 }}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Finalizing..." : "Confirm Resolve"}
                            </Btn>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ── Shared table header cell style ────────────────────────────────────────────
const thCell = {
    fontSize: 11, fontWeight: 800, color: "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: 0.5, padding: "14px",
};