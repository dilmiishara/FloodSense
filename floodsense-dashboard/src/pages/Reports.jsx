// ─── Reports.jsx  ─────────────────────────────────────────────
import { useState } from "react";
import { C, Card, Btn, Input, Select, FormGroup, globalCSS, TabBar, Toast } from "../shared.jsx";

export default function Reports() {
  const [tab, setTab] = useState("generate");
  const [format, setFormat] = useState("PDF");
  const [toast, setToast] = useState(null);

  const tabs = [
    { id: "generate", label: "Generate Report" },
    { id: "archive", label: "Report Archive" },
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const archiveReports = [
    { name: "Water Level Report — 21 Mar 2026", type: "Water Level", district: "All", date: "21 Mar 14:30", size: "1.2MB" },
    { name: "Rainfall Report — 21 Mar 2026", type: "Rainfall", district: "Ratnapura", date: "21 Mar 10:15", size: "900KB" },
    { name: "Sensor Data Report — Week 11", type: "Sensor", district: "All", date: "20 Mar 08:00", size: "700KB" },
  ];

  const actBtn = {
    padding: "4px 9px",
    borderRadius: 7,
    border: `1.5px solid ${C.border}`,
    background: "#fff",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <>
      <style>{globalCSS}</style>

      <div style={{ minHeight: "100vh", background: C.bg }}>

        <div style={{ display: "flex", margin: "12px 14px 14px" }}>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* HEADER */}
            <div className="fadeUp" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>Reports</div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  Generate and manage analytical data for flood monitoring
                </div>
              </div>
            </div>

            {/* STAT CARDS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <Card style={{ padding: "14px", borderLeft: "4px solid #000" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>TOTAL REPORTS</div>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>482</div>
                </Card>
                <Card style={{ padding: "14px", borderLeft: "4px solid #4CAF50" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>LAST GENERATED</div>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>Today, 09:13 AM</div>
                </Card>
                <Card style={{ padding: "14px", borderLeft: "4px solid #2196F3" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>STORAGE USED</div>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>124.5 MB</div>
                </Card>
            </div>

            <TabBar tabs={tabs} active={tab} onChange={setTab} />

            {/* ───────── GENERATE TAB ───────── */}
            {tab === "generate" && (
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: 16 }}>
                
                
                <Card>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>
                    Report Configuration
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 20
                  }}>
                    <FormGroup label="Report Type">
                      <Select>
                        <option>Water Level</option>
                        <option>Rainfall</option>
                        <option>Sensor Data</option>
                      </Select>
                    </FormGroup>

                    <FormGroup label="District">
                      <Select>
                        <option>All Area</option>
                        <option>Eheliyagoda </option>
                        <option>Kuruvita </option>
                        <option>Kiriella </option>
                        <option>Ratnapura</option>
                        <option>Imbulpe </option>
                        <option>Balangoda </option>
                        <option>Opanayake </option>
                        <option>Pelmadulla </option>
                        <option>Elapatha</option>
                        <option>Ayagama</option>
                        <option>Kalawana</option>
                        <option>Nivithigala</option>
                        <option>Kahawatta</option>
                        <option>Godakawela</option>
                        <option>Weligepola </option>
                        <option>Embilipitiya</option>
                        <option>Kolonna</option>
                      </Select>
                    </FormGroup>

                    <FormGroup label="Date From">
                      <Input type="date" />
                    </FormGroup>

                    <FormGroup label="Date To">
                      <Input type="date" />
                    </FormGroup>
                  </div>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    borderTop: `1px solid ${C.border}`,
                    paddingTop: 16
                  }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 8 }}>EXPORT FORMAT</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {["PDF", "Excel", "CSV"].map((f) => (
                          <button
                            key={f}
                            onClick={() => setFormat(f)}
                            style={{
                              padding: "7px 14px",
                              borderRadius: 8,
                              border: `1.5px solid ${format === f ? C.dark : C.border}`,
                              background: format === f ? C.dark : "#fff",
                              color: format === f ? "#fff" : C.mid,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Btn onClick={() => showToast(` ${format} report generated`)}>
                      Generate Report
                    </Btn>
                  </div>
                </Card>

                {/* Info Card */}
                <Card style={{ background: "#fdfdfd" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Reporting Tips</div>
                    <ul style={{ fontSize: 12, color: "#666", paddingLeft: 18, lineHeight: "1.8em" }}>
                        <li>Monthly reports include automated summaries.</li>
                        <li>Rainfall data is updated every 15 minutes.</li>
                        <li>PDF format is recommended for official printing.</li>
                    </ul>
                    <div style={{ marginTop: 20, padding: 12, background: "#f1f1f1", borderRadius: 8, fontSize: 11, color: "#555" }}>
                        <b>Note:</b> Generating large reports (over 3 months) may take a few seconds.
                    </div>
                </Card>
              </div>
            )}

            {/* ───────── ARCHIVE TAB ───────── */}
            {tab === "archive" && (
              <Card style={{ padding: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#f8f8f8", borderBottom: `1px solid ${C.border}` }}>
                    <tr>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12 }}>Name</th>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12 }}>Type</th>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12 }}>District</th>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12 }}>Date</th>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12 }}>Size</th>
                      <th style={{ textAlign: "center", padding: "12px 16px", fontSize: 12 }}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {archiveReports.map((r, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600 }}>{r.name}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12 }}>{r.type}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12 }}>{r.district}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12 }}>{r.date}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12 }}>{r.size}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <button
                            style={actBtn}
                            onClick={() => showToast("Downloading...")}
                          >
                            Download ⬇
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

          </div>
        </div>
      </div>

      <Toast message={toast} />
    </>
  );
}