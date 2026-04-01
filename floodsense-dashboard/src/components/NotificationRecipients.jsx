import React, { useState, useEffect } from "react";
import { fetchFieldOfficers } from "../api/services/userService";
import { C, Card, Btn } from "../shared.jsx";
import {
  UserCheck,
  MessageSquare,
  ShieldCheck,
  Phone,
  X,
  MapPin,
  Mail,
} from "lucide-react";

export default function NotificationRecipients() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

 
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOfficers();
  }, []);

  const loadOfficers = async () => {
    try {
      const res = await fetchFieldOfficers();
      setOfficers(res.data.data || res.data);
    } catch (err) {
      console.error("Error loading maintainers", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>
        Loading Recipients...
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ─── FIELD MAINTAINERS ─── */}
      <Card style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div style={{ background: "#f0f4ff", padding: 10, borderRadius: 12 }}>
            <UserCheck size={20} color="#3f51b5" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>Field Maintainers</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {officers.map((user) => (
            <div
              key={user.id}
              style={styles.row}
              onClick={() => handleUserClick(user)}
            >
              <div
                style={{
                  ...styles.avatar,
                  background: user.role === 1 ? "#ef5350" : "#5c6bc0",
                }}
              >
                {getInitials(user.first_name, user.last_name)}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                >
                  {user.first_name} {user.last_name}
                </div>
                <div style={{ fontSize: 11, color: C.mid }}>
                  {user.area?.name || "Ratnapura"} •{" "}
                  {user.role === 1 ? "Admin" : "Maintainer"}
                </div>
              </div>
              <div style={styles.smsTag}>
                <MessageSquare size={10} /> SMS ACTIVE
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── ALERT CHANNELS (SIMPLE) ─── */}
      <Card style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={20} color={C.green} />
            <div style={{ fontSize: 14, fontWeight: 800 }}>
              SMS Broadcast Gateway
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: C.green,
              }}
            ></div>
            <span style={{ fontSize: 10, fontWeight: 900, color: C.green }}>
              SYSTEM ACTIVE
            </span>
          </div>
        </div>
      </Card>

      {/* ─── OFFICER DETAILS MODAL ─── */}
      {showModal && selectedUser && (
        <div style={modalStyles.overlay}>
          <div className="fadeUp" style={modalStyles.modal}>
            <button
              style={modalStyles.closeBtn}
              onClick={() => setShowModal(false)}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  ...styles.avatar,
                  width: 60,
                  height: 60,
                  fontSize: 20,
                  margin: "0 auto 12px",
                  background: selectedUser.role === 1 ? "#ef5350" : "#5c6bc0",
                }}
              >
                {getInitials(selectedUser.first_name, selectedUser.last_name)}
              </div>
              <h3 style={{ fontWeight: 800, margin: 0 }}>
                {selectedUser.first_name} {selectedUser.last_name}
              </h3>
              <span style={{ fontSize: 12, color: C.mid }}>
                {selectedUser.role === 1 ? "Administrator" : "Field Maintainer"}
              </span>
            </div>

            <div style={modalStyles.infoBox}>
              <div style={modalStyles.infoItem}>
                <Phone size={14} color={C.mid} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>
                  {selectedUser.telephone || "Not Available"}
                </span>
              </div>
              <div style={modalStyles.infoItem}>
                <Mail size={14} color={C.mid} />
                <span style={{ fontSize: 13 }}>{selectedUser.email}</span>
              </div>
              <div style={modalStyles.infoItem}>
                <MapPin size={14} color={C.mid} />
                <span style={{ fontSize: 13 }}>
                  {selectedUser.area?.name || "All Areas"}
                </span>
              </div>
            </div>

            <Btn
              onClick={() => {
                const cleanNumber = selectedUser.telephone.replace(/\s/g, "");
                window.location.href = `tel:${cleanNumber}`;
              }}
              style={{
                width: "100%",
                background: C.green,
                borderColor: C.green,
                marginTop: 15,
              }}
            >
              Call Officer
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    padding: "12px 10px",
    borderBottom: "1px solid #f8f8f8",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "0.2s background",
  },
  
  avatar: {
    width: 38,
    height: 38,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 12,
    fontWeight: 900,
  },
  smsTag: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 10px",
    borderRadius: "6px",
    background: "#e8f5e9",
    color: "#2e7d32",
    fontSize: 9,
    fontWeight: 900,
  },
};

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3000,
  },
  modal: {
    background: "#fff",
    width: "90%",
    maxWidth: "350px",
    padding: "30px",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 15,
    right: 15,
    border: "none",
    background: "#f5f5f5",
    borderRadius: "50%",
    width: 30,
    height: 30,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBox: {
    background: "#f9f9f9",
    borderRadius: "15px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  infoItem: { display: "flex", alignItems: "center", gap: 10, color: "#333" },
};
