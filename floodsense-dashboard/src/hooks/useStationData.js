import { useEffect, useState, useRef } from "react";

const STATIONS_LATEST_API = "https://www.srilankafloodmonitor.site/api/levels/latest";

const MONITORED_STATIONS = ["Rathnapura", "Ellagawa", "Putupaula"];

const STATION_META = {
  Ellagawa:   { id: "s1", color: "#00a86b" },
  Putupaula:  { id: "s2", color: "#00a86b" },
  Rathnapura: { id: "s3", color: "#00a86b" },
};

const REFRESH_INTERVAL = 30000;
const HISTORY_SIZE = 24;

function mapStatus(alert_status) {
  switch (alert_status?.toUpperCase()) {
    case "MAJOR FLOOD": return "critical";
    case "MINOR FLOOD": return "critical";
    case "ALERT":       return "warning";
    default:            return "normal";
  }
}

export function useStationData() {
  const historyRef = useRef(
    Object.fromEntries(MONITORED_STATIONS.map((name) => [name, []]))
  );

  const [stationData, setStationData] = useState(
    MONITORED_STATIONS.map((name) => ({
      id:      STATION_META[name].id,
      name,
      color:   STATION_META[name].color,
      time:    "--",
      level:   0,
      max:     10,
      status:  "normal",
      data:    Array(HISTORY_SIZE).fill(0),
      times:   Array(HISTORY_SIZE).fill("--"),
      loading: true,
      error:   false,
    }))
  );

  useEffect(() => {
    let mounted = true;

    async function loadLatest() {
      try {
        const res = await fetch(STATIONS_LATEST_API);
        const all = await res.json();

        if (!mounted) return;

        const updated = MONITORED_STATIONS.map((name) => {
          const found = all.find((item) => item.station_name === name);

          if (!found) {
            return {
              id:      STATION_META[name].id,
              name,
              color:   STATION_META[name].color,
              time:    "--",
              level:   0,
              max:     10,
              status:  "normal",
              data:    Array(HISTORY_SIZE).fill(0),
              times:   Array(HISTORY_SIZE).fill("--"),
              loading: false,
              error:   true,
            };
          }

          const t = new Date(found.timestamp);
          const time = isNaN(t)
            ? "--"
            : t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          const level = Number(found.water_level) || 0;

          // Accumulate history from each poll
          const bucket = historyRef.current[name];
          const last   = bucket[bucket.length - 1];
          if (!last || last.time !== time) {
            bucket.push({ level, time });
          }
          if (bucket.length > HISTORY_SIZE) {
            bucket.splice(0, bucket.length - HISTORY_SIZE);
          }

          // Pad front with zeros until we have 24 real readings
          const padded = [
            ...Array(Math.max(0, HISTORY_SIZE - bucket.length))
              .fill({ level: 0, time: "--" }),
            ...bucket,
          ];

          const data  = padded.map((e) => e.level);
          const times = padded.map((e) => e.time);

          const dataMax = Math.max(...data.filter((v) => v > 0));
          const max = dataMax > 0 ? Math.ceil(dataMax * 1.4) : 10;

          return {
            id:      STATION_META[name].id,
            name,
            color:   STATION_META[name].color,
            time,
            level,
            max,
            status:  mapStatus(found.alert_status),
            data,
            times,
            loading: false,
            error:   false,
          };
        });

        setStationData(updated);
      } catch (err) {
        console.error("useStationData error:", err);
        if (!mounted) return;
        setStationData((prev) =>
          prev.map((s) => ({ ...s, loading: false, error: true }))
        );
      }
    }

    loadLatest();
    const interval = setInterval(loadLatest, REFRESH_INTERVAL);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return stationData;
}