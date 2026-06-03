// ─── MapView.jsx ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { Card, Badge, globalCSS, TabBar } from "../shared.jsx";

// Real Map Component (Leaflet)
const SriLankaMap = ({ mode, layer }) => {
    const center = [7.8731, 80.7718];

    const districts = [
        { name: "Ellagawa",   pos: [6.730, 80.213], risk: "high",     water: "2.1m" },
        { name: "Putupaula",  pos: [6.612, 80.060], risk: "critical", water: "3.9m" },
        { name: "Rathnapura", pos: [6.690, 80.380], risk: "critical", water: "4.8m" },
    ];

    const safeLocations = [
        { name: "Rathnapura School", pos: [6.68,  80.40] },
        { name: "Colombo Hospital",  pos: [6.93,  79.86] },
        { name: "Kandy Centre",      pos: [7.29,  80.63] },
    ];

    const getColor = (risk) => ({
        critical: "red",
        high:     "orange",
        medium:   "yellow",
        low:      "lightgreen",
        safe:     "green",
    })[risk];

    const tileUrl =
        layer === "Satellite"
            ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attribution =
        layer === "Satellite"
            ? "Tiles &copy; Esri &mdash; Source: Esri, NASA, NGA, USGS"
            : "&copy; OpenStreetMap contributors";

    return (
        <MapContainer center={center} zoom={7} style={{ height: "100%", width: "100%" }}>
            <TileLayer url={tileUrl} attribution={attribution} />
            {districts.map((d, i) => (
                <Marker key={i} position={d.pos}>
                    <Popup>
                        <b>{d.name}</b><br />
                        Water Level: {d.water}<br />
                        Risk: {d.risk}
                    </Popup>
                </Marker>
            ))}
            {mode === "heatmap" && districts.map((d, i) => (
                <Circle
                    key={i}
                    center={d.pos}
                    radius={20000}
                    pathOptions={{ color: getColor(d.risk) }}
                />
            ))}
            {mode === "safe" && safeLocations.map((s, i) => (
                <Marker key={i} position={s.pos}>
                    <Popup>{s.name}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, val, sub, color }) => (
    <div style={{
        background: "var(--surface)",
        borderRadius: 14,
        padding: "16px 18px",
        boxShadow: "var(--shadow)",
        border: "1px solid var(--border)",
        borderLeft: `4px solid ${color}`,
    }}>
        <div style={{
            fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6,
        }}>
            {label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>
            {val}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-mid)", marginTop: 6 }}>
            {sub}
        </div>
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MapView() {
    const [tab, setTab]     = useState("sensor");
    const [layer, setLayer] = useState("Map");

    const tabs = [
        { id: "sensor",   label: "Sensor Locations" },
        { id: "affected", label: "Affected Areas"   },
        { id: "heatmap",  label: "Risk Heatmap"     },
        { id: "safe",     label: "Safe Locations"   },
    ];

    const mapMode =
        tab === "heatmap" ? "heatmap" :
            tab === "safe"    ? "safe"    :
                "sensor";

    const stats = [
        { label: "Critical Zones",  val: "3",  sub: "High risk areas",     color: "var(--red)"    },
        { label: "Active Sensors",  val: "5",  sub: "All systems running", color: "var(--primary)" },
        { label: "Safe Shelters",   val: "12", sub: "Available shelters",  color: "var(--green)"  },
        { label: "Affected Areas",  val: "6",  sub: "Flood impact zones",  color: "var(--orange)" },
    ];

    return (
        <>
            <style>{globalCSS}</style>

            <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

                {/* ── Page Header ── */}
                <div style={{
                    background: "var(--surface)",
                    borderRadius: 16,
                    margin: "0 0 14px",
                    padding: "16px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "var(--shadow)",
                    border: "1px solid var(--border)",
                }}>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.3, color: "var(--text)" }}>
                            Map View
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                            Visualize sensor positions, flood zones, risk heatmap &amp; safe shelters on the map
                        </div>
                    </div>

                    {/* Hint pill */}
                    <div style={{
                        display: "flex", gap: 8, alignItems: "center",
                        fontSize: 11, color: "var(--text-muted)",
                        background: "var(--surface-alt)",
                        border: "1.5px solid var(--border)",
                        borderRadius: 10, padding: "8px 14px",
                    }}>
                        <span>💡</span>
                        <span>
                            To register nodes → <b style={{ color: "var(--text)" }}>IoT Node Manager</b>
                            &nbsp;|&nbsp;
                            To add shelters → <b style={{ color: "var(--text)" }}>Safe Location Manager</b>
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                    {/* ── Stats Row ── */}
                    <div
                        className="fadeUp"
                        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}
                    >
                        {stats.map((s, i) => <StatCard key={i} {...s} />)}
                    </div>

                    {/* ── Tab Bar ── */}
                    <TabBar tabs={tabs} active={tab} onChange={setTab} />

                    {/* ── Map Card ── */}
                    <div className="fadeUp">
                        <div style={{
                            background: "var(--surface)",
                            borderRadius: 16,
                            border: "1px solid var(--border)",
                            boxShadow: "var(--shadow)",
                            overflow: "hidden",
                        }}>
                            {/* Map card header */}
                            <div style={{
                                padding: "12px 16px",
                                borderBottom: "1px solid var(--border)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: "var(--surface)",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                                        Sri Lanka Real-Time Map
                                    </span>
                                    {/* Live indicator */}
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 5,
                                        background: "var(--green-bg)",
                                        border: "1px solid var(--green)",
                                        borderRadius: 20, padding: "2px 8px",
                                    }}>
                                        <div style={{
                                            width: 6, height: 6, borderRadius: "50%",
                                            background: "var(--green)",
                                        }} className="pulse" />
                                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green)" }}>
                                            LIVE
                                        </span>
                                    </div>
                                </div>

                                {/* Layer toggle */}
                                <div style={{
                                    display: "flex", gap: 4,
                                    background: "var(--surface-alt)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 10, padding: 3,
                                }}>
                                    {["Map", "Satellite"].map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => setLayer(l)}
                                            style={{
                                                padding: "5px 14px", borderRadius: 8,
                                                border: "none", cursor: "pointer",
                                                fontSize: 12, fontWeight: 700,
                                                transition: "all .15s",
                                                background: layer === l ? "var(--primary)" : "transparent",
                                                color: layer === l ? "#fff" : "var(--text-muted)",
                                            }}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Map itself */}
                            <div style={{ height: "62vh", width: "100%" }}>
                                <SriLankaMap mode={mapMode} layer={layer} />
                            </div>

                            {/*/!* Map footer — legend *!/*/}
                            {/*<div style={{*/}
                            {/*    padding: "10px 16px",*/}
                            {/*    borderTop: "1px solid var(--border)",*/}
                            {/*    background: "var(--surface)",*/}
                            {/*    display: "flex", alignItems: "center", gap: 16,*/}
                            {/*}}>*/}
                            {/*    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>*/}
                            {/*        Risk Level:*/}
                            {/*    </span>*/}
                            {/*    {[*/}
                            {/*        { label: "Critical", color: "var(--red)"    },*/}
                            {/*        { label: "High",     color: "var(--orange)" },*/}
                            {/*        { label: "Medium",   color: "var(--yellow)" },*/}
                            {/*        { label: "Safe",     color: "var(--green)"  },*/}
                            {/*    ].map(({ label, color }) => (*/}
                            {/*        <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>*/}
                            {/*            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />*/}
                            {/*            <span style={{ fontSize: 11, color: "var(--text-mid)", fontWeight: 600 }}>{label}</span>*/}
                            {/*        </div>*/}
                            {/*    ))}*/}
                            {/*</div>*/}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
