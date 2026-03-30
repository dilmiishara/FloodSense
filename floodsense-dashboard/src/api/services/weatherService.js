// src/api/services/weatherService.js

import { WEATHER_API } from "../config/apiConfig";

export const fetchRatnapuraWeather = async () => {
  const url = `${WEATHER_API.BASE_URL}/forecast.json?key=${WEATHER_API.KEY}&q=${WEATHER_API.RATNAPURA_COORDS}&days=3&aqi=no&alerts=no`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch weather data");

  const data = await response.json();
  const current = data.current;
  const forecast = data.forecast.forecastday;

  // Shape the data to match your UI exactly
  return {
    current: {
      wind:     `${current.wind_kph} kph`,
      windDir:  `Dir: ${current.wind_dir}`,
      humidity: `${current.humidity}%`,
      pressure: `Press: ${current.pressure_mb} mb`,
      rain:     `${current.precip_mm} mm`,
      cloud:    `Cloud: ${current.cloud}%`,
      uv:       `${current.uv}`,
      vis:      `Vis: ${current.vis_km} km`,
    },
    forecast: forecast.map((day) => {
      const date = new Date(day.date);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      return {
        label:     `${dayName}, ${monthDay}`,
        condition: day.day.condition.text,
        icon:      conditionToEmoji(day.day.condition.code, day.day.condition.text),
        max:       `${day.day.maxtemp_c}°`,
        min:       `${day.day.mintemp_c}°`,
        rainChance:`${day.day.daily_chance_of_rain}%`,
        maxWind:   `${day.day.maxwind_kph} kph`,
      };
    }),
  };
};

// Maps WeatherAPI condition codes to emoji
function conditionToEmoji(code, text) {
  const t = text.toLowerCase();
  if (t.includes("sunny") || t.includes("clear"))       return "☀️";
  if (t.includes("partly cloudy"))                      return "⛅";
  if (t.includes("cloudy") || t.includes("overcast"))   return "☁️";
  if (t.includes("thunder"))                            return "⛈️";
  if (t.includes("rain") || t.includes("drizzle"))      return "🌦";
  if (t.includes("snow") || t.includes("sleet"))        return "🌨️";
  if (t.includes("fog") || t.includes("mist"))          return "🌫️";
  return "🌦";
}