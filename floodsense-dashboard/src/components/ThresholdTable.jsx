import React, { useState, useEffect } from 'react';
import { fetchThresholds, updateThresholdAPI } from '../api/services/alertService';
import { C, Btn, Input, Select } from '../shared.jsx';
import { Search, Droplets, CloudRain } from 'lucide-react';


export default function ThresholdTable() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedParam, setSelectedParam] = useState("Water Level");

    useEffect(() => {
        if (data.length === 0) {
            loadThresholds(true);
        } else {
            loadThresholds(false);
        }
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

    const handleSave = async () => {
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
                setEditItem(null);
                await loadThresholds(false);
                alert("Threshold updated successfully!");
            }
        } catch (err) {
            console.error("Update failed:", err);
            alert("Update failed.");
        }
    };

    const filteredData = data.filter(t =>
        t.area?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && data.length === 0) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>
                <div className="pulse" style={{ fontSize: 13, fontWeight: 600 }}> Syncing Configurations...</div>
            </div>
        );
    }

    return (
        <div style={{ opacity: loading ? 0.7 : 1, transition: '0.3s' }}>
            {/* SEARCH & FILTER BAR */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', padding: '12px', background: '#f9f9f9', borderRadius: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 2 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#aaa' }} />
                    <Input 
                        placeholder="Search area..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '38px', width: '100%' }}
                    />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: C.mid, whiteSpace: 'nowrap' }}>TYPE:</label>
                    <Select value={selectedParam} onChange={(e) => { setSelectedParam(e.target.value); setEditItem(null); }} style={{ width: '100%', height: '38px' }}>
                        <option value="Water Level"> Water Level</option>
                        <option value="Rainfall"> Rainfall Rate</option>
                    </Select>
                </div>
            </div>

            {/* TABLE */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', fontSize: '12px', color: '#aaa', borderBottom: `1px solid ${C.border}` }}>
                        <th style={{ padding: '12px' }}>Area & Location</th>
                        <th>Warning ({selectedParam === "Water Level" ? "m" : "mm"})</th>
                        <th>Critical ({selectedParam === "Water Level" ? "m" : "mm"})</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length > 0 ? (
                        filteredData.map((t) => (
                            <tr key={t.id} className="fadeUp" style={{ borderBottom: '1px solid #fafafa' }}>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {selectedParam === "Water Level" ? <Droplets size={14} color="#3498db"/> : <CloudRain size={14} color="#9b59b6"/>}
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{t.area?.name}</div>
                                            <div style={{ fontSize: 10, color: C.mid }}>{selectedParam} Config</div>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    {editItem?.id === t.id ? (
                                        <Input 
                                            type="number" 
                                            value={selectedParam === "Water Level" ? (editItem.water_warning_level ?? "") : (editItem.rain_warning_level ?? "")} 
                                            onChange={(e) => setEditItem({
                                                ...editItem, 
                                                [selectedParam === "Water Level" ? 'water_warning_level' : 'rain_warning_level']: e.target.value
                                            })}
                                            style={{width: 75, padding: '4px'}}
                                        />
                                    ) : (
                                        <span style={{ fontFamily: "DM Mono", fontSize: '13px' }}>
                                            {selectedParam === "Water Level" ? (t.water_warning_level ?? 0) : (t.rain_warning_level ?? 0)}
                                            {selectedParam === "Water Level" ? "m" : "mm"}
                                        </span>
                                    )}
                                </td>

                                <td>
                                    {editItem?.id === t.id ? (
                                        <Input 
                                            type="number" 
                                            value={selectedParam === "Water Level" ? (editItem.water_critical_level ?? "") : (editItem.rain_critical_level ?? "")} 
                                            onChange={(e) => setEditItem({
                                                ...editItem, 
                                                [selectedParam === "Water Level" ? 'water_critical_level' : 'rain_critical_level']: e.target.value
                                            })}
                                            style={{width: 75, padding: '4px'}}
                                        />
                                    ) : (
                                        <span style={{ fontFamily: "DM Mono", color: C.red, fontWeight: 700, fontSize: '13px' }}>
                                            {selectedParam === "Water Level" ? (t.water_critical_level ?? 0) : (t.rain_critical_level ?? 0)}
                                            {selectedParam === "Water Level" ? "m" : "mm"}
                                        </span>
                                    )}
                                </td>

                                <td>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                                        <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3, width: 60, overflow: 'hidden' }}>
                                            <div style={{ width: '70%', height: "100%", background: C.green }} />
                                        </div>
                                        <span style={{ fontSize: 9, fontWeight: 700, color: C.green }}>LIVE</span>
                                    </div>
                                </td>

                                <td>
                                    {editItem?.id === t.id ? (
                                        <div style={{display: 'flex', gap: 5}}>
                                            <Btn onClick={handleSave} style={{padding: '4px 8px', fontSize: 10, background: C.green, color: '#fff'}}>Save</Btn>
                                            <Btn onClick={() => setEditItem(null)} style={{padding: '4px 8px', fontSize: 10, background: '#eee', color: '#333'}}>X</Btn>
                                        </div>
                                    ) : (
                                        <button onClick={() => setEditItem(t)} style={{ padding: "4px 10px", borderRadius: 7, border: `1.5px solid ${C.border}`, background: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#ccc' }}>No results</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}