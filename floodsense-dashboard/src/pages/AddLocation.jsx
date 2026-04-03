// ─── AddLocation.jsx ──────────────────────────────────────────────────────────
import React, { useState ,useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap  } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { C, Card, Badge, Btn, Input, Select, FormGroup, globalCSS, TabBar, SriLankaMap, Toast } from "../shared.jsx";
import { createLocation, updateLocation, deleteLocation, getAllLocations} from "../api/services/locationService.js";
import {fetchAreas} from "../api/services/alertService.js";
import {Edit2, Trash2, UserPlus} from "lucide-react";

export default function AddLocation() {
    const [tab, setTab]         = useState("sensor");
    const [confirm, setConfirm] = useState(null);
    const [toast, setToast]     = useState(null);

    const [locationName, setLocationName] = useState("");
    const [locationType, setLocationType] = useState("");
    const [address, setAddress] = useState("");
    const [safeLat, setSafeLat] = useState(6.9);
    const [safeLng, setSafeLng] = useState(80.5);
    const [safePosition, setSafePosition] = useState([6.9, 80.5]);

    const [district, setDistrict] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    // ─── STATE ADDITIONS (add these alongside your existing state) ───────────────
    const [showSafeZoneModal, setShowSafeZoneModal] = useState(false);
    const [editingZone, setEditingZone] = useState(null); // null = add mode, object = edit mode
    const [confirmDelete, setConfirmDelete] = useState(null); // zone object to delete
    const [locationList, setLocationList] = useState([]);
    const [loadingZones, setLoadingZones] = useState(true);
    const [areas, setAreas] = useState([]);
    const [filterDistrict, setFilterDistrict] = useState("");


// For storing validation errors from API
    const [errors, setErrors] = useState({});

    const tabs = [
        { id: "sensor",   label: "Add Sensor Location" },
        { id: "manage",   label: "Manage Safe Zones" },
        { id: "verify",   label: "Verify on Map" },
    ];

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    // const sensors = [
    //     { name:"Ratnapura-A2",  imei:"865213859621", district:"Ratnapura", coords:"6.68°N 80.40°E", pct:87, color:C.red,    status:"active", badge:"ACTIVE" },
    //     { name:"Kalutara-B1",   imei:"865213859548", district:"Kalutara",  coords:"6.58°N 80.00°E", pct:74, color:C.red,    status:"active", badge:"ACTIVE" },
    //     { name:"Colombo-West",  imei:"865213859302", district:"Colombo",   coords:"6.93°N 79.85°E", pct:55, color:C.orange, status:"warn",   badge:"WEAK SIG" },
    //     { name:"Kandy-Central", imei:"865213859410", district:"Kandy",     coords:"7.29°N 80.63°E", pct:38, color:C.yellow, status:"active", badge:"ACTIVE" },
    //     { name:"Jaffna-North",  imei:"865213859110", district:"Jaffna",    coords:"9.66°N 80.02°E", pct:12, color:C.green,  status:"active", badge:"ACTIVE" },
    // ];
    //
    // const safeZones = [
    //     { name:"Ratnapura Central School",  type:"School",   district:"Ratnapura", cap:240, occ:0,  status:"active", badge:"AVAILABLE" },
    //     { name:"Kalutara District Ground",  type:"Ground",   district:"Kalutara",  cap:500, occ:0,  status:"active", badge:"AVAILABLE" },
    //     { name:"Colombo National Hospital", type:"Hospital", district:"Colombo",   cap:120, occ:72, status:"warn",   badge:"PARTIAL" },
    //     { name:"Galle Fort Community Hall", type:"Hall",     district:"Galle",     cap:180, occ:0,  status:"active", badge:"AVAILABLE" },
    // ];

    const fieldStyle = { display: "grid", gap: 14, marginBottom: 14 };
    const actBtn = (danger) => ({ padding: "4px 9px", borderRadius: 7, border: `1.5px solid ${danger ? "#ffd5cc" : C.border}`, background: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", color: danger ? C.red : C.dark });

    const [lat, setLat] = useState(6.8234);
    const [lng, setLng] = useState(80.4012);
    const [position, setPosition] = useState([6.8234, 80.4012]);

    useEffect(() => {
        if (!isNaN(lat) && !isNaN(lng)) {
            setPosition([parseFloat(lat), parseFloat(lng)]);
        }
    }, [lat, lng]);

    const ChangeView = ({ center }) => {
        const map = useMap();
        map.setView(center, 10);
        return null;
    };

    const searchAddress = async () => {
        if (!address) return;

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${address}`
            );
            const data = await res.json();

            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);

                setSafeLat(lat);
                setSafeLng(lng);
                setSafePosition([lat, lng]);
            } else {
                alert("Location not found");
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!isNaN(safeLat) && !isNaN(safeLng)) {
            setSafePosition([parseFloat(safeLat), parseFloat(safeLng)]);
        }
    }, [safeLat, safeLng]);

    const [mapFilter, setMapFilter] = useState("All");

    const allsensors = [
        { name:"Ratnapura-A2", lat:6.68, lng:80.40, status:"active" },
        { name:"Kalutara-B1", lat:6.58, lng:80.00, status:"active" },
    ];

    const allsafeZones = [
        { name:"Ratnapura School", lat:6.70, lng:80.41 },
        { name:"Kalutara Ground", lat:6.59, lng:79.99 },
    ];


    const resetForm = () => {
        setLocationName("");
        setLocationType("");
        setAddress("");
        setDistrict("");
        setSafeLat(6.9);
        setSafeLng(80.5);
        setContactPerson("");
        setContactNumber("");
        setErrors({});
    };

    // ─── MODAL OVERLAY STYLE ────────────────────────────────────────────────────
    const modalOverlay = {
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
    };
    const modalBox = {
        background: "#fff", borderRadius: 14, boxShadow: "0 8px 48px rgba(0,0,0,0.18)",
        width: "100%", maxWidth: 860, maxHeight: "92vh", overflowY: "auto",
        padding: 28, position: "relative",
    };

// ─── OPEN HANDLERS ──────────────────────────────────────────────────────────
    const openAddModal = () => {
        resetForm();          // your existing resetForm
        setEditingZone(null);
        setShowSafeZoneModal(true);
    };

    const openEditModal = (zone) => {
        setLocationName(zone.location_name);
        setLocationType(zone.location_type);
        setAddress(zone.address || "");
        setDistrict(zone.district || "");
        setSafeLat(zone.latitude || "");
        setSafeLng(zone.longitude || "");
        setContactPerson(zone.contact_person || "");
        setContactNumber(zone.contact_number || "");
        setEditingZone(zone);
        setShowSafeZoneModal(true);
    };

// ─── SUBMIT HANDLER (handles both add & edit) ────────────────────────────────
    const handleModalSubmit = async () => {
        const payload = {
            location_name: locationName,
            location_type: locationType,
            address,
            district,
            latitude: parseFloat(safeLat),
            longitude: parseFloat(safeLng),
            contact_person: contactPerson,
            contact_number: contactNumber
        }
        try {
            if (editingZone) {
                await updateLocation(editingZone.id, payload);
            } else {
                await createLocation(payload);
            }
            setShowSafeZoneModal(false);
            resetForm();
            await fetchZones();
        } catch (err) {
            console.error(err);
        }
    };

    // Fetch
    const fetchZones = async () => {
        try {
            setLoadingZones(true);
            const res = await getAllLocations();
            setLocationList(res.data);
        } catch (err) {
            console.error("Failed to fetch locations:", err);
        } finally {
            setLoadingZones(false);
        }
    };

    const getAllAreas  = async () => {
        try {
            const res = await fetchAreas(); // your API function
            setAreas(res.data.data);        // response is res.data.data because of the {status, data} wrapper
        } catch (err) {
            console.error("Failed to fetch areas:", err);
        }
    };


    useEffect(() => {
        fetchZones();
        getAllAreas ();
    }, []);


// ─── DELETE HANDLER ──────────────────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        try {
            await deleteLocation(confirmDelete.id);
            setConfirmDelete(null);
            await fetchZones();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };




    return (
        <>
            <style>{globalCSS}</style>
            <div style={{ minHeight: "100vh", background: C.bg }}>
                <div style={{ display: "flex", margin: "12px 14px 14px" }}>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: "calc(100vh - 110px)", paddingRight: 2 }}>

                        {/* Page header */}
                        <div className="fadeUp" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -.4 }}>Add Location</div>
                                <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>Register sensor locations, safe zones and verify placements on map</div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                            {[["Total Sensors","5",C.dark],["Safe Zones","12",C.green],["Pending Verify","2",C.orange],["Inactive","1","#aaa"]].map(([l,v,c],i) => (
                                <Card key={i} style={{ padding: "13px 16px" }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: .4, color: "#aaa", marginBottom: 5 }}>{l}</div>
                                    <div style={{ fontSize: 22, fontWeight: 900, color: c }}>{v}</div>
                                </Card>
                            ))}
                        </div>

                        <TabBar tabs={tabs} active={tab} onChange={setTab} />

                        {/* ── ADD SENSOR ── */}
                        {tab === "sensor" && (
                            <div className="fadeUp" style={{ display: "flex", gap: 14 }}>
                                <Card style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Register New Sensor</div>
                                    <div style={{ fontSize: 12, color: "#aaa", marginBottom: 18 }}>Enter sensor details and confirm placement on the map</div>

                                    <div style={{ ...fieldStyle, gridTemplateColumns: "1fr 1fr" }}>
                                        <FormGroup label="Sensor IMEI Number *" hint="15-digit IMEI from device label"><Input placeholder="e.g. 865213859621"/></FormGroup>
                                        <FormGroup label="Sensor Model"><Select><option>FloodSense v2 Pro</option><option>FloodSense v1 Standard</option><option>FloodSense v3 Ultra</option></Select></FormGroup>
                                    </div>
                                    <div style={{ ...fieldStyle, gridTemplateColumns: "1fr 1fr" }}>
                                        <FormGroup label="Area / Location Name *"><Input placeholder="e.g. Ratnapura-A2"/></FormGroup>
                                        <FormGroup label="District *"><Select value={district} onChange={(e) => setDistrict(e.target.value)}></Select></FormGroup>
                                    </div>
                                    <div style={{ ...fieldStyle, gridTemplateColumns: "1fr 1fr" }}>
                                        <FormGroup label="River / Water Body"><Input placeholder="e.g. Kalu Ganga"/></FormGroup>
                                        <FormGroup label="Sensor Type"><Select><option>Water Level + Rainfall</option><option>Water Level Only</option><option>Rainfall Only</option></Select></FormGroup>
                                    </div>
                                    <div style={{...fieldStyle, gridTemplateColumns: "1fr 1fr"}}>
                                        <div style={{...fieldStyle, gridTemplateColumns: "1fr 1fr"}}>
                                            <FormGroup label="GPS Latitude *">
                                                <Input
                                                    placeholder="e.g. 6.6828"
                                                    type="number"
                                                    value={lat}
                                                    onChange={(e) => setLat(e.target.value)}
                                                />
                                            </FormGroup>

                                            <FormGroup label="GPS Longitude *">
                                                <Input
                                                    placeholder="e.g. 80.3992"
                                                    type="number"
                                                    value={lng}
                                                    onChange={(e) => setLng(e.target.value)}

                                                />
                                            </FormGroup>
                                        </div>
                                    </div>
                                    <div style={{...fieldStyle, gridTemplateColumns: "1fr 1fr 1fr"}}>
                                        <FormGroup label="Warning Threshold (m)"><Input placeholder="e.g. 4.0"
                                                                                        type="number"/></FormGroup>
                                        <FormGroup label="Critical Threshold (m)"><Input placeholder="e.g. 5.2"
                                                                                         type="number"/></FormGroup>
                                        <FormGroup label="Sensor Height (m)"><Input placeholder="e.g. 6.0"
                                                                                    type="number"/></FormGroup>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                                        <Btn variant="outline">Clear Form</Btn>
                                        <Btn onClick={() => showToast("Sensor registered successfully!")}>Register Sensor</Btn>
                                    </div>
                                </Card>

                                {/* Map + Signal */}
                                <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 12 }}>
                                    <Card style={{ padding: 0, overflow: "hidden" }}>
                                        <div style={{
                                            padding: "12px 14px",
                                            borderBottom: `1px solid ${C.border}`,
                                            fontSize: 13,
                                            fontWeight: 700
                                        }}>
                                            📍 Pin on Map
                                        </div>

                                        {/* REAL MAP */}
                                        <div style={{ height: 260 }}>
                                            <MapContainer
                                                center={position}
                                                zoom={10}
                                                style={{ height: "100%", width: "100%" }}
                                            >
                                                <TileLayer
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />

                                                <ChangeView center={position} />

                                                <Marker position={position}>
                                                    <Popup>{lat}, {lng}</Popup>
                                                </Marker>
                                            </MapContainer>
                                        </div>

                                        {/* Show coordinates */}
                                        <div style={{
                                            padding: "8px 14px",
                                            fontSize: 11,
                                            fontFamily: "DM Mono",
                                            color: C.mid
                                        }}>
                                            {lat}°N , {lng}°E
                                        </div>

                                    </Card>
                                    <Card style={{ padding: "14px 16px" }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: .4, marginBottom: 10 }}>Signal Check</div>
                                        {[["📶","Signal Strength",78,C.green],["🔋","Battery Level",92,C.green]].map(([icon,label,pct,c],i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i === 0 ? 10 : 0 }}>
                                                <span style={{ fontSize: 18 }}>{icon}</span>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{label}</div>
                                                    <div style={{ background: "#f0f0f0", height: 6, borderRadius: 3 }}><div style={{ width: `${pct}%`, background: c, height: "100%", borderRadius: 3 }}/></div>
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 800, color: c }}>{pct}%</span>
                                            </div>
                                        ))}
                                        <div style={{ marginTop: 10, padding: "8px 10px", background: C.greenBg, borderRadius: 8, fontSize: 11, color: C.green, fontWeight: 600 }}>Location suitable for sensor deployment</div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* ── ADD SAFE ZONE ── */}
                        {/*{tab === "safezone" && (*/}
                        {/*    <div className="fadeUp" style={{ display: "flex", gap: 14 }}>*/}
                        {/*        <Card style={{ flex: 1 }}>*/}
                        {/*            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Register Safe Zone</div>*/}
                        {/*            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 18 }}>Add an evacuation shelter or community safe location</div>*/}

                        {/*            <div style={{ ...fieldStyle, gridTemplateColumns: "1fr 1fr" }}>*/}
                        {/*                <FormGroup label="Location Name *"><Input*/}
                        {/*                    value={locationName}*/}
                        {/*                    onChange={(e) => setLocationName(e.target.value)}*/}
                        {/*                />*/}
                        {/*                    {errors.location_name && <div style={{color:"red"}}>{errors.location_name[0]}</div>}</FormGroup>*/}
                        {/*                <FormGroup label="Location Type *"><Select value={locationType} onChange={(e) => setLocationType(e.target.value)}>*/}
                        {/*                    <option value="">Select Type</option>*/}
                        {/*                    <option value="School">School / Education</option>*/}
                        {/*                    <option value="Community Hall">Community Hall</option>*/}
                        {/*                    <option value="Hospital">Hospital</option>*/}
                        {/*                </Select></FormGroup>*/}
                        {/*            </div>*/}
                        {/*            <div style={{ marginBottom: 14 }}>*/}
                        {/*                <FormGroup label="Full Address *">*/}
                        {/*                    <Input*/}
                        {/*                        placeholder="Street address, city, district…"*/}
                        {/*                        value={address}*/}
                        {/*                        onChange={(e) => setAddress(e.target.value)}*/}
                        {/*                    />*/}
                        {/*                </FormGroup>*/}

                        {/*                <Btn*/}
                        {/*                    style={{ marginBottom: 14 }}*/}
                        {/*                    onClick={searchAddress}*/}
                        {/*                >*/}
                        {/*                    Find Location*/}
                        {/*                </Btn>*/}
                        {/*            </div>*/}
                        {/*            <div style={{ ...fieldStyle, gridTemplateColumns: "1fr 1fr" }}>*/}
                        {/*                <FormGroup label="District *">*/}
                        {/*                    <Select*/}
                        {/*                        value={district}*/}
                        {/*                        onChange={(e) => setDistrict(e.target.value)}*/}
                        {/*                    >*/}
                        {/*                        <option value="">Select District</option>*/}
                        {/*                        <option value="Ratnapura">Ratnapura</option>*/}
                        {/*                        <option value="Kalutara">Kalutara</option>*/}
                        {/*                        <option value="Colombo">Colombo</option>*/}
                        {/*                        <option value="Galle">Galle</option>*/}
                        {/*                        <option value="Kandy">Kandy</option>*/}
                        {/*                    </Select>*/}

                        {/*                    {errors.district && (*/}
                        {/*                        <div style={{ color: "red" }}>{errors.district[0]}</div>*/}
                        {/*                    )}*/}
                        {/*                </FormGroup>*/}
                        {/*                <FormGroup label="Province"><Select><option>Sabaragamuwa Province</option><option>Western Province</option><option>Southern Province</option><option>Central Province</option></Select></FormGroup>*/}
                        {/*            </div>*/}
                        {/*            <div style={{...fieldStyle, gridTemplateColumns: "1fr 1fr 1fr"}}>*/}

                        {/*                <FormGroup label="GPS Latitude *">*/}
                        {/*                    <Input*/}
                        {/*                        placeholder="e.g. 6.6828"*/}
                        {/*                        type="number"*/}
                        {/*                        value={safeLat}*/}
                        {/*                        onChange={(e) => setSafeLat(e.target.value)}*/}
                        {/*                    />*/}
                        {/*                </FormGroup>*/}

                        {/*                <FormGroup label="GPS Longitude *">*/}
                        {/*                    <Input*/}
                        {/*                        placeholder="e.g. 80.3992"*/}
                        {/*                        type="number"*/}
                        {/*                        value={safeLng}*/}
                        {/*                        onChange={(e) => setSafeLng(e.target.value)}*/}
                        {/*                    />*/}
                        {/*                </FormGroup>*/}

                        {/*                <FormGroup label="Elevation (m)">*/}
                        {/*                    <Input*/}
                        {/*                        placeholder="e.g. 42"*/}
                        {/*                        type="number"*/}
                        {/*                    />*/}
                        {/*                </FormGroup>*/}

                        {/*            </div>*/}
                        {/*            <div style={{...fieldStyle, gridTemplateColumns: "1fr 1fr 1fr"}}>*/}
                        {/*                <FormGroup label="Max Capacity *" hint="Total people capacity"><Input*/}
                        {/*                    placeholder="e.g. 240" type="number"/></FormGroup>*/}
                        {/*                <FormGroup label="Contact Person"><Input*/}
                        {/*                    value={contactPerson}*/}
                        {/*                    onChange={(e) => setContactPerson(e.target.value)}*/}
                        {/*                /></FormGroup>*/}
                        {/*                <FormGroup label="Contact Number"><Input*/}
                        {/*                    value={contactNumber}*/}
                        {/*                    onChange={(e) => setContactNumber(e.target.value)}*/}
                        {/*                /></FormGroup>*/}
                        {/*            </div>*/}

                        {/*            /!*<div style={{marginBottom: 14}}>*!/*/}
                        {/*            /!*    <div style={{fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Available Facilities</div>*!/*/}
                        {/*            /!*    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>*!/*/}
                        {/*            /!*        {[["Water Supply",true],["Food Storage",true],["Generator",true],["Medical Unit",false],["Sanitation",true],["Disabled Access",false]].map(([f,sel],i) => (*!/*/}
                        {/*            /!*            <div key={i} style={{ padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${sel ? C.dark : C.border}`, background: sel ? C.dark : "#fff", color: sel ? "#fff" : C.mid, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{f}</div>*!/*/}
                        {/*            /!*        ))}*!/*/}
                        {/*            /!*    </div>*!/*/}
                        {/*            /!*</div>*!/*/}

                        {/*            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>*/}
                        {/*                <Btn variant="outline" onClick={resetForm}>*/}
                        {/*                    Clear Form*/}
                        {/*                </Btn>*/}
                        {/*                <Btn variant="green" onClick={handleModalSubmit}>*/}
                        {/*                    Register Safe Zone*/}
                        {/*                </Btn>                                   </div>*/}
                        {/*        </Card>*/}

                        {/*        /!* Map + Assessment *!/*/}
                        {/*        <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 12 }}>*/}
                        {/*            <Card style={{ padding: 0, overflow: "hidden" }}>*/}
                        {/*                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700 }}>📍 Pin Safe Zone</div>*/}
                        {/*                <div style={{ background: "#e8f4ee", position: "relative" }}>*/}
                        {/*                    <div style={{height: 260}}>*/}
                        {/*                        <MapContainer*/}
                        {/*                            center={safePosition}*/}
                        {/*                            zoom={12}*/}
                        {/*                            style={{height: "100%", width: "100%"}}*/}
                        {/*                        >*/}
                        {/*                            <TileLayer*/}
                        {/*                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>*/}

                        {/*                            <ChangeView center={safePosition}/>*/}

                        {/*                            <Marker position={safePosition}>*/}
                        {/*                                <Popup>{address || `${safeLat}, ${safeLng}`}</Popup>*/}
                        {/*                            </Marker>*/}
                        {/*                        </MapContainer>*/}
                        {/*                    </div>*/}
                        {/*                    <div style={{*/}
                        {/*                        position: "absolute",*/}
                        {/*                        bottom: 10,*/}
                        {/*                        left: 10,*/}
                        {/*                        background: "rgba(26,26,26,.85)",*/}
                        {/*                        color: "#fff",*/}
                        {/*                        borderRadius: 7,*/}
                        {/*                        padding: "5px 10px",*/}
                        {/*                        fontSize: 11,*/}
                        {/*                        fontFamily: "DM Mono"*/}
                        {/*                    }}>6.9014°N 80.5122°E*/}
                        {/*                    </div>*/}
                        {/*                </div>*/}
                        {/*            </Card>*/}
                        {/*            <Card style={{padding: "14px 16px"}}>*/}
                        {/*                <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: .4, marginBottom: 10 }}>Location Assessment</div>*/}
                        {/*                {[["Elevation above flood zone","+12m ✅",C.green],["Distance to nearest flood zone","2.4km ✅",C.green],["Road access in flood event","Available ✅",C.green],["Historical flood record","None ✅",C.green]].map(([k,v,c],i) => (*/}
                        {/*                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: i < 3 ? `1px solid #fafafa` : "none" }}>*/}
                        {/*                        <span style={{ color: C.mid }}>{k}</span>*/}
                        {/*                        <span style={{ fontWeight: 700, color: c }}>{v}</span>*/}
                        {/*                    </div>*/}
                        {/*                ))}*/}
                        {/*                <div style={{ marginTop: 10, padding: "8px 10px", background: C.greenBg, borderRadius: 8, fontSize: 11, color: C.green, fontWeight: 600 }}>Location approved as safe zone</div>*/}
                        {/*            </Card>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*)}*/}


                        {/* ── MANAGE LOCATIONS TAB ── */}
                        {tab === "manage" && (
                            <div className="fadeUp" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {/* Filter bar */}
                                <div style={{ display: "flex", gap: 10 }}>
                                    <Input placeholder="Search locations…" style={{ flex: 1 }}/>
                                    <Select
                                        style={{ width: 160 }}
                                        value={filterDistrict}
                                        onChange={(e) => setFilterDistrict(e.target.value)}
                                    >
                                        <option value="">All Districts</option>
                                        {areas.map((area) => (
                                            <option key={area.id} value={area.name}>
                                                {area.name}
                                            </option>
                                        ))}
                                    </Select>
                                    <Select style={{ width: 140 }}><option>All Status</option><option>Active</option><option>Inactive</option><option>Pending</option></Select>
                                </div>

                                {/* Safe zones table */}
                                {/* Safe zones table */}
                                <Card style={{ padding: 0, overflow: "hidden" }}>
                                    <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>
                                            Safe Zone Locations <span style={{ fontSize: 12, color: "#aaa", fontWeight: 400 }}>({locationList.length} total)</span>
                                        </div>
                                        {/*<Btn variant="green" style={{ fontSize: 12, padding: "6px 14px" }} onClick={openAddModal}>*/}
                                        {/*    + Add Safe Zone*/}
                                        {/*</Btn>*/}
                                        <Btn variant="green" onClick={openAddModal} style={styles.addBtn}>
                                            <UserPlus size={18} /> + Add Safe Zone
                                        </Btn>
                                    </div>

                                    {loadingZones ? (
                                        <div style={{ padding: 32, textAlign: "center", color: "#aaa", fontSize: 13 }}>Loading locations…</div>
                                    ) : locationList.length === 0 ? (
                                        <div style={{ padding: 32, textAlign: "center", color: "#aaa", fontSize: 13 }}>No safe zones registered yet.</div>
                                    ) : (
                                        <table>
                                            <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Type</th>
                                                <th>District</th>
                                                <th>Capacity</th>
                                                <th>Contact Person</th>
                                                <th>Contact Number</th>
                                                <th>Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {locationList.map((z) => (
                                                <tr key={z.id}>
                                                    <td>
                                                        <div style={{ fontWeight: 700, fontSize: 13 }}>{z.location_name}</div>
                                                        <div style={{ fontSize: 11, color: "#aaa" }}>{z.address}</div>
                                                    </td>
                                                    <td>{z.location_type}</td>
                                                    <td>{z.district}</td>
                                                    <td>
                        <span style={{ fontWeight: 700 }}>
                            {z.max_capacity ?? <span style={{ color: "#ccc" }}>—</span>}
                        </span>
                                                    </td>
                                                    <td>{z.contact_person ?? <span style={{ color: "#ccc" }}>—</span>}</td>
                                                    <td>{z.contact_number ?? <span style={{ color: "#ccc" }}>—</span>}</td>
                                                    <td>
                                                        <div style={{ display: "flex", gap: 5 }}>
                                                            <button style={styles.actionBtn} onClick={() => openEditModal(z)}><Edit2 size={16} /></button>
                                                            <button style={styles.deleteBtn} onClick={() => setConfirmDelete(z)}><Trash2 size={16} /></button>
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

                        {/* ══════════════════════════════════════════
    ADD / EDIT SAFE ZONE MODAL
══════════════════════════════════════════ */}
                        {showSafeZoneModal && (
                            <div style={modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setShowSafeZoneModal(false); }}>
                                <div style={modalBox}>
                                    {/* Header */}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                                        <div>
                                            <div style={{ fontSize: 16, fontWeight: 800 }}>
                                                {editingZone ? "Edit Safe Zone" : "Register Safe Zone"}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                                                {editingZone ? `Editing: ${editingZone.name}` : "Add an evacuation shelter or community safe location"}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowSafeZoneModal(false)}
                                            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa", lineHeight: 1, padding: 4 }}
                                        >✕</button>
                                    </div>

                                    {/* Body — same layout as your safezone tab */}
                                    <div style={{ display: "flex", gap: 14 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ ...fieldStyle, gridTemplateColumns: "1fr 1fr" }}>
                                                <FormGroup label="Location Name *">
                                                    <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} />
                                                    {errors.location_name && <div style={{ color: "red" }}>{errors.location_name[0]}</div>}
                                                </FormGroup>
                                                <FormGroup label="Location Type *">
                                                    <Select value={locationType} onChange={(e) => setLocationType(e.target.value)}>
                                                        <option value="">Select Type</option>
                                                        <option value="School">School / Education</option>
                                                        <option value="Community Hall">Community Hall</option>
                                                        <option value="Hospital">Hospital</option>
                                                    </Select>
                                                </FormGroup>
                                            </div>

                                            <div style={{ marginBottom: 14 }}>
                                                <FormGroup label="Full Address *">
                                                    <Input placeholder="Street address, city, district…" value={address} onChange={(e) => setAddress(e.target.value)} />
                                                </FormGroup>
                                                <Btn style={{ marginBottom: 14 }} onClick={searchAddress}>Find Location</Btn>
                                            </div>

                                            <div style={{ ...fieldStyle, gridTemplateColumns: "1fr 1fr" }}>
                                                <FormGroup label="District *">
                                                    <Select value={district} onChange={(e) => setDistrict(e.target.value)}>
                                                        <option value="">Select District</option>
                                                        <option value="Ratnapura">Ratnapura</option>
                                                        <option value="Kalutara">Kalutara</option>
                                                        <option value="Colombo">Colombo</option>
                                                        <option value="Galle">Galle</option>
                                                        <option value="Kandy">Kandy</option>
                                                    </Select>
                                                    {errors.district && <div style={{ color: "red" }}>{errors.district[0]}</div>}
                                                </FormGroup>
                                                <FormGroup label="Province">
                                                    <Select>
                                                        <option>Sabaragamuwa Province</option>
                                                        <option>Western Province</option>
                                                        <option>Southern Province</option>
                                                        <option>Central Province</option>
                                                    </Select>
                                                </FormGroup>
                                            </div>

                                            <div style={{ ...fieldStyle, gridTemplateColumns: "1fr 1fr 1fr" }}>
                                                <FormGroup label="GPS Latitude *">
                                                    <Input placeholder="e.g. 6.6828" type="number" value={safeLat} onChange={(e) => setSafeLat(e.target.value)} disabled={true} style={{ color:"#aaa"}}/>
                                                </FormGroup>
                                                <FormGroup label="GPS Longitude *">
                                                    <Input placeholder="e.g. 80.3992" type="number" value={safeLng} onChange={(e) => setSafeLng(e.target.value)} disabled={true} style={{  color:"#aaa"}}/>
                                                </FormGroup>
                                                <FormGroup label="Elevation (m)">
                                                    <Input placeholder="e.g. 42" type="number" />
                                                </FormGroup>
                                            </div>

                                            <div style={{ ...fieldStyle, gridTemplateColumns: "1fr 1fr 1fr" }}>
                                                <FormGroup label="Max Capacity *" hint="Total people capacity">
                                                    <Input placeholder="e.g. 240" type="number" />
                                                </FormGroup>
                                                <FormGroup label="Contact Person">
                                                    <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
                                                </FormGroup>
                                                <FormGroup label="Contact Number">
                                                    <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                                                </FormGroup>
                                            </div>

                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                                                <Btn variant="outline" onClick={() => setShowSafeZoneModal(false)}>Cancel</Btn>
                                                <Btn variant="outline" onClick={resetForm}>Clear Form</Btn>
                                                <Btn variant="green" onClick={handleModalSubmit}>
                                                    {editingZone ? "Save Changes" : "Register Safe Zone"}
                                                </Btn>
                                            </div>
                                        </div>

                                        {/* Map + Assessment sidebar */}
                                        <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
                                            <Card style={{ padding: 0, overflow: "hidden" }}>
                                                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700 }}>📍 Pin Safe Zone</div>
                                                <div style={{ background: "#e8f4ee", position: "relative" }}>
                                                    <div style={{ height: 220 }}>
                                                        <MapContainer center={safePosition} zoom={12} style={{ height: "100%", width: "100%" }}>
                                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                            <ChangeView center={safePosition} />
                                                            <Marker position={safePosition}>
                                                                <Popup>{address || `${safeLat}, ${safeLng}`}</Popup>
                                                            </Marker>
                                                        </MapContainer>
                                                    </div>
                                                    <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(26,26,26,.85)", color: "#fff", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontFamily: "DM Mono" }}>
                                                        {safeLat || "6.9014"}°N {safeLng || "80.5122"}°E
                                                    </div>
                                                </div>
                                            </Card>
                                            <Card style={{ padding: "14px 16px" }}>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: .4, marginBottom: 10 }}>Location Assessment</div>
                                                {[
                                                    ["Elevation above flood zone", "+12m ✅", C.green],
                                                    ["Distance to nearest flood zone", "2.4km ✅", C.green],
                                                    ["Road access in flood event", "Available ✅", C.green],
                                                    ["Historical flood record", "None ✅", C.green],
                                                ].map(([k, v, c], i) => (
                                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: i < 3 ? `1px solid #fafafa` : "none" }}>
                                                        <span style={{ color: C.mid }}>{k}</span>
                                                        <span style={{ fontWeight: 700, color: c }}>{v}</span>
                                                    </div>
                                                ))}
                                                <div style={{ marginTop: 10, padding: "8px 10px", background: C.greenBg, borderRadius: 8, fontSize: 11, color: C.green, fontWeight: 600 }}>
                                                    Location approved as safe zone
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══════════════════════════════════════════
    DELETE CONFIRMATION MODAL
══════════════════════════════════════════ */}
                        {confirmDelete && (
                            <div style={modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
                                <div style={{ ...modalBox, maxWidth: 420, textAlign: "center" }}>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
                                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Delete Safe Zone?</div>
                                    <div style={{ fontSize: 13, color: C.mid, marginBottom: 24 }}>
                                        Are you sure you want to delete <strong>{confirmDelete.name}</strong>?<br />
                                        This action cannot be undone.
                                    </div>
                                    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                                        <Btn variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Btn>
                                        <Btn
                                            style={{ background: "#ef4444", color: "#fff", border: "none" }}
                                            onClick={handleDeleteConfirm}
                                        >
                                            Yes, Delete
                                        </Btn>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── VERIFY ON MAP ── */}
                        {tab === "verify" && (
                            <div className="fadeUp" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                                <Card style={{ padding: 0, overflow: "hidden" }}>

                                    {/* Header */}
                                    <div style={{
                                        padding: "14px 16px",
                                        borderBottom: `1px solid ${C.border}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between"
                                    }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 800 }}>
                                                Location Map
                                            </div>
                                            <div style={{ fontSize: 11, color: C.mid }}>
                                                View and filter all sensors and safe zones
                                            </div>
                                        </div>

                                        {/* Filter Buttons */}
                                        <div style={{ display: "flex", gap: 6 }}>
                                            {["All", "Sensors", "Safe Zones"].map(l => (
                                                <button
                                                    key={l}
                                                    onClick={() => setMapFilter(l)}
                                                    style={{
                                                        padding: "6px 12px",
                                                        borderRadius: 8,
                                                        border: `1px solid ${mapFilter === l ? C.dark : C.border}`,
                                                        background: mapFilter === l ? C.dark : "#fff",
                                                        color: mapFilter === l ? "#fff" : C.mid,
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        cursor: "pointer",
                                                        transition: "0.2s"
                                                    }}
                                                >
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Map */}
                                    <div style={{ height: 450 }}>
                                        <MapContainer
                                            center={[6.8, 80.4]}
                                            zoom={9}
                                            style={{ height: "100%", width: "100%" }}
                                        >
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                                            {/* Sensors */}
                                            {(mapFilter === "All" || mapFilter === "Sensors") &&
                                                allsensors.map((s, i) => (
                                                    <Marker key={`s-${i}`} position={[s.lat, s.lng]}>
                                                        <Popup>{s.name}</Popup>
                                                    </Marker>
                                                ))
                                            }

                                            {/* Safe Zones */}
                                            {(mapFilter === "All" || mapFilter === "Safe Zones") &&
                                                allsafeZones.map((z, i) => (
                                                    <Marker key={`z-${i}`} position={[z.lat, z.lng]}>
                                                        <Popup>{z.name}</Popup>
                                                    </Marker>
                                                ))
                                            }
                                        </MapContainer>
                                    </div>

                                    {/* Footer Info */}
                                    <div style={{
                                        padding: "10px 14px",
                                        borderTop: `1px solid ${C.border}`,
                                        fontSize: 11,
                                        color: C.mid,
                                        display: "flex",
                                        justifyContent: "space-between"
                                    }}>
                                        <span>Sensors: {allsensors.length}</span>
                                        <span>Safe Zones: {allsafeZones.length}</span>
                                        <span>Total: {allsensors.length + allsafeZones.length}</span>
                                    </div>

                                </Card>

                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Delete Confirm Dialog */}
            {confirm && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setConfirm(null)}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 380, boxShadow: "0 8px 40px rgba(0,0,0,.2)" }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>🗑</div>
                        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Remove Location?</div>
                        <div style={{ fontSize: 13, color: C.mid, lineHeight: 1.6, marginBottom: 20 }}>Are you sure you want to remove <strong>{confirm}</strong>? All associated data will be permanently deleted.</div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <Btn variant="outline" style={{ flex: 1 }} onClick={() => setConfirm(null)}>Cancel</Btn>
                            <Btn variant="red" style={{ flex: 1 }} onClick={() => { setConfirm(null); showToast("Location removed successfully."); }}>🗑 Remove</Btn>
                        </div>
                    </div>
                </div>
            )}

            <Toast message={toast} />
        </>
    );
}


const styles = {
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '25px' },
    title: { fontSize: '24px', fontWeight: '900', color: '#1a1a1a', marginBottom: '4px' },
    subtitle: { fontSize: '14px', color: '#666' },
    addBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' },
    statCard: { padding: '15px 20px', border: '1px solid #eee', borderRadius: '12px' },
    statLabel: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', marginBottom: '4px' },
    statValue: { fontSize: '24px', fontWeight: '900' },
    avatar: { width: '36px', height: '36px', borderRadius: '10px', background: '#1a1a1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' },
    iconText: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444' },
    actionBtn: { border: 'none', background: '#f0f0f0', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#444' },
    deleteBtn: { border: 'none', background: '#fff0ee', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#cc2200' },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
    },
    modal: { background: '#fff', width: '95%', maxWidth: '550px', padding: '30px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10000 },
    errorText: { color: "#cc2200", fontSize: "11px", fontWeight: "700", marginTop: "4px", display: "block", animation: "fadeUp 0.2s ease" },
};
