import L from "leaflet";

// ─── SVG strings for Leaflet divIcon ─────────────────────────────────────────
export const SVG = {
    sensor: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="20" r="1" fill="#fff" stroke="none"/><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/></svg>`,
    school: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
    hospital: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    community: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a3 3 0 0 1 6 0v4"/></svg>`,
    government: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M4 20V10M20 20V10M12 4L2 10h20zM8 20v-6M12 20v-6M16 20v-6"/></svg>`,
    religious: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="10"/><line x1="8" y1="6" x2="16" y2="6"/><path d="M6 10h12v12H6z"/><path d="M9 22v-5a3 3 0 0 1 6 0v5"/></svg>`,
    sports: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="10" ry="5"/><ellipse cx="12" cy="12" rx="5" ry="2.5"/><line x1="12" y1="7" x2="12" y2="17"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
    shield: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l9 4v6c0 5.25-3.75 10.15-9 11.25C6.75 22.15 3 17.25 3 12V6z"/></svg>`,
};

// ─── SVG key for safe location type ──────────────────────────────────────────
export const svgKeyForType = (type = "") => {
    const t = type.toLowerCase();
    if (t.includes("school"))    return "school";
    if (t.includes("hospital"))  return "hospital";
    if (t.includes("community")) return "community";
    if (t.includes("govern"))    return "government";
    if (t.includes("religi"))    return "religious";
    if (t.includes("sports"))    return "sports";
    return "shield";
};

// ─── Risk color by flood risk level ──────────────────────────────────────────
export const riskColorByLevel = (level = "") => {
    const l = level.toLowerCase();
    if (l.includes("major")) return "#ef4444";   // red
    if (l.includes("minor")) return "#f97316";   // orange
    if (l.includes("alert")) return "#eab308";   // yellow
    return "#22c55e";                            // green = normal
};

// ─── Risk color by old risk string (critical/high/medium/low) ────────────────
export const riskColor = (r) => ({
    critical: "#ef4444",
    high:     "#f97316",
    medium:   "#eab308",
    low:      "#22c55e",
})[r] || "#6b7280";

// ─── Build marker icon — Google Maps style teardrop pin + name card ───────────
export const makeIcon = (color, svgStr, label = "") => {
    const displayName = label.length > 26 ? label.slice(0, 24) + "…" : label;

    const charW  = 7.5;
    const cardW  = Math.max(80, Math.min(180, displayName.length * charW + 24));
    const pinW   = 36;
    const totalW = pinW + 6 + cardW;
    const totalH = 44;

    const nameCard = displayName ? `
        <div style="display:flex;align-items:center;position:relative;margin-left:4px;">
            <div style="width:0;height:0;border-top:6px solid transparent;border-bottom:6px solid transparent;border-right:7px solid #fff;filter:drop-shadow(-1px 0 1px rgba(0,0,0,0.12));flex-shrink:0;"></div>
            <div style="background:#fff;color:#1a1a1a;font-size:11.5px;font-weight:700;font-family:'Plus Jakarta Sans',system-ui,sans-serif;padding:5px 10px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.18);border-left:3px solid ${color};letter-spacing:0.1px;line-height:1;">${displayName}</div>
        </div>` : "";

    return L.divIcon({
        className: "",
        html: `
            <div style="display:flex;align-items:center;cursor:pointer;">
                <div style="width:${pinW}px;height:${pinW}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2.5px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">${svgStr}</div>
                </div>
                ${nameCard}
            </div>`,
        iconSize:    [totalW, totalH],
        iconAnchor:  [pinW / 2, pinW],
        popupAnchor: [totalW / 2 - pinW / 2, -(pinW + 4)],
    });
};

export const sensorIcon = (name) => makeIcon("#3b82f6", SVG.sensor, name);
export const safeIcon   = (type, name) => makeIcon("#16a34a", SVG[svgKeyForType(type)], name);