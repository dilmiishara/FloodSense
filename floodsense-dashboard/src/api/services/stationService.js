import axios from "axios";

const STATIONS_LATEST_API = "https://www.srilankafloodmonitor.site/api/levels/latest";

export const MONITORED_STATIONS = ["Rathnapura", "Ellagawa", "Putupaula"];

export const STATION_META = {
  Ellagawa:   { id: "s1", color: "#00a86b" },
  Putupaula:  { id: "s2", color: "#00a86b" },
  Rathnapura: { id: "s3", color: "#00a86b" },
};

export const REFRESH_INTERVAL = 30000;
export const MAX_HISTORY = 24;

export const mapStatus = (alert_status) => {
  switch (alert_status?.toUpperCase()) {
    case "MAJOR FLOOD": return "critical";
    case "MINOR FLOOD": return "critical";
    case "ALERT":       return "warning";
    default:            return "normal";
  }
};

// Single station fetch — calls latest API and finds by name
export const fetchStation = async (name) => {
  const res = await axios.get(STATIONS_LATEST_API);
  const all = res.data;
  const found = all.find((item) => item.station_name === name);

  if (!found) throw new Error(`Station "${name}" not found`);

  return {
    station: {
      alert_level:       5,
      minor_flood_level: 7,
      major_flood_level: 9,
    },
    latest_reading: found,
    history: [found],
  };
};

// All 3 stations in one call
export const fetchAllStations = async () => {
  const res = await axios.get(STATIONS_LATEST_API);
  const all = res.data;

  return MONITORED_STATIONS.map((name) => {
    const found = all.find((item) => item.station_name === name);

    if (!found) {
      return { name, success: false, data: null, error: `Station "${name}" not found` };
    }

    return {
      name,
      success: true,
      error: null,
      data: {
        station_name:         found.station_name,
        river_name:           found.river_name,
        water_level:          Number(found.water_level),
        previous_water_level: Number(found.previous_water_level),
        alert_status:         found.alert_status,
        flood_score:          found.flood_score,
        rising_or_falling:    found.rising_or_falling,
        rainfall_mm:          found.rainfall_mm,
        remarks:              found.remarks,
        timestamp:            found.timestamp,
        status:               mapStatus(found.alert_status),
      },
    };
  });
};