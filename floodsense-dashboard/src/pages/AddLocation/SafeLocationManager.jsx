// ─── SafeLocationManager.jsx ──────────────────────────────────────────────────
//  Manages evacuation shelters / safe zones — with full API integration.
//  Tabs: Register Safe Location | Manage Locations
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, Badge, TabBar, FormGroup, Btn } from "../../shared.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
    fetchSafeLocations, createSafeLocation,
    updateSafeLocation, deleteSafeLocation,
} from "../../api/services/safeLocationService.js";
import {
    DISTRICTS, SAFE_LOCATION_TYPES, LOCATION_STATUS_OPTIONS, iconForType,
    SectionLabel, Modal, StatPill, IconBtn,
    inp, sel, g2,
} from "../../shared/addLocationHelpers.jsx";

// ─── PROVINCES ────────────────────────────────────────────────────────────────
const PROVINCES = [
    "Western", "Central", "Southern", "Northern", "Eastern",
    "North Western", "North Central", "Uva", "Sabaragamuwa",
];

// ─── LocationPicker ───────────────────────────────────────────────────────────
//  Address search (Nominatim) + click-on-map to set lat/lng
// ─────────────────────────────────────────────────────────────────────────────
function LocationPicker({ lat, lng, setLat, setLng }) {
    const mapRef     = useRef(null);
    const leafletMap = useRef(null);
    const markerRef  = useRef(null);

    const [searchText,    setSearchText]    = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching,     setSearching]     = useState(false);
    const [searchError,   setSearchError]   = useState("");

    // ── Init Leaflet ──
    useEffect(() => {
        if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link");
            link.id = "leaflet-css"; link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }

        const initMap = () => {
            if (!mapRef.current || leafletMap.current) return;
            const L   = window.L;
            const clat = parseFloat(lat) || 6.6828;
            const clng = parseFloat(lng) || 80.3992;

            const map = L.map(mapRef.current, { zoomControl: true }).setView([clat, clng], 11);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap contributors",
            }).addTo(map);

            if (lat && lng) {
                markerRef.current = L.marker([clat, clng]).addTo(map)
                    .bindPopup("Safe location").openPopup();
            }

            map.on("click", (e) => {
                const { lat: mlat, lng: mlng } = e.latlng;
                setLat(mlat.toFixed(6));
                setLng(mlng.toFixed(6));
                if (markerRef.current) markerRef.current.setLatLng([mlat, mlng]);
                else markerRef.current = L.marker([mlat, mlng]).addTo(map)
                    .bindPopup("Safe location").openPopup();
            });

            leafletMap.current = map;
        };

        if (window.L) initMap();
        else {
            const script = document.createElement("script");
            script.src   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload = initMap;
            document.head.appendChild(script);
        }

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
                markerRef.current  = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Fly to coords when they change (from search) ──
    useEffect(() => {
        const L   = window.L;
        const map = leafletMap.current;
        if (!L || !map || !lat || !lng) return;
        const plat = parseFloat(lat);
        const plng = parseFloat(lng);
        map.flyTo([plat, plng], 15, { duration: 1.2 });
        if (markerRef.current) markerRef.current.setLatLng([plat, plng]);
        else markerRef.current = L.marker([plat, plng]).addTo(map)
            .bindPopup("Safe location").openPopup();
    }, [lat, lng]);

    // ── Nominatim search ──
    const handleSearch = async () => {
        if (!searchText.trim()) return;
        setSearching(true); setSearchError(""); setSearchResults([]);
        try {
            const url  = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&countrycodes=lk&limit=5`;
            const res  = await fetch(url, { headers: { "Accept-Language": "en" } });
            const data = await res.json();
            if (data.length === 0) setSearchError("No results found. Try a different name.");
            else setSearchResults(data);
        } catch { setSearchError("Search failed. Check your connection."); }
        finally   { setSearching(false); }
    };

    const pickResult = (r) => {
        setLat(parseFloat(r.lat).toFixed(6));
        setLng(parseFloat(r.lon).toFixed(6));
        setSearchResults([]);
        setSearchText(r.display_name.split(",")[0]);
    };

    const searchBtnStyle = {
        padding: "0 14px", borderRadius: 10, border: "none",
        background: "var(--green)", color: "#fff", fontWeight: 800,
        fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
    };
    const dropdown = {
        position: "absolute", top: "100%", left: 0, right: 0, zIndex: 1000,
        background: "var(--surface)", border: "1.5px solid var(--border)",
        borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.12)",
        marginTop: 4, overflow: "hidden",
    };
    const dropItem = {
        padding: "10px 14px", fontSize: 12, cursor: "pointer",
        borderBottom: "1px solid var(--border)", color: "var(--text)", lineHeight: 1.4,
    };
    const coordBox = {
        background: "var(--surface-alt)", border: "1.5px solid var(--border)",
        borderRadius: 10, padding: "8px 12px",
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Search bar */}
            <div style={{ position: "relative" }}>
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        style={{ ...inp, flex: 1 }}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSearch()}
                        placeholder="Search shelter address or place name in Sri Lanka…"
                    />
                    <button style={searchBtnStyle} onClick={handleSearch} disabled={searching}>
                        {searching ? "Searching…" : "Search"}
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div style={dropdown}>
                        {searchResults.map((r, i) => (
                            <div key={i} style={dropItem}
                                 onMouseEnter={e => e.currentTarget.style.background = "var(--surface-alt)"}
                                 onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                 onClick={() => pickResult(r)}>
                                <div style={{ fontWeight: 700, fontSize: 12 }}>{r.display_name.split(",")[0]}</div>
                                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                                    {r.display_name.split(",").slice(1, 3).join(",")}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {searchError && (
                    <div style={{ fontSize: 11, color: "var(--red)", marginTop: 6 }}>⚠ {searchError}</div>
                )}
            </div>

            {/* Map hint */}
            <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <span>🖱</span>
                <span>Or click anywhere on the map to pin the exact shelter location</span>
            </div>

            {/* Map */}
            <div ref={mapRef} style={{
                width: "100%", height: 300, borderRadius: 12,
                border: "1.5px solid var(--border)", overflow: "hidden", background: "#e8edf2",
            }} />

            {/* Coordinate readout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={coordBox}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 2 }}>LATITUDE</div>
                    <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: "var(--text)", fontWeight: 700 }}>
                        {lat || <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>0.0000</span>}
                    </div>
                </div>
                <div style={coordBox}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 2 }}>LONGITUDE</div>
                    <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: "var(--text)", fontWeight: 700 }}>
                        {lng || <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>0.0000</span>}
                    </div>
                </div>
            </div>

            {/* Manual inputs */}
            <div style={g2}>
                <FormGroup label="Latitude (manual)">
                    <input style={inp} type="number" step="0.000001"
                           value={lat} onChange={e => setLat(e.target.value)} placeholder="6.6828" />
                </FormGroup>
                <FormGroup label="Longitude (manual)">
                    <input style={inp} type="number" step="0.000001"
                           value={lng} onChange={e => setLng(e.target.value)} placeholder="80.3992" />
                </FormGroup>
            </div>
        </div>
    );
}

// ─── Action button helper ─────────────────────────────────────────────────────
const actionBtn = (color, bg, border) => ({
    display: "flex", alignItems: "center", gap: 5,
    padding: "5px 12px", borderRadius: 8, cursor: "pointer",
    fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    border: `1.5px solid ${border}`, background: bg, color,
    transition: "all .15s",
});

// ─── SafeLocationManager ──────────────────────────────────────────────────────
export default function SafeLocationManager() {
    const toast = useToast();

    const [activeTab,    setActiveTab]    = useState("register");
    const [locations,    setLocations]    = useState([]);
    const [loading,      setLoading]      = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editTarget,   setEditTarget]   = useState(null);
    const [searchQ,      setSearchQ]      = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [saving,       setSaving]       = useState(false);
    const [editSaving,   setEditSaving]   = useState(false);

    // ── Register form ──
    const [fName,           setFName]           = useState("");
    const [fType,           setFType]           = useState("");
    const [fDistrict,       setFDistrict]       = useState("");
    const [fProvince,       setFProvince]       = useState("");
    const [fAddress,        setFAddress]        = useState("");
    const [fLat,            setFLat]            = useState("");
    const [fLng,            setFLng]            = useState("");
    const [fCap,            setFCap]            = useState("");
    const [fContactPerson,  setFContactPerson]  = useState("");
    const [fContactNumber,  setFContactNumber]  = useState("");
    const [fDisabledAccess, setFDisabledAccess] = useState(false);

    // ── Edit form ──
    const [eName,           setEName]           = useState("");
    const [eType,           setEType]           = useState("");
    const [eDistrict,       setEDistrict]       = useState("");
    const [eProvince,       setEProvince]       = useState("");
    const [eAddress,        setEAddress]        = useState("");
    const [eLat,            setELat]            = useState("");
    const [eLng,            setELng]            = useState("");
    const [eCap,            setECap]            = useState("");
    const [eContactPerson,  setEContactPerson]  = useState("");
    const [eContactNumber,  setEContactNumber]  = useState("");
    const [eDisabledAccess, setEDisabledAccess] = useState(false);

    // ── Load locations ──
    useEffect(() => { loadLocations(); }, []);

    const loadLocations = async () => {
        setLoading(true);
        try {
            const res = await fetchSafeLocations();
            const raw = res.data.data || res.data || [];
            setLocations(Array.isArray(raw) ? raw : []);
        } catch (err) {
            console.error(err);
            setLocations([]);
            toast.error("Could not load safe locations");
        } finally { setLoading(false); }
    };

    // ── Clear register form ──
    const clearForm = () => {
        setFName(""); setFType(""); setFDistrict(""); setFProvince("");
        setFAddress(""); setFLat(""); setFLng(""); setFCap("");
        setFContactPerson(""); setFContactNumber(""); setFDisabledAccess(false);
    };

    // ── Register ──
    const registerLocation = async () => {
        if (!fName || !fType || !fDistrict || !fAddress) {
            toast.error("Fill all required fields (*)"); return;
        }
        if (!fLat || !fLng) {
            toast.error("Please set GPS coordinates using search or map"); return;
        }
        setSaving(true);
        try {
            await createSafeLocation({
                location_name:   fName,
                location_type:   fType,
                district:        fDistrict,
                province:        fProvince || null,
                address:         fAddress,
                latitude:        parseFloat(fLat),
                longitude:       parseFloat(fLng),
                max_capacity:    fCap ? parseInt(fCap) : null,
                contact_person:  fContactPerson  || null,
                contact_number:  fContactNumber  || null,
                disabled_access: fDisabledAccess,
            });
            toast.success(`"${fName}" registered successfully`);
            clearForm();
            await loadLocations();
            setActiveTab("manage");
        } catch (err) {
            const msg = err?.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(", ")
                : err?.response?.data?.message || "Failed to register location";
            toast.error(msg);
        } finally { setSaving(false); }
    };

    // ── Open edit modal ──
    const openEdit = (loc) => {
        setEditTarget(loc);
        setEName(loc.location_name   || "");
        setEType(loc.location_type   || "");
        setEDistrict(loc.district    || "");
        setEProvince(loc.province    || "");
        setEAddress(loc.address      || "");
        setELat(loc.latitude  ? String(loc.latitude)  : "");
        setELng(loc.longitude ? String(loc.longitude) : "");
        setECap(loc.max_capacity ? String(loc.max_capacity) : "");
        setEContactPerson(loc.contact_person  || "");
        setEContactNumber(loc.contact_number  || "");
        setEDisabledAccess(loc.disabled_access || false);
    };

    // ── Save edit ──
    const saveEdit = async () => {
        if (!eName || !eType || !eDistrict || !eAddress) {
            toast.error("Fill all required fields (*)"); return;
        }
        if (!eLat || !eLng) {
            toast.error("Please set GPS coordinates"); return;
        }
        setEditSaving(true);
        try {
            await updateSafeLocation(editTarget.id, {
                location_name:   eName,
                location_type:   eType,
                district:        eDistrict,
                province:        eProvince || null,
                address:         eAddress,
                latitude:        parseFloat(eLat),
                longitude:       parseFloat(eLng),
                max_capacity:    eCap ? parseInt(eCap) : null,
                contact_person:  eContactPerson  || null,
                contact_number:  eContactNumber  || null,
                disabled_access: eDisabledAccess,
            });
            toast.success(`"${eName}" updated`);
            setEditTarget(null);
            await loadLocations();
        } catch (err) {
            const msg = err?.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(", ")
                : err?.response?.data?.message || "Failed to update location";
            toast.error(msg);
        } finally { setEditSaving(false); }
    };

    // ── Delete ──
    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteSafeLocation(deleteTarget.id);
            toast.success(`"${deleteTarget.location_name}" removed`);
            setDeleteTarget(null);
            await loadLocations();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete location");
        }
    };

    // ── Derived ──
    const filtered   = locations.filter(l => {
        const q = searchQ.toLowerCase();
        return (
            (l.location_name || "").toLowerCase().includes(q) ||
            (l.district      || "").toLowerCase().includes(q) ||
            (l.address       || "").toLowerCase().includes(q)
        );
    });
    const totalCap   = locations.reduce((s, l) => s + (l.max_capacity || 0), 0);

    const TABS = [
        { id: "register", label: "Register Safe Location" },
        { id: "manage",   label: "Manage Locations"       },
    ];

    // ── Checkbox style ──
    const checkLabel = { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text)", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" };

    return (
        <>
            {/* Page Header */}
            <div style={{ background:"var(--surface)", borderRadius:16, margin:"0 0 14px",
                padding:"14px 22px", display:"flex", alignItems:"center",
                justifyContent:"space-between", border:"1px solid var(--border)", boxShadow:"var(--shadow)" }}>
                <div>
                    <div style={{ fontSize:17, fontWeight:900, letterSpacing:-.3, color:"var(--text)" }}>
                        Safe Location Manager
                    </div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
                        Register and manage evacuation shelters, safe zones, and emergency facilities
                    </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <StatPill label="Total"    value={locations.length} accent="var(--text)"    />
                </div>
            </div>

            <div style={{ display:"flex", gap:12 }}>
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12, minWidth:0 }}>
                    <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

                    {/* ══ REGISTER TAB ══ */}
                    {activeTab === "register" && (
                        <div className="fadeUp" style={{ display:"flex", flexDirection:"column", gap:12 }}>

                            {/* Step 1 — Shelter Info */}
                            <Card>
                                <SectionLabel step="1" label="Shelter Information" />
                                <div style={{ ...g2, marginBottom:14 }}>
                                    <FormGroup label="Shelter Name *">
                                        <input style={inp} value={fName} onChange={e=>setFName(e.target.value)} placeholder="e.g. Ratnapura Municipal School" />
                                    </FormGroup>
                                    <FormGroup label="Shelter Type *">
                                        <select style={sel} value={fType} onChange={e=>setFType(e.target.value)}>
                                            <option value="">Select type…</option>
                                            {SAFE_LOCATION_TYPES.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </FormGroup>
                                </div>
                                <div style={{ ...g2, marginBottom:14 }}>
                                    <FormGroup label="District *">
                                        <select style={sel} value={fDistrict} onChange={e=>setFDistrict(e.target.value)}>
                                            <option value="">Select district…</option>
                                            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </FormGroup>
                                    <FormGroup label="Province">
                                        <select style={sel} value={fProvince} onChange={e=>setFProvince(e.target.value)}>
                                            <option value="">Select province…</option>
                                            {PROVINCES.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </FormGroup>
                                </div>
                                <FormGroup label="Address / Landmark *">
                                    <input style={inp} value={fAddress} onChange={e=>setFAddress(e.target.value)} placeholder="e.g. No. 15, Main Street, near bus stand" />
                                </FormGroup>
                            </Card>

                            {/* Step 2 — GPS with map picker */}
                            <Card>
                                <SectionLabel step="2" label="GPS Location" />
                                <div style={{ marginBottom:12, padding:"10px 14px", background:"var(--green-bg)",
                                    border:"1.5px solid var(--green)", borderRadius:10, fontSize:11, color:"var(--green)" }}>
                                    📍 Search the shelter address or click the map to pin the exact location
                                </div>
                                <LocationPicker lat={fLat} lng={fLng} setLat={setFLat} setLng={setFLng} />
                            </Card>

                            {/* Step 3 — Capacity & Contact */}
                            <Card>
                                <SectionLabel step="3" label="Contact" />
                                <div style={{ ...g2, marginBottom:14 }}>
                                    {/*<FormGroup label="Max Capacity (people)">*/}
                                    {/*    <input style={inp} type="number" min="0" value={fCap} onChange={e=>setFCap(e.target.value)} placeholder="200" />*/}
                                    {/*</FormGroup>*/}
                                    <FormGroup label="Contact Person">
                                        <input style={inp} value={fContactPerson} onChange={e=>setFContactPerson(e.target.value)} placeholder="e.g. Mr. Silva" />
                                    </FormGroup>
                                    <FormGroup label="Contact Number">
                                        <input style={inp} value={fContactNumber} onChange={e=>setFContactNumber(e.target.value)} placeholder="+94 45 222 3456" />
                                    </FormGroup>
                                </div>
                                <div style={{ ...g2, marginBottom:14 }}>

                                </div>
                            </Card>

                            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
                                <Btn variant="outline" onClick={clearForm}>Clear Form</Btn>
                                <Btn variant="primary" onClick={registerLocation} disabled={saving}>
                                    {saving ? "Registering…" : "Register Safe Location"}
                                </Btn>
                            </div>
                        </div>
                    )}

                    {/* ══ MANAGE TAB ══ */}
                    {activeTab === "manage" && (
                        <div className="fadeUp">
                            <Card>
                                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                                    <div>
                                        <div style={{ fontSize:14, fontWeight:800, color:"var(--text)" }}>Safe Locations</div>
                                        <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>Manage registered shelters and evacuation points</div>
                                    </div>
                                    <div style={{ display:"flex", gap:8 }}>
                                        <Btn variant="outline" onClick={loadLocations} style={{ fontSize:12, padding:"8px 14px" }}>↻ Refresh</Btn>
                                        <Btn variant="primary" onClick={() => setActiveTab("register")} style={{ fontSize:12, padding:"8px 16px" }}>+ New Location</Btn>
                                    </div>
                                </div>

                                <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                                    <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                                           placeholder="Search by name, district or address…" style={{ ...inp, flex:1 }} />
                                </div>

                                {loading ? (
                                    <div style={{ padding:"40px 0", textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>
                                        Loading locations…
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div style={{ padding:"40px 0", textAlign:"center" }}>
                                        <div style={{ fontSize:14, fontWeight:700, color:"var(--text)", marginBottom:4 }}>No safe locations yet</div>
                                        <div style={{ fontSize:12, color:"var(--text-muted)" }}>Register a shelter to get started</div>
                                    </div>
                                ) : (
                                    <table>
                                        <thead>
                                        <tr>{["Shelter","Type","District","Coordinates","Contact","Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                        {filtered.map(l => (
                                            <tr key={l.id}>
                                                <td>
                                                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                                        <div>
                                                            <div style={{ fontWeight:700, fontSize:13, color:"var(--text)" }}>{l.location_name}</div>
                                                            <div style={{ fontSize:10, color:"var(--text-muted)", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.address}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize:11, color:"var(--text-mid)" }}>{l.location_type}</td>
                                                <td>
                                                    <div style={{ fontSize:12 }}>{l.district}</div>
                                                    {l.province && <div style={{ fontSize:10, color:"var(--text-muted)" }}>{l.province}</div>}
                                                </td>
                                                <td style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"var(--text-muted)" }}>
                                                    {l.latitude && l.longitude
                                                        ? `${parseFloat(l.latitude).toFixed(4)}, ${parseFloat(l.longitude).toFixed(4)}`
                                                        : "—"}
                                                </td>
                                                <td style={{ fontSize:11 }}>
                                                    {l.contact_person && <div style={{ fontWeight:600 }}>{l.contact_person}</div>}
                                                    {l.contact_number && <div style={{ color:"var(--text-muted)" }}>{l.contact_number}</div>}
                                                    {!l.contact_person && !l.contact_number && "—"}
                                                </td>
                                                <td>
                                                    <div style={{ display:"flex", gap:6 }}>
                                                        {/* Edit */}
                                                        <button
                                                            onClick={() => openEdit(l)}
                                                            style={actionBtn("#2563eb", "#eff6ff", "#bfdbfe")}
                                                            onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.color = "#fff"; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}
                                                        >
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                            </svg>
                                                            Edit
                                                        </button>

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => setDeleteTarget(l)}
                                                            style={actionBtn("#dc2626", "#fff1f2", "#fca5a5")}
                                                            onMouseEnter={e => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "#fff"; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.color = "#dc2626"; }}
                                                        >
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                                                            </svg>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Edit Modal ── */}
            <Modal
                show={!!editTarget}
                onClose={() => setEditTarget(null)}
                title={`Edit — ${editTarget?.location_name || ""}`}
                size="lg"
                footer={
                    <>
                        <Btn variant="outline" onClick={() => setEditTarget(null)} disabled={editSaving}>Cancel</Btn>
                        <Btn variant="primary" onClick={saveEdit} disabled={editSaving}>
                            {editSaving ? "Saving…" : "Save Changes"}
                        </Btn>
                    </>
                }
            >
                <div style={{ display:"grid", gap:14 }}>

                    {/* Basic info */}
                    <div style={g2}>
                        <FormGroup label="Shelter Name *">
                            <input style={inp} value={eName} onChange={e=>setEName(e.target.value)} />
                        </FormGroup>
                        <FormGroup label="Type *">
                            <select style={sel} value={eType} onChange={e=>setEType(e.target.value)}>
                                <option value="">Select type…</option>
                                {SAFE_LOCATION_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </FormGroup>
                    </div>

                    <div style={g2}>
                        <FormGroup label="District *">
                            <select style={sel} value={eDistrict} onChange={e=>setEDistrict(e.target.value)}>
                                <option value="">Select district…</option>
                                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </FormGroup>
                        <FormGroup label="Province">
                            <select style={sel} value={eProvince} onChange={e=>setEProvince(e.target.value)}>
                                <option value="">Select province…</option>
                                {PROVINCES.map(p => <option key={p}>{p}</option>)}
                            </select>
                        </FormGroup>
                    </div>

                    <FormGroup label="Address *">
                        <input style={inp} value={eAddress} onChange={e=>setEAddress(e.target.value)} />
                    </FormGroup>

                    {/* Map picker */}
                    <div style={{ borderTop:"1px solid var(--border)", paddingTop:14 }}>
                        <div style={{ fontSize:12, fontWeight:800, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:0.5, marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                            <span>📍</span> GPS Location — update if location changed
                        </div>
                        <LocationPicker lat={eLat} lng={eLng} setLat={setELat} setLng={setELng} />
                    </div>

                    {/* Capacity & Contact */}
                    <div style={{ borderTop:"1px solid var(--border)", paddingTop:14 }}>
                        <div style={g2}>
                            <FormGroup label="Contact Person">
                                <input style={inp} value={eContactPerson} onChange={e=>setEContactPerson(e.target.value)} />
                            </FormGroup>
                            <FormGroup label="Contact Number">
                                <input style={inp} value={eContactNumber} onChange={e=>setEContactNumber(e.target.value)} />
                            </FormGroup>
                        </div>
                        <div style={{ ...g2, marginTop:14 }}>

                        </div>
                    </div>
                </div>
            </Modal>

            {/* ── Delete Modal ── */}
            <Modal
                show={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Remove Safe Location?"
                icon="🗑️"
                footer={
                    <>
                        <Btn variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
                        <Btn variant="red" onClick={confirmDelete}>Remove Location</Btn>
                    </>
                }
            >
                <div style={{ textAlign:"center", padding:"8px 0" }}>
                    <div style={{ width:60, height:60, background:"var(--red-bg)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>🗑️</div>
                    <div style={{ fontSize:14, color:"var(--text)", marginBottom:6 }}>Remove this shelter from the system?</div>
                    <div style={{ fontSize:16, fontWeight:900, color:"var(--red)", marginBottom:16 }}>{deleteTarget?.location_name}</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.6 }}>
                        It will no longer appear on the map or in reports.<br/>This action <strong>cannot be undone</strong>.
                    </div>
                </div>
            </Modal>
        </>
    );
}
