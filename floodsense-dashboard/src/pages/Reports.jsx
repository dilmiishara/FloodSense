import { useState, useEffect } from "react";
import { Card, Btn, Input, Select, FormGroup, globalCSS, TabBar } from "../shared.jsx";
import { FileText, Download, Clock, HardDrive, Trash2, Search, Info, ShieldCheck } from "lucide-react";
import { useToast } from "../context/ToastContext";

import { fetchAreas } from "../api/services/userService";
import { generateReportAPI, fetchReportArchive, deleteReportAPI } from "../api/services/reportService";

// ── Delete Modal ──────────────────────────────────────────────────────────────
const DeleteModal = ({ isOpen, onClose, onConfirm, reportName }) => {
  if (!isOpen) return null;
  return (
    <div style={modalOverlay}>
      <div className="fadeUp" style={modalContent}>
        <div style={iconCircle}><Trash2 size={24} color="var(--red)" /></div>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "16px 0 8px", color: "var(--text)" }}>Delete Report?</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
          Are you sure you want to delete <b style={{ color: "var(--text)" }}>{reportName}</b>?
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={onConfirm} style={confirmBtn}>Confirm Delete</button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function Reports() {
  const toast = useToast();

  const [tab,            setTab]            = useState("generate");
  const [format,         setFormat]         = useState("PDF");
  const [loading,        setLoading]        = useState(false);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [areas,          setAreas]          = useState([]);
  const [archiveReports, setArchiveReports] = useState([]);
  const [formData,       setFormData]       = useState({
    reportType: "Alert History Report", areaId: "", fromDate: "", toDate: "",
  });

  const BASE_URL = "https://floodsense-api-389447895642.asia-southeast1.run.app";
  const tabs = [
    { id: "generate", label: "Generate Report" },
    { id: "archive",  label: "Report Archive"  },
  ];

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    setLoadingInitial(true);
    try {
      const [areaRes, archiveRes] = await Promise.all([fetchAreas(), fetchReportArchive()]);
      setAreas(areaRes.data.data || areaRes.data);
      setArchiveReports(archiveRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Load Failed", "Could not load data. Please refresh.");
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleGenerate = async () => {
    if (formData.reportType !== "Flood Prediction Analysis") {
      if (!formData.fromDate || !formData.toDate) {
        toast.warning("Missing Dates", "Please select both a start and end date.");
        return;
      }
    }
    setLoading(true);
    try {
      await generateReportAPI({
        report_type:   formData.reportType,
        area_id:       formData.areaId || null,
        from_date:     formData.fromDate,
        to_date:       formData.toDate,
        export_format: format.toUpperCase(),
      });
      toast.success("Report Generated", "Your report has been created and saved to the archive.");
      const archiveRes = await fetchReportArchive();
      setArchiveReports(archiveRes.data);
      setTab("archive");
    } catch (err) {
      console.error(err);
      toast.error("Generation Failed", "Could not generate the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (filePath, fileName) => {
    toast.info("Downloading", `Starting download for: ${fileName}`);
    const link = document.createElement("a");
    link.href = `${BASE_URL}/storage/${filePath}`;
    link.setAttribute("download", fileName);
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = async () => {
    try {
      await deleteReportAPI(selectedReport.id);
      setArchiveReports(archiveReports.filter(r => r.id !== selectedReport.id));
      toast.success("Report Deleted", `"${selectedReport.name}" has been removed from the archive.`);
    } catch (err) {
      toast.error("Delete Failed", "Could not delete this report. Please try again.");
    } finally {
      setIsModalOpen(false);
    }
  };

  const filteredReports = archiveReports.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.area?.name || "Global").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── HEADER ── */}
          <div className="fadeUp" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, color: "var(--text)", lineHeight: 1.1 }}>
                FloodSense Analytics
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 5, fontWeight: 500 }}>
                Generate and manage historical flood intelligence reports
              </div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 800, color: "var(--text-muted)",
              background: "var(--surface-alt)", border: "1px solid var(--border)",
              padding: "6px 14px", borderRadius: 8, letterSpacing: ".5px",
            }}>
              {archiveReports.length} REPORTS IN ARCHIVE
            </div>
          </div>

          {/* ── STAT CARDS — 2 only ── */}
          <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* Total Archives */}
            <Card style={{
              padding: "24px 28px", borderLeft: "5px solid var(--primary)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={statLabel}>TOTAL ARCHIVES</div>
                <div style={{
                  fontSize: loadingInitial ? 15 : 36,
                  fontWeight: 900,
                  color: loadingInitial ? "var(--text-muted)" : "var(--text)",
                  marginTop: 6, lineHeight: 1,
                  transition: "all 0.3s ease",
                  fontStyle: loadingInitial ? "italic" : "normal",
                }}>
                  {loadingInitial ? "Loading..." : archiveReports.length}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontWeight: 600 }}>
                  Reports stored in system
                </div>
              </div>
              <FileText size={40} color="var(--primary)" opacity={0.15} />
            </Card>

            {/* Available Formats */}
            <Card style={{
              padding: "24px 28px", borderLeft: "5px solid var(--accent)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={statLabel}>AVAILABLE FORMATS</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", marginTop: 6, lineHeight: 1 }}>
                  PDF &amp; Excel
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontWeight: 600 }}>
                  Export in your preferred format
                </div>
              </div>
              <HardDrive size={40} color="var(--accent)" opacity={0.15} />
            </Card>
          </div>

          {/* ── TABS ── */}
          <TabBar tabs={tabs} active={tab} onChange={setTab} />

          {/* ── GENERATE TAB ── */}
          {tab === "generate" && (
            <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "1.5fr 0.5fr", gap: 16, alignItems: "stretch" }}>

              {/* Config card */}
              <Card style={{ padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", marginBottom: 28, letterSpacing: -.3 }}>
                    Report Configuration
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
                    <FormGroup label="REPORT CATEGORY">
                      <Select
                        value={formData.reportType}
                        onChange={e => setFormData({ ...formData, reportType: e.target.value })}
                      >
                        <option>Alert History Report</option>
                        <option>Flood Prediction Analysis</option>
                      </Select>
                    </FormGroup>

                    <FormGroup label="TARGET REGION">
                      <Select
                        value={formData.areaId}
                        onChange={e => setFormData({ ...formData, areaId: e.target.value })}
                      >
                        <option value="">All Regions</option>
                        {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </Select>
                    </FormGroup>

                    <FormGroup label="START DATE">
                      <Input
                        type="date"
                        value={formData.fromDate}
                        onChange={e => setFormData({ ...formData, fromDate: e.target.value })}
                      />
                    </FormGroup>

                    <FormGroup label="END DATE">
                      <Input
                        type="date"
                        value={formData.toDate}
                        onChange={e => setFormData({ ...formData, toDate: e.target.value })}
                      />
                    </FormGroup>
                  </div>
                </div>

                {/* Footer row */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderTop: "1px solid var(--border)", paddingTop: 24,
                }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["PDF", "Excel"].map(f => (
                      <button key={f} onClick={() => setFormat(f)} style={formatBtn(format === f)}>{f}</button>
                    ))}
                  </div>
                  <Btn
                    variant="primary"
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{ padding: "12px 36px", fontSize: 14 }}
                  >
                    {loading ? "Generating..." : "Generate Report"}
                  </Btn>
                </div>
              </Card>

              {/* Quick Guide card */}
              <Card style={{
                background: "var(--surface-alt)",
                border: "1.5px dashed var(--border-mid)",
                padding: 28,
                display: "flex", flexDirection: "column", gap: 0,
              }}>
                <div style={{
                  fontSize: 15, fontWeight: 800, color: "var(--text)",
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 24,
                }}>
                  <Info size={17} color="var(--primary)" /> Quick Guide
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {[
                    {
                      icon: <ShieldCheck size={14} color="var(--green)" />,
                      title: "Select Region",
                      desc: "Use a specific region for localized sensor data comparison.",
                    },
                    {
                      icon: <Clock size={14} color="var(--primary)" />,
                      title: "Timeframe",
                      desc: "Analytical accuracy depends on the selected date range logs.",
                    },
                    {
                      icon: <Search size={14} color="var(--text-muted)" />,
                      title: "Tracking",
                      desc: "Once generated, use the Archive tab to access all historical files.",
                    },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{
                        padding: 8, background: "var(--surface)", borderRadius: 10,
                        boxShadow: "var(--shadow)", display: "flex", flexShrink: 0, marginTop: 1,
                      }}>
                        {item.icon}
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-mid)", margin: 0, lineHeight: 1.6 }}>
                        <b style={{ color: "var(--text)" }}>{item.title}:</b> {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ── ARCHIVE TAB ── */}
          {tab === "archive" && (
            <div className="fadeUp">
              {/* Search */}
              <div style={{ marginBottom: 18, position: "relative", maxWidth: 420 }}>
                <Search size={16} color="var(--text-muted)" style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)", pointerEvents: "none",
                }} />
                <input
                  type="text"
                  placeholder="Search by name or region..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={searchField}
                />
              </div>

              {/* Table */}
              <Card style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--surface-alt)", borderBottom: "2px solid var(--border)" }}>
                      <th style={thStyle}>Document Details</th>
                      <th style={thStyle}>Region</th>
                      <th style={thStyle}>Date Generated</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.length > 0 ? filteredReports.map((r, i) => (
                      <tr
                        key={i}
                        style={{ borderBottom: "1px solid var(--border)", transition: ".15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--surface-alt)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{r.name}</div>
                          <div style={{
                            fontSize: 10, color: "var(--text-muted)", marginTop: 3,
                            fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px",
                          }}>
                            {r.type}
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--text-mid)", fontWeight: 600 }}>
                          {r.area?.name || "Global"}
                        </td>
                        <td style={{
                          padding: "16px 20px", fontSize: 12,
                          color: "var(--text-muted)", fontFamily: "monospace", fontWeight: 700,
                        }}>
                          {new Date(r.created_at).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                            <button
                              style={actionBtn("var(--green-bg)", "var(--green)")}
                              onClick={() => handleDownload(r.file_path, r.name)}
                              title="Download"
                            >
                              <Download size={15} />
                            </button>
                            <button
                              style={actionBtn("var(--red-bg)", "var(--red)")}
                              onClick={() => { setSelectedReport(r); setIsModalOpen(true); }}
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" style={{ padding: "60px 40px", textAlign: "center" }}>
                          <FileText size={32} color="var(--border)" style={{ marginBottom: 10 }} />
                          <div style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: 13 }}>
                            No reports found
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
                            {searchTerm ? "Try a different search term." : "Generate your first report to see it here."}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

        </div>
      </div>

      <DeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        reportName={selectedReport?.name}
      />
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const statLabel = { fontSize: 11, fontWeight: 800, color: "var(--text-muted)", letterSpacing: 0.6, textTransform: "uppercase" };

const thStyle = {
  textAlign: "left", padding: "16px 20px",
  fontSize: 11, color: "var(--text-muted)",
  fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.7px",
};

const searchField = {
  width: "100%", padding: "12px 16px 12px 44px", borderRadius: 12,
  border: "1.5px solid var(--border)", fontSize: 13, outline: "none",
  background: "var(--surface-alt)", color: "var(--text)",
  fontFamily: "inherit", transition: ".2s", boxSizing: "border-box",
};

const formatBtn = (active) => ({
  padding: "10px 22px", borderRadius: 10, fontWeight: 800, fontSize: 13,
  cursor: "pointer", transition: ".2s",
  background: active ? "var(--primary)"           : "var(--surface-alt)",
  color:      active ? "#fff"                     : "var(--text-mid)",
  border:     active ? "2px solid var(--primary)" : "2px solid var(--border)",
});

const actionBtn = (bg, color) => ({
  padding: "9px", borderRadius: 10, background: bg, color,
  border: "none", cursor: "pointer", display: "flex",
  alignItems: "center", transition: ".15s",
});

const modalOverlay = {
  position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
  background: "rgba(15,27,61,0.5)", display: "flex",
  alignItems: "center", justifyContent: "center",
  zIndex: 9999, backdropFilter: "blur(8px)",
};
const modalContent = {
  background: "var(--surface)", padding: "36px", borderRadius: 24,
  width: "90%", maxWidth: 420, textAlign: "center",
  boxShadow: "var(--shadow-md)", border: "1px solid var(--border)",
};
const iconCircle = {
  width: 64, height: 64, borderRadius: 16, background: "var(--red-bg)",
  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
};
const cancelBtn  = { flex: 1, padding: "14px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontWeight: 800, cursor: "pointer", fontSize: 13 };
const confirmBtn = { flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "var(--red)", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 13 };