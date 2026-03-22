// ─── MapView.jsx ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { C, Card, Badge, globalCSS, Header, Sidebar, TabBar } from "./shared";

// 🌍 Real Map Component (Leaflet)
const SriLankaMap = ({ mode }) => {
    const center = [7.8731, 80.7718]; // Sri Lanka center

    const districts = [
        { name: "Colombo", pos: [6.9271, 79.8612], risk: "high", water: "2.1m" },
        { name: "Kalutara", pos: [6.5854, 79.9607], risk: "critical", water: "3.9m" },
        { name: "Ratnapura", pos: [6.6828, 80.3992], risk: "critical", water: "4.8m" },
        { name: "Kandy", pos: [7.2906, 80.6337], risk: "medium", water: "1.8m" },
        { name: "Galle", pos: [6.0535, 80.2210], risk: "high", water: "2.3m" },
        { name: "Jaffna", pos: [9.6615, 80.0255], risk: "safe", water: "0.6m" },
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

    return (
        <MapContainer
            center={center}
            zoom={7}
            style={{ height: "400px", width: "100%" }}
        >
            {/* 🌍 Base Map */}
            <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* 📍 District markers */}
            {districts.map((d, i) => (
                <Marker key={i} position={d.pos}>
                    <Popup>
                        <b>{d.name}</b><br />
                        Water Level: {d.water}<br />
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
        { id: "sensor", label: "📡 Sensor Locations" },
        { id: "safe", label: "🏠 Safe Locations" },
        { id: "affected", label: "🌊 Affected Areas" },
        { id: "heatmap", label: "🔥 Risk Heatmap" },
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
                                justifyContent: "space-between"
                            }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>
                  🗺 Sri Lanka Real-Time Map
                </span>

                                <div style={{ display: "flex", gap: 6 }}>
                                    {["District", "Satellite"].map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => setLayer(l)}
                                            style={{
                                                padding: "5px 11px",
                                                borderRadius: 7,
                                                border: `1px solid ${C.border}`,
                                                background: "#fff",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <SriLankaMap mode={mapMode} />
                        </Card>

                    </div>
                </div>
            </div>
        </>
    );
}