import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import { Input, Select } from '../shared.jsx';

const RISK_CONFIG = {
    Major: {
        color: 'var(--red)',
        badge: '#fee2e2',
        textColor: '#dc2626',
        icon: <ShieldAlert size={14} />,
        label: 'MAJOR',
    },
    Minor: {
        color: 'var(--orange)',
        badge: '#fff7ed',
        textColor: '#ea580c',
        icon: <AlertTriangle size={14} />,
        label: 'MINOR',
    },
    Alert: {
        color: 'var(--yellow)',
        badge: '#fefce8',
        textColor: '#ca8a04',
        icon: <Activity size={14} />,
        label: 'ALERT',
    },
};

const LoadingView = ({ colSpan }) => (
    <tr>
        <td colSpan={colSpan} style={{ padding: "80px 40px", textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 32, height: 32,
                    border: "4px solid var(--border)",
                    borderTop: "4px solid var(--primary)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                }} />
                <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: "var(--text-muted)", letterSpacing: '0.8px',
                }}>
                    LOADING PREDICTION DATA...
                </div>
            </div>
        </td>
    </tr>
);

export default function PredictionTable({ data, loading }) {
    const [searchTerm, setSearchTerm]   = useState('');
    const [selRisk, setSelRisk]         = useState('All Levels');
    const [selected, setSelected]       = useState(null);

    const filtered = (data || []).filter(row => {
        const matchesSearch = row.station_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesRisk =
            selRisk === 'All Levels' ||
            row.flood_risk_level?.toLowerCase() === selRisk.toLowerCase();
        return matchesSearch && matchesRisk;
    });

    return (
        <div style={{ position: 'relative' }}>

            {/* ── Search & Filter Bar ── */}
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface-alt)',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
            }}>
                <Input
                    placeholder="Search by station name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ flex: 1, height: 40 }}
                />
                <Select
                    value={selRisk}
                    onChange={e => setSelRisk(e.target.value)}
                    style={{ width: 160, height: 40 }}
                >
                    <option value="All Levels">All Levels</option>
                    <option value="Alert">Alert</option>
                    <option value="Minor">Minor</option>
                    <option value="Major">Major</option>
                </Select>
            </div>

            {/* ── Table ── */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'var(--surface-alt)', textAlign: 'left' }}>
                        <th style={th}></th>
                        <th style={th}>STATION</th>
                        <th style={th}>FORECAST TIME</th>
                        <th style={th}>WATER LEVEL (m)</th>
                        <th style={th}>RISK LEVEL</th>
                        <th style={th}>AFFECTED AREA</th>
                        <th style={th}>ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <LoadingView colSpan={7} />
                    ) : filtered.length === 0 ? (
                        <tr>
                            <td colSpan={7} style={{
                                padding: 40,
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontStyle: 'italic',
                            }}>
                                No predicted alerts found.
                            </td>
                        </tr>
                    ) : (
                        filtered.map((row, i) => {
                            const cfg = RISK_CONFIG[row.flood_risk_level] || RISK_CONFIG.Alert;
                            return (
                                <tr
                                    key={i}
                                    className="fadeUp"
                                    style={{ borderBottom: '1px solid var(--border)' }}
                                >
                                    {/* Pulse dot */}
                                    <td style={{ padding: '14px 12px' }}>
                                        <div
                                            className={row.flood_risk_level === 'Major' ? 'pulse' : ''}
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: cfg.color,
                                            }}
                                        />
                                    </td>

                                    {/* Station name */}
                                    <td style={{
                                        padding: '14px 12px',
                                        fontWeight: 700,
                                        color: 'var(--text)',
                                        fontSize: 14,
                                    }}>
                                        {row.station_name}
                                    </td>

                                    {/* Forecast time */}
                                    <td style={{
                                        padding: '14px 12px',
                                        fontFamily: 'monospace',
                                        fontSize: 12,
                                        color: 'var(--text-mid)',
                                    }}>
                                        {new Date(row.forecast_time).toLocaleString([], {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </td>

                                    {/* Water level */}
                                    <td style={{
                                        padding: '14px 12px',
                                        fontFamily: 'monospace',
                                        fontWeight: 800,
                                        color: cfg.color,
                                    }}>
                                        {Number(row.predicted_water_level).toFixed(3)} m
                                    </td>

                                    {/* Risk level badge */}
                                    <td style={{ padding: '14px 12px' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            padding: '4px 10px',
                                            borderRadius: 8,
                                            background: cfg.badge,
                                            color: cfg.textColor,
                                            fontSize: 11,
                                            fontWeight: 800,
                                        }}>
                                            {cfg.icon} {cfg.label}
                                        </span>
                                    </td>

                                    {/* Affected area */}
                                    <td style={{
                                        padding: '14px 12px',
                                        fontSize: 12,
                                        color: 'var(--text-mid)',
                                    }}>
                                        {row.affected_area_sqkm > 0
                                            ? `${row.affected_area_sqkm} km²`
                                            : '—'}
                                    </td>

                                    {/* Details button */}
                                    <td style={{ padding: '14px 12px' }}>
                                        <button
                                            onClick={() => setSelected(row)}
                                            style={{
                                                padding: '5px 14px',
                                                borderRadius: 8,
                                                border: '1.5px solid var(--border)',
                                                background: 'var(--surface-alt)',
                                                color: 'var(--text-mid)',
                                                fontSize: 11,
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                transition: 'all .15s',
                                            }}
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

            {/* ── Detail Side Drawer ── */}
            {selected && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setSelected(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(15,27,61,0.4)',
                            backdropFilter: 'blur(6px)',
                            zIndex: 999,
                        }}
                    />

                    {/* Drawer panel */}
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        width: 400,
                        height: '100%',
                        background: 'var(--surface)',
                        zIndex: 1000,
                        boxShadow: '-5px 0 30px rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}>

                        {/* Drawer Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'var(--surface-alt)',
                        }}>
                            <div>
                                <div style={{
                                    fontSize: 15,
                                    fontWeight: 900,
                                    color: 'var(--text)',
                                    letterSpacing: -0.3,
                                }}>
                                    Prediction Detail
                                </div>
                                <div style={{
                                    fontSize: 11,
                                    color: 'var(--text-muted)',
                                    marginTop: 3,
                                }}>
                                    {selected.station_name} Station
                                </div>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                style={{
                                    border: 'none',
                                    background: 'var(--border)',
                                    borderRadius: '50%',
                                    width: 30,
                                    height: 30,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div style={{
                            padding: 24,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 14,
                            overflowY: 'auto',
                        }}>
                            {/* Risk highlight card */}
                            {(() => {
                                const cfg = RISK_CONFIG[selected.flood_risk_level] || RISK_CONFIG.Alert;
                                return (
                                    <div style={{
                                        padding: '18px 20px',
                                        borderRadius: 14,
                                        background: cfg.badge,
                                        borderLeft: `5px solid ${cfg.color}`,
                                        marginBottom: 4,
                                    }}>
                                        <div style={{
                                            fontSize: 11,
                                            fontWeight: 800,
                                            color: cfg.textColor,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.8,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                        }}>
                                            {cfg.icon} {cfg.label} FLOOD RISK
                                        </div>
                                        <div style={{
                                            fontSize: 34,
                                            fontWeight: 950,
                                            color: cfg.color,
                                            fontFamily: "'DM Mono', monospace",
                                            marginTop: 6,
                                            letterSpacing: -1,
                                        }}>
                                            {Number(selected.predicted_water_level).toFixed(3)} m
                                        </div>
                                        <div style={{
                                            fontSize: 11,
                                            color: cfg.textColor,
                                            marginTop: 4,
                                            opacity: 0.8,
                                        }}>
                                            Predicted Water Level
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Detail rows */}
                            {[
                                { label: 'Station',       value: selected.station_name },
                                {
                                    label: 'Forecast Time',
                                    value: new Date(selected.forecast_time).toLocaleString([], {
                                        dateStyle: 'long', timeStyle: 'short',
                                    }),
                                },
                                {
                                    label: 'Affected Area',
                                    value: selected.affected_area_sqkm > 0
                                        ? `${selected.affected_area_sqkm} km²`
                                        : 'Not estimated',
                                },
                                { label: 'Rainfall',    value: `${selected.rainfall} mm`    },
                                { label: 'Temperature', value: `${selected.temperature} °C` },
                                { label: 'Humidity',    value: `${selected.humidity} %`     },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 0',
                                    borderBottom: '1px solid var(--border)',
                                }}>
                                    <span style={{
                                        fontSize: 12,
                                        color: 'var(--text-muted)',
                                        fontWeight: 700,
                                    }}>
                                        {item.label}
                                    </span>
                                    <span style={{
                                        fontSize: 13,
                                        color: 'var(--text)',
                                        fontWeight: 800,
                                    }}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ── Shared table header style ─────────────────────────────────────────────────
const th = {
    fontSize: 11,
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    padding: '14px 12px',
};