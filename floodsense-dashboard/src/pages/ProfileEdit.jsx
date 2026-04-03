import { useState } from "react";
import { Card, Input, Btn, FormGroup, Toast, C } from "../shared.jsx";
import { Clock, ShieldCheck, User, Mail, Phone, Lock } from "lucide-react";
import axios from "axios";

export default function ProfileEdit() {
  const loggedUser = JSON.parse(localStorage.getItem("user")) || {};
  
  const [formData, setFormData] = useState({
    first_name: loggedUser?.first_name || "",
    last_name: loggedUser?.last_name || "",
    email: loggedUser?.email || "",
    telephone: loggedUser?.telephone || "",
    password: "" 
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // නමේ මුල් අකුරු ලබා ගැනීම (Initials)
  const getInitials = () => {
    const f = formData.first_name ? formData.first_name[0] : "";
    const l = formData.last_name ? formData.last_name[0] : "";
    return (f + l).toUpperCase() || "U";
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await axios.put("http://127.0.0.1:8000/api/user/profile", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setToast("Profile updated successfully!");
      
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setToast(err.response?.data?.message || "Update failed.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto" }}>
      
      {/* HEADER SECTION */}
      <div className="fadeUp" style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.04em", color: "#111", marginBottom: 8 }}>Account Settings</h1>
        <p style={{ fontSize: 15, color: "#666" }}>Manage your personal identity and security credentials</p>
      </div>

      <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "minmax(280px, 1fr) 2fr", gap: 32 }}>
        
        {/* LEFT: PROFILE PREVIEW (Label Removed) */}
        <Card style={{ padding: 40, textAlign: 'center', height: 'fit-content', borderRadius: 32, boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
          <div style={{ margin: '0 auto', width: 'fit-content' }}>
            <div style={largeAvatarStyle}>
              {getInitials()} 
            </div>
          </div>
          
          <h2 style={{ marginTop: 24, fontWeight: 800, fontSize: 22, color: "#111" }}>{formData.first_name} {formData.last_name}</h2>
          <p style={{ fontSize: 14, color: "#888", marginTop: 4 }}>{formData.email}</p>
          
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #f5f5f5", textAlign: 'left' }}>
             <div style={infoRow}>
               <Clock size={16} color="#aaa"/> 
               <span>Joined: {loggedUser.created_at ? new Date(loggedUser.created_at).toLocaleDateString() : "N/A"}</span>
             </div>
             <div style={infoRow}>
               <ShieldCheck size={16} color={C.green}/> 
               <span style={{color: C.green, fontWeight: 600}}>Account Verified</span>
             </div>
          </div>
        </Card>

        {/* RIGHT: DATA FORM */}
        <Card style={{ padding: 48, borderRadius: 32, boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10, color: '#111' }}>
            <User size={20} color={C.blue} /> Personal Identification
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            <FormGroup label="First Name">
              <div style={inputWithIcon}>
                <User size={16} color="#bbb" style={iconPos} />
                <Input 
                  style={customInputStyle}
                  value={formData.first_name} 
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
                />
              </div>
            </FormGroup>
            <FormGroup label="Last Name">
              <div style={inputWithIcon}>
                <User size={16} color="#bbb" style={iconPos} />
                <Input 
                  style={customInputStyle}
                  value={formData.last_name} 
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})} 
                />
              </div>
            </FormGroup>
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <FormGroup label="Email Address">
              <div style={inputWithIcon}>
                <Mail size={16} color="#bbb" style={iconPos} />
                <Input 
                  type="email" 
                  style={customInputStyle}
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
            </FormGroup>
          </div>

          <div style={{ marginBottom: 24 }}>
            <FormGroup label="Telephone">
              <div style={inputWithIcon}>
                <Phone size={16} color="#bbb" style={iconPos} />
                <Input 
                  style={customInputStyle}
                  value={formData.telephone} 
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})} 
                />
              </div>
            </FormGroup>
          </div>
          
          <div style={{ margin: "40px 0", height: "1px", background: "linear-gradient(to right, #eee, transparent)" }} />
          
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#111' }}>
              <Lock size={20} color={C.red} /> Security Update
            </div>
            <FormGroup label="New Password (Optional)">
              <div style={inputWithIcon}>
                <Lock size={16} color="#bbb" style={iconPos} />
                <Input 
                  type="password" 
                  placeholder="Leave blank to keep current"
                  style={customInputStyle}
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>
            </FormGroup>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
            <Btn onClick={handleUpdate} disabled={loading} style={saveButtonStyle}>
              {loading ? "Saving Changes..." : "Update Account"}
            </Btn>
          </div>
        </Card>
      </div>
      <Toast message={toast} />
    </div>
  );
}

// --- REFINED STYLES ---
const largeAvatarStyle = {
  width: 120, 
  height: 120, 
  borderRadius: "50%", 
  background: "#111", 
  color: "#fff",
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  fontSize: 42, 
  fontWeight: 900, 
  border: "6px solid #fff",
  boxShadow: "0 12px 24px rgba(0,0,0,0.12)"
};

const inputWithIcon = { position: 'relative', display: 'flex', alignItems: 'center' };
const iconPos = { position: 'absolute', left: 16 };

const customInputStyle = {
  paddingLeft: 44,
  height: 50,
  borderRadius: 14,
  border: '1.5px solid #eee',
  fontSize: 15,
  transition: 'all 0.2s ease'
};

const saveButtonStyle = {
  padding: "16px 50px", 
  fontSize: 15, 
  fontWeight: 700,
  borderRadius: 16,
  background: '#111',
  color: '#fff',
  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
  cursor: 'pointer'
};

const infoRow = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: 12, 
  fontSize: 14, 
  color: '#777', 
  marginBottom: 16 
};