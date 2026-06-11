import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { SafeShieldIcon, LocationPinIcon, PhoneContactIcon, AccessibleIcon, ShelterTypeIcon } from "../../shared/icons.jsx";
import { safeIcon } from "./MapIcons.js";
import { FitBounds, PopupRow, getTileUrl, getTileAttribution, SRI_LANKA_CENTER } from "./MapShared.jsx";

export default function SafeMap({ layer, safeLocations, safeLoading }) {
    const safePositions = safeLocations
        .filter(s => s.latitude && s.longitude)
        .map(s => ({ lat: parseFloat(s.latitude), lng: parseFloat(s.longitude) }));

    return (
        <MapContainer center={SRI_LANKA_CENTER} zoom={7} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                url={getTileUrl(layer)}
                attribution={getTileAttribution(layer)}
            />

            {safePositions.length > 0 && <FitBounds positions={safePositions} />}

            {safeLocations.filter(s => s.latitude && s.longitude).map((s, i) => (
                <Marker
                    key={s.id || i}
                    position={[parseFloat(s.latitude), parseFloat(s.longitude)]}
                    icon={safeIcon(s.location_type, s.location_name)}
                >
                    <Popup>
                        <div style={{ fontFamily: "system-ui,sans-serif", minWidth: 215 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #eee" }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1.5px solid #86efac" }}>
                                    <ShelterTypeIcon type={s.location_type} size={18} color="#16a34a" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 14, color: "#111", lineHeight: 1.2 }}>{s.location_name}</div>
                                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.location_type}</div>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <div style={{ display: "flex", gap: 6, fontSize: 12, alignItems: "flex-start" }}>
                                    <LocationPinIcon size={12} color="#888" />
                                    <span style={{ color: "#444", lineHeight: 1.4 }}>{s.address}</span>
                                </div>
                                <PopupRow label="District"    value={s.district} />
                                <PopupRow label="Province"    value={s.province} />
                                <PopupRow label="Capacity"    value={s.max_capacity ? `${s.max_capacity.toLocaleString()} people` : null} />
                                <PopupRow label="Contact"     value={s.contact_person} />
                                <PopupRow label="Phone"       value={s.contact_number} mono />
                                <PopupRow label="Coordinates" value={`${parseFloat(s.latitude).toFixed(4)}, ${parseFloat(s.longitude).toFixed(4)}`} mono />
                                {s.disabled_access && (
                                    <div style={{ marginTop: 4, padding: "4px 10px", background: "#eff6ff", borderRadius: 6, fontSize: 11, color: "#2563eb", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                                        <AccessibleIcon size={12} color="#2563eb" />
                                        Wheelchair / disabled access available
                                    </div>
                                )}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {!safeLoading && safeLocations.length === 0 && (
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1000, background: "#fff", padding: "24px 32px", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.12)", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                        <SafeShieldIcon size={40} color="#d1d5db" />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#111", marginBottom: 4 }}>No safe locations registered</div>
                    <div style={{ fontSize: 12, color: "#888" }}>Add shelters in Safe Location Manager</div>
                </div>
            )}
        </MapContainer>
    );
}