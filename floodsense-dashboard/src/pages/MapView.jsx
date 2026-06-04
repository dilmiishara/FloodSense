// ─── MapView.jsx ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { globalCSS, TabBar } from "../shared.jsx";
import { fetchSafeLocations } from "../api/services/safeLocationService.js";

// ─── Fix Leaflet default icon broken in Vite/webpack ─────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── SVG icon paths by shelter type ──────────────────────────────────────────
const TYPE_SVG = {
    school: (
        // Graduation cap
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>`
    ),
    hospital: (
        // Cross / plus
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8"  y1="12" x2="16" y2="12"/>
        </svg>`
    ),
    community: (
        // Building / community
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a3 3 0 0 1 6 0v4"/>
            <line x1="9" y1="11" x2="9" y2="11"/><line x1="15" y1="11" x2="15" y2="11"/>
        </svg>`
    ),
    government: (
        // Columns / government building
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 20h20M4 20V10M20 20V10M12 4L2 10h20zM8 20v-6M12 20v-6M16 20v-6"/>
        </svg>`
    ),
    religious: (
        // Church cross
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="2" x2="12" y2="22"/>
            <line x1="8"  y1="6" x2="16" y2="6"/>
            <path d="M6 12h12v10H6z"/>
        </svg>`
    ),
    sports: (
        // Stadium / sports
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="12" rx="10" ry="5"/>
            <ellipse cx="12" cy="12" rx="5" ry="2.5"/>
            <line x1="12" y1="7" x2="12" y2="17"/>
            <line x1="2"  y1="12" x2="22" y2="12"/>
        </svg>`
    ),
    default: (
        // Shield / safe place
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l9 4v6c0 5.25-3.75 10.15-9 11.25C6.75 22.15 3 17.25 3 12V6z"/>
        </svg>`
    ),
    sensor: (
        // Wifi / signal
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="20" r="1" fill="#fff"/>
            <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
            <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
        </svg>`
    ),
};

// ─── Get SVG key by location type string ─────────────────────────────────────
const svgKeyForType = (type = "") => {
    if (type.includes("School"))    return "school";
    if (type.includes("Hospital"))  return "hospital";
    if (type.includes("Community")) return "community";
    if (type.includes("Govern"))    return "government";
    if (type.includes("Religi"))    return "religious";
    if (type.includes("Sports"))    return "sports";
    return "default";
};

// ─── Build Leaflet divIcon with inline SVG ────────────────────────────────────
const makeIcon = (color, svgContent) => L.divIcon({
    className: "",
    html: `<div style="
        width:38px; height:38px; border-radius:50% 50% 50% 0;
        transform:rotate(-45deg); background:${color};
        border:3px solid #fff;
        box-shadow:0 3px 10px rgba(0,0,0,0.28);
        display:flex; align-items:center; justify-content:center;
    ">
        <div style="transform:rotate(45deg); display:flex; align-items:center; justify-content:center;">
            ${svgContent}
        </div>
    </div>`,
    iconSize:    [38, 38],
    iconAnchor:  [19, 38],
    popupAnchor: [0, -40],
});

const sensorIcon = makeIcon("#3b82f6", TYPE_SVG.sensor);

const safeIconByType = (type) =>
    makeIcon("#16a34a", TYPE_SVG[svgKeyForType(type)]);

// ─── Inline SVG React components for UI use ───────────────────────────────────
const Svg = ({ children, size = 16, color = "currentColor", ...rest }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        {children}
    </svg>
);

const SchoolIcon    = ({ size, color }) => <Svg size={size} color={color}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></Svg>;
const HospitalIcon  = ({ size, color }) => <Svg size={size} color={color}><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></Svg>;
const CommunityIcon = ({ size, color }) => <Svg size={size} color={color}><path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a3 3 0 0 1 6 0v4"/></Svg>;
const GovIcon       = ({ size, color }) => <Svg size={size} color={color}><path d="M2 20h20M4 20V10M20 20V10M12 4L2 10h20zM8 20v-6M12 20v-6M16 20v-6"/></Svg>;
const ChurchIcon    = ({ size, color }) => <Svg size={size} color={color}><line x1="12" y1="2" x2="12" y2="22"/><line x1="8" y1="6" x2="16" y2="6"/><path d="M6 12h12v10H6z"/></Svg>;
const SportsIcon    = ({ size, color }) => <Svg size={size} color={color}><ellipse cx="12" cy="12" rx="10" ry="5"/><ellipse cx="12" cy="12" rx="5" ry="2.5"/><line x1="12" y1="7" x2="12" y2="17"/><line x1="2" y1="12" x2="22" y2="12"/></Svg>;
const ShieldIcon    = ({ size, color }) => <Svg size={size} color={color}><path d="M12 2l9 4v6c0 5.25-3.75 10.15-9 11.25C6.75 22.15 3 17.25 3 12V6z"/></Svg>;
const SensorIcon    = ({ size, color }) => <Svg size={size} color={color}><circle cx="12" cy="20" r="1" fill={color}/><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/></Svg>;
const WheelchairIcon = ({ size, color }) => <Svg size={size} color={color}><circle cx="12" cy="4" r="2"/><path d="M9 8h6l1 9h-4l2 5H9l-2-5H5"/><path d="M15 13a5 5 0 1 1-8.66 5"/></Svg>;
const PeopleIcon    = ({ size, color }) => <Svg size={size} color={color}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></Svg>;
const PhoneIcon     = ({ size, color }) => <Svg size={size} color={color}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.32h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></Svg>;
const PersonIcon    = ({ size, color }) => <Svg size={size} color={color}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Svg>;
const PinIcon       = ({ size, color }) => <Svg size={size} color={color}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>;
const MapPinIcon    = ({ size, color }) => <Svg size={size} color={color}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill={color} stroke="none"/></Svg>;
const LiveIcon      = ({ size, color }) => <Svg size={size} color={color}><circle cx="12" cy="12" r="3" fill={color} stroke="none"/><path d="M2 12a10 10 0 1 0 20 0"/><path d="M6 12a6 6 0 1 0 12 0"/></Svg>;
const LayersIcon    = ({ size, color }) => <Svg size={size} color={color}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></Svg>;

// ─── Type icon component for sidebar list ─────────────────────────────────────
const TypeIcon = ({ type, size = 16, color = "#16a34a" }) => {
    const k = svgKeyForType(type);
    const props = { size, color };
    if (k === "school")     return <SchoolIcon {...props} />;
    if (k === "hospital")   return <HospitalIcon {...props} />;
    if (k === "community")  return <CommunityIcon {...props} />;
    if (k === "government") return <GovIcon {...props} />;
    if (k === "religious")  return <ChurchIcon {...props} />;
    if (k === "sports")     return <SportsIcon {...props} />;
    return <ShieldIcon {...props} />;
};

// ─── FitBounds — flies map to fit all markers ─────────────────────────────────
function FitBounds({ positions }) {
    const map = useMap();
    useEffect(() => {
        if (positions.length === 0) return;
        const bounds = L.latLngBounds(positions.map(p => [p.lat, p.lng]));
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }, [positions, map]);
    return null;
}

// ─── Map inner component ──────────────────────────────────────────────────────
const SriLankaMap = ({ mode, layer, safeLocations, safeLoading }) => {
    const center = [7.8731, 80.7718];

    const sensorNodes = [
        { name: "Ellagawa",   pos: [6.730, 80.213], risk: "high",     water: "2.1m" },
        { name: "Putupaula",  pos: [6.612, 80.060], risk: "critical", water: "3.9m" },
        { name: "Rathnapura", pos: [6.690, 80.380], risk: "critical", water: "4.8m" },
    ];

    const getRiskColor = (risk) => ({
        critical: "#ef4444", high: "#f97316",
        medium: "#eab308",   low: "#22c55e", safe: "#16a34a",
    })[risk] || "#6b7280";

    const tileUrl = layer === "Satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attribution = layer === "Satellite"
        ? "Tiles &copy; Esri &mdash; Source: Esri, NASA, NGA, USGS"
        : "&copy; OpenStreetMap contributors";

    const safePositions = safeLocations
        .filter(s => s.latitude && s.longitude)
        .map(s => ({ lat: parseFloat(s.latitude), lng: parseFloat(s.longitude) }));

    // ── Popup row helper ──
    const Row = ({ label, value, mono }) => value ? (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, gap: 12 }}>
            <span style={{ color: "#777", flexShrink: 0 }}>{label}</span>
            <span style={{ fontWeight: 600, fontFamily: mono ? "monospace" : "inherit", textAlign: "right", fontSize: mono ? 11 : 12 }}>{value}</span>
        </div>
    ) : null;

    return (
        <MapContainer center={center} zoom={7} style={{ height: "100%", width: "100%" }}>
            <TileLayer url={tileUrl} attribution={attribution} />

            {/* ── Sensor / heatmap markers ── */}
            {(mode === "sensor" || mode === "heatmap") && sensorNodes.map((d, i) => (
                <Marker key={i} position={d.pos} icon={sensorIcon}>
                    <Popup>
                        <div style={{ fontFamily: "system-ui, sans-serif", minWidth: 180 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #eee" }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <SensorIcon size={16} color="#3b82f6" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 14, color: "#111" }}>{d.name}</div>
                                    <div style={{ fontSize: 11, color: "#888" }}>Sensor Node</div>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                <Row label="Water Level" value={d.water} />
                                <Row label="Risk" value={<span style={{ color: getRiskColor(d.risk), fontWeight: 800, textTransform: "uppercase" }}>{d.risk}</span>} />
                                <Row label="Coordinates" value={`${d.pos[0].toFixed(4)}, ${d.pos[1].toFixed(4)}`} mono />
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* ── Risk heatmap circles ── */}
            {mode === "heatmap" && sensorNodes.map((d, i) => (
                <Circle key={i} center={d.pos} radius={22000}
                        pathOptions={{ color: getRiskColor(d.risk), fillColor: getRiskColor(d.risk), fillOpacity: 0.22, weight: 2 }} />
            ))}

            {/* ── Safe locations ── */}
            {mode === "safe" && (
                <>
                    {safePositions.length > 0 && <FitBounds positions={safePositions} />}

                    {safeLocations.filter(s => s.latitude && s.longitude).map((s, i) => (
                        <Marker key={s.id || i}
                                position={[parseFloat(s.latitude), parseFloat(s.longitude)]}
                                icon={safeIconByType(s.location_type)}>
                            <Popup>
                                <div style={{ fontFamily: "system-ui, sans-serif", minWidth: 210 }}>
                                    {/* Header */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #eee" }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1.5px solid #86efac" }}>
                                            <TypeIcon type={s.location_type} size={18} color="#16a34a" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: 14, color: "#111", lineHeight: 1.2 }}>{s.location_name}</div>
                                            <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.location_type}</div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        <div style={{ display: "flex", gap: 6, fontSize: 12, alignItems: "flex-start" }}>
                                            <PinIcon size={12} color="#888" />
                                            <span style={{ color: "#444", lineHeight: 1.4 }}>{s.address}</span>
                                        </div>
                                        <Row label="District"     value={s.district} />
                                        <Row label="Province"     value={s.province} />
                                        <Row label="Capacity"
                                             value={s.max_capacity ? `${s.max_capacity.toLocaleString()} people` : null} />
                                        <Row label="Contact"      value={s.contact_person} />
                                        <Row label="Phone"        value={s.contact_number} mono />
                                        <Row label="Coordinates"
                                             value={`${parseFloat(s.latitude).toFixed(4)}, ${parseFloat(s.longitude).toFixed(4)}`} mono />

                                        {s.disabled_access && (
                                            <div style={{ marginTop: 4, padding: "4px 10px", background: "#eff6ff", borderRadius: 6, fontSize: 11, color: "#2563eb", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                                                <WheelchairIcon size={12} color="#2563eb" />
                                                Wheelchair / disabled access available
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Empty state */}
                    {!safeLoading && safeLocations.length === 0 && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1000, background: "#fff", padding: "24px 32px", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.12)", textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                                <ShieldIcon size={40} color="#d1d5db" />
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 14, color: "#111", marginBottom: 4 }}>No safe locations registered</div>
                            <div style={{ fontSize: 12, color: "#888" }}>Add shelters in Safe Location Manager</div>
                        </div>
                    )}
                </>
            )}
        </MapContainer>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, val, sub, color, Icon }) => (
    <div style={{
        background: "var(--surface)", borderRadius: 14, padding: "16px 18px",
        boxShadow: "var(--shadow)", border: "1px solid var(--border)",
        borderLeft: `4px solid ${color}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
        <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 11, color: "var(--text-mid)", marginTop: 6 }}>{sub}</div>
        </div>
        <div style={{ opacity: 0.15 }}>
            <Icon size={38} color={color} />
        </div>
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MapView() {
    const [tab,           setTab]           = useState("sensor");
    const [layer,         setLayer]         = useState("Map");
    const [safeLocations, setSafeLocations] = useState([]);
    const [safeLoading,   setSafeLoading]   = useState(false);
    const [safeError,     setSafeError]     = useState(null);

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
            } finally { setSafeLoading(false); }
        };
        load();
    }, [tab]);

    const tabs = [
        { id: "sensor",   label: "Sensor Locations" },
        { id: "affected", label: "Affected Areas"   },
        { id: "heatmap",  label: "Risk Heatmap"     },
        { id: "safe",     label: "Safe Locations"   },
    ];

    const mapMode = tab === "heatmap" ? "heatmap" : tab === "safe" ? "safe" : "sensor";
    const totalCapacity = safeLocations.reduce((s, l) => s + (l.max_capacity || 0), 0);

    const stats = [
        { label: "Critical Zones",  val: "3",                       sub: "High risk areas",     color: "var(--red)",     Icon: ({ size, color }) => <Svg size={size} color={color}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg> },
        { label: "Active Sensors",  val: "5",                       sub: "All systems running", color: "var(--primary)", Icon: SensorIcon },
        { label: "Safe Shelters",   val: safeLocations.length || 0, sub: "Registered shelters", color: "var(--green)",   Icon: ShieldIcon },
        { label: "Affected Areas",  val: "6",                       sub: "Flood impact zones",  color: "var(--orange)",  Icon: ({ size, color }) => <Svg size={size} color={color}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></Svg> },
    ];

    return (
        <>
            <style>{globalCSS}</style>
            <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

                {/* Page Header */}
                <div style={{ background: "var(--surface)", borderRadius: 16, margin: "0 0 14px", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.3, color: "var(--text)" }}>Map View</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                            Visualize sensor positions, flood zones, risk heatmap &amp; safe shelters on the map
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: "var(--text-muted)", background: "var(--surface-alt)", border: "1.5px solid var(--border)", borderRadius: 10, padding: "8px 14px" }}>
                        <LayersIcon size={13} color="var(--text-muted)" />
                        <span>
                            Register nodes → <b style={{ color: "var(--text)" }}>IoT Node Manager</b>
                            &nbsp;|&nbsp;
                            Add shelters → <b style={{ color: "var(--text)" }}>Safe Location Manager</b>
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                    {/* Stats Row */}
                    <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                        {stats.map((s, i) => <StatCard key={i} {...s} />)}
                    </div>

                    <TabBar tabs={tabs} active={tab} onChange={setTab} />

                    {/* Map + side panel */}
                    <div className="fadeUp" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>

                        {/* Map card */}
                        <div style={{ flex: 1, background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", boxShadow: "var(--shadow)", overflow: "hidden" }}>

                            {/* Map header */}
                            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Sri Lanka Real-Time Map</span>

                                    {/* Live pill */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "var(--green-bg)", border: "1px solid var(--green)", borderRadius: 20, padding: "3px 10px" }}>
                                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} className="pulse" />
                                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green)" }}>LIVE</span>
                                    </div>

                                    {/* Shelter count pill */}
                                    {tab === "safe" && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 20, padding: "3px 10px", color: "#16a34a" }}>
                                            <ShieldIcon size={11} color="#16a34a" />
                                            {safeLoading ? "Loading…" : `${safeLocations.length} shelters`}
                                        </div>
                                    )}
                                </div>

                                {/* Layer toggle */}
                                <div style={{ display: "flex", gap: 4, background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 10, padding: 3 }}>
                                    {["Map", "Satellite"].map((l) => (
                                        <button key={l} onClick={() => setLayer(l)} style={{
                                            padding: "5px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                                            fontSize: 12, fontWeight: 700, transition: "all .15s",
                                            background: layer === l ? "var(--primary)" : "transparent",
                                            color:      layer === l ? "#fff" : "var(--text-muted)",
                                        }}>{l}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Map */}
                            <div style={{ height: "62vh", width: "100%" }}>
                                <SriLankaMap mode={mapMode} layer={layer} safeLocations={safeLocations} safeLoading={safeLoading} />
                            </div>

                            {/* Error bar */}
                            {safeError && tab === "safe" && (
                                <div style={{ padding: "10px 16px", background: "#fef2f2", borderTop: "1px solid #fecaca", fontSize: 12, color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                                    <Svg size={14} color="#dc2626"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Svg>
                                    {safeError}
                                </div>
                            )}
                        </div>

                        {/* Side panel — safe tab only */}
                        {tab === "safe" && (
                            <div style={{ width: 290, flexShrink: 0, background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", boxShadow: "var(--shadow)", overflow: "hidden" }}>

                                {/* Panel header */}
                                <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                                        <ShieldIcon size={14} color="var(--green)" />
                                        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>Safe Shelters</div>
                                    </div>

                                </div>

                                {/* List */}
                                <div style={{ overflowY: "auto", maxHeight: "calc(62vh - 50px)" }}>
                                    {safeLoading ? (
                                        <div style={{ padding: "30px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>Loading…</div>
                                    ) : safeLocations.length === 0 ? (
                                        <div style={{ padding: "30px 14px", textAlign: "center" }}>
                                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                                                <ShieldIcon size={36} color="#d1d5db" />
                                            </div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>No shelters yet</div>
                                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Add in Safe Location Manager</div>
                                        </div>
                                    ) : safeLocations.map((s, i) => (
                                        <div key={s.id || i}
                                             style={{ padding: "11px 14px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-start", transition: "background .15s", cursor: "default" }}
                                             onMouseEnter={e => e.currentTarget.style.background = "var(--surface-alt)"}
                                             onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        >
                                            {/* Type icon badge */}
                                            <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f0fdf4", border: "1.5px solid #86efac", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <TypeIcon type={s.location_type} size={15} color="#16a34a" />
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {s.location_name}
                                                </div>
                                                <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {s.district}{s.province ? `, ${s.province}` : ""}
                                                </div>

                                                {/* Badges */}
                                                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                                    {/*{s.max_capacity && (*/}
                                                    {/*    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "1px 6px", color: "#16a34a" }}>*/}
                                                    {/*        <PeopleIcon size={9} color="#16a34a" />*/}
                                                    {/*        {s.max_capacity.toLocaleString()}*/}
                                                    {/*    </span>*/}
                                                    {/*)}*/}
                                                    {s.contact_number && (
                                                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "1px 6px", color: "#2563eb" }}>
                                                            <PhoneIcon size={9} color="#2563eb" />
                                                            {s.contact_number}
                                                        </span>
                                                    )}
                                                    {s.disabled_access && (
                                                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, background: "#faf5ff", border: "1px solid #d8b4fe", borderRadius: 6, padding: "1px 6px", color: "#7c3aed" }}>
                                                            <WheelchairIcon size={9} color="#7c3aed" />
                                                            Accessible
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
