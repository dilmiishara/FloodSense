// ─── MapView.jsx ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { C, Card, Badge, globalCSS, Header, Sidebar, TabBar } from "./shared";

// 🌍 Real Map Component (Leaflet)
const SriLankaMap = ({ mode, layer }) => {
    const center = [7.8731, 80.7718]; // Sri Lanka center

    const districts = [
        { name: "Ellagawa", pos: [6.730, 80.213], risk: "high", water: "2.1m" },
        { name: "Putupaula", pos: [6.612, 80.060], risk: "critical", water: "3.9m" },
        { name: "Rathnapura", pos: [6.690, 80.380], risk: "critical", water: "4.8m" },
    ];

    const safeLocations = [
        { name: "Ratnapura School", pos: [6.68, 80.4] },
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

    // ✅ Tile Layer selection
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
            style={{ height: "400px", width: "100%" }}
        >
            <TileLayer url={tileUrl} attribution={attribution} />

            {/* 📍 District markers */}
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

            {/* 🔥 Heatmap circles */}
            {mode === "heatmap" &&
                districts.map((d, i) => (
                    <Circle
                        key={i}
                        center={d.pos}
                        radius={20000}
                        pathOptions={{ color: getColor(d.risk) }}
                    />
                ))}

            {/* 🏠 Safe locations */}
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


                        {/* 🗺 Map */}
                        <Card style={{ padding: 0, overflow: "hidden" }}>
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

                            <SriLankaMap mode={mapMode} layer={layer} />
                        </Card>


                        {/* ── Bottom Stats ── */}
                        <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                            {[["🚨","Critical Zones","3",C.red],["📡","Active Sensors","5",C.dark],["🏠","Safe Locations","12",C.green],["🌊","Affected Districts","6",C.orange]].map(([icon, label, val, c], i) => (
                                <Card key={i} style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 20 }}>{icon}</span>
                                    <div>
                                        <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: .4 }}>{label}</div>
                                        <div style={{ fontSize: 18, fontWeight: 900, color: c }}>{val}</div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}