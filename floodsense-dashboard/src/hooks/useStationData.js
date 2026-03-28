import { useEffect, useState, useRef } from "react";

const BASE_URL = "https://www.srilankafloodmonitor.site/api/levels";
const MONITORED_STATIONS = ["Rathnapura", "Ellagawa", "Putupaula"];

const STATION_META = {
  Ellagawa:   { id: "s1", color: "#00a86b" },
  Putupaula:  { id: "s2", color: "#00a86b" },
  Rathnapura: { id: "s3", color: "#00a86b" },
};

const REFRESH_INTERVAL = 30000;
const HISTORY_LIMIT = 24;

function mapStatus(alert_status) {
  switch (alert_status?.toUpperCase()) {
    case "MAJOR FLOOD":
    case "MINOR FLOOD": return "critical";
    case "ALERT":       return "warning";
    default:            return "normal";
  }
}

export function useStationData() {
  const [stationData, setStationData] = useState(
    MONITORED_STATIONS.map((name) => ({
      id: STATION_META[name].id,
      name,
      color: STATION_META[name].color,
      loading: true,
      data: [],
      times: []
    }))
  );

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        // 1. Fetch History and Latest status in parallel for all stations
        const results = await Promise.all(
          MONITORED_STATIONS.map(async (name) => {
            const [histRes, latRes] = await Promise.all([
              fetch(`${BASE_URL}/history/${name}?limit=${HISTORY_LIMIT}`),
              fetch(`${BASE_URL}/latest`)
            ]);

            const historyJson = await histRes.json();
            const latestAll = await latRes.json();
            const foundLatest = latestAll.find(s => s.station_name === name);

            // The history API usually returns newest first; we need oldest first for the chart
            const history = Array.isArray(historyJson) ? [...historyJson].reverse() : [];
            
            const data = history.map(h => Number(h.water_level) || 0);
            const times = history.map(h => {
  const d = new Date(h.timestamp);
  
  if (isNaN(d)) return "--";

  // This forces the time to display in Sri Lanka time (UTC+5:30)
  // regardless of where the user is or how the server sends it.
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Set to false if you want 18:30 instead of 06:30 PM
    timeZone: "Asia/Colombo" 
  });
});

            // Calculate a tight Y-axis Max (e.g., if level is 0.4, max is ~0.6)
            const currentLevel = foundLatest ? Number(foundLatest.water_level) : 0;
            const dataMax = Math.max(...data, currentLevel, 0.1);
            const dynamicMax = dataMax * 1.3; 

            return {
              id: STATION_META[name].id,
              name,
              color: STATION_META[name].color,
              time: times[times.length - 1] || "--",
              level: currentLevel,
              max: dynamicMax,
              status: mapStatus(foundLatest?.alert_status),
              data: data.length > 0 ? data : Array(HISTORY_LIMIT).fill(0),
              times: times.length > 0 ? times : Array(HISTORY_LIMIT).fill("--"),
              loading: false,
              error: false,
            };
          })
        );

        if (mounted) setStationData(results);
      } catch (err) {
        console.error("Data fetch error:", err);
        if (mounted) {
          setStationData(prev => prev.map(s => ({ ...s, loading: false, error: true })));
        }
      }
    }

    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return stationData;
}