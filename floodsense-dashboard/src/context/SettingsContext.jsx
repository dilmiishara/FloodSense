import { createContext, useContext, useEffect, useState } from "react";
import { fetchSettings, saveSettings } from "../api/settings";

// 1. Create the context
const SettingsContext = createContext();

// 2. Create the Provider component
export function SettingsProvider({ children }) {

  const [systemSettings, setSystemSettings] = useState({
    system_name:      "FloodSense Portal",
    org_name:         "FloodSense.gov.lk",
    timezone:         "Asia/Colombo",
    date_format:      "DD/MM/YYYY",
    refresh_rate:     "Every 30 seconds",
    default_map_view: "Detailed Map",
    emergency_mode:   false,
    maintenance_mode: false,
  });

  const [loading, setLoading] = useState(true);

  // Load settings from DB when app starts
useEffect(() => {
  fetchSettings("system")
    .then((data) => {
      // Convert "1"/"0"/"true"/"false"/"" to real booleans
      const cleaned = { ...data };
      ["emergency_mode", "maintenance_mode"].forEach((key) => {
        const val = data[key];
        cleaned[key] = val === true || val === "true" || val === "1" || val === 1;
      });
      setSystemSettings((prev) => ({ ...prev, ...cleaned }));
    })
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);

  // Save new settings to DB and update global state
  const updateSystemSettings = async (newSettings) => {
    setSystemSettings((prev) => ({ ...prev, ...newSettings }));
    await saveSettings("system", newSettings);
  };

  // Toggle emergency mode from Header OR Settings page


  const toggleEmergencyMode = async () => {
  // Force current value to real boolean first, then flip
  const current = systemSettings.emergency_mode === true || 
                  systemSettings.emergency_mode === "true" || 
                  systemSettings.emergency_mode === "1" || 
                  systemSettings.emergency_mode === 1;
  const newVal = !current;
  setSystemSettings((prev) => ({ ...prev, emergency_mode: newVal }));
  await saveSettings("system", { emergency_mode: newVal });
};

  return (
    <SettingsContext.Provider value={{
      systemSettings,
      loading,
      updateSystemSettings,
      toggleEmergencyMode,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

// 3. Custom hook so any component can use the context easily
export const useSettings = () => useContext(SettingsContext);