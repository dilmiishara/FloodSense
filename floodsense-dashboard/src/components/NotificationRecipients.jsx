import React, { useState, useEffect } from "react";
import { fetchFieldOfficers } from "../api/services/userService";
import { Card } from "../shared.jsx";
import {
    UserCheck, MessageSquare,
    Phone, X, MapPin, Mail, Search,
    ShieldCheck, Building2,
} from "lucide-react";

export default function NotificationRecipients() {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadOfficers();
    }, []);

    const loadOfficers = async () => {
        try {
            const res = await fetchFieldOfficers();
            setOfficers(res.data.data || res.data || []);
        } catch (err) {
            console.error("Error loading maintainers", err);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (first, last) =>
        `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();

    const getRoleColor   = (role) => role === 1 ? "#ef5350" : "#5c6bc0";
    const getRoleLabel   = (role) => role === 1 ? "Administrator" : "Field Maintainer";
    const getRoleBadgeBg = (role) => role === 1 ? "#fee2e2" : "#ede9fe";

    const filtered = officers.filter(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.area?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ position: "relative" }}>

            {/* ── Recipients Table Card ── */}
            <Card style={{ padding: 0, overflow: "hidden" }}>

                {/* Header */}
                <div style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--surface-alt)",
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", gap: 12,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ background: "var(--primary-bg)", padding: 8, borderRadius: 10 }}>
                            <UserCheck size={16} color="var(--primary)" />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text)" }}>
                                Notification Recipients
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                                {loading ? "Loading..." : `${officers.length} field maintainers registered`}
                            </div>
                        </div>
                    </div>

                    <div style={{ position: "relative", width: 240 }}>
                        <Search size={14} style={{
                            position: "absolute", left: 12, top: 11,
                            color: "var(--text-muted)", pointerEvents: "none",
                        }} />
                        <input
                            placeholder="Search by name or area..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                width: "100%", padding: "9px 12px 9px 34px",
                                borderRadius: 10, fontSize: 12,
                                border: "1.5px solid var(--border)",
                                background: "var(--surface)",
                                color: "var(--text)", outline: "none",
                                fontFamily: "inherit", boxSizing: "border-box",
                            }}
                        />
                    </div>
                </div>

                {/* Table */}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "var(--surface-alt)", textAlign: "left" }}>
                            <th style={th}></th>
                            <th style={th}>NAME</th>
                            <th style={th}>ROLE</th>
                            <th style={th}>AREA</th>
                            <th style={th}>CONTACT</th>
                            <th style={th}>CHANNEL</th>
                            <th style={th}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ padding: "80px 40px", textAlign: "center" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                                        <div style={{
                                            width: 32, height: 32,
                                            border: "4px solid var(--border)",
                                            borderTop: "4px solid var(--primary)",
                                            borderRadius: "50%",
                                            animation: "spin 1s linear infinite",
                                        }} />
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.8px" }}>
                                            FETCHING RECIPIENTS...
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                                    No recipients found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((user) => (
                                <tr key={user.id} className="fadeUp" style={{
                                    borderBottom: "1px solid var(--border)",
                                    transition: "background 0.15s",
                                }}>
                                    <td style={{ padding: "14px 12px" }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: getRoleColor(user.role),
                                            display: "flex", alignItems: "center",
                                            justifyContent: "center",
                                            color: "#fff", fontSize: 12, fontWeight: 900,
                                        }}>
                                            {getInitials(user.first_name, user.last_name)}
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 12px" }}>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>
                                            {user.first_name} {user.last_name}
                                        </div>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                                            {user.email}
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 12px" }}>
                                        <span style={{
                                            display: "inline-block",
                                            padding: "3px 10px", borderRadius: 6,
                                            fontSize: 11, fontWeight: 800,
                                            background: getRoleBadgeBg(user.role),
                                            color: getRoleColor(user.role),
                                        }}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 12px" }}>
                                        <span style={{
                                            display: "inline-flex", alignItems: "center", gap: 5,
                                            fontSize: 12, color: "var(--text-mid)", fontWeight: 600,
                                        }}>
                                            <MapPin size={12} color="var(--text-muted)" />
                                            {user.area?.name || "All Areas"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 12px" }}>
                                        <span style={{
                                            display: "inline-flex", alignItems: "center", gap: 5,
                                            fontSize: 12, color: "var(--text-mid)", fontFamily: "monospace",
                                        }}>
                                            <Phone size={12} color="var(--text-muted)" />
                                            {user.telephone || "—"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 12px" }}>
                                        <span style={{
                                            display: "inline-flex", alignItems: "center", gap: 5,
                                            padding: "4px 10px", borderRadius: 6,
                                            background: "#e8f5e9", color: "#2e7d32",
                                            fontSize: 10, fontWeight: 900,
                                        }}>
                                            <MessageSquare size={10} /> SMS ACTIVE
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 12px" }}>
                                        <button
                                            onClick={() => setSelected(user)}
                                            style={{
                                                padding: "5px 14px", borderRadius: 8,
                                                border: "1.5px solid var(--border)",
                                                background: "var(--surface-alt)",
                                                color: "var(--text-mid)",
                                                fontSize: 11, fontWeight: 800,
                                                cursor: "pointer", transition: "all .15s",
                                            }}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>

            {/* ── Officer Detail Modal ── */}
            {selected && (
                <div
                    onClick={() => setSelected(null)}
                    style={{
                        position: "fixed", inset: 0,
                        background: "rgba(15,27,61,0.45)",
                        backdropFilter: "blur(6px)",
                        zIndex: 2000,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: 20,
                        animation: "fadeInOverlay 0.2s ease",
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: "100%", maxWidth: 440,
                            background: "var(--surface)",
                            borderRadius: 22,
                            boxShadow: "0 24px 70px rgba(15,27,61,0.28)",
                            overflow: "hidden",
                            animation: "popInModal 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
                        }}
                    >
                        {/* ── Modal Header (banner) ── */}
                        <div style={{
                            position: "relative",
                            padding: "30px 28px 24px",
                            background: `linear-gradient(135deg, ${getRoleColor(selected.role)} 0%, ${getRoleColor(selected.role)}cc 100%)`,
                        }}>
                            <button
                                onClick={() => setSelected(null)}
                                style={{
                                    position: "absolute", top: 18, right: 18,
                                    border: "none", background: "rgba(255,255,255,0.18)",
                                    borderRadius: "50%", width: 30, height: 30,
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", cursor: "pointer",
                                    color: "#fff", transition: "background .15s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
                                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
                            >
                                <X size={15} />
                            </button>

                            <div style={{
                                fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.85)",
                                textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 16,
                            }}>
                                Officer Profile
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: 16,
                                    background: "rgba(255,255,255,0.16)",
                                    border: "2px solid rgba(255,255,255,0.35)",
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", flexShrink: 0,
                                    fontSize: 22, fontWeight: 950, color: "#fff",
                                    letterSpacing: -0.5,
                                }}>
                                    {getInitials(selected.first_name, selected.last_name)}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{
                                        fontSize: 19, fontWeight: 950, color: "#fff",
                                        letterSpacing: -0.4, lineHeight: 1.2,
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    }}>
                                        {selected.first_name} {selected.last_name}
                                    </div>
                                    <div style={{
                                        display: "inline-flex", alignItems: "center", gap: 5,
                                        marginTop: 8, padding: "4px 10px", borderRadius: 7,
                                        background: "rgba(255,255,255,0.2)",
                                    }}>
                                        <ShieldCheck size={12} color="#fff" />
                                        <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>
                                            {getRoleLabel(selected.role)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Modal Body ── */}
                        <div style={{
                            padding: "22px 28px", display: "flex",
                            flexDirection: "column", gap: 4,
                            maxHeight: "50vh", overflowY: "auto",
                        }}>
                            <div style={{
                                fontSize: 11, fontWeight: 800, color: "var(--text-muted)",
                                textTransform: "uppercase", letterSpacing: 0.8,
                                marginBottom: 10,
                            }}>
                                Contact Information
                            </div>

                            {[
                                { label: "Phone",  value: selected.telephone || "Not Available", icon: <Phone size={14} /> },
                                { label: "Email",  value: selected.email || "Not Available",      icon: <Mail size={14} /> },
                                { label: "Area",   value: selected.area?.name || "All Areas",     icon: <Building2 size={14} /> },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: "13px 14px", borderRadius: 12,
                                    background: "var(--surface-alt)",
                                    border: "1px solid var(--border)",
                                    marginBottom: 8,
                                }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 9,
                                        background: getRoleBadgeBg(selected.role),
                                        color: getRoleColor(selected.role),
                                        display: "flex", alignItems: "center",
                                        justifyContent: "center", flexShrink: 0,
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>
                                            {item.label}
                                        </div>
                                        <div style={{
                                            fontSize: 13, color: "var(--text)", fontWeight: 800,
                                            marginTop: 2, overflow: "hidden",
                                            textOverflow: "ellipsis", whiteSpace: "nowrap",
                                        }}>
                                            {item.value}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div style={{
                                fontSize: 11, fontWeight: 800, color: "var(--text-muted)",
                                textTransform: "uppercase", letterSpacing: 0.8,
                                margin: "14px 0 10px",
                            }}>
                                Alert Settings
                            </div>

                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "13px 14px", borderRadius: 12,
                                background: "#e8f5e9", border: "1px solid #c8e6c9",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 9,
                                        background: "#c8e6c9", color: "#2e7d32",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <MessageSquare size={14} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: "#2e7d32" }}>
                                            SMS Notifications
                                        </div>
                                        <div style={{ fontSize: 10, color: "#4caf6b", marginTop: 1 }}>
                                            Receiving real-time alerts
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: "#2e7d32",
                                }} className="pulse" />
                            </div>
                        </div>

                        {/* ── Modal Footer ── */}
                        <div style={{
                            padding: "16px 28px 26px",
                            display: "flex", gap: 10,
                        }}>
                            <button
                                onClick={() => setSelected(null)}
                                style={{
                                    flex: 1, padding: "12px", borderRadius: 12,
                                    border: "1.5px solid var(--border)",
                                    background: "var(--surface)",
                                    color: "var(--text-mid)",
                                    fontSize: 13, fontWeight: 800, cursor: "pointer",
                                    transition: "background .15s",
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    const clean = (selected.telephone || "").replace(/\s/g, "");
                                    window.location.href = `tel:${clean}`;
                                }}
                                disabled={!selected.telephone}
                                style={{
                                    flex: 2, padding: "12px", borderRadius: 12,
                                    border: "none",
                                    background: selected.telephone ? "var(--green)" : "var(--border)",
                                    color: "#fff",
                                    fontSize: 13, fontWeight: 800,
                                    cursor: selected.telephone ? "pointer" : "not-allowed",
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", gap: 8,
                                    boxShadow: selected.telephone ? "0 4px 14px rgba(46,125,50,0.25)" : "none",
                                }}
                            >
                                <Phone size={15} /> Call Officer
                            </button>
                        </div>
                    </div>

                    <style>{`
                        @keyframes fadeInOverlay {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes popInModal {
                            from { transform: scale(0.94) translateY(10px); opacity: 0; }
                            to { transform: scale(1) translateY(0); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
}

const th = {
    fontSize: 11, fontWeight: 800,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    padding: "14px 12px",
};