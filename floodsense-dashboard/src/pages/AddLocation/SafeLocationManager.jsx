// ─── SafeLocationManager.jsx ──────────────────────────────────────────────────
//  Manages evacuation shelters / safe zones.
//  Tabs: Register Safe Location | Manage Locations
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Card, Badge, TabBar, FormGroup, Btn } from "../../shared.jsx";
import {
    DISTRICTS, SAFE_LOCATION_TYPES, LOCATION_STATUS_OPTIONS, iconForType,
    SectionLabel, Modal, StatPill, IconBtn,
    inp, sel, g2,
} from "../../shared/addLocationHelpers.jsx";

// ─── SafeLocationManager ──────────────────────────────────────────────────────
export default function SafeLocationManager() {
    const [activeTab, setActiveTab]       = useState("register");
    const [locations, setLocations]       = useState([]);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toastMsg, setToastMsg]         = useState(null);
    const [searchQ, setSearchQ]           = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [editTarget, setEditTarget]     = useState(null);

    // Register form state
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

    // Edit form state
    const [eName,    setEName]    = useState("");
    const [eType,    setEType]    = useState("");
    const [eCap,     setECap]     = useState("");
    const [eContact, setEContact] = useState("");
    const [eNotes,   setENotes]   = useState("");
    const [eStatus,  setEStatus]  = useState("available");

    // ── Helpers ──
    const toast = (msg, isError = false) => {
        setToastMsg({ msg, isError });
        setTimeout(() => setToastMsg(null), 2800);
    };

    const clearForm = () => {
        setFName(""); setFType(""); setFDistrict(""); setFAddress("");
        setFLat(""); setFLng(""); setFCap(""); setFContact(""); setFNotes("");
        setFStatus("available");
    };

    const registerLocation = () => {
        if (!fName || !fType || !fDistrict || !fLat || !fLng || !fCap) {
            toast("Fill all required fields (*)", true); return;
        }
        const loc = {
            id:       "sl-" + Date.now(),
            name:     fName, type:     fType,
            district: fDistrict, address: fAddress,
            lat:      parseFloat(fLat), lng: parseFloat(fLng),
            capacity: parseInt(fCap),   contact: fContact,
            notes:    fNotes,           status:  fStatus,
            addedAt:  new Date().toLocaleString(),
            icon:     iconForType(fType),
        };
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
        setLocations(prev => prev.filter(l => l.id !== deleteTarget.id));
        toast("Location removed");
        setDeleteTarget(null);
    };

    // ── Derived ──
    const filtered    = locations.filter(l => {
        const q = searchQ.toLowerCase();
        return (l.name.toLowerCase().includes(q) || l.district.toLowerCase().includes(q))
            && (statusFilter ? l.status === statusFilter : true);
    });
    const available   = locations.filter(l => l.status === "available").length;
    const full        = locations.filter(l => l.status === "full").length;
    const totalCap    = locations.reduce((s, l) => s + (l.capacity || 0), 0);

    const TABS = [
        { id:"register", label:"Register Safe Location" },
        { id:"manage",   label:"Manage Locations"       },
    ];

    // ── Render ──
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
                    <StatPill label="Total"     value={locations.length} accent="var(--text)"    />
                    {/*<StatPill label="Available" value={available}        accent="var(--green)"   />*/}
                    {/*<StatPill label="Full"      value={full}             accent="var(--red)"     />*/}
                    {/*<StatPill label="Capacity"  value={totalCap}         accent="var(--primary)" />*/}
                </div>
            </div>

            <div style={{ display:"flex", gap:12 }}>

                {/* ── Left: Tabs ── */}
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
                                        <input style={inp} value={fName} onChange={e=>setFName(e.target.value)} placeholder="e.g. Rathnapura Municipal School" />
                                    </FormGroup>
                                    <FormGroup label="Shelter Type *">
                                        <select style={sel} value={fType} onChange={e=>setFType(e.target.value)}>
                                            <option value="">Select type…</option>
                                            {SAFE_LOCATION_TYPES.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </FormGroup>
                                </div>
                                <div style={g2}>
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
                                <SectionLabel step="3" label="Capacity & Contact" />
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

                            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
                                <Btn variant="outline" onClick={clearForm}>Clear Form</Btn>
                                <Btn variant="primary" onClick={registerLocation}>Register Safe Location</Btn>
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
                                    <Btn variant="primary" onClick={() => setActiveTab("register")} style={{ fontSize:12, padding:"8px 16px" }}>+ New Location</Btn>
                                </div>
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

            </div>

            {/* ── Edit Modal ── */}
            <Modal show={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name}`}
                   footer={<><Btn variant="outline" onClick={() => setEditTarget(null)}>Cancel</Btn><Btn variant="primary" onClick={saveEdit}>Save Changes</Btn></>}>
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

            {/* ── Delete Modal ── */}
            <Modal show={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Safe Location?"
                   footer={<><Btn variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Btn><Btn variant="red" onClick={confirmDelete}>Remove Location</Btn></>}>
                <div style={{ textAlign:"center", padding:"8px 0" }}>
                    <div style={{ width:60, height:60, background:"var(--red-bg)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>🗑️</div>
                    <div style={{ fontSize:14, color:"var(--text)", marginBottom:6 }}>Remove this shelter from the system?</div>
                    <div style={{ fontSize:16, fontWeight:900, color:"var(--red)", marginBottom:16 }}>{deleteTarget?.name}</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.6 }}>It will no longer appear on the map or in reports.<br/>This action cannot be undone.</div>
                </div>
            </Modal>

            {/* ── Toast ── */}
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
