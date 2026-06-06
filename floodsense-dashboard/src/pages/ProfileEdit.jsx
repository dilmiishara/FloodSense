import { useState } from "react";
import { Card, Input, Btn, FormGroup, globalCSS } from "../shared.jsx";
import { useToast } from "../context/ToastContext";
import { Clock, ShieldCheck, User, Mail, Phone, Lock } from "lucide-react";
import axios from "axios";

export default function ProfileEdit() {
  const toast = useToast();
  const loggedUser = JSON.parse(localStorage.getItem("user")) || {};

  const [formData, setFormData] = useState({
    first_name: loggedUser?.first_name || "",
    last_name:  loggedUser?.last_name  || "",
    email:      loggedUser?.email      || "",
    telephone:  loggedUser?.telephone  || "",
    password:   "",
  });

  const [loading, setLoading] = useState(false);

  const getInitials = () => {
    const f = formData.first_name ? formData.first_name[0] : "";
    const l = formData.last_name  ? formData.last_name[0]  : "";
    return (f + l).toUpperCase() || "U";
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await axios.put("http://127.0.0.1:8000/api/user/profile", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Profile Updated", "Your account details have been saved successfully.");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error("Update Failed", err.response?.data?.message || "Could not update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <>
        <style>{globalCSS}</style>
        <div style={{ padding: "28px 20px", maxWidth: 1000, margin: "0 auto" }}>

          {/* ── Page Header ── */}
          <div className="fadeUp" style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.4, color: "var(--text)", marginBottom: 4 }}>
              Account Settings
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Manage your personal identity and security credentials
            </p>
          </div>

          <div className="fadeUp" style={{ display: "grid", gridTemplateColumns: "minmax(240px, 1fr) 2fr", gap: 20 }}>

            {/* ── Left: Profile Preview ── */}
            <Card style={{ padding: 32, textAlign: "center", height: "fit-content", borderRadius: 20 }}>
              {/* Avatar */}
              <div style={{
                width: 100, height: 100, borderRadius: "50%",
                background: "var(--primary)",
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, fontWeight: 900,
                margin: "0 auto",
                boxShadow: "0 8px 24px rgba(26,82,204,0.25)",
                border: "4px solid var(--surface)",
              }}>
                {getInitials()}
              </div>

              <h2 style={{ marginTop: 18, fontWeight: 800, fontSize: 18, color: "var(--text)" }}>
                {formData.first_name} {formData.last_name}
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{formData.email}</p>

              {/* Info rows */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                  <Clock size={14} color="var(--text-muted)" />
                  <span>Joined: {loggedUser.created_at ? new Date(loggedUser.created_at).toLocaleDateString() : "N/A"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--green)", marginBottom: 12 }}>
                  <ShieldCheck size={14} color="var(--green)" />
                  <span style={{ fontWeight: 600 }}>Account Verified</span>
                </div>
              </div>
            </Card>

            {/* ── Right: Form ── */}
            <Card style={{ padding: 36, borderRadius: 20 }}>

              {/* Personal Info section */}
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 24, display: "flex", alignItems: "center", gap: 9, color: "var(--text)" }}>
                <User size={18} color="var(--primary)" /> Personal Identification
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                <FormGroup label="First Name">
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <User size={15} color="var(--text-muted)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
                    <Input
                        style={{ paddingLeft: 40 }}
                        value={formData.first_name}
                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  </div>
                </FormGroup>
                <FormGroup label="Last Name">
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <User size={15} color="var(--text-muted)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
                    <Input
                        style={{ paddingLeft: 40 }}
                        value={formData.last_name}
                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>
                </FormGroup>
              </div>

              <div style={{ marginBottom: 18 }}>
                <FormGroup label="Email Address">
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <Mail size={15} color="var(--text-muted)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
                    <Input
                        type="email"
                        style={{ paddingLeft: 40 }}
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </FormGroup>
              </div>

              <div style={{ marginBottom: 18 }}>
                <FormGroup label="Telephone">
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <Phone size={15} color="var(--text-muted)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
                    <Input
                        style={{ paddingLeft: 40 }}
                        value={formData.telephone}
                        onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                    />
                  </div>
                </FormGroup>
              </div>

              {/* Divider */}
              <div style={{ margin: "28px 0", height: 1, background: "var(--border)" }} />

              {/* Security section */}
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 18, display: "flex", alignItems: "center", gap: 9, color: "var(--text)" }}>
                <Lock size={18} color="var(--red)" /> Security Update
              </div>

              <div style={{ marginBottom: 28 }}>
                <FormGroup label="New Password (Optional)">
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <Lock size={15} color="var(--text-muted)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
                    <Input
                        type="password"
                        placeholder="Leave blank to keep current"
                        style={{ paddingLeft: 40 }}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </FormGroup>
              </div>

              {/* Save button */}
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                <Btn variant="primary" onClick={handleUpdate} disabled={loading} style={{ padding: "11px 36px", fontSize: 14 }}>
                  {loading ? "Saving..." : "Update Account"}
                </Btn>
              </div>
            </Card>
          </div>
        </div>
      </>
  );
}
