import React, { useState, useEffect } from 'react';
import { fetchThresholds, updateThresholdAPI } from '../api/services/alertService';
import { C, Btn, Input, Select } from '../shared.jsx';
import { Search, Droplets, CloudRain, X, Sliders, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ThresholdTable() {
    const toast = useToast();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedParam, setSelectedParam] = useState("Water Level");
    
    
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    useEffect(() => {
        loadThresholds(data.length === 0);
    }, []);

    const loadThresholds = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const res = await fetchThresholds();
            setData(res.data);
        } catch (err) {
            console.error("Error loading thresholds", err);
        } finally {
            setLoading(false);
        }
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
                    animation: "spin 1s linear infinite"
                }}></div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", letterSpacing: '0.8px' }}>
                    LOADING THRESHOLD CONFIGURATIONS...
                </div>
            </div>
        </td>
    </tr>
);

    const handleEditClick = (item) => {
        setEditItem({ ...item }); 
        setIsDrawerOpen(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const areaName = editItem?.area?.name || "Selected Region";

        try {
            const payload = {
                area_id: editItem.area_id,
                water_warning_level: parseFloat(editItem.water_warning_level),
                water_critical_level: parseFloat(editItem.water_critical_level),
                rain_warning_level: parseFloat(editItem.rain_warning_level),
                rain_critical_level: parseFloat(editItem.rain_critical_level),
                rise_rate_limit: parseFloat(editItem.rise_rate_limit) || 0.35
            };

            const response = await updateThresholdAPI(payload);
            if (response.status === 200 || response.status === 201) {
                setIsDrawerOpen(false);
                setEditItem(null);
                await loadThresholds(false);
                
                toast.success(
                    "Thresholds Synced",
                    `Safety metrics for ${areaName} have been updated successfully.`,
                    4000
                );
            }
        } catch (err) {
            console.error("Update failed:", err);
            toast.error(
                "Update Failed",
                `Could not update configurations for ${areaName}.`
            );
        } finally {
            setIsSaving(false);
        }
    };

    const filteredData = data.filter(t =>
        t.area?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );



    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            
            {/* SEARCH & FILTER BAR */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', padding: '12px', background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 2 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
                    <Input 
                        placeholder="Search area..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '38px', width: '100%', height: '38px' }}
                    />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>TYPE:</label>
                    <Select value={selectedParam} onChange={(e) => setSelectedParam(e.target.value)} style={{ width: '100%', height: '38px' }}>
                        <option value="Water Level">Water Level</option>
                        <option value="Rainfall">Rainfall Rate</option>
                    </Select>
                </div>
            </div>

           {/* TABLE */}
<table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
        <tr style={{ textAlign: 'left', background: "var(--surface-alt)", borderBottom: `1.5px solid var(--border)` }}>
            <th style={thStyle}>Area & Location</th>
            <th style={thStyle}>Warning ({selectedParam === "Water Level" ? "m" : "mm"})</th>
            <th style={thStyle}>Critical ({selectedParam === "Water Level" ? "m" : "mm"})</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Action</th>
        </tr>
    </thead>
    <tbody>
        {loading ? (
            <LoadingView colSpan={5} />
        ) : filteredData.length > 0 ? (
            filteredData.map((t) => (
                <tr key={t.id} className="fadeUp" style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    
                    <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {selectedParam === "Water Level" ? <Droplets size={16} color="#3498db"/> : <CloudRain size={16} color="#9b59b6"/>}
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{t.area?.name}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{selectedParam} Matrix</div>
                            </div>
                        </div>
                    </td>
                    <td style={{ padding: '14px 12px', fontFamily: "DM Mono", fontSize: '13px', fontWeight: 600 }}>
                        {selectedParam === "Water Level" ? (t.water_warning_level ?? 0) : (t.rain_warning_level ?? 0)}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>{selectedParam === "Water Level" ? "m" : "mm"}</span>
                    </td>
                    <td style={{ padding: '14px 12px', fontFamily: "DM Mono", color: "var(--red)", fontWeight: 700, fontSize: '13px' }}>
                        {selectedParam === "Water Level" ? (t.water_critical_level ?? 0) : (t.rain_critical_level ?? 0)}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>{selectedParam === "Water Level" ? "m" : "mm"}</span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ height: 6, background: "var(--border)", borderRadius: 3, width: 50, overflow: 'hidden' }}>
                                <div style={{ width: '100%', height: "100%", background: "var(--green)" }} />
                            </div>
                            <span style={{ fontSize: 9, fontWeight: 900, color: "var(--green)" }}>LIVE</span>
                        </div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                        <button 
                            onClick={() => handleEditClick(t)} 
                            style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid var(--border)`, background: "var(--surface)", color: "var(--text-mid)", fontSize: 11, fontWeight: 800, cursor: "pointer", transition: 'all 0.2s' }}
                        >
                            Edit Config
                        </button>
                    </td>
                </tr>
            ))
        ) : (
            <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No areas match your search.
                </td>
            </tr>
        )}
    </tbody>
</table>
            
            {/* Backdrop Overlay */}
            {isDrawerOpen && (
                <div 
                    onClick={() => setIsDrawerOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,61,0.2)', backdropFilter: 'blur(4px)', zIndex: 9999, transition: 'all 0.3s' }}
                />
            )}

            {/* Drawer Body */}
            <div style={{
                position: 'fixed', top: 0, right: isDrawerOpen ? 0 : '-420px', bottom: 0,
                width: '100%', maxWidth: '400px', background: 'var(--surface)',
                boxShadow: '-10px 0 40px rgba(0,0,0,0.15)', zIndex: 10000,
                transition: 'right 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border)'
            }}>
                {/* Drawer Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-alt)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Sliders size={18} color="var(--primary)" />
                        <div>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--text)' }}>{editItem?.area?.name}</h3>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Configure Strategic Parameters</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsDrawerOpen(false)}
                        style={{ border: 'none', background: 'var(--border)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-mid)' }}
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Drawer Content Form */}
                {editItem && (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1, overflowY: 'auto' }}>
                        
                        {/* 🌊 SECTION: WATER LEVEL SETTINGS */}
                        <div>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 800, color: '#3498db', textTransform: 'uppercase', letterSpacing: 0.3, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Droplets size={14} /> Water Level Parameters
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Warning Limit (m)</label>
                                    <Input 
                                        type="number" step="0.1"
                                        value={editItem.water_warning_level ?? ""}
                                        onChange={(e) => setEditItem({ ...editItem, water_warning_level: e.target.value })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Critical Limit (m)</label>
                                    <Input 
                                        type="number" step="0.1"
                                        value={editItem.water_critical_level ?? ""}
                                        onChange={(e) => setEditItem({ ...editItem, water_critical_level: e.target.value })}
                                        style={{ width: '100%', borderColor: 'var(--red-border)' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

                        {/* SECTION: RAINFALL SETTINGS */}
                        <div>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 800, color: '#9b59b6', textTransform: 'uppercase', letterSpacing: 0.3, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CloudRain size={14} /> Precipitation Metrics
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Warning Rate (mm)</label>
                                    <Input 
                                        type="number"
                                        value={editItem.rain_warning_level ?? ""}
                                        onChange={(e) => setEditItem({ ...editItem, rain_warning_level: e.target.value })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Critical Rate (mm)</label>
                                    <Input 
                                        type="number"
                                        value={editItem.rain_critical_level ?? ""}
                                        onChange={(e) => setEditItem({ ...editItem, rain_critical_level: e.target.value })}
                                        style={{ width: '100%', borderColor: 'var(--red-border)' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

                        {/* SECTION: ADVANCED ANALYSIS */}
                        <div>
                            <label style={labelStyle}>Flash-Rise Gradient Limit (m/hr)</label>
                            <Input 
                                type="number" step="0.05"
                                value={editItem.rise_rate_limit ?? 0.35}
                                onChange={(e) => setEditItem({ ...editItem, rise_rate_limit: e.target.value })}
                                style={{ width: '100%' }}
                            />
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                                Triggers early predictive alerts if the river rise velocity crosses this gradient marker.
                            </span>
                        </div>
                    </div>
                )}

                {/* Drawer Footer Actions */}
                <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12, background: 'var(--surface-alt)' }}>
                    <Btn 
                        variant="outline" 
                        onClick={() => setIsDrawerOpen(false)} 
                        style={{ flex: 1, height: '42px', borderRadius: 10 }}
                        disabled={isSaving}
                    >
                        Cancel
                    </Btn>
                    <Btn 
                        onClick={handleSave} 
                        style={{ flex: 2, height: '42px', borderRadius: 10, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        disabled={isSaving}
                    >
                        <Save size={14} />
                        {isSaving ? "Saving Config..." : "Save Metrics"}
                    </Btn>
                </div>
            </div>

        </div>
    );
}

const thStyle = {
    fontSize: 11, fontWeight: 800, color: "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: 0.5, padding: "14px 12px",
};

const labelStyle = {
    fontSize: 11, fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: 6
};