// ─── Reports.jsx ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { C, Card, Badge, Btn, Input, Select, FormGroup, Toggle, globalCSS, Header, Sidebar, TabBar, Toast } from "./shared";

export default function Reports({ page, setPage }) {
  const [emergencyMode, setEmergencyMode] = useState(true);
  const [tab, setTab]     = useState("generate");
  const [format, setFormat] = useState("PDF");
  const [toast, setToast] = useState(null);
  const [schedToggles, setSchedToggles] = useState([true, true, true, true, false]);

  const tabs = [
    { id: "generate",   label: "Generate Report" },
    { id: "archive",    label: "Report Archive" },
    { id: "incident",   label: "Incident Reports" },
    
  ];

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const archiveReports = [
    { name:"Flood Status — 21 Mar 2026",   sub:"7-day summary · All districts",       type:"Flood Status", district:"All",      date:"21 Mar 14:30", size:"2.4MB" },
    { name:"Incident Report — Ratnapura",   sub:"Critical event · Water overflow",     type:"Incident",     district:"Ratnapura", date:"21 Mar 10:15", size:"1.1MB" },
    { name:"Sensor Performance — Week 11",  sub:"All sensors · Uptime & accuracy",     type:"Sensor",       district:"All",      date:"20 Mar 08:00", size:"890KB" },
    { name:"District Summary — Kalutara",   sub:"Monthly overview · March 2026",       type:"Flood Status", district:"Kalutara", date:"19 Mar 16:45", size:"1.8MB" },
    { name:"Flood Status — 14 Mar 2026",    sub:"7-day summary · All districts",       type:"Flood Status", district:"All",      date:"14 Mar 14:30", size:"2.2MB" },
    { name:"Incident Report — Galle",       sub:"River overflow event · Kalu Ganga",   type:"Incident",     district:"Galle",    date:"12 Mar 09:30", size:"1.4MB" },
  ];

  const incidents = [
    { title:" Water Overflow — Kalu Ganga",  desc:"3 villages affected",               loc:"Ratnapura", date:"21 Mar", severity:"critical", status:"warn",   statusLabel:"ACTIVE" },
    { title:" Road Closure — A8 Highway",     desc:"Flooding near Payagala junction",   loc:"Kalutara",  date:"21 Mar", severity:"critical", status:"warn",   statusLabel:"ACTIVE" },
    { title:" Evacuation — Ratnapura South",  desc:"240 residents moved to safe zones", loc:"Ratnapura", date:"20 Mar", severity:"critical", status:"active", statusLabel:"RESOLVED" },
    { title:" Sensor Failure — Colombo West", desc:"Power outage · Backup depleted",    loc:"Colombo",   date:"19 Mar", severity:"high",     status:"active", statusLabel:"RESOLVED" },
    { title:" Bridge Damage — Galle Rd",      desc:"Structural damage · Closed",        loc:"Galle",     date:"18 Mar", severity:"critical", status:"active", statusLabel:"RESOLVED" },
  ];



 

  const [selectedCategories, setSelectedCategories] = useState(["Water Level Data","Rainfall Data"]);
  const actBtn = { padding: "4px 9px", borderRadius: 7, border: `1.5px solid ${C.border}`, background: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" };
  const typeBadgeStyle = (type) => ({
    fontSize: 11, borderRadius: 6, padding: "3px 8px", fontWeight: 700, display: "inline-block",
    background: type === "Incident" ? C.redBg : type === "Sensor" ? "#f0f0f0" : C.blueBg,
    color:       type === "Incident" ? C.red   : type === "Sensor" ? "#555"    : C.blue,
  });

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight: "100vh", background: C.bg }}>
        <Header emergencyMode={emergencyMode} setEmergencyMode={setEmergencyMode} />
        <div style={{ display: "flex", margin: "12px 14px 14px" }}>
          <Sidebar page={page} setPage={setPage} />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: "calc(100vh - 110px)", paddingRight: 2 }}>

            {/* Page header */}
            <div className="fadeUp" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -.4 }}> Reports</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>Generate, export and schedule flood monitoring reports</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                
                <Btn>+ Generate New</Btn>
              </div>
            </div>

            <TabBar tabs={tabs} active={tab} onChange={setTab} />

           {/* ── GENERATE (UPDATED) ── */}
{tab === "generate" && (
  <>
    <Card className="fadeUp">
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
        Data Export Configuration
      </div>

      {/* Filters */}
<div 
  style={{ 
    display: "grid", 
    gridTemplateColumns: "1fr 1fr 1fr 1fr", 
    gap: 12, 
    marginBottom: 8 // reduced from 16
  }}
>
  {/* Data Category */}
  <FormGroup label="Data Category">
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {["Water Level Data","Rainfall Data","Sensor Health","Incidents","Safe Zone Status"].map((label, i) => (
        <div
          key={i}
          onClick={() => {
            setSelectedCategories(prev => 
              prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
            );
          }}
          style={{
            padding: "7px 14px",
            borderRadius: 10,
            border: `1.5px solid ${selectedCategories.includes(label) ? C.dark : C.border}`,
            background: selectedCategories.includes(label) ? C.dark : "#fff",
            color: selectedCategories.includes(label) ? "#fff" : C.mid,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {label}
        </div>
      ))}
    </div>
  </FormGroup>

  {/* Date From */}
  <FormGroup label="Date From">
    <Input type="date" defaultValue="2026-03-15" />
  </FormGroup>

  {/* Date To */}
  <FormGroup label="Date To">
    <Input type="date" defaultValue="2026-03-21" />
  </FormGroup>

  {/* District */}
  <FormGroup label="Area">
    <Select>
      <option>All Areas</option>
      <option>Kuruvita  </option>
      <option>Kiriella </option>
      <option>Ratnapura </option>
      <option>Imbulpe </option>
      <option>Balangoda  </option>
      <option>Opanayake  </option>
      <option>Pelmadulla </option>
      <option>Elapatha </option>
      <option>Ayagama </option>
      <option>Kalawana </option>
      <option>Nivithigala </option>
      <option>Kahawatta </option>
      <option>Godakawela  </option>
      <option>Weligepola </option>
      <option>Embilipitiya </option>
      <option>Kolonna </option>
      
    </Select>
  </FormGroup>
</div>

      {/* Extra Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <FormGroup label="Data Granularity">
          <Select>
            <option>Daily</option>
            <option>Hourly</option>
            <option>Weekly</option>
          </Select>
        </FormGroup>

        <FormGroup label="Sort By">
          <Select>
            <option>Date (Newest)</option>
            <option>Date (Oldest)</option>
            <option>Severity Level</option>
          </Select>
        </FormGroup>
      </div>

      {/* Summary Preview */}
      <div style={{ 
        padding: 12, 
        borderRadius: 10, 
        background: "#fafafa", 
        border: `1px solid ${C.border}`, 
        marginBottom: 16 
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>
          Preview Summary
        </div>
        <div style={{ fontSize: 13, color: C.mid }}>
          Selected data will include filtered records based on date range, selected area, and category. Output will be optimized for analysis and reporting.
        </div>
      </div>

      {/* Export */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>
            Export Format
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[[" PDF","PDF"], [" Excel","Excel"]].map(([label,f]) => (
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
                {label}
              </button>
            ))}
          </div>
        </div>

        <Btn onClick={() => showToast(`Exporting ${selectedCategories.join(", ")} as ${format}…`)}>
          ⬇ Export Data
        </Btn>
      </div>
    </Card>

    {/* Stats */}
    <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
      {[["Exports This Month","18",C.dark],
        ["Incidents Logged","12",C.red],
        ["Active Sensors","42",C.blue],
        ["Data Range","7d",C.dark]
      ].map(([l,v,c],i) => (
        <Card key={i} style={{ padding: "14px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>{l}</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: c, marginTop: 4 }}>{v}</div>
        </Card>
      ))}
    </div>
  </>
)}
            {/* ── ARCHIVE ── */}
            {tab === "archive" && (
              <Card className="fadeUp" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
                  <Input placeholder=" Search reports…" style={{ flex: 1, padding: "8px 12px" }}/>
                  <Select style={{ width: 160 }}><option>All Types</option><option>Flood Status</option><option>Incident</option><option>Sensor</option></Select>
                  <Select style={{ width: 160 }}><option>This Month</option><option>Last Month</option><option>Last 3 Months</option></Select>
                </div>
                <table>
                  <thead><tr><th>Report Name</th><th>Type</th><th>District</th><th>Generated</th><th>Size</th><th>Action</th></tr></thead>
                  <tbody>
                    {archiveReports.map((r, i) => (
                      <tr key={i}>
                        <td><div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div><div style={{ fontSize: 11, color: C.mid }}>{r.sub}</div></td>
                        <td><span style={typeBadgeStyle(r.type)}>{r.type}</span></td>
                        <td>{r.district}</td>
                        <td style={{ fontFamily: "DM Mono", fontSize: 11, color: C.mid }}>{r.date}</td>
                        <td style={{ fontFamily: "DM Mono", fontSize: 11, color: C.mid }}>{r.size}</td>
                        <td>
                          <div style={{ display: "flex", gap: 5 }}>
                            <button style={actBtn} onClick={() => showToast(" Downloading report…")}>⬇ PDF</button>
                            <button style={actBtn}>👁</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {/* ── INCIDENTS ── */}
            {tab === "incident" && (
              <Card className="fadeUp" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Input placeholder="🔍 Search incidents…" style={{ flex: 1, padding: "8px 12px", marginRight: 10 }}/>
                  <Btn style={{ fontSize: 12, padding: "7px 14px" }}>+ Log Incident</Btn>
                </div>
                <table>
                  <thead><tr><th>Incident</th><th>Severity</th><th>Location</th><th>Date</th><th>Status</th><th>Report</th></tr></thead>
                  <tbody>
                    {incidents.map((inc, i) => (
                      <tr key={i}>
                        <td><div style={{ fontWeight: 700, fontSize: 13 }}>{inc.title}</div><div style={{ fontSize: 11, color: C.mid }}>{inc.desc}</div></td>
                        <td><Badge type={inc.severity}>{inc.severity.toUpperCase()}</Badge></td>
                        <td>{inc.loc}</td>
                        <td style={{ fontFamily: "DM Mono", fontSize: 11, color: C.mid }}>{inc.date}</td>
                        <td><Badge type={inc.status}>{inc.statusLabel}</Badge></td>
                        <td><button style={actBtn} onClick={() => showToast("📄 Downloading incident report…")}>⬇ PDF</button></td>
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
