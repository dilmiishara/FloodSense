// ─── MapView.jsx ─────────────────────────────────────────────────────────────
import { useState, useEffect, lazy, Suspense } from "react";
import { globalCSS, TabBar } from "../shared.jsx";
import { fetchSafeLocations } from "../api/services/safeLocationService.js";
import {
    SensorNodeIcon, SafeShieldIcon, LayersIcon,
    WarningIcon, InfoIcon,
} from "../shared/icons.jsx";

// ─── Lazy load map components ─────────────────────────────────────────────────
const SensorMap    = lazy(() => import("../components/map/SensorMap.jsx"));
const AffectedMap  = lazy(() => import("../components/map/AffectedMap.jsx"));
// const HeatmapView  = lazy(() => import("../components/map/HeatmapView.jsx"));
const SafeMap      = lazy(() => import("../components/map/SafeMap.jsx"));

// ─── Loading spinner ──────────────────────────────────────────────────────────
const MapLoading = () => (
    <div style={{ height: "62vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading map...</span>
    </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, val, sub, color, Icon }) => (
    <div style={{ background: "var(--surface)", borderRadius: 14, padding: "16px 18px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", borderLeft: `4px solid ${color}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 11, color: "var(--text-mid)", marginTop: 6 }}>{sub}</div>
        </div>
        <div style={{ opacity: 0.12 }}><Icon size={40} color={color} /></div>
    </div>
);

// ─── Layer toggle ─────────────────────────────────────────────────────────────
const LayerToggle = ({ layer, setLayer }) => (
    <div style={{ display: "flex", gap: 4, background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 10, padding: 3 }}>
        {["Map", "Satellite"].map(l => (
            <button key={l} onClick={() => setLayer(l)} style={{ padding: "5px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all .15s", background: layer === l ? "var(--primary)" : "transparent", color: layer === l ? "#fff" : "var(--text-muted)" }}>
                {l}
            </button>
        ))}
    </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MapView() {
    const [tab,           setTab]           = useState("sensor");
    const [layer,         setLayer]         = useState("Map");
    const [safeLocations, setSafeLocations] = useState([]);
    const [safeLoading,   setSafeLoading]   = useState(false);
    const [safeError,     setSafeError]     = useState(null);

    // ── Load safe locations only when safe tab is active ──────────────────────
    useEffect(() => {
        if (tab !== "safe") return;
        const load = async () => {
            setSafeLoading(true); setSafeError(null);
            try {
                const res = await fetchSafeLocations();
                const raw = res.data.data || res.data || [];
                setSafeLocations(Array.isArray(raw) ? raw : []);
            } catch (err) {
                console.error(err);
                setSafeError("Could not load safe locations");
                setSafeLocations([]);
            } finally {
                setSafeLoading(false);
            }
        };
        load();
    }, [tab]);

    const tabs = [
        { id: "sensor",   label: "Sensor Locations" },
        { id: "affected", label: "Predicted Flood Area"   },
        { id: "safe",     label: "Safe Locations"   },
    ];

    //        { id: "heatmap",  label: "Risk Heatmap"     },

    const stats = [
        { label: "Critical Zones", val: "3",                       sub: "High risk areas",     color: "var(--red)",     Icon: WarningIcon    },
        { label: "Active Sensors", val: "5",                       sub: "All systems running", color: "var(--primary)", Icon: SensorNodeIcon },
        { label: "Safe Shelters",  val: safeLocations.length || 0, sub: "Registered shelters", color: "var(--green)",   Icon: SafeShieldIcon },
        { label: "Affected Areas", val: "6",                       sub: "Flood impact zones",  color: "var(--orange)",  Icon: InfoIcon       },
    ];

    return (
        <>
            <style>{globalCSS}</style>
            <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

                {/* ── Page Header ───────────────────────────────────────────── */}
                <div style={{ background: "var(--surface)", borderRadius: 16, margin: "0 0 14px", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.3, color: "var(--text)" }}>Map View</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                            Visualize sensor positions, flood zones, risk heatmap &amp; safe shelters on the map
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: "var(--text-muted)", background: "var(--surface-alt)", border: "1.5px solid var(--border)", borderRadius: 10, padding: "8px 14px" }}>
                        <LayersIcon size={13} color="var(--text-muted)" />
                        <span>Register nodes → <b style={{ color: "var(--text)" }}>IoT Node Manager</b> &nbsp;|&nbsp; Add shelters → <b style={{ color: "var(--text)" }}>Safe Location Manager</b></span>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                    {/* ── Stats ─────────────────────────────────────────────── */}
                    <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                        {stats.map((s, i) => <StatCard key={i} {...s} />)}
                    </div>

                    <TabBar tabs={tabs} active={tab} onChange={setTab} />

                    {/* ── Map header bar — hidden for affected tab ─────────── */}
                    {(
                        <div className="fadeUp" style={{ background: "var(--surface)", borderRadius: "16px 16px 0 0", border: "1px solid var(--border)", borderBottom: "none", boxShadow: "var(--shadow)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Sri Lanka Real-Time Map</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 5, background: "var(--green-bg)", border: "1px solid var(--green)", borderRadius: 20, padding: "3px 10px" }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} className="pulse" />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green)" }}>LIVE</span>
                                </div>
                                {tab === "safe" && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 20, padding: "3px 10px", color: "#16a34a" }}>
                                        <SafeShieldIcon size={11} color="#16a34a" />
                                        {safeLoading ? "Loading…" : `${safeLocations.length} shelters`}
                                    </div>
                                )}
                            </div>
                            <LayerToggle layer={layer} setLayer={setLayer} />
                        </div>
                    )}

                    {/* ── Map Content ───────────────────────────────────────── */}
                    <div className="fadeUp" style={{
                        background: "var(--surface)",
                        borderRadius: tab === "affected" ? "0 0 16px 16px" : "0 0 16px 16px",
                        border: "1px solid var(--border)",
                        borderTop: "none",
                        boxShadow: "var(--shadow)",
                        overflow: "hidden"
                    }}>

                        {/* Sensor Locations tab */}
                        {tab === "sensor" && (
                            <div style={{height: "62vh"}}>
                                <Suspense fallback={<MapLoading/>}>
                                    <SensorMap layer={layer}/>
                                </Suspense>
                            </div>
                        )}

                        {/* Affected Areas tab */}
                        {tab === "affected" && (
                            <Suspense fallback={<MapLoading/>}>
                                <AffectedMap layer={layer}/>
                            </Suspense>
                        )}

                        {/* Risk Heatmap tab */}
                        {tab === "heatmap" && (
                            <div style={{height: "62vh"}}>
                                <Suspense fallback={<MapLoading/>}>
                                    <HeatmapView layer={layer}/>
                                </Suspense>
                            </div>
                        )}

                        {/* Safe Locations tab */}
                        {tab === "safe" && (
                            <>
                                <div style={{height: "62vh", display: "flex", gap: 0}}>
                                    <div style={{flex: 1}}>
                                        <Suspense fallback={<MapLoading/>}>
                                            <SafeMap layer={layer} safeLocations={safeLocations}
                                                     safeLoading={safeLoading}/>
                                        </Suspense>
                                    </div>

                                    {/* Safe locations side panel */}
                                    <div style={{
                                        width: 290,
                                        flexShrink: 0,
                                        borderLeft: "1px solid var(--border)",
                                        overflow: "hidden"
                                    }}>
                                        <div style={{padding: "12px 14px", borderBottom: "1px solid var(--border)"}}>
                                            <div style={{display: "flex", alignItems: "center", gap: 7}}>
                                                <SafeShieldIcon size={14} color="var(--green)"/>
                                                <div style={{fontSize: 13, fontWeight: 800, color: "var(--text)"}}>Safe
                                                    Shelters
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{overflowY: "auto", maxHeight: "calc(62vh - 50px)"}}>
                                            {safeLoading ? (
                                                <div style={{
                                                    padding: "30px 0",
                                                    textAlign: "center",
                                                    color: "var(--text-muted)",
                                                    fontSize: 12
                                                }}>Loading…</div>
                                            ) : safeLocations.length === 0 ? (
                                                <div style={{padding: "30px 14px", textAlign: "center"}}>
                                                    <div style={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        marginBottom: 10
                                                    }}><SafeShieldIcon size={36} color="#d1d5db"/></div>
                                                    <div style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        color: "var(--text)",
                                                        marginBottom: 4
                                                    }}>No shelters yet
                                                    </div>
                                                    <div style={{fontSize: 11, color: "var(--text-muted)"}}>Add in Safe
                                                        Location Manager
                                                    </div>
                                                </div>
                                            ) : safeLocations.map((s, i) => (
                                                <div key={s.id || i}
                                                     style={{
                                                         padding: "11px 14px",
                                                         borderBottom: "1px solid var(--border)",
                                                         display: "flex",
                                                         gap: 10,
                                                         alignItems: "flex-start",
                                                         transition: "background .15s",
                                                         cursor: "default"
                                                     }}
                                                     onMouseEnter={e => e.currentTarget.style.background = "var(--surface-alt)"}
                                                     onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                    <div style={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 9,
                                                        background: "#f0fdf4",
                                                        border: "1.5px solid #86efac",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        flexShrink: 0
                                                    }}>
                                                        <SafeShieldIcon size={15} color="#16a34a"/>
                                                    </div>
                                                    <div style={{flex: 1, minWidth: 0}}>
                                                        <div style={{
                                                            fontSize: 12,
                                                            fontWeight: 800,
                                                            color: "var(--text)",
                                                            marginBottom: 2,
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap"
                                                        }}>{s.location_name}</div>
                                                        <div style={{
                                                            fontSize: 10,
                                                            color: "var(--text-muted)",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap"
                                                        }}>
                                                            {s.district}{s.province ? `, ${s.province}` : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Error bar */}
                                {safeError && (
                                    <div style={{
                                        padding: "10px 16px",
                                        background: "#fef2f2",
                                        borderTop: "1px solid #fecaca",
                                        fontSize: 12,
                                        color: "#dc2626",
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6
                                    }}>
                                        <InfoIcon size={14} color="#dc2626"/> {safeError}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}