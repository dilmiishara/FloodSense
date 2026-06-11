import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchLatestPredictions } from "../../api/services/predictionService.js";
import { WarningIcon, InfoIcon, SensorNodeIcon } from "../../shared/icons.jsx";
import { sensorIcon, riskColorByLevel } from "./MapIcons.js";
import { FitBounds, PopupRow, getTileUrl, getTileAttribution, SRI_LANKA_CENTER, STATION_COORDS } from "./MapShared.jsx";

// ─── Risk badge ───────────────────────────────────────────────────────────────
const RiskBadge = ({ level }) => {
    const color = riskColorByLevel(level);
    const bg = {
        "#ef4444": "#fef2f2",
        "#f97316": "#fff7ed",
        "#eab308": "#fefce8",
        "#22c55e": "#f0fdf4",
    }[color] || "#f9fafb";

    return (
        <span style={{
            background: bg,
            color,
            fontWeight: 800,
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 20,
            border: `1px solid ${color}`,
            textTransform: "uppercase",
            letterSpacing: 0.5,
        }}>
            {level || "Normal"}
        </span>
    );
};

// ─── Side panel station card ──────────────────────────────────────────────────
const StationCard = ({ station }) => {
    const color = riskColorByLevel(station.flood_risk_level);

    console.log(station.station_name, station.flood_risk_level, station.affected_area_sqkm);

    return (
        <div style={{
            padding: "12px 14px",
            borderBottom: "1px solid var(--border)",
            borderLeft: `4px solid ${color}`,
            transition: "background .15s",
        }}>
            {/* Station name + badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: "var(--text)" }}>
                    {station.station_name}
                </div>
                <RiskBadge level={station.flood_risk_level} />
            </div>

            {/* Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: "var(--text-muted)" }}>Affected Area</span>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>
                        {station.affected_area_sqkm ?? 0} sq km
                    </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: "var(--text-muted)" }}>Water Level</span>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>
                        {station.predicted_water_level ?? "-"}m
                    </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: "var(--text-muted)" }}>Rainfall</span>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>
                        {station.rainfall ?? "-"}mm
                    </span>
                </div>
            </div>
        </div>
    );
};

// ─── Main AffectedMap component ───────────────────────────────────────────────
export default function AffectedMap({ layer }) {
    const [predictions, setPredictions] = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // ── Fetch predictions ──────────────────────────────────────────────────────
    const loadPredictions = async () => {
        try {
            setError(null);
            const res = await fetchLatestPredictions();
            const raw = res.data.data || [];
            setPredictions(Array.isArray(raw) ? raw : []);
            setLastUpdated(new Date());
        } catch (err) {
            console.error(err);
            setError("Could not load predictions");
        } finally {
            setLoading(false);
        }
    };

    // ── Load on mount + auto refresh every 5 minutes ──────────────────────────
    useEffect(() => {
        loadPredictions();
        const interval = setInterval(loadPredictions, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // ── Radius based on affected area ─────────────────────────────────────────
    const getRadius = (areaSqKm) => {
        if (!areaSqKm || areaSqKm === 0) return 5000;
        return Math.sqrt(areaSqKm * 1_000_000 / Math.PI);
    };

    // ── Get forecast time from first prediction ────────────────────────────────
    const forecastTime = predictions.length > 0 && predictions[0].forecast_time
        ? new Date(predictions[0].forecast_time).toLocaleString("en-GB", {
            day: "2-digit", month: "short",
            hour: "2-digit", minute: "2-digit"
        })
        : null;


    return (
        <div style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>

            {/* ── Map ─────────────────────────────────────────────────────── */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

                {/* Map */}
                <div style={{ height: "75vh", width: "100%" }}>
                    {loading ? (
                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                            <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading predictions...</span>
                        </div>
                    ) : (
                        <MapContainer center={SRI_LANKA_CENTER} zoom={9} style={{ height: "100%", width: "100%" }}>
                            <TileLayer
                                url={getTileUrl(layer)}
                                attribution={getTileAttribution(layer)}
                            />
                            {/* Auto zoom to fit all station markers */}
                            {predictions.length > 0 && (
                                <FitBounds positions={
                                    predictions
                                        .filter(s => STATION_COORDS[s.station_name])
                                        .map(s => ({
                                            lat: STATION_COORDS[s.station_name][0],
                                            lng: STATION_COORDS[s.station_name][1]
                                        }))
                                } />
                            )}

                            {predictions.map((station, i) => {
                                const coords = STATION_COORDS[station.station_name];
                                if (!coords) return null;

                                const color   = riskColorByLevel(station.flood_risk_level);
                                const radius  = getRadius(station.affected_area_sqkm);
                                const isFlood = station.flood_risk_level !== "Normal";

                                return (
                                    <div key={i}>
                                        {/* Station marker */}
                                        <Marker position={coords} icon={sensorIcon(station.station_name)}>
                                            <Popup>
                                                <div style={{ fontFamily: "system-ui,sans-serif", minWidth: 200 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #eee" }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                            <SensorNodeIcon size={16} color="#3b82f6" />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 800, fontSize: 14, color: "#111" }}>{station.station_name}</div>
                                                            <div style={{ fontSize: 11, color: "#888" }}>Gauging Station</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                                        <PopupRow label="Flood Risk"    value={<span style={{ color, fontWeight: 800 }}>{station.flood_risk_level}</span>} />
                                                        <PopupRow label="Water Level"   value={`${station.predicted_water_level}m`} />
                                                        <PopupRow label="Affected Area" value={`${station.affected_area_sqkm} sq km`} />
                                                        <PopupRow label="Duration"      value={`${station.duration_days} days`} />
                                                        <PopupRow label="Rainfall"      value={`${station.rainfall}mm`} />
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>

                                        {/* Affected area circle — only show if flooding */}
                                        {isFlood && (
                                            <Circle
                                                center={coords}
                                                radius={radius}
                                                pathOptions={{
                                                    color,
                                                    fillColor:   color,
                                                    fillOpacity: 0.20,
                                                    weight:      2,
                                                }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </MapContainer>
                    )}
                </div>

                {/* Error bar */}
                {error && (
                    <div style={{ padding: "10px 16px", background: "#fef2f2", borderTop: "1px solid #fecaca", fontSize: 12, color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                        <InfoIcon size={14} color="#dc2626" /> {error}
                    </div>
                )}
            </div>

            {/* ── Side Panel ──────────────────────────────────────────────── */}
            <div style={{ width: 290, flexShrink: 0, borderLeft: "1px solid var(--border)", background: "var(--surface)", overflow: "hidden", display: "flex", flexDirection: "column", height: "75vh" }}>

                {/* Panel header */}
                <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                        <WarningIcon size={14} color="var(--orange)" />
                        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>Station Status</div>
                    </div>

                    {/* Forecast time shown at top */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Forecast Time</span>
                        <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: 11 }}>
                            {forecastTime ?? "—"}
                        </span>
                    </div>

                    {/* Last updated */}
                    {lastUpdated && (
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 5, textAlign: "right" }}>
                            Updated: {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                    )}
                </div>

                {/* Station cards */}
                <div style={{ overflowY: "auto", flex: 1 }}>
                    {loading ? (
                        <div style={{ padding: "30px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                            Loading...
                        </div>
                    ) : predictions.length === 0 ? (
                        <div style={{ padding: "30px 14px", textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                                <WarningIcon size={36} color="#d1d5db" />
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                                No predictions yet
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                Run the pipeline to generate predictions
                            </div>
                        </div>
                    ) : (
                        predictions.map((station, i) => (
                            <StationCard key={i} station={station} />
                        ))
                    )}
                </div>

                {/* Legend */}
                <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", background: "var(--surface-alt)", flexShrink: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Legend
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {[
                            { color: "#22c55e", label: "Normal — No flooding" },
                            { color: "#eab308", label: "Alert — Watch closely" },
                            { color: "#f97316", label: "Minor Flood" },
                            { color: "#ef4444", label: "Major Flood" },
                        ].map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text)" }}>
                                <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}