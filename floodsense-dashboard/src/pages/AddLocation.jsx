// ─── AddLocation.jsx ─────────────────────────────────────────────────────────
// Matches the FloodSense shared.jsx design system exactly:
// warm beige bg (#f0ede8), white cards, DM Sans, same Badge/Card/Btn/FormGroup/TabBar.

import React, { useState } from "react";
import { C, Card, Badge, globalCSS, TabBar, FormGroup, Btn } from "../shared.jsx";
// import { createLocation, deleteLocation, getAllLocations } from "../api/services/locationService.js";
// import { fetchAreas } from "../api/services/alertService.js";

// ─── LOCAL CONSTANTS ──────────────────────────────────────────────────────────
const DISTRICTS = [
    "Ratnapura","Kalutara","Colombo","Galle","Kandy",
    "Matara","Kegalle","Badulla","Hambantota","Kurunegala",
];

const SENSOR_CHIPS = [
    { icon:"💧", label:"Humidity",    sub:"DHT22 — relative %",    color:C.blue },
    { icon:"🌡️", label:"Temperature", sub:"DHT22 — °C",            color:C.orange },
    { icon:"🌧️", label:"Rainfall",    sub:"Tipping bucket — mm",   color:C.green },
    { icon:"📡", label:"Ultrasonic",  sub:"HC-SR04 — cm distance", color:"#7c3aed" },
];

const INITIAL_GATEWAYS = [
    { id:"gw-001", name:"Gateway-001", eui:"AA:BB:CC:DD:EE:FF:00:01", location:"Ratnapura", status:"active" },
    { id:"gw-002", name:"Gateway-002", eui:"AA:BB:CC:DD:EE:FF:00:02", location:"Kalutara",  status:"active" },
];

// ─── EXTRA LOCAL STYLES ───────────────────────────────────────────────────────
const extraCSS = `
  .al-icon-btn-del:hover { background: #fff0ee !important; color: #cc2200 !important; border-color: #ffdcc2 !important; }
  .al-node-card:hover { border-color: #d0cdc8 !important; background: #faf9f7 !important; }
  input:focus, select:focus { border-color: #1a1a1a !important; outline: none; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .fadeUp { animation: fadeUp .25s ease both; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
  .pulse { animation: pulse 1.4s ease-in-out infinite; }
`;

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
const SectionLabel = ({ step, label }) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{
            width:22, height:22, borderRadius:7, background:"#1a1a1a",
            color:"#fff", fontSize:10, fontWeight:800,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>{step}</div>
        <span style={{ fontSize:12, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:.5 }}>
            {label}
        </span>
    </div>
);

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ show, onClose, title, children, footer }) => {
    if (!show) return null;
    return (
        <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
             style={{ position:"fixed", inset:0, background:"rgba(26,26,26,.45)", zIndex:200,
                 display:"flex", alignItems:"center", justifyContent:"center", padding:20,
                 backdropFilter:"blur(6px)" }}>
            <div className="fadeUp"
                 style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:480,
                     maxHeight:"90vh", overflowY:"auto",
                     boxShadow:"0 20px 60px rgba(0,0,0,.18)", border:"1px solid #e8e4df" }}>
                <div style={{ padding:"18px 22px", borderBottom:"1px solid #e8e4df",
                    display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ fontSize:15, fontWeight:800 }}>{title}</div>
                    <button onClick={onClose}
                            style={{ background:"#f7f5f2", border:"1.5px solid #e8e4df", color:"#666",
                                width:30, height:30, borderRadius:8, cursor:"pointer", fontSize:14,
                                display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                </div>
                <div style={{ padding:22 }}>{children}</div>
                {footer && (
                    <div style={{ padding:"14px 22px", borderTop:"1px solid #e8e4df",
                        display:"flex", gap:8, justifyContent:"flex-end" }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── STAT PILL ────────────────────────────────────────────────────────────────
const StatPill = ({ label, value, accent }) => (
    <div style={{ background:"#f7f5f2", borderRadius:10, padding:"8px 14px",
        border:"1.5px solid #e8e4df", display:"flex", flexDirection:"column",
        alignItems:"center", minWidth:64 }}>
        <div style={{ fontSize:20, fontWeight:900, color:accent, lineHeight:1,
            fontFamily:"'DM Mono',monospace" }}>{value}</div>
        <div style={{ fontSize:9, fontWeight:700, color:"#aaa", textTransform:"uppercase",
            letterSpacing:.5, marginTop:2 }}>{label}</div>
    </div>
);

// ─── ICON BUTTON ─────────────────────────────────────────────────────────────
const IconBtn = ({ onClick, children }) => (
    <button className="al-icon-btn-del" onClick={onClick}
            style={{ width:30, height:30, borderRadius:8, border:"1.5px solid #e8e4df",
                background:"#f7f5f2", color:"#aaa", cursor:"pointer", fontSize:13,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:".15s" }}>
        {children}
    </button>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AddLocation() {
    const [activeTab, setActiveTab]       = useState("register");
    const [nodes, setNodes]               = useState([]);
    const [gateways, setGateways]         = useState(INITIAL_GATEWAYS);
    const [selectedId, setSelectedId]     = useState(null);
    const [toastMsg, setToastMsg]         = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showGwModal, setShowGwModal]   = useState(false);
    const [searchQ, setSearchQ]           = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Register form state
    const [rName, setRName]         = useState("");
    const [rGateway, setRGateway]   = useState("");
    const [rDevEui, setRDevEui]     = useState("");
    const [rAppEui, setRAppEui]     = useState("");
    const [rLocName, setRLocName]   = useState("");
    const [rDistrict, setRDistrict] = useState("");
    const [rLat, setRLat]           = useState("");
    const [rLng, setRLng]           = useState("");
    const [rWarn, setRWarn]         = useState("");
    const [rCrit, setRCrit]         = useState("");
    const [rHeight, setRHeight]     = useState("");

    // Gateway form state
    const [gwName, setGwName] = useState("");
    const [gwEui, setGwEui]   = useState("");
    const [gwLoc, setGwLoc]   = useState("");
    const [gwLat, setGwLat]   = useState("");
    const [gwLng, setGwLng]   = useState("");

    // ── API hooks (wire to backend) ───────────────────────────────────────────
    // useEffect(() => { fetchZones(); }, []);
    // const fetchZones = async () => { const res = await getAllLocations(); setNodes(res.data); };

    const toast = (msg, isError = false) => {
        setToastMsg({ msg, isError });
        setTimeout(() => setToastMsg(null), 2800);
    };

    const clearForm = () => {
        setRName(""); setRGateway(""); setRDevEui(""); setRAppEui("");
        setRLocName(""); setRDistrict(""); setRLat(""); setRLng("");
        setRWarn(""); setRCrit(""); setRHeight("");
    };

    const registerNode = () => {
        if (!rName || !rGateway || !rDevEui || !rLocName || !rLat || !rLng) {
            toast("Fill all required fields (*)", true); return;
        }
        const gw = gateways.find(g => g.id === rGateway);
        const node = {
            id: "node-" + Date.now(),
            name: rName, gateway: gw?.name || rGateway, gatewayId: rGateway,
            deveui: rDevEui.toUpperCase(), appeui: rAppEui,
            location: rLocName, district: rDistrict,
            lat: parseFloat(rLat), lng: parseFloat(rLng),
            warn: rWarn, crit: rCrit, height: rHeight,
            status: "active", lastSeen: "just now",
            rssi: -75 - Math.floor(Math.random() * 30),
            snr: (Math.random() * 10 + 2).toFixed(1),
            hum: (60 + Math.random() * 30).toFixed(1),
            temp: (24 + Math.random() * 10).toFixed(1),
            rain: (Math.random() * 5).toFixed(2),
            dist: (150 + Math.random() * 100).toFixed(0),
        };
        // await createLocation(payload);
        setNodes(prev => [...prev, node]);
        toast(`Node "${rName}" registered`);
        clearForm();
        setActiveTab("manage");
    };

    const addGateway = () => {
        if (!gwName || !gwEui || !gwLoc) { toast("Fill all required fields", true); return; }
        setGateways(prev => [...prev, {
            id:"gw-"+Date.now(), name:gwName, eui:gwEui,
            location:gwLoc, lat:gwLat, lng:gwLng, status:"active"
        }]);
        toast(`Gateway "${gwName}" added`);
        setShowGwModal(false);
        setGwName(""); setGwEui(""); setGwLoc(""); setGwLat(""); setGwLng("");
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        // await deleteLocation(deleteTarget.id);
        setNodes(prev => prev.filter(n => n.id !== deleteTarget.id));
        if (selectedId === deleteTarget.id) setSelectedId(null);
        toast("Node removed");
        setDeleteTarget(null);
    };

    const selectedNode = nodes.find(n => n.id === selectedId);
    const filteredNodes = nodes.filter(n => {
        const q = searchQ.toLowerCase();
        return (n.name.toLowerCase().includes(q) || n.location.toLowerCase().includes(q))
            && (statusFilter ? n.status === statusFilter : true);
    });
    const activeCount = nodes.filter(n => n.status === "active").length;

    const TABS = [
        { id:"register", label:"Register Node" },
        { id:"manage",   label:"Manage Nodes" },
        { id:"gateways", label:"Gateways" },
    ];

    // Input style matching shared.jsx aesthetic
    const inp = {
        padding:"10px 13px", borderRadius:10, border:"1.5px solid #e8e4df",
        background:"#f7f5f2", fontSize:13, color:"#1a1a1a", outline:"none",
        width:"100%", transition:"border .15s", fontFamily:"'DM Sans',sans-serif",
    };
    const sel = {
        ...inp, appearance:"none", cursor:"pointer",
        backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:34,
    };
    const g2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 };
    const g3 = { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 };

    return (
        <>
            <style>{globalCSS}{extraCSS}</style>

            <div style={{ minHeight:"100vh", background:C.bg }}>

                {/* ── PAGE HEADER ── */}
                <div style={{ background:"#fff", borderRadius:16, margin:"14px 14px 0",
                    padding:"14px 22px", display:"flex", alignItems:"center",
                    justifyContent:"space-between", boxShadow:C.shadow }}>
                    <div>
                        <div style={{ fontSize:17, fontWeight:900, letterSpacing:-.3 }}>IoT Node Manager</div>
                        <div style={{ fontSize:12, color:"#aaa", marginTop:2 }}>
                            FloodSense — LoRa Network Administration
                        </div>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <StatPill label="Total"    value={nodes.length}    accent="#1a1a1a" />
                        <StatPill label="Active"   value={activeCount}     accent={C.green} />
                        <StatPill label="Gateways" value={gateways.length} accent={C.blue}  />
                        <StatPill label="Alerts"   value={0}               accent={C.red}   />
                    </div>
                </div>

                <div style={{ display:"flex", margin:"12px 14px 14px", gap:12 }}>

                    {/* ── LEFT MAIN ── */}
                    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12, minWidth:0 }}>

                        {/* Shared TabBar component */}
                        <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

                        {/* ══ REGISTER TAB ══ */}
                        {activeTab === "register" && (
                            <div className="fadeUp" style={{ display:"flex", flexDirection:"column", gap:12 }}>

                                {/* Step 1 — Node Identity */}
                                <Card>
                                    <SectionLabel step="1" label="Node Identity" />
                                    <div style={{ ...g2, marginBottom:14 }}>
                                        <FormGroup label="Node Name *">
                                            <input style={inp} value={rName}
                                                   onChange={e=>setRName(e.target.value)}
                                                   placeholder="e.g. Ratnapura-A1" />
                                        </FormGroup>
                                        <FormGroup label="Gateway *">
                                            <select style={sel} value={rGateway}
                                                    onChange={e=>setRGateway(e.target.value)}>
                                                <option value="">Select gateway…</option>
                                                {gateways.map(g => (
                                                    <option key={g.id} value={g.id}>
                                                        {g.name} — {g.location}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormGroup>
                                    </div>
                                    <div style={g2}>
                                        <FormGroup label="LoRa Dev EUI *" hint="16-char hex from device label">
                                            <input style={{ ...inp, fontFamily:"'DM Mono',monospace", fontSize:12 }}
                                                   value={rDevEui} onChange={e=>setRDevEui(e.target.value)}
                                                   placeholder="70B3D57ED0050123" />
                                        </FormGroup>
                                        <FormGroup label="LoRa App EUI">
                                            <input style={{ ...inp, fontFamily:"'DM Mono',monospace", fontSize:12 }}
                                                   value={rAppEui} onChange={e=>setRAppEui(e.target.value)}
                                                   placeholder="0000000000000001" />
                                        </FormGroup>
                                    </div>
                                </Card>

                                {/* Step 2 — Sensors */}
                                <Card>
                                    <SectionLabel step="2" label="Sensors in this Node" />
                                    <div style={g2}>
                                        {SENSOR_CHIPS.map(({ icon, label, sub, color }) => (
                                            <div key={label}
                                                 style={{ background:"#f7f5f2", borderRadius:12,
                                                     border:"1.5px solid #e8e4df", padding:"12px 14px",
                                                     display:"flex", alignItems:"center", gap:10 }}>
                                                <div style={{ width:36, height:36, background:`${color}18`,
                                                    borderRadius:10, display:"flex", alignItems:"center",
                                                    justifyContent:"center", fontSize:18, flexShrink:0 }}>
                                                    {icon}
                                                </div>
                                                <div style={{ flex:1 }}>
                                                    <div style={{ fontSize:13, fontWeight:700 }}>{label}</div>
                                                    <div style={{ fontSize:10, color:"#aaa", marginTop:1 }}>{sub}</div>
                                                </div>
                                                <span className="pulse"
                                                      style={{ width:7, height:7, borderRadius:"50%",
                                                          background:C.green, flexShrink:0,
                                                          display:"inline-block" }} />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop:10, padding:"9px 14px", background:"#f7f5f2",
                                        border:"1.5px solid #e8e4df", borderRadius:10,
                                        fontSize:11, color:"#aaa" }}>
                                        All 4 sensors are fixed per node — configured in firmware
                                    </div>
                                </Card>

                                {/* Step 3 — Location */}
                                <Card>
                                    <SectionLabel step="3" label="Location" />
                                    <div style={{ ...g2, marginBottom:14 }}>
                                        <FormGroup label="Location Name *">
                                            <input style={inp} value={rLocName}
                                                   onChange={e=>setRLocName(e.target.value)}
                                                   placeholder="e.g. Ratnapura Field A" />
                                        </FormGroup>
                                        <FormGroup label="District">
                                            <select style={sel} value={rDistrict}
                                                    onChange={e=>setRDistrict(e.target.value)}>
                                                <option value="">Select district…</option>
                                                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </FormGroup>
                                    </div>
                                    <div style={g2}>
                                        <FormGroup label="GPS Latitude *">
                                            <div style={{ position:"relative" }}>
                                                <input style={{ ...inp, paddingRight:38 }}
                                                       type="number" step="0.0001" value={rLat}
                                                       onChange={e=>setRLat(e.target.value)} placeholder="6.6828" />
                                                <span style={{ position:"absolute", right:13, top:"50%",
                                                    transform:"translateY(-50%)", fontSize:11, color:"#aaa",
                                                    pointerEvents:"none", fontFamily:"'DM Mono',monospace" }}>°N</span>
                                            </div>
                                        </FormGroup>
                                        <FormGroup label="GPS Longitude *">
                                            <div style={{ position:"relative" }}>
                                                <input style={{ ...inp, paddingRight:38 }}
                                                       type="number" step="0.0001" value={rLng}
                                                       onChange={e=>setRLng(e.target.value)} placeholder="80.3992" />
                                                <span style={{ position:"absolute", right:13, top:"50%",
                                                    transform:"translateY(-50%)", fontSize:11, color:"#aaa",
                                                    pointerEvents:"none", fontFamily:"'DM Mono',monospace" }}>°E</span>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </Card>

                                {/* Step 4 — Thresholds */}
                                <Card>
                                    <SectionLabel step="4" label="Alert Thresholds" />
                                    <div style={g3}>
                                        {[
                                            ["Warning Level", rWarn,   setRWarn,   "4.0", C.orange],
                                            ["Critical Level",rCrit,   setRCrit,   "5.2", C.red],
                                            ["Sensor Height", rHeight, setRHeight, "6.0", "#1a1a1a"],
                                        ].map(([label, val, setter, ph, accent]) => (
                                            <FormGroup key={label} label={label}>
                                                <div style={{ position:"relative" }}>
                                                    <input style={{ ...inp, paddingRight:32,
                                                        borderLeft:`3px solid ${accent}` }}
                                                           type="number" step="0.1" value={val}
                                                           onChange={e=>setter(e.target.value)} placeholder={ph} />
                                                    <span style={{ position:"absolute", right:13, top:"50%",
                                                        transform:"translateY(-50%)", fontSize:11, color:"#aaa",
                                                        pointerEvents:"none",
                                                        fontFamily:"'DM Mono',monospace" }}>m</span>
                                                </div>
                                            </FormGroup>
                                        ))}
                                    </div>
                                    <div style={{ marginTop:12, padding:"10px 14px", background:"#fff4ec",
                                        border:"1.5px solid #ffdcc2", borderRadius:10,
                                        fontSize:11, color:C.orange }}>
                                        💡 Water level = sensor_height − surface_distance_reading
                                    </div>
                                </Card>

                                <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
                                    <Btn variant="outline" onClick={clearForm}>Clear Form</Btn>
                                    <Btn variant="dark" onClick={registerNode}>Register Node</Btn>
                                </div>
                            </div>
                        )}

                        {/* ══ MANAGE TAB ══ */}
                        {activeTab === "manage" && (
                            <div className="fadeUp">
                                <Card>
                                    <div style={{ display:"flex", alignItems:"center",
                                        justifyContent:"space-between", marginBottom:14 }}>
                                        <div>
                                            <div style={{ fontSize:14, fontWeight:800 }}>Sensor Nodes</div>
                                            <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>
                                                Manage registered network nodes
                                            </div>
                                        </div>
                                        <Btn variant="dark" onClick={() => setActiveTab("register")}
                                             style={{ fontSize:12, padding:"8px 16px" }}>+ New Node</Btn>
                                    </div>

                                    {/* Filters */}
                                    <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                                        <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                                               placeholder="Search by name or location…"
                                               style={{ ...inp, flex:1 }} />
                                        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
                                                style={{ ...sel, width:150 }}>
                                            <option value="">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>

                                    {filteredNodes.length === 0 ? (
                                        <div style={{ padding:"40px 0", textAlign:"center" }}>
                                            <div style={{ fontSize:38, marginBottom:10 }}>📡</div>
                                            <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>
                                                No nodes yet
                                            </div>
                                            <div style={{ fontSize:12, color:"#aaa" }}>
                                                Register a node to get started
                                            </div>
                                        </div>
                                    ) : (
                                        <table>
                                            <thead>
                                            <tr>
                                                {["Node","Dev EUI","Gateway","Location","Status","Last Seen",""].map(h => (
                                                    <th key={h}>{h}</th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {filteredNodes.map(n => (
                                                <tr key={n.id} onClick={() => setSelectedId(n.id)}
                                                    style={{ cursor:"pointer",
                                                        background: selectedId===n.id ? "#faf9f7" : "transparent" }}>
                                                    <td>
                                                        <div style={{ fontWeight:700, fontSize:13 }}>{n.name}</div>
                                                        <div style={{ fontSize:10, color:"#aaa" }}>{n.district}</div>
                                                    </td>
                                                    <td style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#666" }}>
                                                        {n.deveui.slice(0,8)}…
                                                    </td>
                                                    <td>{n.gateway}</td>
                                                    <td>{n.location}</td>
                                                    <td><Badge type={n.status}>{n.status.toUpperCase()}</Badge></td>
                                                    <td style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#aaa" }}>
                                                        {n.lastSeen}
                                                    </td>
                                                    <td>
                                                        <IconBtn onClick={e => { e.stopPropagation(); setDeleteTarget(n); }}>
                                                            ✕
                                                        </IconBtn>
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
                                    <div style={{ display:"flex", alignItems:"center",
                                        justifyContent:"space-between", marginBottom:14 }}>
                                        <div>
                                            <div style={{ fontSize:14, fontWeight:800 }}>Gateway Registry</div>
                                            <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>
                                                LoRa network gateways
                                            </div>
                                        </div>
                                        <Btn variant="dark" onClick={() => setShowGwModal(true)}
                                             style={{ fontSize:12, padding:"8px 16px" }}>+ Add Gateway</Btn>
                                    </div>
                                    <table>
                                        <thead>
                                        <tr>
                                            {["Name","EUI","Location","Connected Nodes","Status",""].map(h => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {gateways.map(g => (
                                            <tr key={g.id}>
                                                <td style={{ fontWeight:700 }}>{g.name}</td>
                                                <td style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#666" }}>
                                                    {g.eui}
                                                </td>
                                                <td>{g.location}</td>
                                                <td>
                                                    <span style={{ fontWeight:800, color:C.blue,
                                                        fontFamily:"'DM Mono',monospace" }}>
                                                        {nodes.filter(n => n.gatewayId === g.id).length}
                                                    </span>
                                                </td>
                                                <td><Badge type={g.status}>{g.status.toUpperCase()}</Badge></td>
                                                <td>
                                                    <IconBtn onClick={() => setGateways(prev => prev.filter(x => x.id !== g.id))}>
                                                        ✕
                                                    </IconBtn>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT PANEL ── */}
                    <div style={{ width:252, display:"flex", flexDirection:"column", gap:12, flexShrink:0 }}>

                        {/* Node List */}
                        <Card style={{ padding:"16px 18px" }}>
                            <div style={{ fontSize:11, fontWeight:700, color:"#aaa", textTransform:"uppercase",
                                letterSpacing:.5, marginBottom:12 }}>Network Nodes</div>
                            {nodes.length === 0 ? (
                                <div style={{ padding:"20px 0", textAlign:"center" }}>
                                    <div style={{ fontSize:24, marginBottom:6 }}>📡</div>
                                    <div style={{ fontSize:11, color:"#aaa" }}>No nodes registered</div>
                                </div>
                            ) : nodes.map(n => (
                                <div key={n.id} onClick={() => setSelectedId(n.id)}
                                     className="al-node-card"
                                     style={{ display:"flex", alignItems:"center", gap:9,
                                         padding:"9px 10px", borderRadius:10,
                                         border:`1.5px solid ${selectedId===n.id ? "#1a1a1a" : "#e8e4df"}`,
                                         marginBottom:7, cursor:"pointer", transition:".15s",
                                         background: selectedId===n.id ? "#f7f5f2" : "#fff" }}>
                                    <span style={{ width:8, height:8, borderRadius:"50%", flexShrink:0,
                                        background: n.status==="active" ? C.green : "#ddd",
                                        display:"inline-block" }} />
                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:12, fontWeight:700, whiteSpace:"nowrap",
                                            overflow:"hidden", textOverflow:"ellipsis" }}>{n.name}</div>
                                        <div style={{ fontSize:10, color:"#aaa" }}>{n.gateway}</div>
                                    </div>
                                    <div style={{ fontSize:10, color:"#aaa",
                                        fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>
                                        {n.rssi} dBm
                                    </div>
                                </div>
                            ))}
                        </Card>

                        {/* Live Readings */}
                        {selectedNode && (
                            <Card style={{ padding:"16px 18px" }}>
                                <div style={{ fontSize:11, fontWeight:700, color:"#aaa", textTransform:"uppercase",
                                    letterSpacing:.5, marginBottom:12 }}>
                                    Live — <span style={{ color:"#1a1a1a" }}>{selectedNode.name}</span>
                                </div>
                                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                                    {[
                                        { icon:"💧", label:"Humidity", value:selectedNode.hum,  unit:"%",  color:C.blue },
                                        { icon:"🌡️", label:"Temp",     value:selectedNode.temp, unit:"°C", color:C.orange },
                                        { icon:"🌧️", label:"Rainfall", value:selectedNode.rain, unit:"mm", color:C.green },
                                        { icon:"📡", label:"Distance", value:selectedNode.dist, unit:"cm", color:"#666" },
                                    ].map(({ icon, label, value, unit, color }) => (
                                        <div key={label}
                                             style={{ background:"#f7f5f2", border:"1.5px solid #e8e4df",
                                                 borderRadius:10, padding:"10px 11px" }}>
                                            <div style={{ fontSize:15, marginBottom:3 }}>{icon}</div>
                                            <div style={{ fontSize:9, color:"#aaa", textTransform:"uppercase",
                                                letterSpacing:.4, fontWeight:700 }}>{label}</div>
                                            <div style={{ fontSize:17, fontWeight:900, color,
                                                fontFamily:"'DM Mono',monospace", margin:"2px 0" }}>{value}</div>
                                            <div style={{ fontSize:9, color:"#aaa" }}>{unit}</div>
                                        </div>
                                    ))}
                                </div>
                                {[
                                    { label:"RSSI", val:`${selectedNode.rssi} dBm`, pct:Math.max(0,Math.min(100,(selectedNode.rssi+120)/1.2)), color:C.green },
                                    { label:"SNR",  val:`${selectedNode.snr} dB`,   pct:Math.max(0,Math.min(100,(parseFloat(selectedNode.snr)/15)*100)), color:C.blue },
                                ].map(({ label, val, pct, color }) => (
                                    <div key={label} style={{ marginBottom:8 }}>
                                        <div style={{ display:"flex", justifyContent:"space-between",
                                            fontSize:11, marginBottom:5 }}>
                                            <span style={{ color:"#aaa", fontWeight:600 }}>{label}</span>
                                            <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color }}>{val}</span>
                                        </div>
                                        <div style={{ height:5, background:"#e8e4df", borderRadius:3, overflow:"hidden" }}>
                                            <div style={{ width:`${pct}%`, background:color, height:"100%",
                                                borderRadius:3, transition:".3s" }} />
                                        </div>
                                    </div>
                                ))}
                            </Card>
                        )}

                        {/* Activity Log */}
                        <Card style={{ padding:"16px 18px" }}>
                            <div style={{ fontSize:11, fontWeight:700, color:"#aaa", textTransform:"uppercase",
                                letterSpacing:.5, marginBottom:10 }}>Recent Activity</div>
                            <div style={{ fontSize:12, color:"#aaa",
                                borderBottom:"1px solid #fafafa", paddingBottom:6, marginBottom:6 }}>
                                System started
                            </div>
                            <div style={{ fontSize:12, color:"#ccc" }}>Waiting for registrations…</div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ── GATEWAY MODAL ── */}
            <Modal show={showGwModal} onClose={() => setShowGwModal(false)} title="Add Gateway"
                   footer={<>
                       <Btn variant="outline" onClick={() => setShowGwModal(false)}>Cancel</Btn>
                       <Btn variant="dark" onClick={addGateway}>Add Gateway</Btn>
                   </>}>
                <div style={{ display:"grid", gap:14 }}>
                    <FormGroup label="Gateway Name *">
                        <input style={inp} value={gwName} onChange={e=>setGwName(e.target.value)}
                               placeholder="e.g. Gateway-003" />
                    </FormGroup>
                    <FormGroup label="Gateway EUI *">
                        <input style={{ ...inp, fontFamily:"'DM Mono',monospace", fontSize:12 }}
                               value={gwEui} onChange={e=>setGwEui(e.target.value)}
                               placeholder="AA:BB:CC:DD:EE:FF:00:03" />
                    </FormGroup>
                    <FormGroup label="Location / District *">
                        <input style={inp} value={gwLoc} onChange={e=>setGwLoc(e.target.value)}
                               placeholder="e.g. Galle" />
                    </FormGroup>
                    <div style={g2}>
                        <FormGroup label="Latitude">
                            <input style={inp} type="number" value={gwLat}
                                   onChange={e=>setGwLat(e.target.value)} placeholder="6.0535" />
                        </FormGroup>
                        <FormGroup label="Longitude">
                            <input style={inp} type="number" value={gwLng}
                                   onChange={e=>setGwLng(e.target.value)} placeholder="80.2210" />
                        </FormGroup>
                    </div>
                </div>
            </Modal>

            {/* ── DELETE MODAL ── */}
            <Modal show={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Node?"
                   footer={<>
                       <Btn variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
                       <Btn variant="red" onClick={confirmDelete}>Delete Node</Btn>
                   </>}>
                <div style={{ textAlign:"center", padding:"8px 0" }}>
                    <div style={{ width:60, height:60, background:"#fff0ee", borderRadius:16,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:28, margin:"0 auto 16px" }}>🗑️</div>
                    <div style={{ fontSize:14, color:"#1a1a1a", marginBottom:6 }}>
                        Are you sure you want to delete
                    </div>
                    <div style={{ fontSize:16, fontWeight:900, color:C.red,
                        fontFamily:"'DM Mono',monospace", marginBottom:16 }}>
                        {deleteTarget?.name}
                    </div>
                    <div style={{ fontSize:12, color:"#aaa", lineHeight:1.6 }}>
                        All readings and alerts for this node will be permanently removed.<br/>
                        This action cannot be undone.
                    </div>
                </div>
            </Modal>

            {/* ── TOAST ── */}
            {toastMsg && (
                <div style={{ position:"fixed", bottom:20, right:20,
                    background: toastMsg.isError ? C.red : "#1a7a4a",
                    color:"#fff", borderRadius:12, padding:"13px 20px",
                    fontSize:13, fontWeight:700,
                    boxShadow:"0 4px 20px rgba(0,0,0,.15)", zIndex:999,
                    display:"flex", alignItems:"center", gap:8,
                    animation:"fadeUp .3s ease" }}>
                    {toastMsg.isError ? "⚠️" : "✅"} {toastMsg.msg}
                </div>
            )}
        </>
    );
}
