// ─── IoTNodeManager.jsx ───────────────────────────────────────────────────────
import { useToast } from "../../context/ToastContext.jsx";
import { useState, useEffect, useRef } from "react";
import { C, Card, Badge, TabBar, FormGroup, Btn } from "../../shared.jsx";
import { fetchAreas } from "../../api/services/userService.js";
import {
    fetchGateways, createGateway, deleteGateway,
    activateGateway, updateGateway,
} from "../../api/services/gatewayService.js";
import {
    fetchSensorNodes, createSensorNode, deleteSensorNode,
    activateSensorNode, updateSensorNode,
} from "../../api/services/sensorNodeService.js";
import {
    DISTRICTS, SENSOR_CHIPS,
    SectionLabel, Modal, StatPill, IconBtn,
    inp, sel, g2, g3,
} from "../../shared/addLocationHelpers.jsx";

// ─── GatewayLocationPicker ────────────────────────────────────────────────────
function GatewayLocationPicker({ gwLat, gwLng, setGwLat, setGwLng }) {
    const mapRef     = useRef(null);
    const leafletMap = useRef(null);
    const markerRef  = useRef(null);
    const [searchText,    setSearchText]    = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching,     setSearching]     = useState(false);
    const [searchError,   setSearchError]   = useState("");

    useEffect(() => {
        if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link");
            link.id = "leaflet-css"; link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }
        const initMap = () => {
            if (!mapRef.current || leafletMap.current) return;
            const L = window.L;
            const lat = parseFloat(gwLat) || 6.6828;
            const lng = parseFloat(gwLng) || 80.3992;
            const map = L.map(mapRef.current, { zoomControl: true }).setView([lat, lng], 12);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap contributors",
            }).addTo(map);
            if (gwLat && gwLng) {
                markerRef.current = L.marker([lat, lng]).addTo(map).bindPopup("Gateway location").openPopup();
            }
            map.on("click", (e) => {
                const { lat: clat, lng: clng } = e.latlng;
                setGwLat(clat.toFixed(6)); setGwLng(clng.toFixed(6));
                if (markerRef.current) markerRef.current.setLatLng([clat, clng]);
                else markerRef.current = L.marker([clat, clng]).addTo(map).bindPopup("Gateway location").openPopup();
            });
            leafletMap.current = map;
        };
        if (window.L) initMap();
        else {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload = initMap;
            document.head.appendChild(script);
        }
        return () => {
            if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; markerRef.current = null; }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const L = window.L; const map = leafletMap.current;
        if (!L || !map || !gwLat || !gwLng) return;
        const lat = parseFloat(gwLat); const lng = parseFloat(gwLng);
        map.flyTo([lat, lng], 15, { duration: 1.2 });
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        else markerRef.current = L.marker([lat, lng]).addTo(map).bindPopup("Gateway location").openPopup();
    }, [gwLat, gwLng]);

    const handleSearch = async () => {
        if (!searchText.trim()) return;
        setSearching(true); setSearchError(""); setSearchResults([]);
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&countrycodes=lk&limit=5`;
            const res = await fetch(url, { headers: { "Accept-Language": "en" } });
            const data = await res.json();
            if (data.length === 0) setSearchError("No results found.");
            else setSearchResults(data);
        } catch { setSearchError("Search failed. Check your connection."); }
        finally { setSearching(false); }
    };

    const pickResult = (r) => {
        setGwLat(parseFloat(r.lat).toFixed(6));
        setGwLng(parseFloat(r.lon).toFixed(6));
        setSearchResults([]);
        setSearchText(r.display_name.split(",")[0]);
    };

    const searchBtnStyle = { padding: "0 14px", borderRadius: 10, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" };
    const dropdown = { position: "absolute", top: "100%", left: 0, right: 0, zIndex: 1000, background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.12)", marginTop: 4, overflow: "hidden" };
    const dropItem = { padding: "10px 14px", fontSize: 12, cursor: "pointer", borderBottom: "1px solid var(--border)", color: "var(--text)", lineHeight: 1.4 };
    const coordBox = { background: "var(--surface-alt)", border: "1.5px solid var(--border)", borderRadius: 10, padding: "8px 12px" };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ position: "relative" }}>
                <div style={{ display: "flex", gap: 8 }}>
                    <input style={{ ...inp, flex: 1 }} value={searchText} onChange={e => setSearchText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder="Search place or address in Sri Lanka…" />
                    <button style={searchBtnStyle} onClick={handleSearch} disabled={searching}>{searching ? "Searching…" : "Search"}</button>
                </div>
                {searchResults.length > 0 && (
                    <div style={dropdown}>
                        {searchResults.map((r, i) => (
                            <div key={i} style={dropItem} onMouseEnter={e => e.currentTarget.style.background = "var(--surface-alt)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} onClick={() => pickResult(r)}>
                                <div style={{ fontWeight: 700, fontSize: 12 }}>{r.display_name.split(",")[0]}</div>
                                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{r.display_name.split(",").slice(1, 3).join(",")}</div>
                            </div>
                        ))}
                    </div>
                )}
                {searchError && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 6 }}>⚠ {searchError}</div>}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <span>🖱</span><span>Or click anywhere on the map to drop a pin</span>
            </div>
            <div ref={mapRef} style={{ width: "100%", height: 300, borderRadius: 12, border: "1.5px solid var(--border)", overflow: "hidden", background: "#e8edf2" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={coordBox}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 2 }}>LATITUDE</div>
                    <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: "var(--text)", fontWeight: 700 }}>{gwLat || <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>0.0000</span>}</div>
                </div>
                <div style={coordBox}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 2 }}>LONGITUDE</div>
                    <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: "var(--text)", fontWeight: 700 }}>{gwLng || <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>0.0000</span>}</div>
                </div>
            </div>
            <div style={g2}>
                <FormGroup label="Latitude (manual)"><input style={inp} type="number" step="0.000001" value={gwLat} onChange={e => setGwLat(e.target.value)} placeholder="6.6828" /></FormGroup>
                <FormGroup label="Longitude (manual)"><input style={inp} type="number" step="0.000001" value={gwLng} onChange={e => setGwLng(e.target.value)} placeholder="80.3992" /></FormGroup>
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

// ─── Status badge color map ───────────────────────────────────────────────────
const statusBadgeType = (s) => {
    if (s === "active")      return "active";
    if (s === "maintenance") return "warning";
    return "inactive";
};

// ─── IoTNodeManager ───────────────────────────────────────────────────────────
export default function IoTNodeManager() {
    const toast = useToast();

    const [activeTab,    setActiveTab]    = useState("register");
    const [gateways,     setGateways]     = useState([]);
    const [gwLoading,    setGwLoading]    = useState(false);
    const [areas,        setAreas]        = useState([]);

    // ── Nodes state ──
    const [nodes,          setNodes]          = useState([]);
    const [nodesLoading,   setNodesLoading]   = useState(false);
    const [nodeSearchQ,    setNodeSearchQ]     = useState("");
    const [nodeStatusFilter, setNodeStatusFilter] = useState("all");
    const [nodeDeleteTarget, setNodeDeleteTarget] = useState(null);

    // ── Register form state ──
    const [rName,     setRName]     = useState("");
    const [rGateway,  setRGateway]  = useState("");
    const [rDevEui,   setRDevEui]   = useState("");
    const [rAppEui,   setRAppEui]   = useState("");
    const [rWarn,     setRWarn]     = useState("");
    const [rCrit,     setRCrit]     = useState("");
    const [rHeight,   setRHeight]   = useState("");
    const [rSaving,   setRSaving]   = useState(false);

    // ── Gateway state ──
    const [deleteTarget,  setDeleteTarget]  = useState(null);
    const [showGwModal,   setShowGwModal]   = useState(false);
    const [gwSaving,      setGwSaving]      = useState(false);
    const [gwName, setGwName] = useState("");
    const [gwEui,  setGwEui]  = useState("");
    const [gwLoc,  setGwLoc]  = useState("");
    const [gwLat,  setGwLat]  = useState("");
    const [gwLng,  setGwLng]  = useState("");

    // ── Edit gateway state ──
    const [editTarget,    setEditTarget]    = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editSaving,    setEditSaving]    = useState(false);
    const [eName, setEName] = useState("");
    const [eEui,  setEEui]  = useState("");
    const [eLoc,  setELoc]  = useState("");
    const [eLat,  setELat]  = useState("");
    const [eLng,  setELng]  = useState("");

    // ── Load on mount ──
    useEffect(() => {
        const loadAreas = async () => {
            try { const res = await fetchAreas(); setAreas(res.data.data || res.data); }
            catch (err) { console.error("Failed to fetch areas:", err); }
        };
        loadAreas();
        loadGateways();
        loadNodes();
    }, []);

    const loadGateways = async () => {
        setGwLoading(true);
        try {
            const res = await fetchGateways();
            const raw = res.data.data || res.data || [];
            setGateways(Array.isArray(raw) ? raw : []);
        } catch (err) {
            console.error(err);
            setGateways([]);
            toast.error("Could not load gateways");
        } finally { setGwLoading(false); }
    };

    const loadNodes = async () => {
        setNodesLoading(true);
        try {
            const res = await fetchSensorNodes({ status: "all" });
            const raw = res.data.data || res.data || [];
            setNodes(Array.isArray(raw) ? raw : []);
        } catch (err) {
            console.error(err);
            setNodes([]);
            toast.error("Could not load sensor nodes");
        } finally { setNodesLoading(false); }
    };

    // ── Register node ──
    const registerNode = async () => {
        if (!rName || !rGateway || !rDevEui) {
            toast.error("Node Name, Gateway and Dev EUI are required"); return;
        }
        setRSaving(true);
        try {
            await createSensorNode({
                name:         rName,
                lora_dev_eui: rDevEui.toUpperCase(),
                lora_app_eui: rAppEui || "0000000000000000",
                gateway_id:   parseInt(rGateway),
                status:       "active",
            });
            toast.success(`Node "${rName}" registered`);
            setRName(""); setRGateway(""); setRDevEui(""); setRAppEui("");
            setRWarn(""); setRCrit(""); setRHeight("");
            await loadNodes();
            setActiveTab("manage");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to register node");
        } finally { setRSaving(false); }
    };

    // ── Deactivate node ──
    const confirmNodeDelete = async () => {
        if (!nodeDeleteTarget) return;
        try {
            await deleteSensorNode(nodeDeleteTarget.id);
            toast.success(`"${nodeDeleteTarget.name}" deactivated`);
            setNodeDeleteTarget(null);
            await loadNodes();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to deactivate node");
        }
    };

    // ── Reactivate node ──
    const handleActivateNode = async (node) => {
        try {
            await activateSensorNode(node.id);
            toast.success(`"${node.name}" reactivated`);
            await loadNodes();
        } catch (err) { toast.error("Failed to reactivate node"); }
    };

    // ── Gateway CRUD ──
    const addGateway = async () => {
        if (!gwName || !gwEui || !gwLoc) { toast.error("Fill all required fields"); return; }
        if (!gwLat || !gwLng) { toast.error("Please set a location on the map or via search"); return; }
        setGwSaving(true);
        try {
            await createGateway({ name: gwName, lora_gateway_eui: gwEui, latitude: parseFloat(gwLat), longitude: parseFloat(gwLng), location_name: gwLoc, status: "active" });
            toast.success(`Gateway "${gwName}" added`);
            setShowGwModal(false);
            setGwName(""); setGwEui(""); setGwLoc(""); setGwLat(""); setGwLng("");
            await loadGateways();
        } catch (err) { toast.error(err?.response?.data?.message || "Failed to add gateway"); }
        finally { setGwSaving(false); }
    };

    const openEditModal = (gw) => {
        setEditTarget(gw); setEName(gw.name || ""); setEEui(gw.lora_gateway_eui || "");
        setELoc(gw.location_name || ""); setELat(gw.latitude ? String(gw.latitude) : ""); setELng(gw.longitude ? String(gw.longitude) : "");
        setShowEditModal(true);
    };

    const saveEdit = async () => {
        if (!eName || !eEui || !eLoc) { toast.error("Fill all required fields"); return; }
        if (!eLat || !eLng) { toast.error("Please set a location"); return; }
        setEditSaving(true);
        try {
            await updateGateway(editTarget.id, { name: eName, lora_gateway_eui: eEui, latitude: parseFloat(eLat), longitude: parseFloat(eLng), location_name: eLoc });
            toast.success(`Gateway "${eName}" updated`);
            setShowEditModal(false); setEditTarget(null);
            await loadGateways();
        } catch (err) { toast.error(err?.response?.data?.message || "Failed to update gateway"); }
        finally { setEditSaving(false); }
    };

    const confirmDeactivate = async () => {
        if (!deleteTarget) return;
        try {
            await deleteGateway(deleteTarget.id);
            toast.success(`"${deleteTarget.name}" deactivated`);
            setDeleteTarget(null); await loadGateways();
        } catch (err) { toast.error(err?.response?.data?.message || "Failed to deactivate gateway"); }
    };

    const handleActivate = async (gw) => {
        try { await activateGateway(gw.id); toast.success(`"${gw.name}" reactivated`); await loadGateways(); }
        catch (err) { toast.error("Failed to reactivate gateway"); }
    };

    // ── Derived ──
    const filteredNodes = nodes.filter(n => {
        const q = nodeSearchQ.toLowerCase();
        const matchSearch = n.name.toLowerCase().includes(q) || (n.gateway?.name || "").toLowerCase().includes(q) || n.lora_dev_eui.toLowerCase().includes(q);
        const matchStatus = nodeStatusFilter === "all" || n.status === nodeStatusFilter;
        return matchSearch && matchStatus;
    });
    const activeNodeCount = nodes.filter(n => n.status === "active").length;
    const activeGwCount   = gateways.filter(g => g.status === "active").length;

    const TABS = [
        { id: "register", label: "Register Node" },
        { id: "manage",   label: "Manage Nodes"  },
        { id: "gateways", label: "Gateways"       },
    ];

    // ── Shared Gateway Form ──
    const GatewayForm = ({ name, setName, eui, setEui, loc, setLoc, lat, setLat, lng, setLng, lockEui = false }) => (
        <div style={{ display: "grid", gap: 16 }}>
            <div style={g2}>
                <FormGroup label="Gateway Name *">
                    <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Gateway-003" />
                </FormGroup>
                <FormGroup label="Gateway EUI *">
                    <input style={{ ...inp, fontFamily: "'DM Mono',monospace", fontSize: 12, ...(lockEui ? { opacity: 0.6, cursor: "not-allowed" } : {}) }}
                           value={eui} onChange={e => !lockEui && setEui(e.target.value)} readOnly={lockEui} placeholder="AA:BB:CC:DD:EE:FF:00:03" />
                    {lockEui && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>EUI cannot be changed after creation</div>}
                </FormGroup>
            </div>
            <FormGroup label="Area / Division *">
                <select style={sel} value={loc} onChange={e => setLoc(e.target.value)}>
                    <option value="">Select area…</option>
                    {areas.map(area => <option key={area.id} value={area.name}>{area.name}</option>)}
                </select>
            </FormGroup>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>📍</span> Gateway Coordinates
                    <span style={{ fontSize: 11, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— search a place or click the map</span>
                </div>
                <GatewayLocationPicker gwLat={lat} gwLng={lng} setGwLat={setLat} setGwLng={setLng} />
            </div>
        </div>
    );

    return (
        <>
            {/* Page Header */}
            <div style={{ background:"var(--surface)", borderRadius:16, margin:"0 0 14px", padding:"14px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", border:"1px solid var(--border)", boxShadow:"var(--shadow)" }}>
                <div>
                    <div style={{ fontSize:17, fontWeight:900, letterSpacing:-.3, color:"var(--text)" }}>IoT Node Manager</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>Register LoRa sensor nodes and manage gateways for the flood monitoring network</div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <StatPill label="Nodes"    value={nodes.length}      accent="var(--text)"    />
                    <StatPill label="Active"   value={activeNodeCount}   accent="var(--green)"   />
                    <StatPill label="Gateways" value={activeGwCount}     accent="var(--primary)" />
                </div>
            </div>

            <div style={{ display:"flex", gap:12 }}>
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12, minWidth:0 }}>
                    <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

                    {/* ══ REGISTER TAB ══ */}
                    {activeTab === "register" && (
                        <div className="fadeUp" style={{ display:"flex", flexDirection:"column", gap:12 }}>

                            {/* Step 1 — Node Identity */}
                            <Card>
                                <SectionLabel step="1" label="Node Identity" />
                                <div style={{ ...g2, marginBottom:14 }}>
                                    <FormGroup label="Node Name *">
                                        <input style={inp} value={rName} onChange={e=>setRName(e.target.value)} placeholder="e.g. Ratnapura-A1" />
                                    </FormGroup>
                                    <FormGroup label="Gateway *">
                                        <select style={sel} value={rGateway} onChange={e=>setRGateway(e.target.value)}>
                                            <option value="">Select gateway…</option>
                                            {gateways.filter(g => g.status === "active").map(g => (
                                                <option key={g.id} value={g.id}>{g.name} — {g.location_name}</option>
                                            ))}
                                        </select>
                                    </FormGroup>
                                </div>
                                <div style={g2}>
                                    <FormGroup label="LoRa Dev EUI *" hint="16-char hex from device label">
                                        <input style={{ ...inp, fontFamily:"'DM Mono',monospace", fontSize:12 }}
                                               value={rDevEui} onChange={e=>setRDevEui(e.target.value)} placeholder="70B3D57ED0050123" />
                                    </FormGroup>
                                    <FormGroup label="LoRa App EUI">
                                        <input style={{ ...inp, fontFamily:"'DM Mono',monospace", fontSize:12 }}
                                               value={rAppEui} onChange={e=>setRAppEui(e.target.value)} placeholder="0000000000000001" />
                                    </FormGroup>
                                </div>
                            </Card>

                            {/* Step 2 — Sensors */}
                            <Card>
                                <SectionLabel step="2" label="Sensors in this Node" />
                                <div style={g2}>
                                    {SENSOR_CHIPS.map(({ Icon, label, sub, color }) => (
                                        <div key={label} style={{ background:"var(--surface-alt)", borderRadius:12, border:"1.5px solid var(--border)", padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
                                            <div style={{ width:36, height:36, background:`${color}18`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color }}>
                                                <Icon size={18} />
                                            </div>
                                            <div style={{ flex:1 }}>
                                                <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{label}</div>
                                                <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:1 }}>{sub}</div>
                                            </div>
                                            <span className="pulse" style={{ width:7, height:7, borderRadius:"50%", background:"var(--green)", flexShrink:0, display:"inline-block" }} />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop:10, padding:"9px 14px", background:"var(--surface-alt)", border:"1.5px solid var(--border)", borderRadius:10, fontSize:11, color:"var(--text-muted)" }}>
                                    All 4 sensors are fixed per node — configured in firmware
                                </div>
                            </Card>

                            {/* Step 3 — Alert Thresholds */}
                            <Card>
                                <SectionLabel step="3" label="Alert Thresholds" />
                                <div style={g3}>
                                    {[
                                        ["Warning Level", rWarn,   setRWarn,   "4.0", "var(--orange)"],
                                        ["Critical Level",rCrit,   setRCrit,   "5.2", "var(--red)"   ],
                                        ["Sensor Height", rHeight, setRHeight, "6.0", "var(--primary)"],
                                    ].map(([label, val, setter, ph, accent]) => (
                                        <FormGroup key={label} label={label}>
                                            <div style={{ position:"relative" }}>
                                                <input style={{ ...inp, paddingRight:32, borderLeft:`3px solid ${accent}` }} type="number" step="0.1" value={val} onChange={e=>setter(e.target.value)} placeholder={ph} />
                                                <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", fontSize:11, color:"var(--text-muted)", pointerEvents:"none", fontFamily:"'DM Mono',monospace" }}>m</span>
                                            </div>
                                        </FormGroup>
                                    ))}
                                </div>
                                <div style={{ marginTop:12, padding:"10px 14px", background:"var(--orange-bg)", border:"1.5px solid var(--orange)", borderRadius:10, fontSize:11, color:"var(--orange)" }}>
                                    💡 Water level = sensor_height − surface_distance_reading
                                </div>
                            </Card>

                            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
                                <Btn variant="outline" onClick={() => { setRName(""); setRGateway(""); setRDevEui(""); setRAppEui(""); setRWarn(""); setRCrit(""); setRHeight(""); }}>Clear Form</Btn>
                                <Btn variant="primary" onClick={registerNode} disabled={rSaving}>{rSaving ? "Registering…" : "Register Node"}</Btn>
                            </div>
                        </div>
                    )}

                    {/* ══ MANAGE NODES TAB ══ */}
                    {activeTab === "manage" && (
                        <div className="fadeUp">
                            <Card>
                                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                                    <div>
                                        <div style={{ fontSize:14, fontWeight:800, color:"var(--text)" }}>Sensor Nodes</div>
                                        <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>Manage registered network nodes</div>
                                    </div>
                                    <div style={{ display:"flex", gap:8 }}>
                                        <Btn variant="outline" onClick={loadNodes} style={{ fontSize:12, padding:"8px 14px" }}>↻ Refresh</Btn>
                                        <Btn variant="primary" onClick={() => setActiveTab("register")} style={{ fontSize:12, padding:"8px 16px" }}>+ New Node</Btn>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                                    <input value={nodeSearchQ} onChange={e=>setNodeSearchQ(e.target.value)}
                                           placeholder="Search by name, gateway or Dev EUI…" style={{ ...inp, flex:1 }} />
                                    <select value={nodeStatusFilter} onChange={e=>setNodeStatusFilter(e.target.value)} style={{ ...sel, width:160 }}>
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>

                                {nodesLoading ? (
                                    <div style={{ padding:"40px 0", textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>Loading nodes…</div>
                                ) : filteredNodes.length === 0 ? (
                                    <div style={{ padding:"40px 0", textAlign:"center" }}>
                                        <div style={{ fontSize:38, marginBottom:10 }}>📡</div>
                                        <div style={{ fontSize:14, fontWeight:700, color:"var(--text)", marginBottom:4 }}>No nodes found</div>
                                        <div style={{ fontSize:12, color:"var(--text-muted)" }}>Register a node to get started</div>
                                    </div>
                                ) : (
                                    <table>
                                        <thead>
                                        <tr>{["Node","Dev EUI","App EUI","Gateway","Last Seen","Status","Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                        {filteredNodes.map(n => (
                                            <tr key={n.id}>
                                                <td>
                                                    <div style={{ fontWeight:700, fontSize:13, color:"var(--text)" }}>{n.name}</div>
                                                    <div style={{ fontSize:10, color:"var(--text-muted)" }}>ID #{n.id}</div>
                                                </td>
                                                <td style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--text-mid)" }}>
                                                    {n.lora_dev_eui?.slice(0,8)}…
                                                </td>
                                                <td style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--text-muted)" }}>
                                                    {n.lora_app_eui?.slice(0,8)}…
                                                </td>
                                                <td>
                                                    <div style={{ fontSize:12, fontWeight:600 }}>{n.gateway?.name || "—"}</div>
                                                    <div style={{ fontSize:10, color:"var(--text-muted)" }}>{n.gateway?.location_name || ""}</div>
                                                </td>
                                                <td style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--text-muted)" }}>
                                                    {n.last_seen ? new Date(n.last_seen).toLocaleString([], { dateStyle:"short", timeStyle:"short" }) : "Never"}
                                                </td>
                                                <td><Badge type={statusBadgeType(n.status)}>{n.status.toUpperCase()}</Badge></td>
                                                <td>
                                                    <div style={{ display:"flex", gap:6 }}>
                                                        {n.status === "active" ? (
                                                            <button
                                                                onClick={() => setNodeDeleteTarget(n)}
                                                                style={actionBtn("#dc2626", "#fff1f2", "#fca5a5")}
                                                                onMouseEnter={e => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "#fff"; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.color = "#dc2626"; }}
                                                            >
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                                                Deactivate
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleActivateNode(n)}
                                                                style={actionBtn("#16a34a", "#f0fdf4", "#86efac")}
                                                                onMouseEnter={e => { e.currentTarget.style.background = "#16a34a"; e.currentTarget.style.color = "#fff"; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.color = "#16a34a"; }}
                                                            >
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                                Activate
                                                            </button>
                                                        )}
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

                    {/* ══ GATEWAYS TAB ══ */}
                    {activeTab === "gateways" && (
                        <div className="fadeUp">
                            <Card>
                                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                                    <div>
                                        <div style={{ fontSize:14, fontWeight:800, color:"var(--text)" }}>Gateway Registry</div>
                                        <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>LoRa network gateways</div>
                                    </div>
                                    <div style={{ display:"flex", gap:8 }}>
                                        <Btn variant="outline" onClick={loadGateways} style={{ fontSize:12, padding:"8px 14px" }}>↻ Refresh</Btn>
                                        <Btn variant="primary" onClick={() => setShowGwModal(true)} style={{ fontSize:12, padding:"8px 16px" }}>+ Add Gateway</Btn>
                                    </div>
                                </div>
                                {gwLoading ? (
                                    <div style={{ padding:"40px 0", textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>Loading gateways…</div>
                                ) : gateways.length === 0 ? (
                                    <div style={{ padding:"40px 0", textAlign:"center" }}>
                                        <div style={{ fontSize:38, marginBottom:10 }}>🛰️</div>
                                        <div style={{ fontSize:14, fontWeight:700, color:"var(--text)", marginBottom:4 }}>No gateways yet</div>
                                        <div style={{ fontSize:12, color:"var(--text-muted)" }}>Add a gateway to get started</div>
                                    </div>
                                ) : (
                                    <table>
                                        <thead>
                                        <tr>{["Name","EUI","Location","Coordinates","Connected Nodes","Status","Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                        {gateways.map(g => (
                                            <tr key={g.id}>
                                                <td style={{ fontWeight:700 }}>{g.name}</td>
                                                <td style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--text-mid)" }}>{g.lora_gateway_eui}</td>
                                                <td>{g.location_name || "—"}</td>
                                                <td style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"var(--text-muted)" }}>
                                                    {g.latitude && g.longitude ? `${parseFloat(g.latitude).toFixed(4)}, ${parseFloat(g.longitude).toFixed(4)}` : "—"}
                                                </td>
                                                <td>
                                                    <span style={{ fontWeight:800, color:"var(--primary)", fontFamily:"'DM Mono',monospace" }}>
                                                        {nodes.filter(n => n.gateway_id === g.id && n.status === "active").length}
                                                    </span>
                                                </td>
                                                <td><Badge type={g.status === "active" ? "active" : "inactive"}>{g.status.toUpperCase()}</Badge></td>
                                                <td>
                                                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                                        <button onClick={() => openEditModal(g)} style={actionBtn("#2563eb","#eff6ff","#bfdbfe")}
                                                                onMouseEnter={e=>{ e.currentTarget.style.background="#2563eb"; e.currentTarget.style.color="#fff"; }}
                                                                onMouseLeave={e=>{ e.currentTarget.style.background="#eff6ff"; e.currentTarget.style.color="#2563eb"; }}>
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                            Edit
                                                        </button>
                                                        {g.status === "active" ? (
                                                            <button onClick={() => setDeleteTarget(g)} style={actionBtn("#dc2626","#fff1f2","#fca5a5")}
                                                                    onMouseEnter={e=>{ e.currentTarget.style.background="#dc2626"; e.currentTarget.style.color="#fff"; }}
                                                                    onMouseLeave={e=>{ e.currentTarget.style.background="#fff1f2"; e.currentTarget.style.color="#dc2626"; }}>
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                                                Deactivate
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => handleActivate(g)} style={actionBtn("#16a34a","#f0fdf4","#86efac")}
                                                                    onMouseEnter={e=>{ e.currentTarget.style.background="#16a34a"; e.currentTarget.style.color="#fff"; }}
                                                                    onMouseLeave={e=>{ e.currentTarget.style.background="#f0fdf4"; e.currentTarget.style.color="#16a34a"; }}>
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                                Activate
                                                            </button>
                                                        )}
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

            {/* ── Add Gateway Modal ── */}
            <Modal show={showGwModal} onClose={() => setShowGwModal(false)} title="Add Gateway" icon="📡" size="lg"
                   footer={<><Btn variant="outline" onClick={() => setShowGwModal(false)} disabled={gwSaving}>Cancel</Btn><Btn variant="primary" onClick={addGateway} disabled={gwSaving}>{gwSaving ? "Saving…" : "Add Gateway"}</Btn></>}>
                <GatewayForm name={gwName} setName={setGwName} eui={gwEui} setEui={setGwEui} loc={gwLoc} setLoc={setGwLoc} lat={gwLat} setLat={setGwLat} lng={gwLng} setLng={setGwLng} />
            </Modal>

            {/* ── Edit Gateway Modal ── */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title={`Edit — ${editTarget?.name || "Gateway"}`} icon="✏️" size="lg"
                   footer={<><Btn variant="outline" onClick={() => setShowEditModal(false)} disabled={editSaving}>Cancel</Btn><Btn variant="primary" onClick={saveEdit} disabled={editSaving}>{editSaving ? "Saving…" : "Save Changes"}</Btn></>}>
                <GatewayForm name={eName} setName={setEName} eui={eEui} setEui={setEEui} loc={eLoc} setLoc={setELoc} lat={eLat} setLat={setELat} lng={eLng} setLng={setELng} lockEui={true} />
            </Modal>

            {/* ── Deactivate Gateway Modal ── */}
            <Modal show={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Deactivate Gateway?" icon="⛔"
                   footer={<><Btn variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Btn><Btn variant="red" onClick={confirmDeactivate}>Deactivate</Btn></>}>
                <div style={{ textAlign:"center", padding:"8px 0" }}>
                    <div style={{ width:60, height:60, background:"var(--red-bg)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>⛔</div>
                    <div style={{ fontSize:14, color:"var(--text)", marginBottom:6 }}>Are you sure you want to deactivate</div>
                    <div style={{ fontSize:16, fontWeight:900, color:"var(--red)", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>{deleteTarget?.name}</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.8 }}>
                        The gateway will be marked as <strong>inactive</strong>.<br/>No data will be deleted — you can reactivate it at any time.
                    </div>
                </div>
            </Modal>

            {/* ── Deactivate Node Modal ── */}
            <Modal show={!!nodeDeleteTarget} onClose={() => setNodeDeleteTarget(null)} title="Deactivate Node?" icon="⛔"
                   footer={<><Btn variant="outline" onClick={() => setNodeDeleteTarget(null)}>Cancel</Btn><Btn variant="red" onClick={confirmNodeDelete}>Deactivate</Btn></>}>
                <div style={{ textAlign:"center", padding:"8px 0" }}>
                    <div style={{ width:60, height:60, background:"var(--red-bg)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>📡</div>
                    <div style={{ fontSize:14, color:"var(--text)", marginBottom:6 }}>Are you sure you want to deactivate</div>
                    <div style={{ fontSize:16, fontWeight:900, color:"var(--red)", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>{nodeDeleteTarget?.name}</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.8 }}>
                        The node will be marked as <strong>inactive</strong>.<br/>No data will be deleted — you can reactivate it at any time.
                    </div>
                </div>
            </Modal>
        </>
    );
}
