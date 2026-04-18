  // ✅ YOUR API KEY IS HERE
  const WEATHER_API_KEY = 'cbd88e284d4426cc133ba926235c9765';
  
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const statusMsgDiv = document.getElementById('statusMsg');
  const weatherPanel = document.getElementById('weatherPanel');
  
  function setStatus(message, isError = false) {
    statusMsgDiv.innerHTML = isError ? `⚠️ ${message}` : `✨ ${message}`;
    statusMsgDiv.style.color = isError ? '#ffb4a2' : '#cbdae9';
  }
  
  function getClothingSuggestion(tempC, weatherMain, humidity, windSpeed) {
    let outfit = [];
    let accessories = [];
    let tip = "";
    
    if (tempC <= 0) {
      outfit = ["🧥 Heavy Winter Coat", "🧣 Thermal Scarf", "🧤 Gloves", "🥾 Insulated Boots"];
      accessories.push("Beanie", "Ear muffs");
      tip = "❄️ Extremely cold! Layer up and cover exposed skin.";
    } 
    else if (tempC <= 10) {
      outfit = ["🧥 Winter Jacket", "🧶 Sweater", "👖 Warm Trousers"];
      accessories.push("Warm hat", "Scarf");
      tip = "🍂 Chill alert — wear warm mid-layers.";
    }
    else if (tempC <= 18) {
      outfit = ["🧥 Light Jacket", "👕 Long-sleeve shirt", "👖 Jeans"];
      accessories.push("Light scarf", "Sneakers");
      tip = "🍁 Cool but comfortable; a jacket works well.";
    }
    else if (tempC <= 25) {
      outfit = ["👕 T-shirt", "👖 Casual pants", "🧥 Denim jacket (optional)"];
      accessories.push("Sunglasses", "Sneakers");
      tip = "☀️ Perfect mild weather — breathable fabrics.";
    }
    else if (tempC <= 32) {
      outfit = ["🎽 Short sleeves", "🩳 Shorts", "👗 Summer dress"];
      accessories.push("🧢 Cap", "Sunglasses", "Sandals");
      tip = "🔥 Warm day! Wear light colors.";
    }
    else {
      outfit = ["🩳 Ultra-light shorts", "🎽 Tank top", "🧢 Wide-brim hat"];
      accessories.push("Sunscreen", "Breathable sandals");
      tip = "🥵 Extreme heat! Avoid dark clothes.";
    }
    
    const condition = weatherMain?.toLowerCase() || "";
    if (condition.includes('rain')) {
      outfit.push("🌂 Raincoat");
      accessories.push("☔ Umbrella");
      tip += " 🌧️ Don't forget rain protection!";
    }
    if (condition.includes('snow')) {
      outfit.push("❄️ Snow-proof parka");
      tip += " ⛄ Snowy conditions!";
    }
    if (windSpeed > 7) {
      outfit.push("🧥 Windbreaker");
      tip += " 💨 Windy conditions.";
    }
    if (humidity > 75) {
      tip += " 💧 High humidity — choose breathable fabrics.";
    }
    
    return { outfit, accessories, tip };
  }
  
  function renderWeatherAndSuggestion(data, cityName) {
    const tempC = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const weatherMain = data.weather[0].main;
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    const { outfit, accessories, tip } = getClothingSuggestion(tempC, weatherMain, humidity, windSpeed);
    
    const html = `
      <div class="weather-card">
        <div class="city-name">
          <span>📍 ${cityName}, ${data.sys.country}</span>
          <span>💨 ${windSpeed.toFixed(1)} m/s</span>
        </div>
        <div class="temp-block">
          <div class="temp-big">${tempC}°C</div>
          <div class="condition-icon">
            <img src="${iconUrl}" alt="${weatherMain}" style="width:40px;"> 
            ${description}
          </div>
        </div>
        <div class="details">
          <span>🌡️ Feels like: ${Math.round(data.main.feels_like)}°C</span>
          <span>💧 Humidity: ${humidity}%</span>
          <span>🌤️ ${weatherMain}</span>
        </div>
      </div>
      
      <div class="suggestion-card">
        <div class="suggestion-title">👗🧥 CLOTHING SUGGESTION</div>
        <div style="margin-bottom: 6px; font-weight:500;">👕 Outfit ideas:</div>
        <div class="outfit-list">
          ${outfit.map(item => `<span class="outfit-tag">${item}</span>`).join('')}
        </div>
        ${accessories.length ? `<div style="margin: 12px 0 6px;">🧢 Accessories:</div>
        <div class="outfit-list">
          ${accessories.map(acc => `<span class="accessory-tag">${acc}</span>`).join('')}
        </div>` : ''}
        <div class="tip-text">💡 ${tip}</div>
      </div>
    `;
    weatherPanel.innerHTML = html;
  }
  
  function showErrorPanel(message) {
    weatherPanel.innerHTML = `
      <div class="weather-card" style="text-align:center; color:#ffb7a3;">
        <div style="font-size:2rem;">⚠️</div>
        <h3>Could not fetch weather</h3>
        <p>${message}</p>
        <small>Try another city or check your connection</small>
      </div>
    `;
  }
  
  async function fetchWeather(city) {
    if (!city.trim()) {
      setStatus("Please enter a city name", true);
      return false;
    }
    
    setStatus(`Fetching weather for ${city}...`);
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;
    
    console.log("Fetching URL:", apiUrl); // This helps debug
    
    try {
      const response = await fetch(apiUrl);
      console.log("Response status:", response.status); // Check what status you get
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error details:", errorData);
        
        if (response.status === 401) {
          throw new Error("API key invalid or not activated yet. Wait 15-30 minutes after signup.");
        }
        if (response.status === 404) {
          throw new Error("City not found. Check spelling (e.g., 'London', 'Tokyo')");
        }
        if (response.status === 429) {
          throw new Error("Too many requests. Please wait a moment.");
        }
        throw new Error(errorData.message || "Unknown error");
      }
      
      const data = await response.json();
      console.log("Weather data received:", data);
      setStatus(`✅ Weather loaded for ${data.name}`);
      renderWeatherAndSuggestion(data, data.name);
      return true;
    } catch (err) {
      console.error("Fetch error:", err);
      showErrorPanel(err.message);
      setStatus(err.message, true);
      return false;
    }
  }
  
  async function handleSearch() {
    let city = cityInput.value.trim();
    if (city === "") city = "London";
    await fetchWeather(city);
  }
  
  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });
  searchBtn.addEventListener("click", handleSearch);
  
  // Test the API on load
  window.addEventListener("DOMContentLoaded", () => {
    console.log("App loaded, testing API with London...");
    fetchWeather("London");
  });