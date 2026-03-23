// ─── MapView.jsx ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { C, Card, Badge, globalCSS, Header, Sidebar, TabBar } from "./shared";

// Real Map Component (Leaflet)
const SriLankaMap = ({ mode, layer }) => {
    const center = [7.8731, 80.7718]; // Sri Lanka center

    const districts = [
        { name: "Ellagawa", pos: [6.730, 80.213], risk: "high", water: "2.1m" },
        { name: "Putupaula", pos: [6.612, 80.060], risk: "critical", water: "3.9m" },
        { name: "Rathnapura", pos: [6.690, 80.380], risk: "critical", water: "4.8m" },
    ];

    const safeLocations = [
        { name: "Rathnapura School", pos: [6.68, 80.4] },
        { name: "Colombo Hospital", pos: [6.93, 79.86] },
        { name: "Kandy Centre", pos: [7.29, 80.63] },
    ];

    const getColor = (risk) => ({
        critical: "red",
        high: "orange",
        medium: "yellow",
        low: "lightgreen",
        safe: "green",
    })[risk];

    // Tile Layer selection
    const tileUrl =
        layer === "Satellite"
            ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attribution =
        layer === "Satellite"
            ? "Tiles &copy; Esri &mdash; Source: Esri, NASA, NGA, USGS"
            : "&copy; OpenStreetMap contributors";

    return (
        <MapContainer
            center={center}
            zoom={7}
            style={{ height: "100%", width: "100%"}}
        >
            <TileLayer url={tileUrl} attribution={attribution} />

            {/* District markers */}
            {districts.map((d, i) => (
                <Marker key={i} position={d.pos}>
                    <Popup>
                        <b>{d.name}</b>
                        <br />
                        Water Level: {d.water}
                        <br />
                        Risk: {d.risk}
                    </Popup>
                </Marker>
            ))}

            {/* Heatmap circles */}
            {mode === "heatmap" &&
                districts.map((d, i) => (
                    <Circle
                        key={i}
                        center={d.pos}
                        radius={20000}
                        pathOptions={{ color: getColor(d.risk) }}
                    />
                ))}

            {/* Safe locations */}
            {mode === "safe" &&
                safeLocations.map((s, i) => (
                    <Marker key={i} position={s.pos}>
                        <Popup>{s.name}</Popup>
                    </Marker>
                ))}
        </MapContainer>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function MapView({ page, setPage }) {
    const [emergencyMode, setEmergencyMode] = useState(true);
    const [tab, setTab] = useState("sensor");
    const [layer, setLayer] = useState("District");

    const tabs = [
        { id: "sensor", label: "Sensor Locations" },
        { id: "safe", label: "Safe Locations" },
        { id: "affected", label: "Affected Areas" },
        { id: "heatmap", label: "Risk Heatmap" },
    ];

    const mapMode =
        tab === "heatmap"
            ? "heatmap"
            : tab === "safe"
                ? "safe"
                : "sensor";

    const sensors = [
        { name: "Sensor A", loc: "IMEI 123", val: "80%", dot: "red", pulse: true, valColor: "red" },
        { name: "Sensor B", loc: "IMEI 123", val: "80%", dot: "red", pulse: true, valColor: "red" },
        { name: "Sensor C", loc: "IMEI 123", val: "80%", dot: "red", pulse: true, valColor: "red" }

    ];

    const safeList = [
        { icon: "", name: "Safe Center 1", cap: "200", status: "active", label: "AVAILABLE" }
    ];

    const districts = [
        { name: "Rathnapura", level: "4.8m", badge: "critical", label: "CRITICAL" }
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

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                        <TabBar tabs={tabs} active={tab} onChange={setTab} />

                        <div className="fadeUp" style={{ display: "flex", gap: 12 }}>

                            {/* 🗺 Map */}
                            <Card style={{ flex: 1, padding: 0, overflow: "hidden", minWidth: 0 }}>
                                <div style={{
                                    padding: "11px 14px",
                                    borderBottom: `1px solid ${C.border}`,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
                🗺 Sri Lanka Real-Time Map
            </span>

                                    {/* Layer toggle */}
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {["Map", "Satellite"].map((l) => (
                                            <button
                                                key={l}
                                                onClick={() => setLayer(l)}
                                                style={{
                                                    padding: "5px 11px",
                                                    borderRadius: 7,
                                                    border: `1px solid ${layer === l ? C.dark : C.border}`,
                                                    background: layer === l ? C.dark : "#fff",
                                                    color: layer === l ? "#fff" : C.mid,
                                                    cursor: "pointer"
                                                }}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* THIS IS THE MAIN FIX */}
                                <div style={{ height: "60vh", width: "100%" }}>
                                    <SriLankaMap mode={mapMode} layer={layer} />
                                </div>
                            </Card>

                            {/* Side Panel */}
                            <div style={{width: 244, display: "flex", flexDirection: "column", gap: 12}}>

                                {/* Sensor / Affected / Heatmap panel */}
                                {(tab === "sensor" || tab === "affected" || tab === "heatmap") && (
                                    <Card>
                                        <div style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            letterSpacing: .5,
                                            color: "#aaa",
                                            marginBottom: 10
                                        }}>
                                            {tab === "sensor" ? "Active Sensors" : tab === "heatmap" ? "Risk Probability (6H)" : "Affected Zones"}
                                        </div>
                                        {tab === "sensor" ? (
                                            sensors.map((s, i) => (
                                                <div key={i} style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 9,
                                                    padding: "7px 0",
                                                    borderBottom: i < sensors.length - 1 ? `1px solid #fafafa` : "none"
                                                }}>
                                                    <span className={s.pulse ? "pulse" : ""} style={{
                                                        display: "inline-block",
                                                        width: 9,
                                                        height: 9,
                                                        borderRadius: "50%",
                                                        background: s.dot,
                                                        flexShrink: 0
                                                    }}/>
                                                    <div style={{flex: 1}}>
                                                        <div style={{fontSize: 12, fontWeight: 700}}>{s.name}</div>
                                                        <div style={{fontSize: 10, color: "#aaa"}}>{s.loc}</div>
                                                    </div>
                                                    <span style={{
                                                        fontSize: 12,
                                                        fontWeight: 800,
                                                        color: s.valColor
                                                    }}>{s.val}</span>
                                                </div>
                                            ))
                                        ) : districts.map((d, i) => (
                                            <div key={i} style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: "7px 0",
                                                borderBottom: i < districts.length - 1 ? `1px solid #fafafa` : "none"
                                            }}>
                                                <div>
                                                    <div style={{fontSize: 13, fontWeight: 600}}>{d.name}</div>
                                                    <div style={{fontSize: 11, color: C.mid}}>
                                                        {tab === "heatmap" ? `Probability: ${[92, 78, 65, 60, 40, 10][i] || 20}%` : `Water: ${d.level}`}
                                                    </div>
                                                </div>
                                                <Badge type={d.badge}>{d.label}</Badge>
                                            </div>
                                        ))}
                                    </Card>
                                )}

                                {/* Safe Locations panel */}
                                {tab === "safe" && (
                                    <Card>
                                        <div style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            letterSpacing: .5,
                                            color: "#aaa",
                                            marginBottom: 10
                                        }}>Safe Locations (12 Total)
                                        </div>
                                        {safeList.map((z, i) => (
                                            <div key={i} style={{
                                                display: "flex",
                                                gap: 10,
                                                padding: "8px 0",
                                                borderBottom: i < safeList.length - 1 ? `1px solid #fafafa` : "none",
                                                alignItems: "flex-start"
                                            }}>
                                                <span style={{fontSize: 18, flexShrink: 0}}>{z.icon}</span>
                                                <div style={{flex: 1}}>
                                                    <div style={{fontSize: 12, fontWeight: 700}}>{z.name}</div>
                                                    <div
                                                        style={{fontSize: 10, color: C.mid, marginTop: 2}}>{z.cap}</div>
                                                    <Badge type={z.status}>{z.label}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </Card>
                                )}

                                {/* District alert card for sensor tab */}
                                {tab === "sensor" && (
                                    <Card>
                                        <div style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            letterSpacing: .5,
                                            color: "#aaa",
                                            marginBottom: 10
                                        }}>Rathnapura Risk Zones
                                        </div>
                                        {districts.map((d, i) => (
                                            <div key={i} style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: "7px 0",
                                                borderBottom: i < districts.length - 1 ? `1px solid #fafafa` : "none"
                                            }}>
                                                <div>
                                                    <div style={{fontSize: 13, fontWeight: 600}}>{d.name}</div>
                                                    <div style={{fontSize: 11, color: C.mid}}>Water: {d.level}</div>
                                                </div>
                                                <Badge type={d.badge}>{d.label}</Badge>
                                            </div>
                                        ))}
                                    </Card>
                                )}
                            </div>
                        </div>

                        {/* ── Bottom Stats ── */}
                        <div
                            className="fadeUp"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4,1fr)",
                                gap: 10
                            }}
                        >
                            {[
                                ["Critical Zones", "3", "High risk areas", C.red],
                                ["Active Sensors", "5", "All systems running", C.dark],
                                ["Safe Locations", "12", "Available shelters", C.green],
                                ["Affected Areas", "6", "Flood impact zones", C.orange]
                            ].map(([label, val, sub, c], i) => (
                                <div
                                    key={i}
                                    style={{
                                        background: C.white,
                                        borderRadius: 12,
                                        padding: "14px 16px",
                                        boxShadow: C.shadow,
                                        borderLeft: `4px solid ${c}`
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: "#aaa",
                                            textTransform: "uppercase",
                                            letterSpacing: 0.4
                                        }}
                                    >
                                        {label}
                                    </div>

                                    <div
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 900,
                                            color: c,
                                            marginTop: 4
                                        }}
                                    >
                                        {val}
                                    </div>

                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: C.mid,
                                            marginTop: 3
                                        }}
                                    >
                                        {sub}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}