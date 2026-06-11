import React, { useState, useEffect } from "react";
import { fetchFieldOfficers } from "../api/services/userService";
import { Card } from "../shared.jsx";
import {
    UserCheck, MessageSquare,
    Phone, X, MapPin, Mail, Search,
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

            {/* ── Side Drawer ── */}
            {selected && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setSelected(null)}
                        style={{
                            position: "fixed",
                            top: 72, left: 0, right: 0, bottom: 0,
                            background: "rgba(15,27,61,0.35)",
                            backdropFilter: "blur(5px)",
                            zIndex: 999,
                        }}
                    />

                    {/* Drawer */}
                    <div style={{
                        position: "fixed",
                        top: 72, right: 0,
                        width: 380,
                        height: "calc(100% - 72px)",
                        background: "var(--surface)",
                        zIndex: 1000,
                        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
                        display: "flex", flexDirection: "column",
                        overflow: "hidden",
                        borderLeft: "1px solid var(--border)",
                    }}>

                        {/* ── Drawer Header ── */}
                        <div style={{
                            padding: "20px 24px",
                            borderBottom: "1px solid var(--border)",
                            display: "flex", justifyContent: "space-between",
                            alignItems: "center",
                            background: "var(--surface-alt)",
                        }}>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 900, color: "var(--text)", letterSpacing: -0.3 }}>
                                    Officer Detail
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                                    {selected.first_name} {selected.last_name}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                style={{
                                    border: "none", background: "var(--border)",
                                    borderRadius: "50%", width: 30, height: 30,
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", cursor: "pointer",
                                    color: "var(--text-muted)",
                                }}
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* ── Drawer Body ── */}
                        <div style={{
                            padding: 24, display: "flex",
                            flexDirection: "column", gap: 14,
                            overflowY: "auto", flex: 1,
                        }}>

                            {/* Profile Card */}
                            <div style={{
                                padding: "18px 20px", borderRadius: 14,
                                background: getRoleBadgeBg(selected.role),
                                borderLeft: `5px solid ${getRoleColor(selected.role)}`,
                                display: "flex", alignItems: "center", gap: 16,
                                marginBottom: 4,
                            }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: 14,
                                    background: getRoleColor(selected.role),
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", flexShrink: 0,
                                    fontSize: 18, fontWeight: 900, color: "#fff",
                                }}>
                                    {getInitials(selected.first_name, selected.last_name)}
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: 11, fontWeight: 800,
                                        color: getRoleColor(selected.role),
                                        textTransform: "uppercase", letterSpacing: 0.8,
                                    }}>
                                        {getRoleLabel(selected.role)}
                                    </div>
                                    <div style={{
                                        fontSize: 18, fontWeight: 950,
                                        color: "var(--text)", marginTop: 4, letterSpacing: -0.4,
                                    }}>
                                        {selected.first_name} {selected.last_name}
                                    </div>
                                </div>
                            </div>

                            {/* Detail Rows */}
                            {[
                                { label: "Phone",         value: selected.telephone || "Not Available" },
                                { label: "Email",         value: selected.email },
                                { label: "Area",          value: selected.area?.name || "All Areas" },
                                { label: "Role",          value: getRoleLabel(selected.role) },
                                { label: "Alert Channel", value: "SMS Active" },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: "flex", justifyContent: "space-between",
                                    alignItems: "center", padding: "12px 0",
                                    borderBottom: "1px solid var(--border)",
                                }}>
                                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>
                                        {item.label}
                                    </span>
                                    <span style={{
                                        fontSize: 13, color: "var(--text)", fontWeight: 800,
                                        maxWidth: 200, textAlign: "right", wordBreak: "break-all",
                                    }}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* ── Drawer Footer ── */}
                        <div style={{
                            padding: "16px 24px",
                            borderTop: "1px solid var(--border)",
                            background: "var(--surface-alt)",
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
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    const clean = (selected.telephone || "").replace(/\s/g, "");
                                    window.location.href = `tel:${clean}`;
                                }}
                                style={{
                                    flex: 2, padding: "12px", borderRadius: 12,
                                    border: "none", background: "var(--green)", color: "#fff",
                                    fontSize: 13, fontWeight: 800, cursor: "pointer",
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", gap: 8,
                                }}
                            >
                                <Phone size={15} /> Call Officer
                            </button>
                        </div>
                    </div>
                </>
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