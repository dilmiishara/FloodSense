// ─── AddLocation.jsx ──────────────────────────────────────────────────────────
import { useState ,useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap  } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { C, Card, Badge, Btn, Input, Select, FormGroup, globalCSS, TabBar, SriLankaMap, Toast } from "../shared.jsx";
import { createLocation } from "../api/services/locationService.js";

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

// For storing validation errors from API
    const [errors, setErrors] = useState({});

    const tabs = [
        { id: "sensor",   label: "Add Sensor Location" },
        { id: "safezone", label: "Add Safe Zone" },
        { id: "manage",   label: "Manage Locations" },
        { id: "verify",   label: "Verify on Map" },
    ];

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const sensors = [
        { name:"Ratnapura-A2",  imei:"865213859621", district:"Ratnapura", coords:"6.68°N 80.40°E", pct:87, color:C.red,    status:"active", badge:"ACTIVE" },
        { name:"Kalutara-B1",   imei:"865213859548", district:"Kalutara",  coords:"6.58°N 80.00°E", pct:74, color:C.red,    status:"active", badge:"ACTIVE" },
        { name:"Colombo-West",  imei:"865213859302", district:"Colombo",   coords:"6.93°N 79.85°E", pct:55, color:C.orange, status:"warn",   badge:"WEAK SIG" },
        { name:"Kandy-Central", imei:"865213859410", district:"Kandy",     coords:"7.29°N 80.63°E", pct:38, color:C.yellow, status:"active", badge:"ACTIVE" },
        { name:"Jaffna-North",  imei:"865213859110", district:"Jaffna",    coords:"9.66°N 80.02°E", pct:12, color:C.green,  status:"active", badge:"ACTIVE" },
    ];

    const safeZones = [
        { name:"Ratnapura Central School",  type:"School",   district:"Ratnapura", cap:240, occ:0,  status:"active", badge:"AVAILABLE" },
        { name:"Kalutara District Ground",  type:"Ground",   district:"Kalutara",  cap:500, occ:0,  status:"active", badge:"AVAILABLE" },
        { name:"Colombo National Hospital", type:"Hospital", district:"Colombo",   cap:120, occ:72, status:"warn",   badge:"PARTIAL" },
        { name:"Galle Fort Community Hall", type:"Hall",     district:"Galle",     cap:180, occ:0,  status:"active", badge:"AVAILABLE" },
    ];

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

    // ─── AddLocation.jsx ──────────────────────────────────────────────────────────
    import { useState ,useEffect } from "react";
    import { MapContainer, TileLayer, Marker, Popup, useMap  } from "react-leaflet";
    import "leaflet/dist/leaflet.css";
    import { C, Card, Badge, Btn, Input, Select, FormGroup, globalCSS, TabBar, SriLankaMap, Toast } from "../shared.jsx";
    import { createLocation } from "../api/services/locationService.js";

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

// For storing validation errors from API
        const [errors, setErrors] = useState({});

        const tabs = [
            { id: "sensor",   label: "Add Sensor Location" },
            { id: "safezone", label: "Add Safe Zone" },
            { id: "manage",   label: "Manage Locations" },
            { id: "verify",   label: "Verify on Map" },
        ];

        const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

        const sensors = [
            { name:"Ratnapura-A2",  imei:"865213859621", district:"Ratnapura", coords:"6.68°N 80.40°E", pct:87, color:C.red,    status:"active", badge:"ACTIVE" },
            { name:"Kalutara-B1",   imei:"865213859548", district:"Kalutara",  coords:"6.58°N 80.00°E", pct:74, color:C.red,    status:"active", badge:"ACTIVE" },
            { name:"Colombo-West",  imei:"865213859302", district:"Colombo",   coords:"6.93°N 79.85°E", pct:55, color:C.orange, status:"warn",   badge:"WEAK SIG" },
            { name:"Kandy-Central", imei:"865213859410", district:"Kandy",     coords:"7.29°N 80.63°E", pct:38, color:C.yellow, status:"active", badge:"ACTIVE" },
            { name:"Jaffna-North",  imei:"865213859110", district:"Jaffna",    coords:"9.66°N 80.02°E", pct:12, color:C.green,  status:"active", badge:"ACTIVE" },
        ];

        const safeZones = [
            { name:"Ratnapura Central School",  type:"School",   district:"Ratnapura", cap:240, occ:0,  status:"active", badge:"AVAILABLE" },
            { name:"Kalutara District Ground",  type:"Ground",   district:"Kalutara",  cap:500, occ:0,  status:"active", badge:"AVAILABLE" },
            { name:"Colombo National Hospital", type:"Hospital", district:"Colombo",   cap:120, occ:72, status:"warn",   badge:"PARTIAL" },
            { name:"Galle Fort Community Hall", type:"Hall",     district:"Galle",     cap:180, occ:0,  status:"active", badge:"AVAILABLE" },
        ];

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

        const handleSubmit = async () => {
            setErrors({});

            const payload = {
                location_name: locationName,
                location_type: locationType,
                address,
                district,
                latitude: parseFloat(safeLat),
                longitude: parseFloat(safeLng),
                contact_person: contactPerson,
                contact_number: contactNumber
            };

            console.log("Payload:", payload); // keep this for debugging

            try {
                await createLocation(payload);

                showToast("Safe zone registered successfully!");
            } catch (error) {
                console.log("API Error:", error.response?.data);
                if (error.response?.status === 422) {
                    setErrors(error.response.data.errors);
                } else {
                    console.error(error);
                    showToast("Server error");
                }
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
                            {tab === "safezone" && (
                                <div className="fadeUp" style={{ display: "flex", gap: 14 }}>
                                    <Card style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Register Safe Zone</div>
                                        <div style={{ fontSize: 12, color: "#aaa", marginBottom: 18 }}>Add an evacuation shelter or community safe location</div>

                                        <div style={{ ...fieldStyle, gridTemplateColumns: "1fr 1fr" }}>
                                            <FormGroup label="Location Name *"><Input
                                                value={locationName}
                                                onChange={(e) => setLocationName(e.target.value)}
                                            />
                                                {errors.location_name && <div style={{color:"red"}}>{errors.location_name[0]}</div>}</FormGroup>
                                            <FormGroup label="Location Type *"><Select value={locationType} onChange={(e) => setLocationType(e.target.value)}>
                                                <option value="">Select Type</option>
                                                <option value="School">School / Education</option>
                                                <option value="Community Hall">Community Hall</option>
                                                <option value="Hospital">Hospital</option>
                                            </Select></FormGroup>
                                        </div>
                                        <div style={{ marginBottom: 14 }}>
                                            <FormGroup label="Full Address *">
                                                <Input
                                                    placeholder="Street address, city, district…"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                />
                                            </FormGroup>

                                            <Btn
                                                style={{ marginBottom: 14 }}
                                                onClick={searchAddress}
                                            >
                                                Find Location
                                            </Btn>
                                        </div>
                                        <div style={{ ...fieldStyle, gridTemplateColumns: "1fr 1fr" }}>
                                            <FormGroup label="District *">
                                                <Select
                                                    value={district}
                                                    onChange={(e) => setDistrict(e.target.value)}
                                                >
                                                    <option value="">Select District</option>
                                                    <option value="Ratnapura">Ratnapura</option>
                                                    <option value="Kalutara">Kalutara</option>
                                                    <option value="Colombo">Colombo</option>
                                                    <option value="Galle">Galle</option>
                                                    <option value="Kandy">Kandy</option>
                                                </Select>

                                                {errors.district && (
                                                    <div style={{ color: "red" }}>{errors.district[0]}</div>
                                                )}
                                            </FormGroup>
                                            <FormGroup label="Province"><Select><option>Sabaragamuwa Province</option><option>Western Province</option><option>Southern Province</option><option>Central Province</option></Select></FormGroup>
                                        </div>
                                        <div style={{...fieldStyle, gridTemplateColumns: "1fr 1fr 1fr"}}>

                                            <FormGroup label="GPS Latitude *">
                                                <Input
                                                    placeholder="e.g. 6.6828"
                                                    type="number"
                                                    value={safeLat}
                                                    onChange={(e) => setSafeLat(e.target.value)}
                                                />
                                            </FormGroup>

                                            <FormGroup label="GPS Longitude *">
                                                <Input
                                                    placeholder="e.g. 80.3992"
                                                    type="number"
                                                    value={safeLng}
                                                    onChange={(e) => setSafeLng(e.target.value)}
                                                />
                                            </FormGroup>

                                            <FormGroup label="Elevation (m)">
                                                <Input
                                                    placeholder="e.g. 42"
                                                    type="number"
                                                />
                                            </FormGroup>

                                        </div>
                                        <div style={{...fieldStyle, gridTemplateColumns: "1fr 1fr 1fr"}}>
                                            <FormGroup label="Max Capacity *" hint="Total people capacity"><Input
                                                placeholder="e.g. 240" type="number"/></FormGroup>
                                            <FormGroup label="Contact Person"><Input
                                                value={contactPerson}
                                                onChange={(e) => setContactPerson(e.target.value)}
                                            /></FormGroup>
                                            <FormGroup label="Contact Number"><Input
                                                value={contactNumber}
                                                onChange={(e) => setContactNumber(e.target.value)}
                                            /></FormGroup>
                                        </div>

                                        {/*<div style={{marginBottom: 14}}>*/}
                                        {/*    <div style={{fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Available Facilities</div>*/}
                                        {/*    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>*/}
                                        {/*        {[["Water Supply",true],["Food Storage",true],["Generator",true],["Medical Unit",false],["Sanitation",true],["Disabled Access",false]].map(([f,sel],i) => (*/}
                                        {/*            <div key={i} style={{ padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${sel ? C.dark : C.border}`, background: sel ? C.dark : "#fff", color: sel ? "#fff" : C.mid, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{f}</div>*/}
                                        {/*        ))}*/}
                                        {/*    </div>*/}
                                        {/*</div>*/}

                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                                            <Btn variant="outline" onClick={resetForm}>
                                                Clear Form
                                            </Btn>
                                            <Btn variant="green" onClick={handleSubmit}>
                                                Register Safe Zone
                                            </Btn>                                   </div>
                                    </Card>

                                    {/* Map + Assessment */}
                                    <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 12 }}>
                                        <Card style={{ padding: 0, overflow: "hidden" }}>
                                            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700 }}>📍 Pin Safe Zone</div>
                                            <div style={{ background: "#e8f4ee", position: "relative" }}>
                                                <div style={{height: 260}}>
                                                    <MapContainer
                                                        center={safePosition}
                                                        zoom={12}
                                                        style={{height: "100%", width: "100%"}}
                                                    >
                                                        <TileLayer
                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

                                                        <ChangeView center={safePosition}/>

                                                        <Marker position={safePosition}>
                                                            <Popup>{address || `${safeLat}, ${safeLng}`}</Popup>
                                                        </Marker>
                                                    </MapContainer>
                                                </div>
                                                <div style={{
                                                    position: "absolute",
                                                    bottom: 10,
                                                    left: 10,
                                                    background: "rgba(26,26,26,.85)",
                                                    color: "#fff",
                                                    borderRadius: 7,
                                                    padding: "5px 10px",
                                                    fontSize: 11,
                                                    fontFamily: "DM Mono"
                                                }}>6.9014°N 80.5122°E
                                                </div>
                                            </div>
                                        </Card>
                                        <Card style={{padding: "14px 16px"}}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: .4, marginBottom: 10 }}>Location Assessment</div>
                                            {[["Elevation above flood zone","+12m ✅",C.green],["Distance to nearest flood zone","2.4km ✅",C.green],["Road access in flood event","Available ✅",C.green],["Historical flood record","None ✅",C.green]].map(([k,v,c],i) => (
                                                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: i < 3 ? `1px solid #fafafa` : "none" }}>
                                                    <span style={{ color: C.mid }}>{k}</span>
                                                    <span style={{ fontWeight: 700, color: c }}>{v}</span>
                                                </div>
                                            ))}
                                            <div style={{ marginTop: 10, padding: "8px 10px", background: C.greenBg, borderRadius: 8, fontSize: 11, color: C.green, fontWeight: 600 }}>Location approved as safe zone</div>
                                        </Card>
                                    </div>
                                </div>
                            )}

                            {/* ── MANAGE LOCATIONS ── */}
                            {tab === "manage" && (
                                <div className="fadeUp" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {/* Filter bar */}
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <Input placeholder="Search locations…" style={{ flex: 1 }}/>
                                        <Select style={{ width: 160 }}><option>All Types</option><option>Sensors</option><option>Safe Zones</option></Select>
                                        <Select style={{ width: 160 }}><option>All Districts</option><option>Ratnapura</option><option>Kalutara</option><option>Colombo</option></Select>
                                        <Select style={{ width: 140 }}><option>All Status</option><option>Active</option><option>Inactive</option><option>Pending</option></Select>
                                    </div>

                                    {/* Sensors table */}
                                    <Card style={{ padding: 0, overflow: "hidden" }}>
                                        <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ fontSize: 13, fontWeight: 700 }}>Sensor Locations <span style={{ fontSize: 12, color: "#aaa", fontWeight: 400 }}>(5 total)</span></div>
                                            <Btn style={{ fontSize: 12, padding: "6px 14px" }}>+ Add Sensor</Btn>
                                        </div>
                                        <table>
                                            <thead><tr><th>Location</th><th>IMEI</th><th>District</th><th>Coordinates</th><th>Water Lv</th><th>Status</th><th>Actions</th></tr></thead>
                                            <tbody>
                                            {sensors.map((s, i) => (
                                                <tr key={i}>
                                                    <td><div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div><div style={{ fontSize: 11, color: C.mid }}>FloodSense v2</div></td>
                                                    <td style={{ fontFamily: "DM Mono", fontSize: 11, color: C.mid }}>{s.imei}</td>
                                                    <td>{s.district}</td>
                                                    <td style={{ fontFamily: "DM Mono", fontSize: 11, color: C.mid }}>{s.coords}</td>
                                                    <td><span style={{ fontWeight: 800, color: s.color }}>{s.pct}%</span></td>
                                                    <td><Badge type={s.status}>{s.badge}</Badge></td>
                                                    <td>
                                                        <div style={{ display: "flex", gap: 5 }}>
                                                            <button style={actBtn(false)}>✏ Edit</button>
                                                            <button style={actBtn(false)}>🗺 View</button>
                                                            <button onClick={() => setConfirm(s.name)} style={actBtn(true)}>🗑</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </Card>

                                    {/* Safe zones table */}
                                    <Card style={{ padding: 0, overflow: "hidden" }}>
                                        <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ fontSize: 13, fontWeight: 700 }}>Safe Zone Locations <span style={{ fontSize: 12, color: "#aaa", fontWeight: 400 }}>(12 total)</span></div>
                                            <Btn variant="green" style={{ fontSize: 12, padding: "6px 14px" }}>+ Add Safe Zone</Btn>
                                        </div>
                                        <table>
                                            <thead><tr><th>Name</th><th>Type</th><th>District</th><th>Capacity</th><th>Occupancy</th><th>Status</th><th>Actions</th></tr></thead>
                                            <tbody>
                                            {safeZones.map((z, i) => (
                                                <tr key={i}>
                                                    <td><div style={{ fontWeight: 700, fontSize: 13 }}>{z.name}</div></td>
                                                    <td>{z.type}</td>
                                                    <td>{z.district}</td>
                                                    <td><span style={{ fontWeight: 700 }}>{z.cap}</span></td>
                                                    <td><span style={{ fontWeight: 700, color: z.occ > 0 ? C.orange : C.green }}>{Math.round((z.occ / z.cap) * 100)}%</span></td>
                                                    <td><Badge type={z.status}>{z.badge}</Badge></td>
                                                    <td>
                                                        <div style={{ display: "flex", gap: 5 }}>
                                                            <button style={actBtn(false)}>✏ Edit</button>
                                                            <button onClick={() => setConfirm(z.name)} style={actBtn(true)}>🗑</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </Card>
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
                        {tab === "safezone" && (
                            <div className="fadeUp" style={{ display: "flex", gap: 14 }}>
                                <Card style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Register Safe Zone</div>
                                    <div style={{ fontSize: 12, color: "#aaa", marginBottom: 18 }}>Add an evacuation shelter or community safe location</div>

                                    <div style={{ ...fieldStyle, gridTemplateColumns: "1fr 1fr" }}>
                                        <FormGroup label="Location Name *"><Input
                                            value={locationName}
                                            onChange={(e) => setLocationName(e.target.value)}
                                        />
                                            {errors.location_name && <div style={{color:"red"}}>{errors.location_name[0]}</div>}</FormGroup>
                                        <FormGroup label="Location Type *"><Select value={locationType} onChange={(e) => setLocationType(e.target.value)}>
                                            <option value="">Select Type</option>
                                            <option value="School">School / Education</option>
                                            <option value="Community Hall">Community Hall</option>
                                            <option value="Hospital">Hospital</option>
                                        </Select></FormGroup>
                                    </div>
                                    <div style={{ marginBottom: 14 }}>
                                        <FormGroup label="Full Address *">
                                            <Input
                                                placeholder="Street address, city, district…"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                        </FormGroup>

                                        <Btn
                                            style={{ marginBottom: 14 }}
                                            onClick={searchAddress}
                                        >
                                            Find Location
                                        </Btn>
                                    </div>
                                    <div style={{ ...fieldStyle, gridTemplateColumns: "1fr 1fr" }}>
                                        <FormGroup label="District *">
                                            <Select
                                                value={district}
                                                onChange={(e) => setDistrict(e.target.value)}
                                            >
                                                <option value="">Select District</option>
                                                <option value="Ratnapura">Ratnapura</option>
                                                <option value="Kalutara">Kalutara</option>
                                                <option value="Colombo">Colombo</option>
                                                <option value="Galle">Galle</option>
                                                <option value="Kandy">Kandy</option>
                                            </Select>

                                            {errors.district && (
                                                <div style={{ color: "red" }}>{errors.district[0]}</div>
                                            )}
                                        </FormGroup>
                                        <FormGroup label="Province"><Select><option>Sabaragamuwa Province</option><option>Western Province</option><option>Southern Province</option><option>Central Province</option></Select></FormGroup>
                                    </div>
                                    <div style={{...fieldStyle, gridTemplateColumns: "1fr 1fr 1fr"}}>

                                        <FormGroup label="GPS Latitude *">
                                            <Input
                                                placeholder="e.g. 6.6828"
                                                type="number"
                                                value={safeLat}
                                                onChange={(e) => setSafeLat(e.target.value)}
                                            />
                                        </FormGroup>

                                        <FormGroup label="GPS Longitude *">
                                            <Input
                                                placeholder="e.g. 80.3992"
                                                type="number"
                                                value={safeLng}
                                                onChange={(e) => setSafeLng(e.target.value)}
                                            />
                                        </FormGroup>

                                        <FormGroup label="Elevation (m)">
                                            <Input
                                                placeholder="e.g. 42"
                                                type="number"
                                            />
                                        </FormGroup>

                                    </div>
                                    <div style={{...fieldStyle, gridTemplateColumns: "1fr 1fr 1fr"}}>
                                        <FormGroup label="Max Capacity *" hint="Total people capacity"><Input
                                            placeholder="e.g. 240" type="number"/></FormGroup>
                                        <FormGroup label="Contact Person"><Input
                                            value={contactPerson}
                                            onChange={(e) => setContactPerson(e.target.value)}
                                        /></FormGroup>
                                        <FormGroup label="Contact Number"><Input
                                            value={contactNumber}
                                            onChange={(e) => setContactNumber(e.target.value)}
                                        /></FormGroup>
                                    </div>

                                    {/*<div style={{marginBottom: 14}}>*/}
                                    {/*    <div style={{fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Available Facilities</div>*/}
                                    {/*    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>*/}
                                    {/*        {[["Water Supply",true],["Food Storage",true],["Generator",true],["Medical Unit",false],["Sanitation",true],["Disabled Access",false]].map(([f,sel],i) => (*/}
                                    {/*            <div key={i} style={{ padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${sel ? C.dark : C.border}`, background: sel ? C.dark : "#fff", color: sel ? "#fff" : C.mid, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{f}</div>*/}
                                    {/*        ))}*/}
                                    {/*    </div>*/}
                                    {/*</div>*/}

                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                                        <Btn variant="outline" onClick={resetForm}>
                                            Clear Form
                                        </Btn>
                                        <Btn variant="green" onClick={handleSubmit}>
                                            Register Safe Zone
                                        </Btn>                                   </div>
                                </Card>

                                {/* Map + Assessment */}
                                <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 12 }}>
                                    <Card style={{ padding: 0, overflow: "hidden" }}>
                                        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700 }}>📍 Pin Safe Zone</div>
                                        <div style={{ background: "#e8f4ee", position: "relative" }}>
                                            <div style={{height: 260}}>
                                                <MapContainer
                                                    center={safePosition}
                                                    zoom={12}
                                                    style={{height: "100%", width: "100%"}}
                                                >
                                                    <TileLayer
                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

                                                    <ChangeView center={safePosition}/>

                                                    <Marker position={safePosition}>
                                                        <Popup>{address || `${safeLat}, ${safeLng}`}</Popup>
                                                    </Marker>
                                                </MapContainer>
                                            </div>
                                            <div style={{
                                                position: "absolute",
                                                bottom: 10,
                                                left: 10,
                                                background: "rgba(26,26,26,.85)",
                                                color: "#fff",
                                                borderRadius: 7,
                                                padding: "5px 10px",
                                                fontSize: 11,
                                                fontFamily: "DM Mono"
                                            }}>6.9014°N 80.5122°E
                                            </div>
                                        </div>
                                    </Card>
                                    <Card style={{padding: "14px 16px"}}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: .4, marginBottom: 10 }}>Location Assessment</div>
                                        {[["Elevation above flood zone","+12m ✅",C.green],["Distance to nearest flood zone","2.4km ✅",C.green],["Road access in flood event","Available ✅",C.green],["Historical flood record","None ✅",C.green]].map(([k,v,c],i) => (
                                            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: i < 3 ? `1px solid #fafafa` : "none" }}>
                                                <span style={{ color: C.mid }}>{k}</span>
                                                <span style={{ fontWeight: 700, color: c }}>{v}</span>
                                            </div>
                                        ))}
                                        <div style={{ marginTop: 10, padding: "8px 10px", background: C.greenBg, borderRadius: 8, fontSize: 11, color: C.green, fontWeight: 600 }}>Location approved as safe zone</div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* ── MANAGE LOCATIONS ── */}
                        {tab === "manage" && (
                            <div className="fadeUp" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {/* Filter bar */}
                                <div style={{ display: "flex", gap: 10 }}>
                                    <Input placeholder="Search locations…" style={{ flex: 1 }}/>
                                    <Select style={{ width: 160 }}><option>All Types</option><option>Sensors</option><option>Safe Zones</option></Select>
                                    <Select style={{ width: 160 }}><option>All Districts</option><option>Ratnapura</option><option>Kalutara</option><option>Colombo</option></Select>
                                    <Select style={{ width: 140 }}><option>All Status</option><option>Active</option><option>Inactive</option><option>Pending</option></Select>
                                </div>

                                {/* Sensors table */}
                                <Card style={{ padding: 0, overflow: "hidden" }}>
                                    <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>Sensor Locations <span style={{ fontSize: 12, color: "#aaa", fontWeight: 400 }}>(5 total)</span></div>
                                        <Btn style={{ fontSize: 12, padding: "6px 14px" }}>+ Add Sensor</Btn>
                                    </div>
                                    <table>
                                        <thead><tr><th>Location</th><th>IMEI</th><th>District</th><th>Coordinates</th><th>Water Lv</th><th>Status</th><th>Actions</th></tr></thead>
                                        <tbody>
                                        {sensors.map((s, i) => (
                                            <tr key={i}>
                                                <td><div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div><div style={{ fontSize: 11, color: C.mid }}>FloodSense v2</div></td>
                                                <td style={{ fontFamily: "DM Mono", fontSize: 11, color: C.mid }}>{s.imei}</td>
                                                <td>{s.district}</td>
                                                <td style={{ fontFamily: "DM Mono", fontSize: 11, color: C.mid }}>{s.coords}</td>
                                                <td><span style={{ fontWeight: 800, color: s.color }}>{s.pct}%</span></td>
                                                <td><Badge type={s.status}>{s.badge}</Badge></td>
                                                <td>
                                                    <div style={{ display: "flex", gap: 5 }}>
                                                        <button style={actBtn(false)}>✏ Edit</button>
                                                        <button style={actBtn(false)}>🗺 View</button>
                                                        <button onClick={() => setConfirm(s.name)} style={actBtn(true)}>🗑</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </Card>

                                {/* Safe zones table */}
                                <Card style={{ padding: 0, overflow: "hidden" }}>
                                    <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>Safe Zone Locations <span style={{ fontSize: 12, color: "#aaa", fontWeight: 400 }}>(12 total)</span></div>
                                        <Btn variant="green" style={{ fontSize: 12, padding: "6px 14px" }}>+ Add Safe Zone</Btn>
                                    </div>
                                    <table>
                                        <thead><tr><th>Name</th><th>Type</th><th>District</th><th>Capacity</th><th>Occupancy</th><th>Status</th><th>Actions</th></tr></thead>
                                        <tbody>
                                        {safeZones.map((z, i) => (
                                            <tr key={i}>
                                                <td><div style={{ fontWeight: 700, fontSize: 13 }}>{z.name}</div></td>
                                                <td>{z.type}</td>
                                                <td>{z.district}</td>
                                                <td><span style={{ fontWeight: 700 }}>{z.cap}</span></td>
                                                <td><span style={{ fontWeight: 700, color: z.occ > 0 ? C.orange : C.green }}>{Math.round((z.occ / z.cap) * 100)}%</span></td>
                                                <td><Badge type={z.status}>{z.badge}</Badge></td>
                                                <td>
                                                    <div style={{ display: "flex", gap: 5 }}>
                                                        <button style={actBtn(false)}>✏ Edit</button>
                                                        <button onClick={() => setConfirm(z.name)} style={actBtn(true)}>🗑</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </Card>
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