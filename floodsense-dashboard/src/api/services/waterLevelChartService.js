const BASE = import.meta.env.VITE_API_URL ?? 'https://floodsense-api-389447895642.asia-southeast1.run.app/api';

export async function fetchStationHistory(stationName) {
  const res = await fetch(`${BASE}/water-level-history/${encodeURIComponent(stationName)}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json(); // { past: [...], current: {...} }
}

export async function fetchStationPredictions(stationName) {
  const res = await fetch(`${BASE}/water-level-predictions/${encodeURIComponent(stationName)}`);
  if (!res.ok) throw new Error('Failed to fetch predictions');
  return res.json(); // { predictions: [...] }
}