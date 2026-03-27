import axios from "axios";
import { STATION_API } from "../config/apiConfig";

export const MONITORED_STATIONS = ["Ellagawa", "Putupaula", "Rathnapura"];

export const STATION_META = {
  Ellagawa:   { id: "s1", max: 15 },
  Putupaula:  { id: "s2", max: 6  },
  Rathnapura: { id: "s3", max: 10 },
};

export const REFRESH_INTERVAL = 30000;
export const MAX_HISTORY      = 24;

export const fetchStation = async (name) => {
  const response = await axios.get(STATION_API(name));
  return response.data;
};

export const fetchAllStations = async () => {
  const results = await Promise.allSettled(
    MONITORED_STATIONS.map((name) => fetchStation(name))
  );
  return results.map((result, i) => ({
    name:    MONITORED_STATIONS[i],
    success: result.status === "fulfilled",
    data:    result.status === "fulfilled" ? result.value : null,
    error:   result.status === "rejected"  ? result.reason : null,
  }));
};