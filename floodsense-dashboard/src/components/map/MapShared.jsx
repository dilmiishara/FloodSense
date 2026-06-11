import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

// ─── Fix Leaflet default icon (Vite/webpack) ──────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── FitBounds — auto zoom map to fit all markers ────────────────────────────
export function FitBounds({ positions }) {
    const map = useMap();
    useEffect(() => {
        if (!positions.length) return;
        const bounds = L.latLngBounds(positions.map(p => [p.lat, p.lng]));
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }, [positions, map]);
    return null;
}

// ─── Popup Row — reusable label/value row inside popups ──────────────────────
export const PopupRow = ({ label, value, mono }) => value ? (
    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, gap:12, alignItems:"flex-start" }}>
        <span style={{ color:"#777", flexShrink:0 }}>{label}</span>
        <span style={{ fontWeight:600, fontFamily: mono ? "monospace":"inherit", textAlign:"right", fontSize: mono ? 11:12 }}>{value}</span>
    </div>
) : null;

// ─── Tile URLs ────────────────────────────────────────────────────────────────
export const getTileUrl = (layer) => layer === "Satellite"
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const getTileAttribution = (layer) => layer === "Satellite"
    ? "Tiles &copy; Esri &mdash; Source: Esri, NASA, NGA, USGS"
    : "&copy; OpenStreetMap contributors";

// ─── Sri Lanka map center ─────────────────────────────────────────────────────
export const SRI_LANKA_CENTER = [7.8731, 80.7718];

// ─── Station coordinates ──────────────────────────────────────────────────────
export const STATION_COORDS = {
    "Ellagawa":   [6.730, 80.213],
    "Putupaula":  [6.612, 80.060],
    "Rathnapura": [6.690, 80.380],
};