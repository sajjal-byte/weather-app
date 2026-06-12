import { useState, useEffect } from "react";


const weatherIcons = {
  Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
  Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Fog: "🌫️", Haze: "🌫️",
};

const bgGradients = {
  Clear: "linear-gradient(135deg, #f7971e, #ffd200)",
  Clouds: "linear-gradient(135deg, #757f9a, #d7dde8)",
  Rain: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
  Drizzle: "linear-gradient(135deg, #4b6cb7, #182848)",
  Thunderstorm: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
  Snow: "linear-gradient(135deg, #e0eafc, #cfdef3)",
  Mist: "linear-gradient(135deg, #606c88, #3f4c6b)",
  Fog: "linear-gradient(135deg, #606c88, #3f4c6b)",
  Haze: "linear-gradient(135deg, #f7971e, #ffd200)",
};

const isDark = (condition) =>
  ["Rain", "Drizzle", "Thunderstorm", "Mist", "Fog"].includes(condition);

export default function WeatherApp() {
  const [city, setCity] = useState("Karachi");
  const [input, setInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("metric"); // metric = °C, imperial = °F

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError("");
    try {
      const [curr, fore] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${unit}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${unit}&cnt=40`),
      ]);
      if (!curr.ok) throw new Error("City not found");
      const currData = await curr.json();
      const foreData = await fore.json();

      setWeather(currData);

      // Get one entry per day (noon forecast)
      const daily = {};
      foreData.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0];
        if (!daily[date] && item.dt_txt.includes("12:00:00")) daily[date] = item;
      });
      setForecast(Object.values(daily).slice(0, 5));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather(city); }, [city, unit]);

  const condition = weather?.weather[0]?.main || "Clear";
  const dark = isDark(condition);
  const bg = bgGradients[condition] || bgGradients.Clear;
  const textColor = dark ? "#f0f0f0" : "#1a1a1a";
  const subColor = dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)";
  const cardBg = dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.35)";
  const borderColor = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) { setCity(input.trim()); setInput(""); }
  };

  const fmt = (dt) => new Date(dt * 1000).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const dayName = (dt_txt) => new Date(dt_txt).toLocaleDateString("en-US", { weekday: "short" });

  return (
    <div style={{
      minHeight: "100vh", background: bg, display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "24px", transition: "background 0.8s ease",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: ${subColor}; }
        input:focus { outline: none; }
        .card { backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
        .forecast-item:hover { transform: translateY(-4px); transition: transform 0.2s; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ width: "100%", maxWidth: "480px" }}>
        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search city..."
            style={{
              flex: 1, padding: "14px 20px", borderRadius: "50px",
              border: `1px solid ${borderColor}`, background: cardBg,
              color: textColor, fontSize: "15px", backdropFilter: "blur(10px)",
            }}
          />
          <button type="submit" style={{
            padding: "14px 22px", borderRadius: "50px", border: "none",
            background: dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
            color: textColor, cursor: "pointer", fontSize: "16px", fontWeight: "600",
          }}>→</button>
          <button type="button" onClick={() => setUnit(u => u === "metric" ? "imperial" : "metric")} style={{
            padding: "14px 18px", borderRadius: "50px", border: `1px solid ${borderColor}`,
            background: cardBg, color: textColor, cursor: "pointer", fontSize: "13px", fontWeight: "600",
            backdropFilter: "blur(10px)",
          }}>{unit === "metric" ? "°F" : "°C"}</button>
        </form>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px", color: textColor }}>
            <div style={{ width: "40px", height: "40px", border: `3px solid ${borderColor}`, borderTopColor: textColor, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            Loading...
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "40px", color: "#ff6b6b", fontSize: "16px" }}>
            ⚠️ {error}
          </div>
        )}

        {weather && !loading && (
          <div className="fade-up">
            {/* Main Card */}
            <div className="card" style={{
              background: cardBg, border: `1px solid ${borderColor}`,
              borderRadius: "28px", padding: "32px", marginBottom: "16px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: "800", color: textColor }}>
                    {weather.name}, <span style={{ fontWeight: "700", fontSize: "20px" }}>{weather.sys.country}</span>
                  </div>
                  <div style={{ color: subColor, fontSize: "14px", marginTop: "4px" }}>{fmt(weather.dt)}</div>
                </div>
                <div style={{ fontSize: "64px", lineHeight: 1 }}>{weatherIcons[condition] || "🌡️"}</div>
              </div>

              <div style={{ marginTop: "28px", display: "flex", alignItems: "flex-end", gap: "12px" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "80px", fontWeight: "800", color: textColor, lineHeight: 1 }}>
                  {Math.round(weather.main.temp)}°
                </div>
                <div style={{ paddingBottom: "12px" }}>
                  <div style={{ color: textColor, fontSize: "18px", fontWeight: "600", textTransform: "capitalize" }}>
                    {weather.weather[0].description}
                  </div>
                  <div style={{ color: subColor, fontSize: "13px" }}>
                    Feels like {Math.round(weather.main.feels_like)}°
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "28px" }}>
                {([
                  { label: "Humidity", value: `${weather.main.humidity}%`, icon: "💧" },
                  { label: "Wind", value: `${Math.round(weather.wind.speed)} ${unit === "metric" ? "m/s" : "mph"}`, icon: "💨" },
                  { label: "Pressure", value: `${weather.main.pressure} hPa`, icon: "🔵" },
                ]).map((s) => (
                  <div key={s.label} style={{
                    background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    borderRadius: "16px", padding: "14px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: "20px" }}>{s.icon}</div>
                    <div style={{ color: textColor, fontWeight: "700", fontSize: "14px", marginTop: "6px" }}>{s.value}</div>
                    <div style={{ color: subColor, fontSize: "11px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5-Day Forecast */}
            {forecast.length > 0 && (
              <div className="card" style={{
                background: cardBg, border: `1px solid ${borderColor}`,
                borderRadius: "28px", padding: "24px",
              }}>
                <div style={{ color: subColor, fontSize: "12px", fontWeight: "600", letterSpacing: "1px", marginBottom: "16px", textTransform: "uppercase" }}>
                  5-Day Forecast
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {forecast.map((day, i) => (
                    <div key={i} className="forecast-item" style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 0", borderBottom: i < forecast.length - 1 ? `1px solid ${borderColor}` : "none",
                    }}>
                      <div style={{ color: textColor, fontWeight: "600", width: "48px", fontSize: "15px" }}>
                        {dayName(day.dt_txt)}
                      </div>
                      <div style={{ fontSize: "24px" }}>{weatherIcons[day.weather[0].main] || "🌡️"}</div>
                      <div style={{ color: subColor, fontSize: "13px", flex: 1, textAlign: "center", textTransform: "capitalize" }}>
                        {day.weather[0].description}
                      </div>
                      <div style={{ color: textColor, fontWeight: "700", fontSize: "15px" }}>
                        {Math.round(day.main.temp_max)}° / <span style={{ color: subColor, fontWeight: "400" }}>{Math.round(day.main.temp_min)}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return <WeatherApp />;
}
