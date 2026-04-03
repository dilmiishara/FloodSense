import { useState, useEffect } from "react";
import { C, Card, Btn, Input, Select, FormGroup, globalCSS, TabBar, Toast } from "../shared.jsx";
import { FileText, TrendingUp, Download, Clock, HardDrive, Trash2, Search, CheckCircle, Info, ShieldCheck, Zap } from "lucide-react";

// ✅ API Services
import { fetchAreas } from "../api/services/userService";
import { generateReportAPI, fetchReportArchive, deleteReportAPI } from "../api/services/reportService";

// --- CUSTOM DELETE MODAL ---
const DeleteModal = ({ isOpen, onClose, onConfirm, reportName }) => {
  if (!isOpen) return null;
  return (
    <div style={modalOverlay}>
      <div className="fadeUp" style={modalContent}>
        <div style={iconCircle}><Trash2 size={24} color="#ef4444" /></div>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "16px 0 8px", color: "#1a1a1a" }}>Delete Report?</h2>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>Are you sure you want to delete <b>{reportName}</b>?</p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={onConfirm} style={confirmBtn}>Confirm Delete</button>
        </div>
      </div>
    </div>
  );
};

export default function Reports() {
  const [tab, setTab] = useState("archive");
  const [format, setFormat] = useState("PDF");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const BASE_URL = "http://127.0.0.1:8000";
  const [areas, setAreas] = useState([]);
  const [archiveReports, setArchiveReports] = useState([]);
  const [formData, setFormData] = useState({
    reportType: "Alert History Report", areaId: "", fromDate: "", toDate: ""
  });

  const tabs = [{ id: "generate", label: "Generate Report" }, { id: "archive", label: "Report Archive" }];

  useEffect(() => { loadInitialData(); }, [tab]);

  const loadInitialData = async () => {
    try {
      const areaRes = await fetchAreas();
      setAreas(areaRes.data.data || areaRes.data);
      if (tab === "archive") {
        const archiveRes = await fetchReportArchive();
        setArchiveReports(archiveRes.data);
      }
    } catch (err) { console.error(err); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = async () => {
    if (!formData.fromDate || !formData.toDate) return showToast("Please select dates");
    setLoading(true);
    try {
      await generateReportAPI({
        report_type: formData.reportType, area_id: formData.areaId || null,
        from_date: formData.fromDate, to_date: formData.toDate, export_format: format
      });
      showToast("Report generated successfully!");
      setTab("archive");
    } catch (err) { showToast("Generation failed."); }
    finally { setLoading(false); }
  };

  const handleDownload = (filePath, fileName) => {
    showToast(`Downloading: ${fileName}`);
    const link = document.createElement('a');
    link.href = `${BASE_URL}/storage/${filePath}`;
    link.setAttribute('download', fileName);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = async () => {
    try {
      await deleteReportAPI(selectedReport.id);
      setArchiveReports(archiveReports.filter(r => r.id !== selectedReport.id));
      showToast("Report removed successfully");
    } catch (err) { showToast("Delete failed"); }
    finally { setIsModalOpen(false); }
  };

  const filteredReports = archiveReports.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.area?.name || "Global").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight: "100vh", background: C.bg, padding: "14px" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* HEADER SECTION */}
          <div className="fadeUp" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.7 }}>FloodSense Analytics</div>
              <div style={{ fontSize: 13, color: C.mid, marginTop: 2 }}>Generate and manage historical flood intelligence</div>
            </div>
          </div>

          {/* TOP STAT CARDS */}
          <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <Card style={statCard(C.dark)}>
              <div><div style={statLabel}>TOTAL ARCHIVES</div><div style={statVal}>{archiveReports.length}</div></div>
              <FileText opacity={0.2} size={32} />
            </Card>
            <Card style={statCard(C.green)}>
              <div><div style={statLabel}>SERVER STATUS</div><div style={{...statVal, color: C.green, fontSize: 18}}>SYNCED</div></div>
              <CheckCircle opacity={0.2} color={C.green} size={32} />
            </Card>
            <Card style={statCard(C.blue)}>
              <div><div style={statLabel}>AVAILABLE FORMATS</div><div style={{...statVal, fontSize: 18}}>PDF / EXCEL</div></div>
              <HardDrive opacity={0.2} color={C.blue} size={32} />
            </Card>
          </div>

          <TabBar tabs={tabs} active={tab} onChange={setTab} />

          {/* GENERATE TAB */}
          {tab === "generate" && (
            <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: 16, alignItems: 'stretch' }}>
              <Card style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={20} color={C.blue} /> Configuration
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 30 }}>
                    <FormGroup label="REPORT CATEGORY">
                      <Select value={formData.reportType} onChange={(e)=>setFormData({...formData, reportType: e.target.value})}>
                        <option>Alert History Report</option>
                        <option>Flood Prediction Analysis</option>
                      </Select>
                    </FormGroup>
                    <FormGroup label="TARGET REGION">
                      <Select value={formData.areaId} onChange={(e)=>setFormData({...formData, areaId: e.target.value})}>
                        <option value="">All Regions</option>
                        {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </Select>
                    </FormGroup>
                    <FormGroup label="START DATE">
                      <Input type="date" value={formData.fromDate} onChange={(e)=>setFormData({...formData, fromDate: e.target.value})} />
                    </FormGroup>
                    <FormGroup label="END DATE">
                      <Input type="date" value={formData.toDate} onChange={(e)=>setFormData({...formData, toDate: e.target.value})} />
                    </FormGroup>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: 24 }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["PDF", "Excel"].map(f => (
                      <button key={f} onClick={()=>setFormat(f)} style={formatBtn(format === f)}>{f}</button>
                    ))}
                  </div>
                  <Btn onClick={handleGenerate} disabled={loading} style={{ padding: '12px 32px' }}>
                    {loading ? "Generating..." : "Generate Report"}
                  </Btn>
                </div>
              </Card>

              {/* ENHANCED QUICK GUIDE */}
              <Card style={{ background: "#fcfcfc", border: `1.5px dashed ${C.border}`, padding: 28 }}>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Info size={18} color={C.blue} /> Quick Guide
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={guideItem}>
                    <div style={guideIcon}><ShieldCheck size={14} color={C.green} /></div>
                    <p style={guideText}><b>Select Region:</b> Use specific region for localized sensor data comparison.</p>
                  </div>
                  <div style={guideItem}>
                    <div style={guideIcon}><Clock size={14} color={C.blue} /></div>
                    <p style={guideText}><b>Timeframe:</b> Analytical accuracy depends on the selected date range logs.</p>
                  </div>
                  <div style={guideItem}>
                    <div style={guideIcon}><Search size={14} color={C.mid} /></div>
                    <p style={guideText}><b>Tracking:</b> Once generated, use the Archive tab to track historical files.</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ARCHIVE TAB */}
          {tab === "archive" && (
            <div className="fadeUp">
              <div style={{ marginBottom: 18, position: 'relative', maxWidth: 400 }}>
                <Search size={16} color={C.mid} style={{ position: 'absolute', left: 14, top: 14 }} />
                <input type="text" placeholder="Search by name, region or date..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} style={searchField} />
              </div>

              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa", borderBottom: `1px solid ${C.border}` }}>
                      <th style={thStyle}>DOCUMENT DETAILS</th>
                      <th style={thStyle}>REGION</th>
                      <th style={thStyle}>DATE GENERATED</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.length > 0 ? filteredReports.map((r, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, transition: '0.2s' }} className="tableRowHover">
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: C.mid, marginTop: 3, fontWeight: 600 }}>{r.type.toUpperCase()}</div>
                        </td>
                        <td style={{ padding: "16px 20px", fontSize: 13, color: "#444" }}>{r.area?.name || "Global"}</td>
                        <td style={{ padding: "16px 20px", fontSize: 13, color: C.mid }}>{new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td style={{ padding: "16px 20px", display: 'flex', justifyContent: 'center', gap: 12 }}>
                          <button style={actionBtn("#f0fdf4", "#16a34a", "#dcfce7")} onClick={() => handleDownload(r.file_path, r.name)} title="Download"><Download size={16} /></button>
                          <button style={actionBtn("#fef2f2", "#ef4444", "#fee2e2")} onClick={() => { setSelectedReport(r); setIsModalOpen(true); }} title="Delete"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" style={{ padding: 60, textAlign: 'center', color: C.mid, fontStyle: 'italic' }}>No matching reports found in archive.</td></tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </div>
          )}
        </div>
      </div>

      <DeleteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDelete} reportName={selectedReport?.name} />
      <Toast message={toast} />
    </>
  );
}

// --- PROFESSIONAL STYLES ---
const thStyle = { textAlign: "left", padding: "18px 20px", fontSize: 11, color: C.mid, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px" };
const statCard = (color) => ({ padding: "22px", borderLeft: `5px solid ${color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' });
const statLabel = { fontSize: 11, fontWeight: 800, color: C.mid, letterSpacing: 0.5 };
const statVal = { fontSize: 28, fontWeight: 900, marginTop: 6 };

const searchField = { width: '100%', padding: '12px 16px 12px 42px', borderRadius: 14, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', transition: '0.3s' };

const formatBtn = (active) => ({
  padding: "10px 22px", borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: "pointer", transition: '0.2s',
  background: active ? C.dark : "#fff", color: active ? "#fff" : C.mid, border: `2px solid ${active ? C.dark : C.border}`
});

const actionBtn = (bg, col, brd) => ({
  padding: "10px", borderRadius: 12, background: bg, color: col, border: `1px solid ${brd}`, cursor: "pointer", display: 'flex', alignItems: 'center', transition: '0.2s'
});

const guideItem = { display: 'flex', gap: 12, alignItems: 'flex-start' };
const guideIcon = { padding: 8, background: '#fff', borderRadius: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', marginTop: 2 };
const guideText = { fontSize: 12, color: '#555', margin: 0, lineHeight: '1.6' };

const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(8px)" };
const modalContent = { background: "#fff", padding: "36px", borderRadius: 32, width: "90%", maxWidth: 420, textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" };
const iconCircle = { width: 64, height: 64, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" };
const cancelBtn = { flex: 1, padding: "14px", borderRadius: 16, border: `2px solid ${C.border}`, background: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 14 };
const confirmBtn = { flex: 1, padding: "14px", borderRadius: 16, border: "none", background: "#ef4444", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 14 };