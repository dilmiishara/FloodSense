// ─── src/shared/icons.jsx ────────────────────────────────────────────────────
// All sidebar & UI SVG icons for FloodSense Portal.
// Usage: import { DashboardIcon, MapIcon, ... } from "./shared/icons";

import React from "react";

const Icon = ({ children, size = 16 }) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
        {children}
    </svg>
);

// ─── Navigation Icons ─────────────────────────────────────────────────────────
export const DashboardIcon    = ({ size }) => <Icon size={size}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>;
export const MapIcon          = ({ size }) => <Icon size={size}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></Icon>;
export const AlertsIcon       = ({ size }) => <Icon size={size}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Icon>;
export const PredictionIcon   = ({ size }) => <Icon size={size}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Icon>;
export const AddLocationIcon  = ({ size }) => <Icon size={size}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><line x1="12" y1="7" x2="12" y2="13"/><line x1="9" y1="10" x2="15" y2="10"/></Icon>;
export const ReportsIcon      = ({ size }) => <Icon size={size}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></Icon>;
export const SettingsIcon     = ({ size }) => <Icon size={size}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon>;
export const UsersIcon        = ({ size }) => <Icon size={size}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
export const PostsIcon        = ({ size }) => <Icon size={size}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Icon>;
export const LogoutIcon       = ({ size }) => <Icon size={size}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>;
export const AccountIcon      = ({ size }) => <Icon size={size}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>;

// ─── Sensor Icons ─────────────────────────────────────────────────────────────
export const HumidityIcon     = ({ size }) => <Icon size={size}><path d="M12 2C6 8 4 13 4 16a8 8 0 0 0 16 0c0-3-2-8-8-14z"/></Icon>;
export const TemperatureIcon  = ({ size }) => <Icon size={size}><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></Icon>;
export const RainfallIcon     = ({ size }) => <Icon size={size}><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="8" y1="20" x2="8.01" y2="20"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="12" y1="22" x2="12.01" y2="22"/><line x1="16" y1="16" x2="16.01" y2="16"/><line x1="16" y1="20" x2="16.01" y2="20"/></Icon>;
export const UltrasonicIcon   = ({ size }) => <Icon size={size}><circle cx="12" cy="12" r="3"/><path d="M6.34 6.34a8 8 0 0 0 0 11.32"/><path d="M17.66 6.34a8 8 0 0 1 0 11.32"/><path d="M3.51 3.51a13 13 0 0 0 0 16.98"/><path d="M20.49 3.51a13 13 0 0 1 0 16.98"/></Icon>;

// ─── Map / Safe Location Icons ────────────────────────────────────────────────

/** Sensor node — wifi signal waves */
export const SensorNodeIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="20" r="1" fill={color} stroke="none"/>
        <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
        <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
    </svg>
);

/** Shield — generic safe place */
export const SafeShieldIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l9 4v6c0 5.25-3.75 10.15-9 11.25C6.75 22.15 3 17.25 3 12V6z"/>
    </svg>
);

/** School — graduation cap */
export const SchoolShelterIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
);

/** Hospital — cross in rounded rect */
export const HospitalShelterIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
);

/** Community centre — building with arch door */
export const CommunityShelterIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a3 3 0 0 1 6 0v4"/>
    </svg>
);

/** Government building — columns with triangular pediment */
export const GovernmentShelterIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20"/>
        <path d="M4 20V10M20 20V10"/>
        <path d="M12 4L2 10h20z"/>
        <path d="M8 20v-6M12 20v-6M16 20v-6"/>
    </svg>
);

/** Religious — church with cross */
export const ReligiousShelterIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="10"/>
        <line x1="8" y1="6" x2="16" y2="6"/>
        <path d="M6 10h12v12H6z"/>
        <path d="M9 22v-5a3 3 0 0 1 6 0v5"/>
    </svg>
);

/** Sports — stadium with field lines */
export const SportsShelterIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="12" rx="10" ry="5"/>
        <ellipse cx="12" cy="12" rx="5" ry="2.5"/>
        <line x1="12" y1="7" x2="12" y2="17"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
    </svg>
);

/** Wheelchair / accessibility */
export const AccessibleIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="2"/>
        <path d="M9 8h6l1 9h-4l2 5H9l-2-5H5"/>
        <path d="M15 13a5 5 0 1 1-8.66 5"/>
    </svg>
);

/** People / group / capacity */
export const CapacityIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

/** Phone handset */
export const PhoneContactIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.32h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
);

/** Map pin */
export const LocationPinIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
    </svg>
);

/** Layers — map layer toggle */
export const LayersIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
    </svg>
);

/** Warning triangle */
export const WarningIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);

/** Info circle */
export const InfoIcon = ({ size, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);

export const EditIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);

// ─── Nav icon map ─────────────────────────────────────────────────────────────
export const NAV_ICONS = {
    dashboard:   DashboardIcon,
    mapview:     MapIcon,
    alerts:      AlertsIcon,
    prediction:  PredictionIcon,
    addlocation: AddLocationIcon,
    reports:     ReportsIcon,
    settings:    SettingsIcon,
    users:       UsersIcon,
    profile:     AccountIcon,
};

// ─── Helper: pick the right shelter icon by type string ───────────────────────
export const ShelterTypeIcon = ({ type = "", size = 16, color = "#16a34a" }) => {
    const t = type.toLowerCase();
    const props = { size, color };
    if (t.includes("school"))    return <SchoolShelterIcon    {...props} />;
    if (t.includes("hospital"))  return <HospitalShelterIcon  {...props} />;
    if (t.includes("community")) return <CommunityShelterIcon {...props} />;
    if (t.includes("govern"))    return <GovernmentShelterIcon {...props} />;
    if (t.includes("religi"))    return <ReligiousShelterIcon {...props} />;
    if (t.includes("sports"))    return <SportsShelterIcon    {...props} />;
    return <SafeShieldIcon {...props} />;
};

export const getNavIcon = (id) =>
    NAV_ICONS[id] ||
    NAV_ICONS[id?.toLowerCase()] ||
    null;