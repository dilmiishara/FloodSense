
import { useState } from "react";
import { globalCSS } from "../../shared.jsx";
import { extraCSS } from "../../shared/addLocationHelpers.jsx";
import IoTNodeManager      from "./IoTNodeManager";
import SafeLocationManager from "./SafeLocationManager";

export default function AddLocation() {
    const [section, setSection] = useState("iot"); // "iot" | "safe"

    return (
        <>
            <style>{globalCSS}{extraCSS}</style>

            {/* ── Section Switcher ── */}
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
                {/*<div style={{ fontSize:13, fontWeight:700, color:"var(--text-muted)", marginRight:4 }}>*/}
                {/*    You are managing:*/}
                {/*</div>*/}

                <button
                    className="section-toggle-btn"
                    onClick={() => setSection("iot")}
                    style={{
                        background:  section === "iot" ? "var(--primary)"     : "var(--surface-alt)",
                        color:       section === "iot" ? "#fff"               : "var(--text-mid)",
                        borderColor: section === "iot" ? "var(--primary)"     : "var(--border)",
                    }}
                >
                    IoT Sensor Nodes &amp; Gateways
                </button>

                <span style={{ color:"var(--border)", fontSize:18 }}>|</span>

                <button
                    className="section-toggle-btn"
                    onClick={() => setSection("safe")}
                    style={{
                        background:  section === "safe" ? "var(--green)"  : "var(--surface-alt)",
                        color:       section === "safe" ? "#fff"          : "var(--text-mid)",
                        borderColor: section === "safe" ? "var(--green)"  : "var(--border)",
                    }}
                >
                    Safe Locations &amp; Shelters
                </button>

                <div style={{ marginLeft:"auto", fontSize:11, color:"var(--text-muted)", maxWidth:220, lineHeight:1.5 }}>
                    {section === "iot"
                        ? "Register ESP32 sensor nodes, assign gateways, set flood thresholds"
                        : "Register evacuation shelters, manage capacity & availability status"}
                </div>
            </div>

            {/* ── Active Manager ── */}
            {section === "iot"  && <IoTNodeManager     />}
            {section === "safe" && <SafeLocationManager />}
        </>
    );
}