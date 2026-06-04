// ─── MapView.jsx ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { globalCSS, TabBar } from "../shared.jsx";
import { fetchSafeLocations } from "../api/services/safeLocationService.js";
import {
    SensorNodeIcon, SafeShieldIcon, LayersIcon, WarningIcon, InfoIcon,
    AccessibleIcon, CapacityIcon, PhoneContactIcon, LocationPinIcon,
    SchoolShelterIcon, HospitalShelterIcon, CommunityShelterIcon,
    GovernmentShelterIcon, ReligiousShelterIcon, SportsShelterIcon,
    ShelterTypeIcon,
} from "../shared/icons.jsx";

// ─── Fix Leaflet default icon (Vite/webpack) ──────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── SVG strings for Leaflet divIcon (can't use React here) ──────────────────
const SVG = {
    sensor: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="20" r="1" fill="#fff" stroke="none"/><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/></svg>`,
    school: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
    hospital: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    community: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a3 3 0 0 1 6 0v4"/></svg>`,
    government: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M4 20V10M20 20V10M12 4L2 10h20zM8 20v-6M12 20v-6M16 20v-6"/></svg>`,
    religious: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="10"/><line x1="8" y1="6" x2="16" y2="6"/><path d="M6 10h12v12H6z"/><path d="M9 22v-5a3 3 0 0 1 6 0v5"/></svg>`,
    sports: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="10" ry="5"/><ellipse cx="12" cy="12" rx="5" ry="2.5"/><line x1="12" y1="7" x2="12" y2="17"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
    shield: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l9 4v6c0 5.25-3.75 10.15-9 11.25C6.75 22.15 3 17.25 3 12V6z"/></svg>`,
};

const svgKeyForType = (type = "") => {
    const t = type.toLowerCase();
    if (t.includes("school"))    return "school";
    if (t.includes("hospital"))  return "hospital";
    if (t.includes("community")) return "community";
    if (t.includes("govern"))    return "government";
    if (t.includes("religi"))    return "religious";
    if (t.includes("sports"))    return "sports";
    return "shield";
};

// ─── Build marker icon — Google Maps style: pin + name callout to the right ───
//  Layout:  [ colored teardrop pin ] [ white card with name ]
//  The white card has a left-pointing triangle connecting it to the pin.
const makeIcon = (color, svgStr, label = "") => {
    const displayName = label.length > 26 ? label.slice(0, 24) + "…" : label;

    // Estimate card width so iconAnchor and iconSize are correct
    const charW   = 7.5;
    const cardW   = Math.max(80, Math.min(180, displayName.length * charW + 24));
    const pinW    = 36;
    const totalW  = pinW + 6 + cardW;  // pin + gap + card
    const totalH  = 44;

    const nameCard = displayName ? `
        <div style="
            display: flex;
            align-items: center;
            position: relative;
            margin-left: 4px;
        ">
            <!-- left-pointing triangle (callout arrow) -->
            <div style="
                width: 0; height: 0;
                border-top: 6px solid transparent;
                border-bottom: 6px solid transparent;
                border-right: 7px solid #fff;
                filter: drop-shadow(-1px 0 1px rgba(0,0,0,0.12));
                flex-shrink: 0;
            "></div>

            <!-- name card -->
            <div style="
                background: #fff;
                color: #1a1a1a;
                font-size: 11.5px;
                font-weight: 700;
                font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                padding: 5px 10px;
                border-radius: 8px;
                white-space: nowrap;
                box-shadow: 0 2px 10px rgba(0,0,0,0.18);
                border-left: 3px solid ${color};
                letter-spacing: 0.1px;
                line-height: 1;
            ">${displayName}</div>
        </div>` : "";

    return L.divIcon({
        className: "",
        html: `
            <div style="
                display: flex;
                align-items: center;
                cursor: pointer;
            ">
                <!-- teardrop pin -->
                <div style="
                    width: ${pinW}px; height: ${pinW}px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    background: ${color};
                    border: 2.5px solid #fff;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                ">
                    <div style="transform:rotate(45deg); display:flex; align-items:center; justify-content:center;">
                        ${svgStr}
                    </div>
                </div>

                ${nameCard}
            </div>`,
        iconSize:    [totalW, totalH],
        iconAnchor:  [pinW / 2, pinW],   // tip of the teardrop = anchor
        popupAnchor: [totalW / 2 - pinW / 2, -(pinW + 4)],
    });
};

const sensorIcon = (name) => makeIcon("#3b82f6", SVG.sensor, name);
const safeIcon   = (type, name) => makeIcon("#16a34a", SVG[svgKeyForType(type)], name);

// ─── FitBounds ────────────────────────────────────────────────────────────────
function FitBounds({ positions }) {
    const map = useMap();
    useEffect(() => {
        if (!positions.length) return;
        const bounds = L.latLngBounds(positions.map(p => [p.lat, p.lng]));
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }, [positions, map]);
    return null;
}

// ─── Map component ────────────────────────────────────────────────────────────
const SriLankaMap = ({ mode, layer, safeLocations, safeLoading }) => {
    const center = [7.8731, 80.7718];

    const sensorNodes = [
        { name: "Ellagawa",   pos: [6.730, 80.213], risk: "high",     water: "2.1m" },
        { name: "Putupaula",  pos: [6.612, 80.060], risk: "critical", water: "3.9m" },
        { name: "Rathnapura", pos: [6.690, 80.380], risk: "critical", water: "4.8m" },
    ];

    const riskColor = (r) => ({ critical:"#ef4444", high:"#f97316", medium:"#eab308", low:"#22c55e" })[r] || "#6b7280";

    const tileUrl = layer === "Satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attribution = layer === "Satellite"
        ? "Tiles &copy; Esri &mdash; Source: Esri, NASA, NGA, USGS"
        : "&copy; OpenStreetMap contributors";

    const safePositions = safeLocations
        .filter(s => s.latitude && s.longitude)
        .map(s => ({ lat: parseFloat(s.latitude), lng: parseFloat(s.longitude) }));

    // Popup detail row
    const Row = ({ label, value, mono }) => value ? (
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, gap:12, alignItems:"flex-start" }}>
            <span style={{ color:"#777", flexShrink:0 }}>{label}</span>
            <span style={{ fontWeight:600, fontFamily: mono ? "monospace":"inherit", textAlign:"right", fontSize: mono ? 11:12 }}>{value}</span>
        </div>
    ) : null;

    return (
        <MapContainer center={center} zoom={7} style={{ height:"100%", width:"100%" }}>
            <TileLayer url={tileUrl} attribution={attribution} />

            {/* Sensor markers */}
            {(mode === "sensor" || mode === "heatmap") && sensorNodes.map((d, i) => (
                <Marker key={i} position={d.pos} icon={sensorIcon(d.name)}>
                    <Popup>
                        <div style={{ fontFamily:"system-ui,sans-serif", minWidth:185 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, paddingBottom:8, borderBottom:"1px solid #eee" }}>
                                <div style={{ width:32, height:32, borderRadius:8, background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                    <SensorNodeIcon size={16} color="#3b82f6" />
                                </div>
                                <div>
                                    <div style={{ fontWeight:800, fontSize:14, color:"#111" }}>{d.name}</div>
                                    <div style={{ fontSize:11, color:"#888" }}>Sensor Node</div>
                                </div>
                            </div>
                            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                                <Row label="Water Level" value={d.water} />
                                <Row label="Risk" value={<span style={{ color:riskColor(d.risk), fontWeight:800, textTransform:"uppercase" }}>{d.risk}</span>} />
                                <Row label="Coordinates" value={`${d.pos[0].toFixed(4)}, ${d.pos[1].toFixed(4)}`} mono />
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Heatmap circles */}
            {mode === "heatmap" && sensorNodes.map((d, i) => (
                <Circle key={i} center={d.pos} radius={22000}
                        pathOptions={{ color:riskColor(d.risk), fillColor:riskColor(d.risk), fillOpacity:0.22, weight:2 }} />
            ))}

            {/* Safe location markers */}
            {mode === "safe" && (
                <>
                    {safePositions.length > 0 && <FitBounds positions={safePositions} />}

                    {safeLocations.filter(s => s.latitude && s.longitude).map((s, i) => (
                        <Marker key={s.id || i}
                                position={[parseFloat(s.latitude), parseFloat(s.longitude)]}
                                icon={safeIcon(s.location_type, s.location_name)}>
                            <Popup>
                                <div style={{ fontFamily:"system-ui,sans-serif", minWidth:215 }}>
                                    {/* Header */}
                                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, paddingBottom:8, borderBottom:"1px solid #eee" }}>
                                        <div style={{ width:36, height:36, borderRadius:10, background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:"1.5px solid #86efac" }}>
                                            <ShelterTypeIcon type={s.location_type} size={18} color="#16a34a" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight:800, fontSize:14, color:"#111", lineHeight:1.2 }}>{s.location_name}</div>
                                            <div style={{ fontSize:11, color:"#888", marginTop:2 }}>{s.location_type}</div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                        <div style={{ display:"flex", gap:6, fontSize:12, alignItems:"flex-start" }}>
                                            <LocationPinIcon size={12} color="#888" />
                                            <span style={{ color:"#444", lineHeight:1.4 }}>{s.address}</span>
                                        </div>
                                        <Row label="District"     value={s.district} />
                                        <Row label="Province"     value={s.province} />
                                        <Row label="Capacity"     value={s.max_capacity ? `${s.max_capacity.toLocaleString()} people` : null} />
                                        <Row label="Contact"      value={s.contact_person} />
                                        <Row label="Phone"        value={s.contact_number} mono />
                                        <Row label="Coordinates"  value={`${parseFloat(s.latitude).toFixed(4)}, ${parseFloat(s.longitude).toFixed(4)}`} mono />
                                        {s.disabled_access && (
                                            <div style={{ marginTop:4, padding:"4px 10px", background:"#eff6ff", borderRadius:6, fontSize:11, color:"#2563eb", fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
                                                <AccessibleIcon size={12} color="#2563eb" />
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
                        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:1000, background:"#fff", padding:"24px 32px", borderRadius:16, boxShadow:"0 4px 24px rgba(0,0,0,0.12)", textAlign:"center" }}>
                            <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}>
                                <SafeShieldIcon size={40} color="#d1d5db" />
                            </div>
                            <div style={{ fontWeight:800, fontSize:14, color:"#111", marginBottom:4 }}>No safe locations registered</div>
                            <div style={{ fontSize:12, color:"#888" }}>Add shelters in Safe Location Manager</div>
                        </div>
                    )}
                </>
            )}
        </MapContainer>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, val, sub, color, Icon }) => (
    <div style={{ background:"var(--surface)", borderRadius:14, padding:"16px 18px", boxShadow:"var(--shadow)", border:"1px solid var(--border)", borderLeft:`4px solid ${color}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
            <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>{label}</div>
            <div style={{ fontSize:28, fontWeight:900, color, lineHeight:1 }}>{val}</div>
            <div style={{ fontSize:11, color:"var(--text-mid)", marginTop:6 }}>{sub}</div>
        </div>
        <div style={{ opacity:0.12 }}><Icon size={40} color={color} /></div>
    </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
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
        { id:"sensor",   label:"Sensor Locations" },
        { id:"affected", label:"Affected Areas"   },
        { id:"heatmap",  label:"Risk Heatmap"     },
        { id:"safe",     label:"Safe Locations"   },
    ];

    const mapMode      = tab === "heatmap" ? "heatmap" : tab === "safe" ? "safe" : "sensor";
    const totalCap     = safeLocations.reduce((s, l) => s + (l.max_capacity || 0), 0);

    const stats = [
        { label:"Critical Zones", val:"3",                       sub:"High risk areas",     color:"var(--red)",     Icon: WarningIcon },
        { label:"Active Sensors", val:"5",                       sub:"All systems running", color:"var(--primary)", Icon: SensorNodeIcon },
        { label:"Safe Shelters",  val:safeLocations.length || 0, sub:"Registered shelters", color:"var(--green)",   Icon: SafeShieldIcon },
        { label:"Affected Areas", val:"6",                       sub:"Flood impact zones",  color:"var(--orange)",  Icon: InfoIcon },
    ];

    return (
        <>
            <style>{globalCSS}</style>
            <div style={{ minHeight:"100vh", background:"var(--bg)" }}>

                {/* Header */}
                <div style={{ background:"var(--surface)", borderRadius:16, margin:"0 0 14px", padding:"16px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"var(--shadow)", border:"1px solid var(--border)" }}>
                    <div>
                        <div style={{ fontSize:18, fontWeight:900, letterSpacing:-0.3, color:"var(--text)" }}>Map View</div>
                        <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:3 }}>
                            Visualize sensor positions, flood zones, risk heatmap &amp; safe shelters on the map
                        </div>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center", fontSize:11, color:"var(--text-muted)", background:"var(--surface-alt)", border:"1.5px solid var(--border)", borderRadius:10, padding:"8px 14px" }}>
                        <LayersIcon size={13} color="var(--text-muted)" />
                        <span>Register nodes → <b style={{ color:"var(--text)" }}>IoT Node Manager</b> &nbsp;|&nbsp; Add shelters → <b style={{ color:"var(--text)" }}>Safe Location Manager</b></span>
                    </div>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

                    {/* Stats */}
                    <div className="fadeUp" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                        {stats.map((s, i) => <StatCard key={i} {...s} />)}
                    </div>

                    <TabBar tabs={tabs} active={tab} onChange={setTab} />

                    {/* Map + side panel */}
                    <div className="fadeUp" style={{ display:"flex", gap:12, alignItems:"flex-start" }}>

                        {/* Map card */}
                        <div style={{ flex:1, background:"var(--surface)", borderRadius:16, border:"1px solid var(--border)", boxShadow:"var(--shadow)", overflow:"hidden" }}>

                            {/* Map header */}
                            <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                    <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>Sri Lanka Real-Time Map</span>
                                    <div style={{ display:"flex", alignItems:"center", gap:5, background:"var(--green-bg)", border:"1px solid var(--green)", borderRadius:20, padding:"3px 10px" }}>
                                        <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)" }} className="pulse" />
                                        <span style={{ fontSize:10, fontWeight:700, color:"var(--green)" }}>LIVE</span>
                                    </div>
                                    {tab === "safe" && (
                                        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, fontWeight:700, background:"#f0fdf4", border:"1px solid #86efac", borderRadius:20, padding:"3px 10px", color:"#16a34a" }}>
                                            <SafeShieldIcon size={11} color="#16a34a" />
                                            {safeLoading ? "Loading…" : `${safeLocations.length} shelters`}
                                        </div>
                                    )}
                                </div>

                                {/* Layer toggle */}
                                <div style={{ display:"flex", gap:4, background:"var(--surface-alt)", border:"1px solid var(--border)", borderRadius:10, padding:3 }}>
                                    {["Map","Satellite"].map(l => (
                                        <button key={l} onClick={() => setLayer(l)} style={{ padding:"5px 14px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, transition:"all .15s", background: layer===l ? "var(--primary)" : "transparent", color: layer===l ? "#fff" : "var(--text-muted)" }}>{l}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Map */}
                            <div style={{ height:"62vh", width:"100%" }}>
                                <SriLankaMap mode={mapMode} layer={layer} safeLocations={safeLocations} safeLoading={safeLoading} />
                            </div>

                            {/* Error bar */}
                            {safeError && tab === "safe" && (
                                <div style={{ padding:"10px 16px", background:"#fef2f2", borderTop:"1px solid #fecaca", fontSize:12, color:"#dc2626", fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
                                    <InfoIcon size={14} color="#dc2626" /> {safeError}
                                </div>
                            )}
                        </div>

                        {/* Side panel */}
                        {tab === "safe" && (
                            <div style={{ width:290, flexShrink:0, background:"var(--surface)", borderRadius:16, border:"1px solid var(--border)", boxShadow:"var(--shadow)", overflow:"hidden" }}>
                                <div style={{ padding:"12px 14px", borderBottom:"1px solid var(--border)" }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                                        <SafeShieldIcon size={14} color="var(--green)" />
                                        <div style={{ fontSize:13, fontWeight:800, color:"var(--text)" }}>Safe Shelters</div>
                                    </div>
                                </div>

                                <div style={{ overflowY:"auto", maxHeight:"calc(62vh - 50px)" }}>
                                    {safeLoading ? (
                                        <div style={{ padding:"30px 0", textAlign:"center", color:"var(--text-muted)", fontSize:12 }}>Loading…</div>
                                    ) : safeLocations.length === 0 ? (
                                        <div style={{ padding:"30px 14px", textAlign:"center" }}>
                                            <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}><SafeShieldIcon size={36} color="#d1d5db" /></div>
                                            <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", marginBottom:4 }}>No shelters yet</div>
                                            <div style={{ fontSize:11, color:"var(--text-muted)" }}>Add in Safe Location Manager</div>
                                        </div>
                                    ) : safeLocations.map((s, i) => (
                                        <div key={s.id || i}
                                             style={{ padding:"11px 14px", borderBottom:"1px solid var(--border)", display:"flex", gap:10, alignItems:"flex-start", transition:"background .15s", cursor:"default" }}
                                             onMouseEnter={e => e.currentTarget.style.background = "var(--surface-alt)"}
                                             onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        >
                                            <div style={{ width:32, height:32, borderRadius:9, background:"#f0fdf4", border:"1.5px solid #86efac", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                                <ShelterTypeIcon type={s.location_type} size={15} color="#16a34a" />
                                            </div>
                                            <div style={{ flex:1, minWidth:0 }}>
                                                <div style={{ fontSize:12, fontWeight:800, color:"var(--text)", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.location_name}</div>
                                                <div style={{ fontSize:10, color:"var(--text-muted)", marginBottom:5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                                    {s.district}{s.province ? `, ${s.province}` : ""}
                                                </div>
                                                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>

                                                    {s.contact_number && (
                                                        <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:10, fontWeight:700, background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:6, padding:"1px 6px", color:"#2563eb" }}>
                                                            <PhoneContactIcon size={9} color="#2563eb" />
                                                            {s.contact_number}
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
