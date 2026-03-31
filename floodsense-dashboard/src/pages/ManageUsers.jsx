import React, { useState, useEffect } from "react";
import { Card, Btn, Badge, Input, Select, C, FormGroup } from "../shared";
import { Search, UserPlus, Edit2, Trash2, Phone, MapPin, X } from "lucide-react";
import api from "../api/axios";
import { createPortal } from 'react-dom'; 

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [roles, setRoles] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // --- MODAL STATES ---
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
 const [formData, setFormData] = useState({ 
  first_name: "", 
  last_name: "", 
  email: "", 
  telephone: "", 
  role: "", 
  area_id: "", 
  password: "" 
});
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  
useEffect(() => {
  const loadInitialData = async () => {
    setLoading(true);
    try {
      
      await Promise.all([
        fetchUsers(),
        fetchAreas(),
        fetchRoles()
      ]);
    } catch (err) {
      console.error("Error loading initial setup data:", err);
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
    } catch (err) { console.error("Fetch error", err); }
    finally { setLoading(false); }
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

  // --- HANDLERS ---
  const openAdd = () => {
    setSelectedUser(null);
    setErrors({});
    setFormData({ 
    first_name: "", 
    last_name: "", 
    email: "", 
    telephone: "", 
    role: "", 
    area_id: "", 
    password: "" 
  });
    setShowForm(true);
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setErrors({});
    setFormData({ 
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email, 
        telephone: user.telephone, 
        role: user.role, 
        area_id: user.area_id,
        password: "" 
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
      } else {
        await api.post("/users", formData);
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setErrors(err.response.data.data); 
      } else {
        alert("A system error occurred. Please try again.");
      }
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await api.delete(`/users/${selectedUser.id}`);
      setShowDelete(false);
      fetchUsers();
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const filteredUsers = users.filter(u => 
    u.status === 'active' && 
    ((u.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
     (u.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (u.email?.toLowerCase().includes(searchTerm.toLowerCase())))
);
  return (
    <div className="fadeUp" style={{ padding: '10px' }}>
      
      {/* Header Area */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>User Management</h1>
          <p style={styles.subtitle}>Manage administrative access and technical officer assignments.</p>
        </div>
        <Btn variant="dark" onClick={openAdd} style={styles.addBtn}>
          <UserPlus size={18} /> Add New User
        </Btn>
      </div>

      {/* Stats Summary */}
      <div style={styles.statsGrid}>
          <Card style={{ ...styles.statCard, borderLeft: '4px solid #cc2200' }}>
              <span style={styles.statLabel}>Total Active Personnel</span>
              <span style={{ ...styles.statValue, color: '#cc2200' }}>
                 {users.filter(u => u.status === 'active').length}
              </span>
          </Card>
          <Card style={{ ...styles.statCard, borderLeft: '4px solid #ff9800' }}>
              <span style={styles.statLabel}>Admins</span>
              <span style={{ ...styles.statValue, color: '#ff9800' }}>
                {users.filter(u => u.status === 'active' && u.role_data?.name === 'admin').length}
              </span>
          </Card>
          <Card style={{ ...styles.statCard, borderLeft: '4px solid #2e7d32' }}>
              <span style={styles.statLabel}>Field Officers</span>
              <span style={{ ...styles.statValue, color: '#2e7d32' }}>
                {users.filter(u => u.status === 'active' && u.role_data?.name === 'maintainer').length}
              </span>
          </Card>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: '20px', padding: '12px 20px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: '#999' }} />
          <Input 
            placeholder="Search by name, email or area..." 
            style={{ paddingLeft: '40px', maxWidth: '400px', border: 'none', background: '#f8f9fa' }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fcfbf9' }}>
              <th>User Details</th>
              <th>Access Role</th>
              <th>Assigned Area</th>
              <th>Contact</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={styles.avatar}>
                    {user.first_name && user.last_name 
                      ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
                      : user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                     <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a1a', textTransform: 'capitalize' }}>
            {user.first_name || ''} {user.last_name || ''}
          </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge type={user.role_data?.name === 'admin' ? 'admin' : 'officer'}>
                    {user.role_data?.name ? user.role_data.name.toUpperCase() : 'N/A'}
                  </Badge>
                </td>
                <td>
                  <div style={styles.iconText}>
                    <MapPin size={14} color={C.mid} />
                    {user.area?.name || 'Unassigned'}
                  </div>
                </td>
                <td>
                  <div style={styles.iconText}>
                    <Phone size={14} color={C.mid} />
                    {user.telephone}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={() => openEdit(user)} style={styles.actionBtn} title="Edit"><Edit2 size={16} /></button>
                    <button onClick={() => { setSelectedUser(user); setShowDelete(true); }} style={styles.deleteBtn} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* ─── ADD / EDIT MODAL (NOW USING PORTAL) ─── */}
{showForm && createPortal(
  <div style={styles.overlay}>
    <div className="fadeUp" style={styles.modal}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 900, letterSpacing: -0.5 }}>
            {selectedUser ? "Edit User Profile" : "Register New User"}
          </h2>
          <X size={20} onClick={() => setShowForm(false)} style={{ cursor: 'pointer' }} />
      </div>

      <form onSubmit={handleSave} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 15 }}>
          
          {/*  First Name & Last Name Fields */}
          <div style={{ display: 'flex', gap: 15 }}>
              <div style={{ flex: 1 }}>
                  <FormGroup label="First Name">
                      <Input 
                          style={errors.first_name ? { borderColor: C.red } : {}}
                          value={formData.first_name} 
                          onChange={e => setFormData({...formData, first_name: e.target.value})} 
                          placeholder="e.g. Arjuna" 
                      />
                      {errors.first_name && <span style={styles.errorText}>{errors.first_name[0]}</span>}
                  </FormGroup>
              </div>
              <div style={{ flex: 1 }}>
                  <FormGroup label="Last Name">
                      <Input 
                          style={errors.last_name ? { borderColor: C.red } : {}}
                          value={formData.last_name} 
                          onChange={e => setFormData({...formData, last_name: e.target.value})} 
                          placeholder="e.g. Perera" 
                      />
                      {errors.last_name && <span style={styles.errorText}>{errors.last_name[0]}</span>}
                  </FormGroup>
              </div>
          </div>

          <div style={{ display: 'flex', gap: 15 }}>
              <div style={{ flex: 1 }}>
                  <FormGroup label="Email Address">
                      <Input 
                          style={errors.email ? { borderColor: C.red } : {}}
                          type="email" 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})} 
                          placeholder="name@floodsense.lk" 
                      />
                      {errors.email && <span style={styles.errorText}>{errors.email[0]}</span>}
                  </FormGroup>
              </div>
              <div style={{ flex: 1 }}>
                  <FormGroup label="Telephone">
                      <Input 
                          style={errors.telephone ? { borderColor: C.red } : {}}
                          value={formData.telephone} 
                          onChange={e => setFormData({...formData, telephone: e.target.value})} 
                          placeholder="+94 7..." 
                      />
                      {errors.telephone && <span style={styles.errorText}>{errors.telephone[0]}</span>}
                  </FormGroup>
              </div>
          </div>

          <div style={{ display: 'flex', gap: 15 }}>
              <div style={{ flex: 1 }}>
                  <FormGroup label="System Role">
                      <Select 
                          style={errors.role ? { borderColor: C.red } : {}}
                          value={formData.role} 
                          onChange={e => setFormData({...formData, role: e.target.value})}
                      >
                          <option value="">Select Role...</option>
                          {roles.map(r => (
                              <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>
                          ))}
                      </Select>
                      {errors.role && <span style={styles.errorText}>{errors.role[0]}</span>}
                  </FormGroup>
              </div>
              <div style={{ flex: 1 }}>
                  <FormGroup label="Assigned Monitoring Area">
                      <Select 
                          style={errors.area_id ? { borderColor: C.red } : {}}
                          value={formData.area_id} 
                          onChange={e => setFormData({...formData, area_id: e.target.value})}
                      >
                          <option value="">Select Area...</option>
                          {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </Select>
                      {errors.area_id && <span style={styles.errorText}>{errors.area_id[0]}</span>}
                  </FormGroup>
              </div>
          </div>

          <FormGroup label={selectedUser ? "New Password (Leave blank to keep current)" : "Set Password"}>
              <Input 
                  style={errors.password ? { borderColor: C.red } : {}}
                  type="password" 
                  required={!selectedUser} 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
              />
              {errors.password && <span style={styles.errorText}>{errors.password[0]}</span>}
          </FormGroup>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <Btn variant="outline" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn variant="dark" type="submit" disabled={isSaving} style={{ flex: 2 }}>
                  {isSaving ? "Saving..." : selectedUser ? "Update User" : "Create Account"}
              </Btn>
          </div>
      </form>
    </div>
  </div>,
  document.body
)}
      {/* ─── DELETE MODAL (ALSO USING PORTAL) ─── */}
      {showDelete && createPortal(
        <div style={styles.overlay}>
            <div className="fadeUp" style={{ ...styles.modal, maxWidth: 400, textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, background: '#fff0ee', color: C.red, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>🗑</div>
                <h2 style={{ fontWeight: 800 }}>Revoke Access?</h2>
                <p style={{ fontSize: 14, color: '#666', margin: '10px 0 25px' }}>
    You are about to delete <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>. 
    This will immediately terminate their portal access.
</p>
                <div style={{ display: 'flex', gap: 10 }}>
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

const styles = {
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '25px' },
  title: { fontSize: '24px', fontWeight: '900', color: '#1a1a1a', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: '#666' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' },
  statCard: { padding: '15px 20px', border: '1px solid #eee', borderRadius: '12px' },
  statLabel: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', marginBottom: '4px' },
  statValue: { fontSize: '24px', fontWeight: '900' },
  avatar: { width: '36px', height: '36px', borderRadius: '10px', background: '#1a1a1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' },
  iconText: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444' },
  actionBtn: { border: 'none', background: '#f0f0f0', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#444' },
  deleteBtn: { border: 'none', background: '#fff0ee', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#cc2200' },
  overlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100vw', 
    height: '100vh', 
    background: 'rgba(0, 0, 0, 0.4)', 
    backdropFilter: 'blur(10px)', 
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 9999 
  },
  modal: { background: '#fff', width: '95%', maxWidth: '550px', padding: '30px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10000 },
  errorText: { color: "#cc2200", fontSize: "11px", fontWeight: "700", marginTop: "4px", display: "block", animation: "fadeUp 0.2s ease" },
};

export default ManageUsers;