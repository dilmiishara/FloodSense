// ─── Logout.jsx ───────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { C, globalCSS, Header, Sidebar, Toggle } from "../shared.jsx";

export default function Logout({ page, setPage }) {
  const [emergencyMode, setEmergencyMode] = useState(true);
  const [state, setState] = useState("confirm"); // "confirm" | "loading" | "done"
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect countdown after logout
  useEffect(() => {
    if (state !== "done") return;
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(iv); setPage("dashboard"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [state, setPage]);

  const doLogout = () => {
    setState("loading");
    setTimeout(() => { setState("done"); }, 1900);
  };

  const cancel = () => {
    setPage("dashboard");
  };

  const sessionInfo = [
    { k: "Signed in as",    v: "Ravi Kumara · Admin" },
    { k: "Session started", v: "21 Mar 2026 · 08:14 LKT" },
    { k: "Session duration",v: "6h 18m" },
    { k: "Active alerts",   v: "⚠ 3 CRITICAL — monitoring continues", danger: true },
  ];

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight: "100vh", background: C.bg }}>
        <Header emergencyMode={emergencyMode} setEmergencyMode={setEmergencyMode} />
        <div style={{ display: "flex", margin: "12px 14px 14px" }}>
          <Sidebar page={page} setPage={setPage} />

          {/* Centred content area */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 520 }}>
            <div style={{ width: "100%", maxWidth: 480 }}>

              {/* ── CONFIRM STATE ── */}
              {state === "confirm" && (
                <div className="fadeUp" style={{ background: C.white, borderRadius: 20, padding: "36px 40px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,.1)" }}>
                  {/* Icon */}
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.redBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>⎋</div>

                  <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -.4, marginBottom: 8 }}>Sign Out of FloodSense?</div>
                  <div style={{ fontSize: 14, color: C.mid, lineHeight: 1.6, marginBottom: 10 }}>
                    You are about to end your current session. Any unsaved changes will be lost.
                  </div>

                  {/* Session info box */}
                  <div style={{ background: C.bg, borderRadius: 12, padding: "14px 18px", margin: "16px 0 24px", textAlign: "left" }}>
                    {sessionInfo.map((row, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "4px 0" }}>
                        <span style={{ color: "#aaa", fontWeight: 600 }}>{row.k}</span>
                        <span style={{ fontWeight: 700, fontFamily: "DM Mono", fontSize: 11, color: row.danger ? C.red : C.dark }}>{row.v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Buttons */}
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={cancel} style={{ flex: 1, padding: 13, borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", background: C.bg, color: C.dark, border: `2px solid ${C.border}` }}>
                      ← Stay Signed In
                    </button>
                    <button onClick={doLogout} style={{ flex: 1, padding: 13, borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", background: C.red, color: "#fff", border: "none" }}>
                      Sign Out →
                    </button>
                  </div>

                  <div style={{ fontSize: 12, color: "#bbb", marginTop: 14, lineHeight: 1.6 }}>
                    ⚠ Active critical alerts are being monitored. The system will continue running and notifying registered contacts after you sign out.
                  </div>
                </div>
              )}

              {/* ── LOADING STATE ── */}
              {state === "loading" && (
                <div className="fadeUp" style={{ background: C.white, borderRadius: 20, padding: "36px 40px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,.1)" }}>
                  <div className="spinner" />
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Signing Out…</div>
                  <div style={{ fontSize: 13, color: "#aaa" }}>Saving your session data and clearing credentials</div>
                  <div className="progbar"><div className="progfill" /></div>
                </div>
              )}

              {/* ── DONE STATE ── */}
              {state === "done" && (
                <div className="fadeUp" style={{ background: C.white, borderRadius: 20, padding: "36px 40px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,.1)" }}>
                  {/* Success icon */}
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.greenBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px", animation: "popIn .4s ease" }}>✅</div>

                  <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>You've Been Signed Out</div>
                  <div style={{ fontSize: 14, color: C.mid, marginBottom: 6 }}>Your session has ended and credentials have been cleared.</div>

                  {/* Monitoring still active note */}
                  <div style={{ background: C.greenBg, borderRadius: 10, padding: "12px 16px", fontSize: 12, color: C.green, fontWeight: 600, marginTop: 12 }}>
                    ✅ Monitoring is still active · 3 critical alerts being tracked by system
                  </div>

                  <div style={{ fontSize: 12, color: "#bbb", marginTop: 14 }}>
                    Redirecting to dashboard in <strong style={{ color: C.dark }}>{countdown}</strong> second{countdown !== 1 ? "s" : ""}…
                  </div>

                  <button
                    onClick={() => setPage("dashboard")}
                    style={{ marginTop: 20, padding: "11px 32px", borderRadius: 11, background: C.dark, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none" }}
                  >
                    Go to Dashboard →
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}