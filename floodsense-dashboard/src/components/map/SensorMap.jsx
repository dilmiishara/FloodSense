import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { SensorNodeIcon } from "../../shared/icons.jsx";
import { sensorIcon, riskColor } from "./MapIcons.js";
import { PopupRow, getTileUrl, getTileAttribution, SRI_LANKA_CENTER } from "./MapShared.jsx";

// ─── Static sensor nodes ──────────────────────────────────────────────────────
const SENSOR_NODES = [
    { name: "Ellagawa",   pos: [6.730, 80.213], risk: "high",     water: "2.1m" },
    { name: "Putupaula",  pos: [6.612, 80.060], risk: "critical", water: "3.9m" },
    { name: "Rathnapura", pos: [6.690, 80.380], risk: "critical", water: "4.8m" },
];

export default function SensorMap({ layer }) {
    return (
        <MapContainer center={SRI_LANKA_CENTER} zoom={7} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                url={getTileUrl(layer)}
                attribution={getTileAttribution(layer)}
            />

            {SENSOR_NODES.map((d, i) => (
                <Marker key={i} position={d.pos} icon={sensorIcon(d.name)}>
                    <Popup>
                        <div style={{ fontFamily: "system-ui,sans-serif", minWidth: 185 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #eee" }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <SensorNodeIcon size={16} color="#3b82f6" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 14, color: "#111" }}>{d.name}</div>
                                    <div style={{ fontSize: 11, color: "#888" }}>Sensor Node</div>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                <PopupRow label="Water Level" value={d.water} />
                                <PopupRow label="Risk" value={
                                    <span style={{ color: riskColor(d.risk), fontWeight: 800, textTransform: "uppercase" }}>{d.risk}</span>
                                } />
                                <PopupRow label="Coordinates" value={`${d.pos[0].toFixed(4)}, ${d.pos[1].toFixed(4)}`} mono />
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}