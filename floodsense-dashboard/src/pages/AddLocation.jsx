// ─── AddLocation.jsx ─────────────────────────────────────────────────────────
//
//  TWO DISTINCT MANAGERS inside one page, selected via a top-level "section" toggle:
//
//    [IoT Node Manager]        — register sensor nodes, manage nodes, manage gateways
//                                (all original functionality, UNCHANGED)
//
//    [Safe Location Manager]   — register evacuation shelters / safe zones,
//                                manage them (NEW functionality)
//
//  This eliminates the confusion between "Add Locations" (which sounded like map pins)
//  and "Map View" (which shows the map). Now it is crystal clear:
//    • Map View    = look at the map
//    • This page   = manage IoT hardware  OR  manage safe shelters

import React, { useState } from "react";
import { C, Card, Badge, globalCSS, TabBar, FormGroup, Btn } from "../shared.jsx";
// import { createLocation, deleteLocation, getAllLocations } from "../api/services/locationService.js";
// import { createSafeLocation, deleteSafeLocation, getAllSafeLocations } from "../api/services/safeLocationService.js";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DISTRICTS = [
    "Ratnapura","Kalutara","Colombo","Galle","Kandy",
    "Matara","Kegalle","Badulla","Hambantota","Kurunegala",
];

const SAFE_LOCATION_TYPES = [
    "School / Educational",
    "Hospital / Medical",
    "Community Centre",
    "Government Building",
    "Religious Building",
    "Sports Complex",
    "Other",
];

const SENSOR_CHIPS = [
    { icon:"💧", label:"Humidity",    sub:"DHT22 — relative %",    color:"var(--primary)"   },
    { icon:"🌡️", label:"Temperature", sub:"DHT22 — °C",            color:"var(--orange)" },
    { icon:"🌧️", label:"Rainfall",    sub:"Tipping bucket — mm",   color:"var(--green)"  },
    { icon:"📡", label:"Ultrasonic",  sub:"HC-SR04 — cm distance", color:"#7c3aed"},
];

const INITIAL_GATEWAYS = [
    { id:"gw-001", name:"Gateway-001", eui:"AA:BB:CC:DD:EE:FF:00:01", location:"Ratnapura", status:"active" },
    { id:"gw-002", name:"Gateway-002", eui:"AA:BB:CC:DD:EE:FF:00:02", location:"Kalutara",  status:"active" },
];

// ─── EXTRA CSS ────────────────────────────────────────────────────────────────
const extraCSS = `
  .al-icon-btn-del:hover { background: var(--red-bg) !important; color: var(--red) !important; border-color: var(--red) !important; }
  .al-node-card:hover { border-color: var(--border-mid) !important; background: var(--surface-alt) !important; }
  input:focus, select:focus { border-color: var(--primary) !important; outline: none; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .fadeUp { animation: fadeUp .25s ease both; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
  .pulse { animation: pulse 1.4s ease-in-out infinite; }
  .section-toggle-btn { transition: all .18s; border: 1.5px solid var(--border); cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; border-radius: 12px; padding: 10px 22px; }
  .section-toggle-btn:hover { border-color: var(--primary); }
`;

// ─── SHARED SMALL COMPONENTS ──────────────────────────────────────────────────
const SectionLabel = ({ step, label }) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{
            width:22, height:22, borderRadius:7, background:"var(--primary)",
            color:"#fff", fontSize:10, fontWeight:800,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>{step}</div>
        <span style={{ fontSize:12, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:.5 }}>
            {label}
        </span>
    </div>
);

const Modal = ({ show, onClose, title, children, footer }) => {
    if (!show) return null;
    return (
        <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
             style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:200,
                 display:"flex", alignItems:"center", justifyContent:"center", padding:20,
                 backdropFilter:"blur(6px)" }}>
            <div className="fadeUp"
                 style={{ background:"var(--surface)", borderRadius:20, width:"100%", maxWidth:480,
                     maxHeight:"90vh", overflowY:"auto",
                     boxShadow:"var(--shadow-md)", border:"1px solid var(--border)" }}>
                <div style={{ padding:"18px 22px", borderBottom:"1px solid var(--border)",
                    display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ fontSize:15, fontWeight:800, color:"var(--text)" }}>{title}</div>
                    <button onClick={onClose}
                            style={{ background:"var(--surface-alt)", border:"1.5px solid var(--border)", color:"var(--text-mid)",
                                width:30, height:30, borderRadius:8, cursor:"pointer", fontSize:14,
                                display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                </div>
                <div style={{ padding:22, color:"var(--text)" }}>{children}</div>
                {footer && (
                    <div style={{ padding:"14px 22px", borderTop:"1px solid var(--border)",
                        display:"flex", gap:8, justifyContent:"flex-end" }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatPill = ({ label, value, accent }) => (
    <div style={{ background:"var(--surface-alt)", borderRadius:10, padding:"8px 14px",
        border:"1.5px solid var(--border)", display:"flex", flexDirection:"column",
        alignItems:"center", minWidth:64 }}>
        <div style={{ fontSize:20, fontWeight:900, color:accent, lineHeight:1,
            fontFamily:"'DM Mono',monospace" }}>{value}</div>
        <div style={{ fontSize:9, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase",
            letterSpacing:.5, marginTop:2 }}>{label}</div>
    </div>
);

const IconBtn = ({ onClick, children }) => (
    <button className="al-icon-btn-del" onClick={onClick}
            style={{ width:30, height:30, borderRadius:8, border:"1.5px solid var(--border)",
                background:"var(--surface-alt)", color:"var(--text-muted)", cursor:"pointer", fontSize:13,
                display:"flex", alignItems:"center", justifyContent:"center", transition:".15s" }}>
        {children}
    </button>
);

// ─── Shared input / select styles ─────────────────────────────────────────────
const inp = {
    padding:"10px 13px", borderRadius:10, border:"1.5px solid var(--border)",
    background:"var(--surface-alt)", fontSize:13, color:"var(--text)", outline:"none",
    width:"100%", transition:"border .15s", fontFamily:"'DM Sans',sans-serif",
};
const sel = {
    ...inp, appearance:"none", cursor:"pointer",
    backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:34,
};
const g2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 };
const g3 = { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 };

// ══════════════════════════════════════════════════════════════════════════════
// ─── IOT NODE MANAGER (original, unchanged) ───────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function IoTNodeManager() {
    const [activeTab, setActiveTab]       = useState("register");
    const [nodes, setNodes]               = useState([]);
    const [gateways, setGateways]         = useState(INITIAL_GATEWAYS);
    const [selectedId, setSelectedId]     = useState(null);
    const [toastMsg, setToastMsg]         = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showGwModal, setShowGwModal]   = useState(false);
    const [searchQ, setSearchQ]           = useState("");
    const [statusFilter, setStatusFilter] = useState("");

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

    const [gwName, setGwName] = useState("");
    const [gwEui, setGwEui]   = useState("");
    const [gwLoc, setGwLoc]   = useState("");
    const [gwLat, setGwLat]   = useState("");
    const [gwLng, setGwLng]   = useState("");

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
            snr:  (Math.random() * 10 + 2).toFixed(1),
            hum:  (60 + Math.random() * 30).toFixed(1),
            temp: (24 + Math.random() * 10).toFixed(1),
            rain: (Math.random() * 5).toFixed(2),
            dist: (150 + Math.random() * 100).toFixed(0),
        };
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
        setNodes(prev => prev.filter(n => n.id !== deleteTarget.id));
        if (selectedId === deleteTarget.id) setSelectedId(null);
        toast("Node removed");
        setDeleteTarget(null);
    };

    const selectedNode  = nodes.find(n => n.id === selectedId);
    const filteredNodes = nodes.filter(n => {
        const q = searchQ.toLowerCase();
        return (n.name.toLowerCase().includes(q) || n.location.toLowerCase().includes(q))
            && (statusFilter ? n.status === statusFilter : true);
    });
    const activeCount = nodes.filter(n => n.status === "active").length;

    const TABS = [
        { id:"register", label:"Register Node" },
        { id:"manage",   label:"Manage Nodes"  },
        { id:"gateways", label:"Gateways"      },
    ];

    return (
        <>
            {/* ── Page Header ── */}
            <div style={{ background:"var(--surface)", borderRadius:16, margin:"0 0 14px",
                padding:"14px 22px", display:"flex", alignItems:"center",
                justifyContent:"space-between", border:"1px solid var(--border)", boxShadow:"var(--shadow)" }}>
                <div>
                    <div style={{ fontSize:17, fontWeight:900, letterSpacing:-.3, color:"var(--text)" }}>
                        📡 IoT Node Manager
                    </div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
                        Register LoRa sensor nodes and manage gateways for the flood monitoring network
                    </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <StatPill label="Total"    value={nodes.length}    accent="var(--text)" />
                    <StatPill label="Active"   value={activeCount}     accent="var(--green)" />
                    <StatPill label="Gateways" value={gateways.length} accent="var(--primary)"  />
                    <StatPill label="Alerts"   value={0}               accent="var(--red)"   />
                </div>
            </div>

            <div style={{ display:"flex", margin:"12px 14px 14px", gap:12 }}>

                {/* ── Left Main ── */}
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12, minWidth:0 }}>
                    <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

                    {/* ══ REGISTER TAB ══ */}
                    {activeTab === "register" && (
                        <div className="fadeUp" style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            <Card>
                                <SectionLabel step="1" label="Node Identity" />
                                <div style={{ ...g2, marginBottom:14 }}>
                                    <FormGroup label="Node Name *">
                                        <input style={inp} value={rName} onChange={e=>setRName(e.target.value)} placeholder="e.g. Ratnapura-A1" />
                                    </FormGroup>
                                    <FormGroup label="Gateway *">
                                        <select style={sel} value={rGateway} onChange={e=>setRGateway(e.target.value)}>
                                            <option value="">Select gateway…</option>
                                            {gateways.map(g => (
                                                <option key={g.id} value={g.id}>{g.name} — {g.location}</option>
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

                            <Card>
                                <SectionLabel step="2" label="Sensors in this Node" />
                                <div style={g2}>
                                    {SENSOR_CHIPS.map(({ icon, label, sub, color }) => (
                                        <div key={label} style={{ background:"var(--surface-alt)", borderRadius:12,
                                            border:"1.5px solid var(--border)", padding:"12px 14px",
                                            display:"flex", alignItems:"center", gap:10 }}>
                                            <div style={{ width:36, height:36, background:`${color}18`,
                                                borderRadius:10, display:"flex", alignItems:"center",
                                                justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
                                            <div style={{ flex:1 }}>
                                                <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{label}</div>
                                                <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:1 }}>{sub}</div>
                                            </div>
                                            <span className="pulse" style={{ width:7, height:7, borderRadius:"50%",
                                                background:"var(--green)", flexShrink:0, display:"inline-block" }} />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop:10, padding:"9px 14px", background:"var(--surface-alt)",
                                    border:"1.5px solid var(--border)", borderRadius:10, fontSize:11, color:"var(--text-muted)" }}>
                                    All 4 sensors are fixed per node — configured in firmware
                                </div>
                            </Card>

                            <Card>
                                <SectionLabel step="3" label="Location" />
                                <div style={{ ...g2, marginBottom:14 }}>
                                    <FormGroup label="Location Name *">
                                        <input style={inp} value={rLocName} onChange={e=>setRLocName(e.target.value)} placeholder="e.g. Ratnapura Field A" />
                                    </FormGroup>
                                    <FormGroup label="District">
                                        <select style={sel} value={rDistrict} onChange={e=>setRDistrict(e.target.value)}>
                                            <option value="">Select district…</option>
                                            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </FormGroup>
                                </div>
                                <div style={g2}>
                                    <FormGroup label="GPS Latitude *">
                                        <div style={{ position:"relative" }}>
                                            <input style={{ ...inp, paddingRight:38 }} type="number" step="0.0001"
                                                   value={rLat} onChange={e=>setRLat(e.target.value)} placeholder="6.6828" />
                                            <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
                                                fontSize:11, color:"var(--text-muted)", pointerEvents:"none", fontFamily:"'DM Mono',monospace" }}>°N</span>
                                        </div>
                                    </FormGroup>
                                    <FormGroup label="GPS Longitude *">
                                        <div style={{ position:"relative" }}>
                                            <input style={{ ...inp, paddingRight:38 }} type="number" step="0.0001"
                                                   value={rLng} onChange={e=>setRLng(e.target.value)} placeholder="80.3992" />
                                            <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
                                                fontSize:11, color:"var(--text-muted)", pointerEvents:"none", fontFamily:"'DM Mono',monospace" }}>°E</span>
                                        </div>
                                    </FormGroup>
                                </div>
                            </Card>

                            <Card>
                                <SectionLabel step="4" label="Alert Thresholds" />
                                <div style={g3}>
                                    {[
                                        ["Warning Level", rWarn,   setRWarn,   "4.0", "var(--orange)"],
                                        ["Critical Level",rCrit,   setRCrit,   "5.2", "var(--red)"],
                                        ["Sensor Height", rHeight, setRHeight, "6.0", "var(--primary)"],
                                    ].map(([label, val, setter, ph, accent]) => (
                                        <FormGroup key={label} label={label}>
                                            <div style={{ position:"relative" }}>
                                                <input style={{ ...inp, paddingRight:32, borderLeft:`3px solid ${accent}` }}
                                                       type="number" step="0.1" value={val}
                                                       onChange={e=>setter(e.target.value)} placeholder={ph} />
                                                <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
                                                    fontSize:11, color:"var(--text-muted)", pointerEvents:"none", fontFamily:"'DM Mono',monospace" }}>m</span>
                                            </div>
                                        </FormGroup>
                                    ))}
                                </div>
                                <div style={{ marginTop:12, padding:"10px 14px", background:"var(--orange-bg)",
                                    border:"1.5px solid var(--orange)", borderRadius:10, fontSize:11, color:"var(--orange)" }}>
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
                                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                                    <div>
                                        <div style={{ fontSize:14, fontWeight:800, color:"var(--text)" }}>Sensor Nodes</div>
                                        <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>Manage registered network nodes</div>
                                    </div>
                                    <Btn variant="dark" onClick={() => setActiveTab("register")} style={{ fontSize:12, padding:"8px 16px" }}>+ New Node</Btn>
                                </div>
                                <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                                    <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                                           placeholder="Search by name or location…" style={{ ...inp, flex:1 }} />
                                    <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ ...sel, width:150 }}>
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                {filteredNodes.length === 0 ? (
                                    <div style={{ padding:"40px 0", textAlign:"center" }}>
                                        <div style={{ fontSize:38, marginBottom:10 }}>📡</div>
                                        <div style={{ fontSize:14, fontWeight:700, color:"var(--text)", marginBottom:4 }}>No nodes yet</div>
                                        <div style={{ fontSize:12, color:"var(--text-muted)" }}>Register a node to get started</div>
                                    </div>
                                ) : (
                                    <table>
                                        <thead>
                                        <tr>{["Node","Dev EUI","Gateway","Location","Status","Last Seen",""].map(h => <th key={h}>{h}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                        {filteredNodes.map(n => (
                                            <tr key={n.id} onClick={() => setSelectedId(n.id)}
                                                style={{ cursor:"pointer", background: selectedId===n.id ? "var(--surface-alt)" : "transparent" }}>
                                                <td><div style={{ fontWeight:700, fontSize:13, color:"var(--text)" }}>{n.name}</div><div style={{ fontSize:10, color:"var(--text-muted)" }}>{n.district}</div></td>
                                                <td style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--text-mid)" }}>{n.deveui.slice(0,8)}…</td>
                                                <td>{n.gateway}</td>
                                                <td>{n.location}</td>
                                                <td><Badge type={n.status}>{n.status.toUpperCase()}</Badge></td>
                                                <td style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--text-muted)" }}>{n.lastSeen}</td>
                                                <td><IconBtn onClick={e => { e.stopPropagation(); setDeleteTarget(n); }}>✕</IconBtn></td>
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
                                    <Btn variant="dark" onClick={() => setShowGwModal(true)} style={{ fontSize:12, padding:"8px 16px" }}>+ Add Gateway</Btn>
                                </div>
                                <table>
                                    <thead>
                                    <tr>{["Name","EUI","Location","Connected Nodes","Status",""].map(h => <th key={h}>{h}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                    {gateways.map(g => (
                                        <tr key={g.id}>
                                            <td style={{ fontWeight:700 }}>{g.name}</td>
                                            <td style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--text-mid)" }}>{g.eui}</td>
                                            <td>{g.location}</td>
                                            <td><span style={{ fontWeight:800, color:"var(--primary)", fontFamily:"'DM Mono',monospace" }}>{nodes.filter(n => n.gatewayId === g.id).length}</span></td>
                                            <td><Badge type={g.status}>{g.status.toUpperCase()}</Badge></td>
                                            <td><IconBtn onClick={() => setGateways(prev => prev.filter(x => x.id !== g.id))}>✕</IconBtn></td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </Card>
                        </div>
                    )}
                </div>

                {/* ── Right Panel ── */}
                <div style={{ width:252, display:"flex", flexDirection:"column", gap:12, flexShrink:0 }}>
                    <Card style={{ padding:"16px 18px" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:.5, marginBottom:12 }}>Network Nodes</div>
                        {nodes.length === 0 ? (
                            <div style={{ padding:"20px 0", textAlign:"center" }}>
                                <div style={{ fontSize:24, marginBottom:6 }}>📡</div>
                                <div style={{ fontSize:11, color:"var(--text-muted)" }}>No nodes registered</div>
                            </div>
                        ) : nodes.map(n => (
                            <div key={n.id} onClick={() => setSelectedId(n.id)} className="al-node-card"
                                 style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:10,
                                     border:`1.5px solid ${selectedId===n.id ? "var(--primary)" : "var(--border)"}`,
                                     marginBottom:7, cursor:"pointer", transition:".15s",
                                     background: selectedId===n.id ? "var(--surface-alt)" : "var(--surface)" }}>
                                <span style={{ width:8, height:8, borderRadius:"50%", flexShrink:0,
                                    background: n.status==="active" ? "var(--green)" : "var(--border)", display:"inline-block" }} />
                                <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontSize:12, fontWeight:700, color:"var(--text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{n.name}</div>
                                    <div style={{ fontSize:10, color:"var(--text-muted)" }}>{n.gateway}</div>
                                </div>
                                <div style={{ fontSize:10, color:"var(--text-muted)", fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{n.rssi} dBm</div>
                            </div>
                        ))}
                    </Card>

                    {selectedNode && (
                        <Card style={{ padding:"16px 18px" }}>
                            <div style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:.5, marginBottom:12 }}>
                                Live — <span style={{ color:"var(--text)" }}>{selectedNode.name}</span>
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                                {[
                                    { icon:"💧", label:"Humidity", value:selectedNode.hum,  unit:"%",  color:"var(--primary)"   },
                                    { icon:"🌡️", label:"Temp",     value:selectedNode.temp, unit:"°C", color:"var(--orange)" },
                                    { icon:"🌧️", label:"Rainfall", value:selectedNode.rain, unit:"mm", color:"var(--green)"  },
                                    { icon:"📡", label:"Distance", value:selectedNode.dist, unit:"cm", color:"var(--text-mid)"   },
                                ].map(({ icon, label, value, unit, color }) => (
                                    <div key={label} style={{ background:"var(--surface-alt)", border:"1.5px solid var(--border)", borderRadius:10, padding:"10px 11px" }}>
                                        <div style={{ fontSize:15, marginBottom:3 }}>{icon}</div>
                                        <div style={{ fontSize:9, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:.4, fontWeight:700 }}>{label}</div>
                                        <div style={{ fontSize:17, fontWeight:900, color, fontFamily:"'DM Mono',monospace", margin:"2px 0" }}>{value}</div>
                                        <div style={{ fontSize:9, color:"var(--text-muted)" }}>{unit}</div>
                                    </div>
                                ))}
                            </div>
                            {[
                                { label:"RSSI", val:`${selectedNode.rssi} dBm`, pct:Math.max(0,Math.min(100,(selectedNode.rssi+120)/1.2)), color:"var(--green)" },
                                { label:"SNR",  val:`${selectedNode.snr} dB`,   pct:Math.max(0,Math.min(100,(parseFloat(selectedNode.snr)/15)*100)), color:"var(--primary)" },
                            ].map(({ label, val, pct, color }) => (
                                <div key={label} style={{ marginBottom:8 }}>
                                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:5 }}>
                                        <span style={{ color:"var(--text-muted)", fontWeight:600 }}>{label}</span>
                                        <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color }}>{val}</span>
                                    </div>
                                    <div style={{ height:5, background:"var(--border)", borderRadius:3, overflow:"hidden" }}>
                                        <div style={{ width:`${pct}%`, background:color, height:"100%", borderRadius:3, transition:".3s" }} />
                                    </div>
                                </div>
                            ))}
                        </Card>
                    )}

                    <Card style={{ padding:"16px 18px" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>Recent Activity</div>
                        <div style={{ fontSize:12, color:"var(--text-muted)", borderBottom:"1px solid var(--border)", paddingBottom:6, marginBottom:6 }}>System started</div>
                        <div style={{ fontSize:12, color:"var(--text-muted)" }}>Waiting for registrations…</div>
                    </Card>
                </div>
            </div>

            {/* Gateway Modal */}
            <Modal show={showGwModal} onClose={() => setShowGwModal(false)} title="Add Gateway"
                   footer={<><Btn variant="outline" onClick={() => setShowGwModal(false)}>Cancel</Btn><Btn variant="dark" onClick={addGateway}>Add Gateway</Btn></>}>
                <div style={{ display:"grid", gap:14 }}>
                    <FormGroup label="Gateway Name *"><input style={inp} value={gwName} onChange={e=>setGwName(e.target.value)} placeholder="e.g. Gateway-003" /></FormGroup>
                    <FormGroup label="Gateway EUI *"><input style={{ ...inp, fontFamily:"'DM Mono',monospace", fontSize:12 }} value={gwEui} onChange={e=>setGwEui(e.target.value)} placeholder="AA:BB:CC:DD:EE:FF:00:03" /></FormGroup>
                    <FormGroup label="Location / District *"><input style={inp} value={gwLoc} onChange={e=>setGwLoc(e.target.value)} placeholder="e.g. Galle" /></FormGroup>
                    <div style={g2}>
                        <FormGroup label="Latitude"><input style={inp} type="number" value={gwLat} onChange={e=>setGwLat(e.target.value)} placeholder="6.0535" /></FormGroup>
                        <FormGroup label="Longitude"><input style={inp} type="number" value={gwLng} onChange={e=>setGwLng(e.target.value)} placeholder="80.2210" /></FormGroup>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal show={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Node?"
                   footer={<><Btn variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Btn><Btn variant="red" onClick={confirmDelete}>Delete Node</Btn></>}>
                <div style={{ textAlign:"center", padding:"8px 0" }}>
                    <div style={{ width:60, height:60, background:"var(--red-bg)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>🗑️</div>
                    <div style={{ fontSize:14, color:"var(--text)", marginBottom:6 }}>Are you sure you want to delete</div>
                    <div style={{ fontSize:16, fontWeight:900, color:"var(--red)", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>{deleteTarget?.name}</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.6 }}>All readings and alerts for this node will be permanently removed.<br/>This action cannot be undone.</div>
                </div>
            </Modal>

            {/* Toast */}
            {toastMsg && (
                <div style={{ position:"fixed", bottom:20, right:20,
                    background: toastMsg.isError ? "var(--red)" : "var(--green)",
                    color:"#fff", borderRadius:12, padding:"13px 20px",
                    fontSize:13, fontWeight:700, boxShadow:"0 4px 20px rgba(0,0,0,.15)",
                    zIndex:999, display:"flex", alignItems:"center", gap:8, animation:"fadeUp .3s ease" }}>
                    {toastMsg.isError ? "⚠️" : "✅"} {toastMsg.msg}
                </div>
            )}
        </>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── SAFE LOCATION MANAGER (new) ─────────────────────────────────────────────
//  Lets admins register evacuation shelters / safe zones and manage them.
//  Completely separate from IoT nodes — different purpose, different data.
// ══════════════════════════════════════════════════════════════════════════════
function SafeLocationManager() {
    const [activeTab, setActiveTab]       = useState("register");
    const [locations, setLocations]       = useState([]);
    const [selectedId, setSelectedId]     = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toastMsg, setToastMsg]         = useState(null);
    const [searchQ, setSearchQ]           = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [editTarget, setEditTarget]     = useState(null);

    // Register form
    const [fName,     setFName]     = useState("");
    const [fType,     setFType]     = useState("");
    const [fDistrict, setFDistrict] = useState("");
    const [fAddress,  setFAddress]  = useState("");
    const [fLat,      setFLat]      = useState("");
    const [fLng,      setFLng]      = useState("");
    const [fCap,      setFCap]      = useState("");
    const [fContact,  setFContact]  = useState("");
    const [fNotes,    setFNotes]    = useState("");
    const [fStatus,   setFStatus]   = useState("available");

    // Edit form mirrors
    const [eName,     setEName]     = useState("");
    const [eType,     setEType]     = useState("");
    const [eCap,      setECap]      = useState("");
    const [eContact,  setEContact]  = useState("");
    const [eNotes,    setENotes]    = useState("");
    const [eStatus,   setEStatus]   = useState("available");

    const toast = (msg, isError = false) => {
        setToastMsg({ msg, isError });
        setTimeout(() => setToastMsg(null), 2800);
    };

    const clearForm = () => {
        setFName(""); setFType(""); setFDistrict(""); setFAddress("");
        setFLat(""); setFLng(""); setFCap(""); setFContact(""); setFNotes("");
        setFStatus("available");
    };

    const LOCATION_STATUS_OPTIONS = [
        { val:"available", label:"Available",   color:"var(--green)"  },
        { val:"limited",   label:"Limited",     color:"var(--orange)" },
        { val:"full",      label:"Full",        color:"var(--red)"    },
        { val:"inactive",  label:"Inactive",    color:"var(--text-muted)"   },
    ];

    const iconForType = (type) => {
        if (!type) return "📍";
        if (type.includes("School"))    return "🏫";
        if (type.includes("Hospital"))  return "🏥";
        if (type.includes("Community")) return "🏢";
        if (type.includes("Govern"))    return "🏛️";
        if (type.includes("Religi"))    return "⛪";
        if (type.includes("Sports"))    return "🏟️";
        return "📍";
    };

    const registerLocation = () => {
        if (!fName || !fType || !fDistrict || !fLat || !fLng || !fCap) {
            toast("Fill all required fields (*)", true); return;
        }
        const loc = {
            id:        "sl-" + Date.now(),
            name:      fName,
            type:      fType,
            district:  fDistrict,
            address:   fAddress,
            lat:       parseFloat(fLat),
            lng:       parseFloat(fLng),
            capacity:  parseInt(fCap),
            contact:   fContact,
            notes:     fNotes,
            status:    fStatus,
            addedAt:   new Date().toLocaleString(),
            icon:      iconForType(fType),
        };
        // await createSafeLocation(loc);
        setLocations(prev => [...prev, loc]);
        toast(`Safe location "${fName}" registered`);
        clearForm();
        setActiveTab("manage");
    };

    const openEdit = (loc) => {
        setEditTarget(loc);
        setEName(loc.name); setEType(loc.type); setECap(String(loc.capacity));
        setEContact(loc.contact); setENotes(loc.notes); setEStatus(loc.status);
    };

    const saveEdit = () => {
        setLocations(prev => prev.map(l => l.id === editTarget.id
            ? { ...l, name:eName, type:eType, capacity:parseInt(eCap),
                contact:eContact, notes:eNotes, status:eStatus, icon:iconForType(eType) }
            : l
        ));
        toast("Location updated");
        setEditTarget(null);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        // await deleteSafeLocation(deleteTarget.id);
        setLocations(prev => prev.filter(l => l.id !== deleteTarget.id));
        if (selectedId === deleteTarget.id) setSelectedId(null);
        toast("Location removed");
        setDeleteTarget(null);
    };

    const filtered = locations.filter(l => {
        const q = searchQ.toLowerCase();
        return (l.name.toLowerCase().includes(q) || l.district.toLowerCase().includes(q))
            && (statusFilter ? l.status === statusFilter : true);
    });

    const selectedLoc = locations.find(l => l.id === selectedId);
    const available   = locations.filter(l => l.status === "available").length;
    const full        = locations.filter(l => l.status === "full").length;
    const totalCap    = locations.reduce((s, l) => s + (l.capacity || 0), 0);

    const TABS = [
        { id:"register", label:"Register Safe Location" },
        { id:"manage",   label:"Manage Locations"       },
    ];

    return (
        <>
            {/* ── Page Header ── */}
            <div style={{ background:"var(--surface)", borderRadius:16, margin:"0 0 14px",
                padding:"14px 22px", display:"flex", alignItems:"center",
                justifyContent:"space-between", border:"1px solid var(--border)", boxShadow:"var(--shadow)" }}>
                <div>
                    <div style={{ fontSize:17, fontWeight:900, letterSpacing:-.3 }}>
                        🏠 Safe Location Manager
                    </div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
                        Register and manage evacuation shelters, safe zones, and emergency facilities
                    </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <StatPill label="Total"     value={locations.length} accent="var(--text)" />
                    <StatPill label="Available" value={available}        accent="var(--green)" />
                    <StatPill label="Full"      value={full}             accent="var(--red)"   />
                    <StatPill label="Capacity"  value={totalCap}         accent="var(--primary)"  />
                </div>
            </div>

            <div style={{ display:"flex", margin:"12px 14px 14px", gap:12 }}>

                {/* ── Left Main ── */}
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12, minWidth:0 }}>
                    <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

                    {/* ══ REGISTER TAB ══ */}
                    {activeTab === "register" && (
                        <div className="fadeUp" style={{ display:"flex", flexDirection:"column", gap:12 }}>

                            {/* Step 1 — Basic Info */}
                            <Card>
                                <SectionLabel step="1" label="Shelter Information" />
                                <div style={{ ...g2, marginBottom:14 }}>
                                    <FormGroup label="Shelter Name *">
                                        <input style={inp} value={fName} onChange={e=>setFName(e.target.value)} placeholder="e.g. Rathnapura Municipal School" />
                                    </FormGroup>
                                    <FormGroup label="Shelter Type *">
                                        <select style={sel} value={fType} onChange={e=>setFType(e.target.value)}>
                                            <option value="">Select type…</option>
                                            {SAFE_LOCATION_TYPES.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </FormGroup>
                                </div>
                                <div style={{ ...g2 }}>
                                    <FormGroup label="District *">
                                        <select style={sel} value={fDistrict} onChange={e=>setFDistrict(e.target.value)}>
                                            <option value="">Select district…</option>
                                            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </FormGroup>
                                    <FormGroup label="Address / Landmark">
                                        <input style={inp} value={fAddress} onChange={e=>setFAddress(e.target.value)} placeholder="e.g. Main Street, near bus stand" />
                                    </FormGroup>
                                </div>
                            </Card>

                            {/* Step 2 — GPS */}
                            <Card>
                                <SectionLabel step="2" label="GPS Location" />
                                <div style={g2}>
                                    <FormGroup label="GPS Latitude *">
                                        <div style={{ position:"relative" }}>
                                            <input style={{ ...inp, paddingRight:38 }} type="number" step="0.0001"
                                                   value={fLat} onChange={e=>setFLat(e.target.value)} placeholder="6.6828" />
                                            <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
                                                fontSize:11, color:"var(--text-muted)", pointerEvents:"none", fontFamily:"'DM Mono',monospace" }}>°N</span>
                                        </div>
                                    </FormGroup>
                                    <FormGroup label="GPS Longitude *">
                                        <div style={{ position:"relative" }}>
                                            <input style={{ ...inp, paddingRight:38 }} type="number" step="0.0001"
                                                   value={fLng} onChange={e=>setFLng(e.target.value)} placeholder="80.3992" />
                                            <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
                                                fontSize:11, color:"var(--text-muted)", pointerEvents:"none", fontFamily:"'DM Mono',monospace" }}>°E</span>
                                        </div>
                                    </FormGroup>
                                </div>
                                <div style={{ marginTop:10, padding:"9px 14px", background:"var(--green-bg)",
                                    border:"1.5px solid var(--green)", borderRadius:10, fontSize:11, color:"var(--green)" }}>
                                    📍 These coordinates will pin this shelter on the <b>Map View → Safe Locations</b> tab
                                </div>
                            </Card>

                            {/* Step 3 — Capacity & Contact */}
                            <Card>
                                <SectionLabel step="3" label="Capacity &amp; Contact" />
                                <div style={{ ...g2, marginBottom:14 }}>
                                    <FormGroup label="Max Capacity (people) *">
                                        <input style={inp} type="number" value={fCap} onChange={e=>setFCap(e.target.value)} placeholder="200" />
                                    </FormGroup>
                                    <FormGroup label="Contact Number">
                                        <input style={inp} value={fContact} onChange={e=>setFContact(e.target.value)} placeholder="+94 11 234 5678" />
                                    </FormGroup>
                                </div>
                                <FormGroup label="Notes / Facilities">
                                    <textarea style={{ ...inp, resize:"vertical", minHeight:72, lineHeight:1.5 }}
                                              value={fNotes} onChange={e=>setFNotes(e.target.value)}
                                              placeholder="e.g. Has generator, water supply, kitchen facilities…" />
                                </FormGroup>
                            </Card>

                            {/* Step 4 — Initial Status */}
                            <Card>
                                <SectionLabel step="4" label="Availability Status" />
                                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                                    {LOCATION_STATUS_OPTIONS.map(({ val, label, color }) => (
                                        <button key={val} onClick={() => setFStatus(val)}
                                                style={{
                                                    padding:"9px 18px", borderRadius:10, cursor:"pointer",
                                                    border:`2px solid ${fStatus === val ? color : "var(--border)"}`,
                                                    background: fStatus === val ? `${color}18` : "var(--surface-alt)",
                                                    color: fStatus === val ? color : "var(--text-muted)",
                                                    fontWeight:700, fontSize:13,
                                                    fontFamily:"'DM Sans',sans-serif", transition:".15s",
                                                }}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </Card>

                            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
                                <Btn variant="outline" onClick={clearForm}>Clear Form</Btn>
                                <Btn variant="dark" onClick={registerLocation}>Register Safe Location</Btn>
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
                                    <Btn variant="dark" onClick={() => setActiveTab("register")} style={{ fontSize:12, padding:"8px 16px" }}>+ New Location</Btn>
                                </div>

                                {/* Filters */}
                                <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                                    <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                                           placeholder="Search by name or district…" style={{ ...inp, flex:1 }} />
                                    <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ ...sel, width:160 }}>
                                        <option value="">All Status</option>
                                        {LOCATION_STATUS_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                                    </select>
                                </div>

                                {filtered.length === 0 ? (
                                    <div style={{ padding:"40px 0", textAlign:"center" }}>
                                        <div style={{ fontSize:38, marginBottom:10 }}>🏠</div>
                                        <div style={{ fontSize:14, fontWeight:700, color:"var(--text)", marginBottom:4 }}>No safe locations yet</div>
                                        <div style={{ fontSize:12, color:"var(--text-muted)" }}>Register a shelter to get started</div>
                                    </div>
                                ) : (
                                    <table>
                                        <thead>
                                        <tr>{["Shelter","Type","District","Capacity","Contact","Status",""].map(h => <th key={h}>{h}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                        {filtered.map(l => (
                                            <tr key={l.id} onClick={() => setSelectedId(l.id)}
                                                style={{ cursor:"pointer", background: selectedId===l.id ? "var(--green-bg)" : "transparent" }}>
                                                <td>
                                                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                                        <span style={{ fontSize:16 }}>{l.icon}</span>
                                                        <div>
                                                            <div style={{ fontWeight:700, fontSize:13, color:"var(--text)" }}>{l.name}</div>
                                                            <div style={{ fontSize:10, color:"var(--text-muted)" }}>{l.address || "—"}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize:12, color:"var(--text-mid)" }}>{l.type}</td>
                                                <td>{l.district}</td>
                                                <td style={{ fontFamily:"'DM Mono',monospace", fontWeight:700 }}>{l.capacity.toLocaleString()}</td>
                                                <td style={{ fontSize:12, color:"var(--text-mid)" }}>{l.contact || "—"}</td>
                                                <td>
                                                    <Badge type={l.status === "available" ? "active" : l.status === "full" ? "critical" : "inactive"}>
                                                        {l.status.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td style={{ display:"flex", gap:4 }}>
                                                    <button onClick={e => { e.stopPropagation(); openEdit(l); }}
                                                            style={{ width:30, height:30, borderRadius:8, border:"1.5px solid var(--border)",
                                                                background:"var(--surface-alt)", color:"var(--text-muted)", cursor:"pointer", fontSize:12,
                                                                display:"flex", alignItems:"center", justifyContent:"center" }}>✏️</button>
                                                    <IconBtn onClick={e => { e.stopPropagation(); setDeleteTarget(l); }}>✕</IconBtn>
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

                {/* ── Right Panel ── */}
                <div style={{ width:252, display:"flex", flexDirection:"column", gap:12, flexShrink:0 }}>

                    {/* Location list */}
                    <Card style={{ padding:"16px 18px" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:.5, marginBottom:12 }}>
                            Registered Shelters
                        </div>
                        {locations.length === 0 ? (
                            <div style={{ padding:"20px 0", textAlign:"center" }}>
                                <div style={{ fontSize:24, marginBottom:6 }}>🏠</div>
                                <div style={{ fontSize:11, color:"var(--text-muted)" }}>No shelters registered</div>
                            </div>
                        ) : locations.map(l => (
                            <div key={l.id} onClick={() => setSelectedId(l.id)} className="al-node-card"
                                 style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:10,
                                     border:`1.5px solid ${selectedId===l.id ? "var(--primary)" : "var(--border)"}`,
                                     marginBottom:7, cursor:"pointer", transition:".15s",
                                     background: selectedId===l.id ? "var(--green-bg)" : "var(--surface)" }}>
                                <span style={{ fontSize:16, flexShrink:0 }}>{l.icon}</span>
                                <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontSize:12, fontWeight:700, color:"var(--text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{l.name}</div>
                                    <div style={{ fontSize:10, color:"var(--text-muted)" }}>{l.district}</div>
                                </div>
                                <span style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, display:"inline-block",
                                    background: l.status==="available" ? "var(--green)" : l.status==="full" ? "var(--red)" : "var(--border)" }} />
                            </div>
                        ))}
                    </Card>

                    {/* Detail card for selected location */}
                    {selectedLoc && (
                        <Card style={{ padding:"16px 18px" }}>
                            <div style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>
                                {selectedLoc.icon} {selectedLoc.name}
                            </div>
                            {[
                                { label:"Type",     value:selectedLoc.type     },
                                { label:"District", value:selectedLoc.district  },
                                { label:"Capacity", value:`${selectedLoc.capacity.toLocaleString()} people` },
                                { label:"Contact",  value:selectedLoc.contact || "—" },
                                { label:"Lat / Lng",value:`${selectedLoc.lat}, ${selectedLoc.lng}` },
                                { label:"Added",    value:selectedLoc.addedAt  },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ display:"flex", justifyContent:"space-between",
                                    padding:"5px 0", borderBottom:"1px solid var(--border)", fontSize:12 }}>
                                    <span style={{ color:"var(--text-muted)", fontWeight:600 }}>{label}</span>
                                    <span style={{ color:"var(--text)", fontWeight:500, textAlign:"right", maxWidth:130, wordBreak:"break-word" }}>{value}</span>
                                </div>
                            ))}
                            {selectedLoc.notes && (
                                <div style={{ marginTop:10, padding:"8px 10px", background:"var(--surface-alt)",
                                    border:"1.5px solid var(--border)", borderRadius:8, fontSize:11, color:"var(--text-mid)", lineHeight:1.5 }}>
                                    {selectedLoc.notes}
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <Modal show={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name}`}
                   footer={<><Btn variant="outline" onClick={() => setEditTarget(null)}>Cancel</Btn><Btn variant="dark" onClick={saveEdit}>Save Changes</Btn></>}>
                <div style={{ display:"grid", gap:14 }}>
                    <FormGroup label="Shelter Name"><input style={inp} value={eName} onChange={e=>setEName(e.target.value)} /></FormGroup>
                    <FormGroup label="Type">
                        <select style={sel} value={eType} onChange={e=>setEType(e.target.value)}>
                            {SAFE_LOCATION_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </FormGroup>
                    <FormGroup label="Max Capacity"><input style={inp} type="number" value={eCap} onChange={e=>setECap(e.target.value)} /></FormGroup>
                    <FormGroup label="Contact"><input style={inp} value={eContact} onChange={e=>setEContact(e.target.value)} /></FormGroup>
                    <FormGroup label="Notes"><textarea style={{ ...inp, resize:"vertical", minHeight:60 }} value={eNotes} onChange={e=>setENotes(e.target.value)} /></FormGroup>
                    <FormGroup label="Status">
                        <select style={sel} value={eStatus} onChange={e=>setEStatus(e.target.value)}>
                            {LOCATION_STATUS_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                        </select>
                    </FormGroup>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal show={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Safe Location?"
                   footer={<><Btn variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Btn><Btn variant="red" onClick={confirmDelete}>Remove Location</Btn></>}>
                <div style={{ textAlign:"center", padding:"8px 0" }}>
                    <div style={{ width:60, height:60, background:"var(--red-bg)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>🗑️</div>
                    <div style={{ fontSize:14, color:"var(--text)", marginBottom:6 }}>Remove this shelter from the system?</div>
                    <div style={{ fontSize:16, fontWeight:900, color:"var(--red)", marginBottom:16 }}>{deleteTarget?.name}</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.6 }}>It will no longer appear on the map or in reports.<br/>This action cannot be undone.</div>
                </div>
            </Modal>

            {/* Toast */}
            {toastMsg && (
                <div style={{ position:"fixed", bottom:20, right:20,
                    background: toastMsg.isError ? "var(--red)" : "var(--green)",
                    color:"#fff", borderRadius:12, padding:"13px 20px",
                    fontSize:13, fontWeight:700, boxShadow:"0 4px 20px rgba(0,0,0,.15)",
                    zIndex:999, display:"flex", alignItems:"center", gap:8, animation:"fadeUp .3s ease" }}>
                    {toastMsg.isError ? "⚠️" : "✅"} {toastMsg.msg}
                </div>
            )}
        </>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── ROOT EXPORT — top-level section switcher ─────────────────────────────────
//
//  The sidebar item previously labelled "Add Locations" was confusing because:
//    • It sounded like adding pins on a map (that's Map View's job)
//    • It mixed IoT hardware management with shelter management
//
//  Solution: rename the sidebar item to "Locations & Nodes" (or two separate
//  sidebar items), and inside this page show two clear section buttons so the
//  user immediately knows which manager they are opening.
// ══════════════════════════════════════════════════════════════════════════════
export default function AddLocation() {
    // "section" controls which manager the user is looking at
    const [section, setSection] = useState("iot"); // "iot" | "safe"

    return (
        <>
            <style>{globalCSS}{extraCSS}</style>

            {/* ── TOP SECTION SWITCHER — makes purpose immediately obvious ── */}
            <div style={{
                background: "var(--surface)",
                borderRadius: 16,
                margin: "0 0 14px",
                padding: "14px 22px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
                borderBottom: "3px solid var(--bg)",
            }}>

                {/* IoT toggle */}
                <button
                    className="section-toggle-btn"
                    onClick={() => setSection("iot")}
                    style={{
                        background: section === "iot" ? "var(--primary)" : "var(--surface-alt)",
                        color:      section === "iot" ? "#fff"    : "var(--text-mid)",
                        borderColor:section === "iot" ? "var(--primary)" : "var(--border)",
                    }}
                >
                    📡 IoT Sensor Nodes &amp; Gateways
                </button>

                {/* divider */}
                <span style={{ color:"var(--border)", fontSize:18 }}>|</span>

                {/* Safe Locations toggle */}
                <button
                    className="section-toggle-btn"
                    onClick={() => setSection("safe")}
                    style={{
                        background: section === "safe" ? "var(--green)"  : "var(--surface-alt)",
                        color:      section === "safe" ? "#fff"   : "var(--text-mid)",
                        borderColor:section === "safe" ? "var(--green)"  : "var(--border)",
                    }}
                >
                    🏠 Safe Locations &amp; Shelters
                </button>

                {/* Contextual hint */}
                <div style={{ marginLeft:"auto", fontSize:11, color:"var(--text-muted)", maxWidth:220, lineHeight:1.5 }}>
                    {section === "iot"
                        ? "Register ESP32 sensor nodes, assign gateways, set flood thresholds"
                        : "Register evacuation shelters, manage capacity &amp; availability status"}
                </div>
            </div>

            {/* ── Render the selected manager ── */}
            {section === "iot"  && <IoTNodeManager     />}
            {section === "safe" && <SafeLocationManager />}
        </>
    );
}
