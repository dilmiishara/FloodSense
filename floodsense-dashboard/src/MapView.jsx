// ─── MapView.jsx ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { C, Card, Badge, Btn, globalCSS, Header, Sidebar, TabBar } from "./shared";

// Sri Lanka Map Component with interactive features
const SriLankaMap = ({ mode }) => {
    const canvasRef = useRef(null);

    // Sri Lanka districts with their coordinates (simplified SVG-like positions)
    const districts = {
        "Colombo": { x: 35, y: 48, risk: "high", sensors: ["Colombo-West"], waterLevel: "2.1m" },
        "Gampaha": { x: 32, y: 42, risk: "high", sensors: [], waterLevel: "1.8m" },
        "Kalutara": { x: 35, y: 58, risk: "critical", sensors: ["Kalutara-B1"], waterLevel: "3.9m" },
        "Kandy": { x: 55, y: 35, risk: "medium", sensors: ["Kandy-Central"], waterLevel: "1.8m" },
        "Matale": { x: 58, y: 28, risk: "medium", sensors: [], waterLevel: "1.2m" },
        "Nuwara Eliya": { x: 62, y: 42, risk: "low", sensors: [], waterLevel: "0.5m" },
        "Galle": { x: 48, y: 68, risk: "high", sensors: [], waterLevel: "2.3m" },
        "Matara": { x: 55, y: 72, risk: "medium", sensors: [], waterLevel: "1.4m" },
        "Hambantota": { x: 68, y: 75, risk: "low", sensors: [], waterLevel: "0.7m" },
        "Jaffna": { x: 62, y: 5, risk: "safe", sensors: ["Jaffna-North"], waterLevel: "0.6m" },
        "Kilinochchi": { x: 58, y: 12, risk: "safe", sensors: [], waterLevel: "0.3m" },
        "Mannar": { x: 45, y: 18, risk: "low", sensors: [], waterLevel: "0.8m" },
        "Vavuniya": { x: 55, y: 20, risk: "low", sensors: [], waterLevel: "0.9m" },
        "Mullaitivu": { x: 68, y: 15, risk: "safe", sensors: [], waterLevel: "0.4m" },
        "Batticaloa": { x: 82, y: 45, risk: "medium", sensors: [], waterLevel: "1.3m" },
        "Ampara": { x: 78, y: 58, risk: "low", sensors: [], waterLevel: "0.9m" },
        "Trincomalee": { x: 75, y: 28, risk: "medium", sensors: [], waterLevel: "1.1m" },
        "Kurunegala": { x: 48, y: 32, risk: "medium", sensors: [], waterLevel: "1.2m" },
        "Puttalam": { x: 38, y: 28, risk: "low", sensors: [], waterLevel: "0.8m" },
        "Anuradhapura": { x: 58, y: 18, risk: "low", sensors: [], waterLevel: "0.6m" },
        "Polonnaruwa": { x: 70, y: 22, risk: "low", sensors: [], waterLevel: "0.7m" },
        "Badulla": { x: 72, y: 48, risk: "medium", sensors: [], waterLevel: "1.2m" },
        "Monaragala": { x: 75, y: 65, risk: "low", sensors: [], waterLevel: "0.8m" },
        "Ratnapura": { x: 52, y: 52, risk: "critical", sensors: ["Ratnapura-A2"], waterLevel: "4.8m" },
        "Kegalle": { x: 48, y: 42, risk: "high", sensors: [], waterLevel: "2.0m" }
    };

    const safeLocations = [
        { x: 52, y: 52, name: "Ratnapura School", capacity: 240, status: "active" },
        { x: 48, y: 68, name: "Galle Fort Hall", capacity: 180, status: "active" },
        { x: 35, y: 48, name: "Colombo Hospital", capacity: 120, status: "warn" },
        { x: 55, y: 35, name: "Kandy Comm. Centre", capacity: 350, status: "active" },
        { x: 62, y: 5, name: "Jaffna University", capacity: 400, status: "active" }
    ];

    const getColorByRisk = (risk, mode) => {
        if (mode === "heatmap") {
            const heatmapColors = {
                critical: "#ff0000",
                high: "#ff6b6b",
                medium: "#ffb347",
                low: "#ffff99",
                safe: "#90ee90"
            };
            return heatmapColors[risk] || "#cccccc";
        }

        const riskColors = {
            critical: "#ff4444",
            high: "#ff8800",
            medium: "#ffcc00",
            low: "#ffffaa",
            safe: "#aaffaa"
        };
        return riskColors[risk] || "#cccccc";
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background (water)
        ctx.fillStyle = "#e3f2fd";
        ctx.fillRect(0, 0, width, height);

        // Draw Sri Lanka outline (simplified)
        ctx.beginPath();
        ctx.moveTo(20, 10);
        ctx.lineTo(85, 8);
        ctx.lineTo(88, 25);
        ctx.lineTo(90, 40);
        ctx.lineTo(85, 55);
        ctx.lineTo(75, 70);
        ctx.lineTo(60, 78);
        ctx.lineTo(45, 75);
        ctx.lineTo(30, 68);
        ctx.lineTo(18, 55);
        ctx.lineTo(15, 40);
        ctx.lineTo(18, 25);
        ctx.closePath();
        ctx.fillStyle = "#f4f4f4";
        ctx.fill();
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw districts based on mode
        Object.entries(districts).forEach(([name, district]) => {
            let fillColor;
            let shouldDraw = true;

            switch(mode) {
                case "sensor":
                    fillColor = getColorByRisk(district.risk, "normal");
                    break;
                case "affected":
                    fillColor = getColorByRisk(district.risk, "normal");
                    break;
                case "heatmap":
                    fillColor = getColorByRisk(district.risk, "heatmap");
                    break;
                case "safe":
                    fillColor = "#e0e0e0";
                    break;
                default:
                    fillColor = "#f4f4f4";
            }

            if (shouldDraw) {
                ctx.beginPath();
                ctx.arc(district.x, district.y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = fillColor;
                ctx.fill();
                ctx.strokeStyle = "#666";
                ctx.lineWidth = 0.5;
                ctx.stroke();

                // Draw district names
                ctx.font = "bold 8px Arial";
                ctx.fillStyle = "#333";
                ctx.fillText(name, district.x - 12, district.y - 4);

                // Draw water level for affected areas
                if (mode === "affected" && district.waterLevel) {
                    ctx.font = "7px Arial";
                    ctx.fillStyle = "#0066cc";
                    ctx.fillText(district.waterLevel, district.x - 8, district.y + 8);
                }
            }
        });

        // Draw sensor locations
        if (mode === "sensor") {
            const sensors = [
                { x: 52, y: 52, name: "Ratnapura-A2", value: 87, color: "#ff4444" },
                { x: 35, y: 58, name: "Kalutara-B1", value: 74, color: "#ff4444" },
                { x: 35, y: 48, name: "Colombo-West", value: 55, color: "#ff8800" },
                { x: 55, y: 35, name: "Kandy-Central", value: 38, color: "#ffcc00" },
                { x: 62, y: 5, name: "Jaffna-North", value: 12, color: "#aaffaa" }
            ];

            sensors.forEach(sensor => {
                ctx.beginPath();
                ctx.arc(sensor.x, sensor.y + 10, 4, 0, 2 * Math.PI);
                ctx.fillStyle = sensor.color;
                ctx.fill();
                ctx.fillStyle = "white";
                ctx.font = "bold 7px Arial";
                ctx.fillText(`${sensor.value}%`, sensor.x - 6, sensor.y + 12);

                // Pulse effect animation
                ctx.beginPath();
                ctx.arc(sensor.x, sensor.y + 10, 6, 0, 2 * Math.PI);
                ctx.fillStyle = sensor.color + "40";
                ctx.fill();
            });
        }

        // Draw safe locations
        if (mode === "safe") {
            safeLocations.forEach(location => {
                ctx.beginPath();
                ctx.rect(location.x - 6, location.y - 3, 12, 6);
                ctx.fillStyle = location.status === "active" ? "#4caf50" : "#ff9800";
                ctx.fill();
                ctx.fillStyle = "white";
                ctx.font = "7px Arial";
                ctx.fillText("🏠", location.x - 3, location.y + 1);
            });
        }

        // Draw risk heatmap overlay
        if (mode === "heatmap") {
            const gradient = ctx.createLinearGradient(20, 10, 80, 70);
            gradient.addColorStop(0, "rgba(255,0,0,0.3)");
            gradient.addColorStop(0.5, "rgba(255,165,0,0.2)");
            gradient.addColorStop(1, "rgba(255,255,0,0.1)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

    }, [mode]);

    return (
        <div style={{ position: "relative", width: "100%", height: "auto", backgroundColor: "#f5f5f5" }}>
            <canvas
                ref={canvasRef}
                width={500}
                height={400}
                style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    border: "none",
                    cursor: "pointer"
                }}
            />
            <div style={{
                position: "absolute",
                bottom: 10,
                left: 10,
                background: "rgba(0,0,0,0.7)",
                color: "white",
                padding: "4px 8px",
                borderRadius: 4,
                fontSize: 10,
                pointerEvents: "none"
            }}>
                Sri Lanka • Interactive Map
            </div>
        </div>
    );
};

export default function MapView({ page, setPage }) {
    const [emergencyMode, setEmergencyMode] = useState(true);
    const [tab, setTab]     = useState("sensor");
    const [layer, setLayer] = useState("District");

    const tabs = [
        { id: "sensor",   label: "📡 Sensor Locations" },
        { id: "safe",     label: "🏠 Safe Locations" },
        { id: "affected", label: "🌊 Affected Areas" },
        { id: "heatmap",  label: "🔥 Risk Heatmap" },
    ];

    const districts = [
        { name: "Ratnapura", level: "4.8m", badge: "critical", label: "CRITICAL" },
        { name: "Kalutara",  level: "3.9m", badge: "critical", label: "CRITICAL" },
        { name: "Colombo",   level: "2.1m", badge: "high",     label: "HIGH" },
        { name: "Kandy",     level: "1.8m", badge: "medium",   label: "MEDIUM" },
        { name: "Jaffna",    level: "0.6m", badge: "safe",     label: "SAFE" },
    ];

    const safeList = [
        { icon: "🏫", name: "Ratnapura School",    cap: "240 cap", status: "active",  label: "AVAILABLE" },
        { icon: "🏟", name: "Kalutara Ground",      cap: "500 cap", status: "active",  label: "AVAILABLE" },
        { icon: "🏥", name: "Colombo Hospital",     cap: "120 cap", status: "warn",    label: "PARTIAL" },
        { icon: "🕌", name: "Galle Fort Hall",      cap: "180 cap", status: "active",  label: "AVAILABLE" },
        { icon: "🎓", name: "Kandy Comm. Centre",   cap: "350 cap", status: "active",  label: "AVAILABLE" },
    ];

    const sensors = [
        { dot: C.red,    pulse: true,  name: "Ratnapura-A2",  loc: "IMEI 865213859621", val: "87%", valColor: C.red },
        { dot: C.red,    pulse: true,  name: "Kalutara-B1",   loc: "IMEI 865213859548", val: "74%", valColor: C.red },
        { dot: C.orange, pulse: false, name: "Colombo-West",  loc: "IMEI 865213859302", val: "55%", valColor: C.orange },
        { dot: C.yellow, pulse: false, name: "Kandy-Central", loc: "IMEI 865213859410", val: "38%", valColor: C.yellow },
        { dot: C.green,  pulse: false, name: "Jaffna-North",  loc: "IMEI 865213859110", val: "12%", valColor: C.green },
    ];

    const mapMode = tab === "heatmap" ? "heatmap" : tab === "affected" ? "affected" : tab === "safe" ? "safe" : "sensor";

    const legendMap = {
        sensor:   { title: "Sensor Status",     items: [[C.red,"Critical (87%+)"],[C.orange,"High (50–86%)"],[C.yellow,"Medium (25–49%)"],[C.green,"Safe (<25%)"]] },
        safe:     { title: "Safe Zone Status",  items: [[C.green,"Available"],[C.yellow,"Partially Full"],[C.red,"At Capacity"]] },
        affected: { title: "Flood Risk Level",  items: [[C.red,"Critical"],[C.orange,"High Alert"],[C.yellow,"Medium Risk"],["#aaddaa","Safe Zone"]] },
        heatmap:  { title: "Risk Intensity",    items: [[C.red,"Very High Risk"],[C.orange,"High Risk"],[C.yellow,"Moderate Risk"],["#90ee90","Low Risk"]] },
    };
    const leg = legendMap[tab];

    return (
        <>
            <style>{globalCSS}</style>
            <div style={{ minHeight: "100vh", background: C.bg }}>
                <Header emergencyMode={emergencyMode} setEmergencyMode={setEmergencyMode} />
                <div style={{ display: "flex", margin: "12px 14px 14px" }}>
                    <Sidebar page={page} setPage={setPage} />
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: "calc(100vh - 110px)", paddingRight: 2 }}>

                        <TabBar tabs={tabs} active={tab} onChange={setTab} />

                        {/* ── Map + Panel ── */}
                        <div className="fadeUp" style={{ display: "flex", gap: 12 }}>

                            {/* Map Card */}
                            <Card style={{ flex: 1, padding: 0, overflow: "hidden" }}>
                                <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>🗺 {tabs.find(t => t.id === tab)?.label} — Sri Lanka</span>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {["District", "Province", "Satellite"].map(l => (
                                            <button key={l} onClick={() => setLayer(l)} style={{ padding: "5px 11px", borderRadius: 7, border: `1.5px solid ${layer === l ? C.dark : C.border}`, background: layer === l ? C.dark : "#fff", color: layer === l ? "#fff" : C.mid, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{l}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ position: "relative" }}>
                                    <SriLankaMap mode={mapMode} />
                                    {/* Legend */}
                                    <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(255,255,255,.96)", borderRadius: 10, padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,.1)", fontSize: 11, zIndex: 10 }}>
                                        <div style={{ fontWeight: 800, marginBottom: 7, fontSize: 10, textTransform: "uppercase", letterSpacing: .4, color: "#888" }}>{leg.title}</div>
                                        {leg.items.map(([c, l], i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                                                <div style={{ width: 12, height: 12, borderRadius: 3, background: c, flexShrink: 0 }} />
                                                <span style={{ color: "#555" }}>{l}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Zoom controls */}
                                    <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 3, zIndex: 10 }}>
                                        {["+", "−", "⊙"].map(l => (
                                            <button key={l} style={{ width: 28, height: 28, background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 6, fontSize: l === "⊙" ? 11 : 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#444" }}>{l}</button>
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            {/* Side Panel */}
                            <div style={{ width: 244, display: "flex", flexDirection: "column", gap: 12 }}>

                                {/* Sensor / Affected / Heatmap panel */}
                                {(tab === "sensor" || tab === "affected" || tab === "heatmap") && (
                                    <Card>
                                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "#aaa", marginBottom: 10 }}>
                                            {tab === "sensor" ? "Active Sensors" : tab === "heatmap" ? "Risk Probability (6H)" : "Affected Districts"}
                                        </div>
                                        {tab === "sensor" ? (
                                            sensors.map((s, i) => (
                                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 0", borderBottom: i < sensors.length - 1 ? `1px solid #fafafa` : "none" }}>
                                                    <span className={s.pulse ? "pulse" : ""} style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 12, fontWeight: 700 }}>{s.name}</div>
                                                        <div style={{ fontSize: 10, color: "#aaa" }}>{s.loc}</div>
                                                    </div>
                                                    <span style={{ fontSize: 12, fontWeight: 800, color: s.valColor }}>{s.val}</span>
                                                </div>
                                            ))
                                        ) : districts.map((d, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: i < districts.length - 1 ? `1px solid #fafafa` : "none" }}>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                                                    <div style={{ fontSize: 11, color: C.mid }}>
                                                        {tab === "heatmap" ? `Probability: ${[92,78,65,60,40,10][i] || 20}%` : `Water: ${d.level}`}
                                                    </div>
                                                </div>
                                                <Badge type={d.badge}>{d.label}</Badge>
                                            </div>
                                        ))}
                                    </Card>
                                )}

                                {/* Safe Locations panel */}
                                {tab === "safe" && (
                                    <Card>
                                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "#aaa", marginBottom: 10 }}>Safe Locations (12 Total)</div>
                                        {safeList.map((z, i) => (
                                            <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < safeList.length - 1 ? `1px solid #fafafa` : "none", alignItems: "flex-start" }}>
                                                <span style={{ fontSize: 18, flexShrink: 0 }}>{z.icon}</span>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 700 }}>{z.name}</div>
                                                    <div style={{ fontSize: 10, color: C.mid, marginTop: 2 }}>{z.cap}</div>
                                                    <Badge type={z.status}>{z.label}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </Card>
                                )}

                                {/* District alert card for sensor tab */}
                                {tab === "sensor" && (
                                    <Card>
                                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "#aaa", marginBottom: 10 }}>District Alert Status</div>
                                        {districts.map((d, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: i < districts.length - 1 ? `1px solid #fafafa` : "none" }}>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                                                    <div style={{ fontSize: 11, color: C.mid }}>Water: {d.level}</div>
                                                </div>
                                                <Badge type={d.badge}>{d.label}</Badge>
                                            </div>
                                        ))}
                                    </Card>
                                )}
                            </div>
                        </div>

                        {/* ── Bottom Stats ── */}
                        <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                            {[["🚨","Critical Zones","3",C.red],["📡","Active Sensors","5",C.dark],["🏠","Safe Locations","12",C.green],["🌊","Affected Districts","6",C.orange]].map(([icon, label, val, c], i) => (
                                <Card key={i} style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 20 }}>{icon}</span>
                                    <div>
                                        <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: .4 }}>{label}</div>
                                        <div style={{ fontSize: 18, fontWeight: 900, color: c }}>{val}</div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}