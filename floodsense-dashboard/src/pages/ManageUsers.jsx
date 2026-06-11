import React, { useState, useEffect } from "react";
import { Card, Btn, Badge, Input, Select, FormGroup } from "../shared";
import { Search, UserPlus, Edit2, Trash2, Phone, MapPin, X } from "lucide-react";
import api from "../api/axios";
import { createPortal } from 'react-dom';
import { useToast } from "../context/ToastContext";

const ManageUsers = () => {
    const toast = useToast();

    const [users, setUsers]           = useState([]);
    const [areas, setAreas]           = useState([]);
    const [roles, setRoles]           = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading]       = useState(true);

    // --- MODAL STATES ---
    const [showForm, setShowForm]         = useState(false);
    const [showDelete, setShowDelete]     = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData]         = useState({
        first_name: "", last_name: "", email: "",
        telephone: "", role: "", area_id: "", password: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors]     = useState({});

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                await Promise.all([fetchUsers(), fetchAreas(), fetchRoles()]);
            } catch (err) {
                console.error("Error loading initial setup data:", err);
                toast.error("Failed to load data. Please refresh the page.");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/users");
            setUsers(res.data.data);
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAreas = async () => {
        try {
            const res = await api.get("/areas");
            setAreas(res.data.data);
        } catch (err) { console.error("Areas error", err); }
    };

    const fetchRoles = async () => {
        try {
            const res = await api.get("/roles");
            setRoles(res.data.data);
        } catch (err) { console.error("Roles error", err); }
    };

    // --- LOADING ROW — same pattern as ThresholdTable ---
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
                    }} />
                    <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: "var(--text-muted)", letterSpacing: '0.8px'
                    }}>
                        LOADING USER DIRECTORY...
                    </div>
                </div>
            </td>
        </tr>
    );

    // --- HANDLERS ---
    const openAdd = () => {
        setSelectedUser(null);
        setErrors({});
        setFormData({ first_name: "", last_name: "", email: "", telephone: "", role: "", area_id: "", password: "" });
        setShowForm(true);
    };

    const openEdit = (user) => {
        setSelectedUser(user);
        setErrors({});
        setFormData({
            first_name: user.first_name || "", last_name: user.last_name || "",
            email: user.email, telephone: user.telephone,
            role: user.role, area_id: user.area_id, password: ""
        });
        setShowForm(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});
        try {
            if (selectedUser) {
                await api.put(`/users/${selectedUser.id}`, formData);
                toast.success(
                    "User Updated",
                    `${formData.first_name} ${formData.last_name}'s profile has been updated.`
                );
            } else {
                await api.post("/users", formData);
                toast.success(
                    "User Created",
                    `Account created for ${formData.first_name} ${formData.last_name}.`
                );
            }
            setShowForm(false);
            fetchUsers();
        } catch (err) {
            if (err.response && err.response.status === 403) {
                setErrors(err.response.data.data);
                toast.error("Validation Failed", "Please check the highlighted fields and try again.");
            } else {
                toast.error("System Error", "An unexpected error occurred. Please try again.");
            }
        } finally { setIsSaving(false); }
    };

    const handleDelete = async () => {
        setIsSaving(true);
        const name = `${selectedUser?.first_name} ${selectedUser?.last_name}`;
        try {
            await api.delete(`/users/${selectedUser.id}`);
            setShowDelete(false);
            fetchUsers();
            toast.success("Access Revoked", `${name}'s account has been removed.`);
        } catch (err) {
            console.error(err);
            toast.error("Delete Failed", "Could not remove this user. Please try again.");
        } finally { setIsSaving(false); }
    };

    const filteredUsers = users.filter(u =>
        u.status === 'active' &&
        ((u.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.last_name?.toLowerCase().includes(searchTerm.toLowerCase()))  ||
            (u.email?.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    // ── Stat card data ──
    const stats = [
        {
            label: "Total Active Personnel",
            value: users.filter(u => u.status === 'active').length,
            color: "var(--primary)",
        },
        {
            label: "Admins",
            value: users.filter(u => u.status === 'active' && u.role_data?.name === 'admin').length,
            color: "var(--orange)",
        },
        {
            label: "Field Officers",
            value: users.filter(u => u.status === 'active' && u.role_data?.name === 'maintainer').length,
            color: "var(--green)",
        },
    ];

    return (
        <div className="fadeUp" style={{ padding: '10px' }}>

            {/* ── Page Header ── */}
            <div style={{
                background: "var(--surface)", borderRadius: 16, padding: "16px 22px",
                marginBottom: 20, display: "flex", alignItems: "center",
                justifyContent: "space-between", border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
            }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: "var(--text)", marginBottom: 3, letterSpacing: -0.4 }}>
                        User Management
                    </h1>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        Manage administrative access and technical officer assignments.
                    </p>
                </div>
                <Btn variant="primary" onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px" }}>
                    <UserPlus size={16} /> Add New User
                </Btn>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
                {stats.map(({ label, value, color }) => (
                    <div key={label} style={{
                        background: "var(--surface)", borderRadius: 14, padding: "16px 20px",
                        border: "1px solid var(--border)", boxShadow: "var(--shadow)",
                        borderLeft: `4px solid ${color}`,
                    }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                            {label}
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, fontFamily: "'DM Mono', monospace" }}>
                            {value}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Search ── */}
            <Card style={{ marginBottom: 16, padding: "12px 18px" }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <Search size={16} style={{ position: "absolute", left: 12, color: "var(--text-muted)", pointerEvents: "none" }} />
                    <Input
                        placeholder="Search by name, email or area..."
                        style={{ paddingLeft: 38, maxWidth: 420, border: "none", background: "var(--surface-alt)" }}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            {/* ── Users Table ── */}
            <Card style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "var(--surface-alt)", borderBottom: "1.5px solid var(--border)" }}>
                            <th style={thStyle}>User Details</th>
                            <th style={thStyle}>Access Role</th>
                            <th style={thStyle}>Assigned Area</th>
                            <th style={thStyle}>Contact</th>
                            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingView colSpan={5} />
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 13 }}>
                                    No users found.
                                </td>
                            </tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}>
                                <td style={{ padding: "14px 12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: "var(--primary)",
                                            color: "#fff", display: "flex", alignItems: "center",
                                            justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0,
                                        }}>
                                            {user.first_name && user.last_name
                                                ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                                                : user.first_name ? user.first_name[0].toUpperCase() : "U"}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", textTransform: "capitalize" }}>
                                                {user.first_name || ""} {user.last_name || ""}
                                            </div>
                                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: "14px 12px" }}>
                                    <Badge type={user.role_data?.name === 'admin' ? 'admin' : 'officer'}>
                                        {user.role_data?.name ? user.role_data.name.toUpperCase() : 'N/A'}
                                    </Badge>
                                </td>
                                <td style={{ padding: "14px 12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-mid)" }}>
                                        <MapPin size={14} color="var(--text-muted)" />
                                        {user.area?.name || "Unassigned"}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-mid)" }}>
                                        <Phone size={14} color="var(--text-muted)" />
                                        {user.telephone}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 12px", textAlign: "right" }}>
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                        <button
                                            onClick={() => openEdit(user)} title="Edit"
                                            style={{
                                                border: "none", background: "var(--primary-bg)", color: "var(--primary)",
                                                padding: 8, borderRadius: 8, cursor: "pointer", display: "flex",
                                                alignItems: "center", justifyContent: "center", transition: "all .15s",
                                            }}
                                        ><Edit2 size={15} /></button>
                                        <button
                                            onClick={() => { setSelectedUser(user); setShowDelete(true); }} title="Delete"
                                            style={{
                                                border: "none", background: "var(--red-bg)", color: "var(--red)",
                                                padding: 8, borderRadius: 8, cursor: "pointer", display: "flex",
                                                alignItems: "center", justifyContent: "center", transition: "all .15s",
                                            }}
                                        ><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* ── Add / Edit Modal ── */}
            {showForm && createPortal(
                <div style={S.overlay}>
                    <div className="fadeUp" style={S.modal}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h2 style={{ fontWeight: 900, fontSize: 17, letterSpacing: -0.4, color: "var(--text)" }}>
                                {selectedUser ? "Edit User Profile" : "Register New User"}
                            </h2>
                            <button onClick={() => setShowForm(false)} style={S.closeBtn}><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ display: "flex", gap: 14 }}>
                                <div style={{ flex: 1 }}>
                                    <FormGroup label="First Name">
                                        <Input
                                            style={errors.first_name ? { borderColor: "var(--red)" } : {}}
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                            placeholder="e.g. Arjuna"
                                        />
                                        {errors.first_name && <span style={S.errorText}>{errors.first_name[0]}</span>}
                                    </FormGroup>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <FormGroup label="Last Name">
                                        <Input
                                            style={errors.last_name ? { borderColor: "var(--red)" } : {}}
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                            placeholder="e.g. Perera"
                                        />
                                        {errors.last_name && <span style={S.errorText}>{errors.last_name[0]}</span>}
                                    </FormGroup>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 14 }}>
                                <div style={{ flex: 1 }}>
                                    <FormGroup label="Email Address">
                                        <Input
                                            style={errors.email ? { borderColor: "var(--red)" } : {}}
                                            type="email" value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="name@floodsense.lk"
                                        />
                                        {errors.email && <span style={S.errorText}>{errors.email[0]}</span>}
                                    </FormGroup>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <FormGroup label="Telephone">
                                        <Input
                                            style={errors.telephone ? { borderColor: "var(--red)" } : {}}
                                            value={formData.telephone}
                                            onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                                            placeholder="+94 7..."
                                        />
                                        {errors.telephone && <span style={S.errorText}>{errors.telephone[0]}</span>}
                                    </FormGroup>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 14 }}>
                                <div style={{ flex: 1 }}>
                                    <FormGroup label="System Role">
                                        <Select
                                            style={errors.role ? { borderColor: "var(--red)" } : {}}
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="">Select Role...</option>
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>
                                            ))}
                                        </Select>
                                        {errors.role && <span style={S.errorText}>{errors.role[0]}</span>}
                                    </FormGroup>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <FormGroup label="Assigned Monitoring Area">
                                        <Select
                                            style={errors.area_id ? { borderColor: "var(--red)" } : {}}
                                            value={formData.area_id}
                                            onChange={e => setFormData({ ...formData, area_id: e.target.value })}
                                        >
                                            <option value="">Select Area...</option>
                                            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </Select>
                                        {errors.area_id && <span style={S.errorText}>{errors.area_id[0]}</span>}
                                    </FormGroup>
                                </div>
                            </div>

                            <FormGroup label={selectedUser ? "New Password (leave blank to keep current)" : "Set Password"}>
                                <Input
                                    style={errors.password ? { borderColor: "var(--red)" } : {}}
                                    type="password" required={!selectedUser}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                {errors.password && <span style={S.errorText}>{errors.password[0]}</span>}
                            </FormGroup>

                            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                                <Btn variant="outline" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</Btn>
                                <Btn variant="primary" type="submit" disabled={isSaving} style={{ flex: 2 }}>
                                    {isSaving ? "Saving..." : selectedUser ? "Update User" : "Create Account"}
                                </Btn>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* ── Delete Modal ── */}
            {showDelete && createPortal(
                <div style={S.overlay}>
                    <div className="fadeUp" style={{ ...S.modal, maxWidth: 400, textAlign: "center" }}>
                        <div style={{
                            width: 60, height: 60, background: "var(--red-bg)", color: "var(--red)",
                            borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 18px", fontSize: 26,
                        }}>🗑</div>
                        <h2 style={{ fontWeight: 800, fontSize: 18, color: "var(--text)", marginBottom: 8 }}>Revoke Access?</h2>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.6 }}>
                            You are about to delete{" "}
                            <strong style={{ color: "var(--text)" }}>{selectedUser?.first_name} {selectedUser?.last_name}</strong>.
                            {" "}This will immediately terminate their portal access.
                        </p>
                        <div style={{ display: "flex", gap: 10 }}>
                            <Btn variant="outline" onClick={() => setShowDelete(false)} style={{ flex: 1 }}>Cancel</Btn>
                            <Btn variant="red" onClick={handleDelete} disabled={isSaving} style={{ flex: 1 }}>
                                {isSaving ? "Deleting..." : "Confirm Delete"}
                            </Btn>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

const thStyle = {
    fontSize: 11, fontWeight: 800, color: "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: 0.5, padding: "14px 12px",
    textAlign: "left",
};

const S = {
    overlay: {
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(15,27,61,0.5)", backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
    },
    modal: {
        background: "var(--surface)", width: "95%", maxWidth: 560,
        padding: 30, borderRadius: 20,
        boxShadow: "var(--shadow-md)", border: "1px solid var(--border)",
        position: "relative", zIndex: 10000,
    },
    closeBtn: {
        background: "var(--surface-alt)", border: "1.5px solid var(--border)",
        color: "var(--text-mid)", width: 32, height: 32, borderRadius: 8,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    },
    errorText: {
        color: "var(--red)", fontSize: 11, fontWeight: 700,
        marginTop: 4, display: "block", animation: "fadeUp 0.2s ease",
    },
};

export default ManageUsers;