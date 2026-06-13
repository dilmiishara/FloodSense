import React, { useState, useMemo } from 'react';
import { X, AlertTriangle, ShieldAlert, Activity, Calendar, MapPin, Filter } from 'lucide-react';
import { Select } from '../shared.jsx';

// ── Risk config (Normal records are excluded from this table) ─────────────────
// ✅ FIX — add "Major Flood" and "Minor Flood" keys
const RISK_CONFIG = {
    'Major Flood': {
        color: '#dc2626',
        badge: '#fee2e2',
        textColor: '#dc2626',
        icon: <ShieldAlert size={13} />,
        label: 'MAJOR FLOOD',
        dotColor: '#dc2626',
    },
    'Minor Flood': {
        color: '#ea580c',
        badge: '#fff7ed',
        textColor: '#ea580c',
        icon: <AlertTriangle size={13} />,
        label: 'MINOR FLOOD',
        dotColor: '#ea580c',
    },
    Alert: {
        color: '#ca8a04',
        badge: '#fefce8',
        textColor: '#ca8a04',
        icon: <Activity size={13} />,
        label: 'ALERT',
        dotColor: '#ca8a04',
    },
};

const RELEVANT_LEVELS = ['major flood', 'minor flood', 'alert'];


// ── Helpers ───────────────────────────────────────────────────────────────────
// Use LOCAL date (not UTC) so "Today" / "Last 7d" / "This Month" match the
// user's calendar day correctly, regardless of timezone offset.
const toLocalDateStr = (dateInput) => {
    const d = new Date(dateInput);
    const offsetMs = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - offsetMs);
    return local.toISOString().slice(0, 10);
};

const todayStr = () => toLocalDateStr(new Date());

const last7dStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toLocalDateStr(d);
};

const thisMonthStartStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

const LoadingView = ({ colSpan }) => (
    <tr>
        <td colSpan={colSpan} style={{ padding: '80px 40px', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 32, height: 32,
                    border: '4px solid var(--border)',
                    borderTop: '4px solid var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.8px' }}>
                    LOADING PREDICTION DATA...
                </div>
            </div>
        </td>
    </tr>
);

const FilterLabel = ({ icon, text }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 9.5, fontWeight: 800, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 5,
    }}>
        {icon} {text}
    </div>
);

const dateInputStyle = {
    height: 38, width: '100%', padding: '0 10px',
    border: '1px solid var(--border)', borderRadius: 8,
    background: 'var(--surface)', color: 'var(--text)',
    fontSize: 13, fontFamily: 'inherit',
    outline: 'none', cursor: 'pointer', boxSizing: 'border-box',
};

// ── Stations (fixed list matching your DB) ────────────────────────────────────
const KNOWN_STATIONS = ['Ellagawa', 'Rathnapura', 'Putupaula'];

export default function PredictionTable({ data, loading }) {
    const [selRisk,    setSelRisk]    = useState('All Levels');
    const [selStation, setSelStation] = useState('All Stations');
    const [dateFrom,   setDateFrom]   = useState(todayStr());
    const [dateTo,     setDateTo]     = useState(todayStr());
    const [selected,   setSelected]   = useState(null);

    // Station list: always show all known stations, plus any extra stations
    // that might appear in the data but aren't in KNOWN_STATIONS.
    const stationOptions = useMemo(() => {
        const fromData = (data || []).map(r => r.station_name).filter(Boolean);
        const merged = new Set([...KNOWN_STATIONS, ...fromData]);
        return [...merged].sort();
    }, [data]);

    // Filter — exclude Normal, apply date/station/risk filters
    const filtered = useMemo(() => {
        return (data || []).filter(row => {
            // Exclude Normal & unknown risk levels
            const level = row.flood_risk_level?.toLowerCase();
            if (!RELEVANT_LEVELS.includes(level)) return false;

            // Risk level filter
            if (selRisk !== 'All Levels' && level !== selRisk.toLowerCase()) return false;

            // Station filter
            if (selStation !== 'All Stations' && row.station_name !== selStation) return false;

            // Date range filter on forecast_time (compared using LOCAL date)
            if (row.forecast_time) {
                const rowDate = toLocalDateStr(row.forecast_time);
                if (dateFrom && rowDate < dateFrom) return false;
                if (dateTo   && rowDate > dateTo)   return false;
            }

            return true;
        });
    }, [data, selRisk, selStation, dateFrom, dateTo]);

    const resetFilters = () => {
        setSelRisk('All Levels');
        setSelStation('All Stations');
        setDateFrom(todayStr());
        setDateTo(todayStr());
    };

    const isDefaultDate = dateFrom === todayStr() && dateTo === todayStr();
    const hasActiveFilters = selRisk !== 'All Levels' || selStation !== 'All Stations' || !isDefaultDate;

    // Which quick-filter (if any) matches the current date range — drives the
    // highlighted/active styling on the Today / Last 7d / This Month buttons.
    const activeQuickFilter = useMemo(() => {
        const today = todayStr();
        if (dateFrom === today && dateTo === today) return 'Today';
        if (dateFrom === last7dStr() && dateTo === today) return 'Last 7d';
        if (dateFrom === thisMonthStartStr() && dateTo === today) return 'This Month';
        return null;
    }, [dateFrom, dateTo]);

    // Counts per risk (from filtered data)
    const counts = useMemo(() => ({
    'Major Flood': filtered.filter(r => r.flood_risk_level?.toLowerCase() === 'major flood').length,
    'Minor Flood': filtered.filter(r => r.flood_risk_level?.toLowerCase() === 'minor flood').length,
    Alert:         filtered.filter(r => r.flood_risk_level?.toLowerCase() === 'alert').length,
}), [filtered]);

    return (
        <div style={{ position: 'relative' }}>

            {/* ── Filter Bar ── */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface-alt)',
            }}>

                {/* Summary chips */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    {[
                         { key: 'Major Flood', color: '#dc2626', bg: '#fee2e2', icon: <ShieldAlert size={11} /> },
    { key: 'Minor Flood', color: '#ea580c', bg: '#fff7ed', icon: <AlertTriangle size={11} /> },
    { key: 'Alert',       color: '#ca8a04', bg: '#fefce8', icon: <Activity size={11} /> },
                    ].map(({ key, color, bg, icon }) => (
                        <button
                            key={key}
                            onClick={() => setSelRisk(selRisk === key ? 'All Levels' : key)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
                                border: `1.5px solid ${selRisk === key ? color : 'var(--border)'}`,
                                background: selRisk === key ? bg : 'var(--surface)',
                                color: selRisk === key ? color : 'var(--text-muted)',
                                fontSize: 11, fontWeight: 800, transition: 'all .15s',
                            }}
                        >
                            {icon}
                            {key.toUpperCase()}
                            <span style={{
                                background: selRisk === key ? color : 'var(--border)',
                                color: selRisk === key ? '#fff' : 'var(--text-muted)',
                                borderRadius: 6, padding: '0px 6px', fontSize: 10, fontWeight: 900,
                            }}>
                                {counts[key]}
                            </span>
                        </button>
                    ))}

                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                            fontSize: 11, fontWeight: 800, color: 'var(--primary)',
                            background: 'var(--primary-bg)', padding: '4px 12px', borderRadius: 8,
                        }}>
                            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                        </span>
                        {hasActiveFilters && (
                            <button onClick={resetFilters} style={{
                                padding: '4px 11px', borderRadius: 7, cursor: 'pointer',
                                border: '1.5px solid #dc2626', background: '#fee2e2',
                                color: '#dc2626', fontSize: 11, fontWeight: 800, transition: 'all .15s',
                            }}>
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter row */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>

                    {/* Location */}
                    <div style={{ flex: 1.2 }}>
                        <FilterLabel icon={<MapPin size={9} />} text="Location" />
                        <Select
                            value={selStation}
                            onChange={e => setSelStation(e.target.value)}
                            style={{ height: 38, width: '100%' }}
                        >
                            <option value="All Stations">All Stations</option>
                            {stationOptions.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </Select>
                    </div>

                    {/* Risk level */}
                    <div style={{ flex: 1 }}>
                        <FilterLabel icon={<Filter size={9} />} text="Risk Level" />
                        <Select
                            value={selRisk}
                            onChange={e => setSelRisk(e.target.value)}
                            style={{ height: 38, width: '100%' }}
                        >
                            <option value="All Levels">All Levels</option>
                            <option value="Alert">Alert</option>
<option value="Minor Flood">Minor Flood</option>
<option value="Major Flood">Major Flood</option>
                        </Select>
                    </div>

                    {/* From */}
                    <div style={{ flex: 1 }}>
                        <FilterLabel icon={<Calendar size={9} />} text="From Date" />
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={dateInputStyle} />
                    </div>

                    {/* To */}
                    <div style={{ flex: 1 }}>
                        <FilterLabel icon={<Calendar size={9} />} text="To Date" />
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={dateInputStyle} />
                    </div>

                    {/* Quick shortcuts */}
                    <div style={{ display: 'flex', gap: 6, paddingBottom: 1 }}>
                        {[
                            { label: 'Today',      fn: () => { setDateFrom(todayStr()); setDateTo(todayStr()); } },
                            { label: 'Last 7d',    fn: () => { setDateFrom(last7dStr()); setDateTo(todayStr()); } },
                            { label: 'This Month', fn: () => { setDateFrom(thisMonthStartStr()); setDateTo(todayStr()); } },
                        ].map(btn => {
                            const isActive = activeQuickFilter === btn.label;
                            return (
                                <button key={btn.label} onClick={btn.fn} style={{
                                    padding: '0 11px', height: 38, borderRadius: 8, cursor: 'pointer',
                                    border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                                    background: isActive ? 'var(--primary-bg)' : 'var(--surface)',
                                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                    fontSize: 11, fontWeight: 800,
                                    whiteSpace: 'nowrap', transition: 'all .15s',
                                }}>
                                    {btn.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            {/* Fixed-height scroll area so the table never gets clipped by the
                parent card — instead it scrolls internally and the header
                stays pinned at the top while you scroll through rows. */}
            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 560 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                    <thead>
                        <tr style={{ background: 'var(--surface-alt)' }}>
                            <th style={{ ...th, position: 'sticky', top: 0, background: 'var(--surface-alt)', zIndex: 1 }}></th>
                            <th style={{ ...th, position: 'sticky', top: 0, background: 'var(--surface-alt)', zIndex: 1 }}>Station</th>
                            <th style={{ ...th, position: 'sticky', top: 0, background: 'var(--surface-alt)', zIndex: 1 }}>Forecast Time</th>
                            <th style={{ ...th, position: 'sticky', top: 0, background: 'var(--surface-alt)', zIndex: 1 }}>Water Level (m)</th>
                            <th style={{ ...th, position: 'sticky', top: 0, background: 'var(--surface-alt)', zIndex: 1 }}>Risk Level</th>
                            <th style={{ ...th, position: 'sticky', top: 0, background: 'var(--surface-alt)', zIndex: 1 }}>Affected Area</th>
                            <th style={{ ...th, position: 'sticky', top: 0, background: 'var(--surface-alt)', zIndex: 1 }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingView colSpan={7} />
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: 50, textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                        <Calendar size={30} color="var(--border)" />
                                        <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 13 }}>
                                            No predictions found for selected filters
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                                            Try adjusting the date range, location, or risk level
                                        </div>
                                        {hasActiveFilters && (
                                            <button onClick={resetFilters} style={{
                                                marginTop: 6, padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
                                                border: '1.5px solid var(--primary)', background: 'var(--primary-bg)',
                                                color: 'var(--primary)', fontSize: 12, fontWeight: 800,
                                            }}>
                                                Reset Filters
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((row, i) => {
                                const cfg = RISK_CONFIG[row.flood_risk_level] || RISK_CONFIG.Alert;
                                const isMajor = row.flood_risk_level === 'Major';
                                return (
                                    <tr key={i} style={{
                                        borderBottom: '1px solid var(--border)',
                                        background: isMajor ? 'rgba(220,38,38,0.02)' : 'transparent',
                                        transition: 'background .15s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-alt)'}
                                        onMouseLeave={e => e.currentTarget.style.background = isMajor ? 'rgba(220,38,38,0.02)' : 'transparent'}
                                    >
                                        {/* Dot */}
                                        <td style={{ padding: '14px 16px', width: 28 }}>
                                            <div style={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                background: cfg.color,
                                                boxShadow: isMajor ? `0 0 6px ${cfg.color}` : 'none',
                                            }} />
                                        </td>

                                        {/* Station */}
                                        <td style={{ padding: '14px 12px' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13 }}>
                                                {row.station_name}
                                            </div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
                                                Kalu Ganga Basin
                                            </div>
                                        </td>

                                        {/* Forecast time */}
                                        <td style={{ padding: '14px 12px' }}>
                                            <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text)', fontWeight: 700 }}>
                                                {new Date(row.forecast_time).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                                {new Date(row.forecast_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>

                                        {/* Water level */}
                                        <td style={{ padding: '14px 12px' }}>
                                            <span style={{
                                                fontFamily: 'monospace', fontWeight: 900,
                                                color: cfg.color, fontSize: 15, letterSpacing: '-.5px',
                                            }}>
                                                {Number(row.predicted_water_level).toFixed(3)}
                                            </span>
                                            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 3, fontWeight: 600 }}>m</span>
                                        </td>

                                        {/* Risk badge */}
                                        <td style={{ padding: '14px 12px' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                padding: '5px 11px', borderRadius: 8,
                                                background: cfg.badge, color: cfg.textColor,
                                                fontSize: 11, fontWeight: 800,
                                                border: `1px solid ${cfg.color}22`,
                                            }}>
                                                {cfg.icon} {cfg.label}
                                            </span>
                                        </td>

                                        {/* Affected area */}
                                        <td style={{ padding: '14px 12px', fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>
                                            {row.affected_area_sqkm > 0
                                                ? <><span style={{ fontWeight: 800, color: 'var(--text)' }}>{row.affected_area_sqkm}</span> km²</>
                                                : <span style={{ color: 'var(--border)' }}>—</span>
                                            }
                                        </td>

                                        {/* Details */}
                                        <td style={{ padding: '14px 12px' }}>
                                            <button
                                                onClick={() => setSelected(row)}
                                                style={{
                                                    padding: '6px 14px', borderRadius: 8,
                                                    border: '1.5px solid var(--border)',
                                                    background: 'var(--surface)',
                                                    color: 'var(--text-mid)',
                                                    fontSize: 11, fontWeight: 800,
                                                    cursor: 'pointer', transition: 'all .15s',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.color = cfg.color; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-mid)'; }}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Detail Side Drawer ── */}
            {selected && (() => {
                const cfg = RISK_CONFIG[selected.flood_risk_level] || RISK_CONFIG.Alert;
                return (
                    <>
                        <div onClick={() => setSelected(null)} style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(15,27,61,0.35)',
                            backdropFilter: 'blur(5px)', zIndex: 999,
                        }} />
                        <div style={{
                            position: 'fixed', top: 0, right: 0,
                            width: 420, height: '100%',
                            background: 'var(--surface)', zIndex: 1000,
                            boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        }}>
                            {/* Header */}
                            <div style={{
                                padding: '22px 24px', borderBottom: '1px solid var(--border)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: 'var(--surface-alt)',
                            }}>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.3 }}>
                                        Prediction Detail
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 600 }}>
                                        {selected.station_name} — Kalu Ganga Basin
                                    </div>
                                </div>
                                <button onClick={() => setSelected(null)} style={{
                                    border: 'none', background: 'var(--border)', borderRadius: '50%',
                                    width: 32, height: 32, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)',
                                }}>
                                    <X size={15} />
                                </button>
                            </div>

                            {/* Body */}
                            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>

                                {/* Risk card */}
                                <div style={{
                                    padding: '20px 22px', borderRadius: 14,
                                    background: cfg.badge, borderLeft: `5px solid ${cfg.color}`,
                                }}>
                                    <div style={{
                                        fontSize: 10.5, fontWeight: 800, color: cfg.textColor,
                                        textTransform: 'uppercase', letterSpacing: 0.8,
                                        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
                                    }}>
                                        {cfg.icon} {cfg.label} FLOOD RISK
                                    </div>
                                    <div style={{
                                        fontSize: 38, fontWeight: 950, color: cfg.color,
                                        fontFamily: 'monospace', letterSpacing: -2, lineHeight: 1,
                                    }}>
                                        {Number(selected.predicted_water_level).toFixed(3)}
                                        <span style={{ fontSize: 16, fontWeight: 700, marginLeft: 6, opacity: 0.7 }}>m</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: cfg.textColor, marginTop: 6, opacity: 0.75, fontWeight: 600 }}>
                                        Predicted Water Level
                                    </div>
                                </div>

                                {/* Detail rows */}
                                {[
                                    { label: 'Station',       value: selected.station_name },
                                    { label: 'Basin',         value: 'Kalu Ganga Basin' },
                                    {
                                        label: 'Forecast Time',
                                        value: new Date(selected.forecast_time).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' }),
                                    },
                                    {
                                        label: 'Affected Area',
                                        value: selected.affected_area_sqkm > 0 ? `${selected.affected_area_sqkm} km²` : 'Not estimated',
                                    },
                                    { label: 'Rainfall',    value: selected.rainfall    != null ? `${selected.rainfall} mm`    : '—' },
                                    { label: 'Temperature', value: selected.temperature != null ? `${selected.temperature} °C` : '—' },
                                    { label: 'Humidity',    value: selected.humidity    != null ? `${selected.humidity} %`     : '—' },
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '11px 0', borderBottom: '1px solid var(--border)',
                                    }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>{item.label}</span>
                                        <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 800 }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                );
            })()}
        </div>
    );
}

// ── Table header style ────────────────────────────────────────────────────────
const th = {
    fontSize: 10.5, fontWeight: 800,
    color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: 0.6, padding: '12px 12px',
    borderBottom: '2px solid var(--border)',
    whiteSpace: 'nowrap',
};
