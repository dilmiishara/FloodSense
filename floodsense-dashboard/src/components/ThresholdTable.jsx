import React, { useState, useEffect } from 'react';
import { fetchThresholds, updateThresholdAPI } from '../api/services/alertService';
import { C, Btn, Input, Select } from '../shared.jsx';
import { Search } from 'lucide-react'; // Search icon එක සඳහා

export default function ThresholdTable() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editItem, setEditItem] = useState(null); 
    
    // Search සහ Filter සඳහා States
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadThresholds();
    }, []);

    const loadThresholds = async () => {
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
            await updateThresholdAPI(editItem);
            setEditItem(null);
            loadThresholds();
            alert("Threshold updated successfully!");
        } catch (err) {
            alert("Update failed");
        }
    };

    // Filter Logic: නම අනුව නගරය සෙවීම
    const filteredData = data.filter(t => 
        t.area?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{padding: 20, color: '#aaa'}}>Loading thresholds...</div>;

    return (
        <div>
            {/* ─── SEARCH & FILTER HEADER ─── */}
            <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginBottom: '20px', 
                padding: '10px', 
                background: '#f9f9f9', 
                borderRadius: '10px',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#aaa' }} />
                    <Input 
                        placeholder="Search area (e.g. Ratnapura...)" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '35px', width: '100%' }}
                    />
                </div>
                <div style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>
                    Showing {filteredData.length} Areas
                </div>
            </div>

            {/* ─── TABLE ─── */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', fontSize: '12px', color: '#aaa', borderBottom: `1px solid ${C.border}` }}>
                        <th style={{ padding: '12px' }}>Parameter & Area</th>
                        <th>Warning Level</th>
                        <th>Critical Level</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length > 0 ? (
                        filteredData.map((t) => (
                            <tr key={t.id} className="fadeUp" style={{ borderBottom: '1px solid #fafafa' }}>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ fontWeight: 700, fontSize: 13 }}>Water Level</div>
                                    <div style={{ fontSize: 11, color: C.mid }}>{t.area?.name}</div>
                                </td>
                                <td>
                                    {editItem?.id === t.id ? (
                                        <Input 
                                            type="number" 
                                            value={editItem.water_warning_level} 
                                            onChange={(e) => setEditItem({...editItem, water_warning_level: e.target.value})}
                                            style={{width: 70, padding: '4px'}}
                                        />
                                    ) : (
                                        <span style={{ fontFamily: "DM Mono", fontSize: '13px' }}>{t.water_warning_level}m</span>
                                    )}
                                </td>
                                <td>
                                    {editItem?.id === t.id ? (
                                        <Input 
                                            type="number" 
                                            value={editItem.water_critical_level} 
                                            onChange={(e) => setEditItem({...editItem, water_critical_level: e.target.value})}
                                            style={{width: 70, padding: '4px'}}
                                        />
                                    ) : (
                                        <span style={{ fontFamily: "DM Mono", color: C.red, fontWeight: 700, fontSize: '13px' }}>{t.water_critical_level}m</span>
                                    )}
                                </td>
                                <td>
                                    <div style={{ fontSize: 10, color: C.mid, marginBottom: 4 }}>System Monitoring</div>
                                    <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3, width: 100 }}>
                                        <div style={{ width: '60%', height: "100%", background: C.green, borderRadius: 3 }} />
                                    </div>
                                </td>
                                <td>
                                    {editItem?.id === t.id ? (
                                        <div style={{display: 'flex', gap: 5}}>
                                            <Btn onClick={handleSave} style={{padding: '4px 8px', fontSize: 10, background: C.green}}>Save</Btn>
                                            <Btn onClick={() => setEditItem(null)} style={{padding: '4px 8px', fontSize: 10, background: '#eee', color: '#333'}}>X</Btn>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setEditItem(t)}
                                            style={{ 
                                                padding: "4px 10px", 
                                                borderRadius: 7, 
                                                border: `1.5px solid ${C.border}`, 
                                                background: "#fff", 
                                                fontSize: 11, 
                                                fontWeight: 700, 
                                                cursor: "pointer" 
                                            }}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#ccc' }}>
                                No areas found matching "{searchTerm}"
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}