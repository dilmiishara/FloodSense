import React, { useState } from 'react';
import { Search, Brain, Clock, AlertCircle, X, Save, Sliders } from 'lucide-react';
import { Btn, Input } from '../shared.jsx';

export default function PredictionTable({ data, onUpdate }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const filteredData = data.filter(t => 
        t.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditClick = (item) => {
        setEditItem({ ...item });
        setIsDrawerOpen(true);
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* SEARCH BAR */}
            <div style={{ padding: '12px', background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '20px' }}>
                <Input 
                    placeholder="Search predicted locations..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', height: '38px' }}
                />
            </div>

            {/* TABLE */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', background: "var(--surface-alt)", borderBottom: `1.5px solid var(--border)` }}>
                        <th style={thStyle}>Location</th>
                        <th style={thStyle}>Event Type</th>
                        <th style={thStyle}>Probability</th>
                        <th style={thStyle}>Time Window</th>
                        <th style={thStyle}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((t) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '14px 12px', fontWeight: 700 }}>{t.location}</td>
                            <td style={{ padding: '14px 12px', color: 'var(--text-mid)' }}>{t.type}</td>
                            <td style={{ padding: '14px 12px', color: 'var(--primary)', fontWeight: 800 }}>{t.probability}</td>
                            <td style={{ padding: '14px 12px', fontFamily: 'monospace' }}>{t.timeframe}</td>
                            <td style={{ padding: '14px 12px' }}>
                                <button onClick={() => handleEditClick(t)} style={btnStyle}>View Details</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* SIDE DRAWER (Prediction Details) */}
            {isDrawerOpen && (
                <>
                    <div onClick={() => setIsDrawerOpen(false)} style={backdropStyle} />
                    <div style={drawerStyle}>
                        <div style={drawerHeaderStyle}>
                            <h3>Prediction Insight</h3>
                            <button onClick={() => setIsDrawerOpen(false)}><X size={16}/></button>
                        </div>
                        <div style={{ padding: 20 }}>
                            <p><strong>Location:</strong> {editItem?.location}</p>
                            <p><strong>Risk Level:</strong> {editItem?.probability}</p>
                            
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

const thStyle = { fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", padding: "14px 12px" };
const btnStyle = { padding: "6px 14px", borderRadius: 8, border: `1.5px solid var(--border)`, background: "var(--surface)", cursor: "pointer" };
const backdropStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 999 };
const drawerStyle = { position: 'fixed', top: 0, right: 0, width: '400px', height: '100%', background: 'var(--surface)', zIndex: 1000, boxShadow: '-5px 0 15px rgba(0,0,0,0.1)' };
const drawerHeaderStyle = { padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' };