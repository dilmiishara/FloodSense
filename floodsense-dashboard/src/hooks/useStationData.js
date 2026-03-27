import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchAllStations,
  MONITORED_STATIONS,
  STATION_META,
  REFRESH_INTERVAL,
  MAX_HISTORY,
} from "../api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStatus(waterLevel, station) {
  if (waterLevel >= station.major_flood_level) return "critical";
  if (waterLevel >= station.minor_flood_level) return "warning";
  if (waterLevel >= station.alert_level)       return "warning";
  return "normal";
}

function getColor(status) {
  if (status === "critical") return "#e03030";
  if (status === "warning")  return "#e07800";
  return "#22c55e";
}

function formatTime(timestamp) {
  // "2026-03-26 09:30:00" → "09:30"
  return timestamp?.split(" ")[1]?.slice(0, 5) ?? "--:--";
}

function buildInitialState() {
  return MONITORED_STATIONS.map((name) => ({
    id:      STATION_META[name].id,
    name,
    time:    "--:--",
    level:   0,
    max:     STATION_META[name].max,
    status:  "normal",
    color:   "#22c55e",
    data: Array(MAX_HISTORY).fill(0).map(() => STATION_META[name].max * 0.1), 
    times: Array(MAX_HISTORY).fill("--:--"),
    loading: true,
    error:   false,
  }));
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useStationData() {
  const [stationData, setStationData] = useState(buildInitialState);

  // Holds rolling history without causing re-renders
  const historyRef = useRef(
    Object.fromEntries(MONITORED_STATIONS.map((n) => [n, []]))
  );

  const processResults = useCallback((results) => {
    setStationData((prev) =>
      prev.map((s, i) => {
        const { success, data } = results[i];

        if (!success) return { ...s, loading: false, error: true };

        const { station, latest_reading } = data;
        const wl        = latest_reading.water_level;
        const timeLabel = formatTime(latest_reading.timestamp);

        // Append to rolling history
        const hist = historyRef.current[s.name];
        hist.push({ level: wl, time: timeLabel });
        if (hist.length > MAX_HISTORY) hist.shift();

        // Pad with current value until we have full 24 readings
        const padded = [
          ...Array(Math.max(0, MAX_HISTORY - hist.length)).fill({
            level: wl,
            time:  "--:--",
          }),
          ...hist,
        ];

        const status = getStatus(wl, station);
        const color  = getColor(status);

        return {
          ...s,
          time:    timeLabel,
          level:   wl,
          max:     STATION_META[s.name].max,
          status,
          color,
          data:    padded.map((p) => p.level),
          times:   padded.map((p) => p.time),
          loading: false,
          error:   false,
        };
      })
    );
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const results = await fetchAllStations();
      processResults(results);
    } catch (err) {
      console.error("Station fetch error:", err);
      setStationData((prev) =>
        prev.map((s) => ({ ...s, loading: false, error: true }))
      );
    }
  }, [processResults]);

  useEffect(() => {
    fetchData();                                         // fetch immediately on mount
    const id = setInterval(fetchData, REFRESH_INTERVAL); // then every 30s
    return () => clearInterval(id);                      // cleanup on unmount
  }, [fetchData]);

  return stationData;
}