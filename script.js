const APP_CONFIG = {
  portalName: "Sol Chuva",
  logoPath: "solchuva.svg",
  defaultCity: "Brasília",
  wmoCsvPath: "codigos_wmo.csv",
  iconsFolder: "icones/"
};


const ICONES_CLIMA = {
  sol: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="14" fill="%23FBBF24"/><g stroke="%23FBBF24" stroke-width="4" stroke-linecap="round"><line x1="32" y1="6" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="58"/><line x1="6" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="58" y2="32"/><line x1="13.6" y1="13.6" x2="17.8" y2="17.8"/><line x1="46.2" y1="46.2" x2="50.4" y2="50.4"/><line x1="13.6" y1="50.4" x2="17.8" y2="46.2"/><line x1="46.2" y1="17.8" x2="50.4" y2="13.6"/></g></svg>`,
  nublado: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M20 46h26a11 11 0 0 0 1.5-21.9A15 15 0 0 0 18.5 21 12.5 12.5 0 0 0 20 46z" fill="%239CA3AF"/></svg>`,
  chuva: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M20 40h26a11 11 0 0 0 1.5-21.9A15 15 0 0 0 18.5 15 12.5 12.5 0 0 0 20 40z" fill="%239CA3AF"/><g stroke="%233B82F6" stroke-width="3.5" stroke-linecap="round"><line x1="24" y1="46" x2="21" y2="54"/><line x1="33" y1="46" x2="30" y2="54"/><line x1="42" y1="46" x2="39" y2="54"/></g></svg>`,
  tempestade: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M20 40h26a11 11 0 0 0 1.5-21.9A15 15 0 0 0 18.5 15 12.5 12.5 0 0 0 20 40z" fill="%236B7280"/><polygon points="33,41 25,53 32,53 29,62 41,49 34,49" fill="%23FBBF24"/></svg>`
};

const PADRAO_WMO = {
  0: { desc: "Céu limpo", img: ICONES_CLIMA.sol },
  1: { desc: "Predominantemente limpo", img: ICONES_CLIMA.sol },
  2: { desc: "Parcialmente nublado", img: ICONES_CLIMA.nublado },
  3: { desc: "Nublado", img: ICONES_CLIMA.nublado },
  45: { desc: "Nevoeiro", img: ICONES_CLIMA.nublado },
  48: { desc: "Nevoeiro com geada", img: ICONES_CLIMA.nublado },
  51: { desc: "Garoa leve", img: ICONES_CLIMA.chuva },
  53: { desc: "Garoa moderada", img: ICONES_CLIMA.chuva },
  55: { desc: "Garoa intensa", img: ICONES_CLIMA.chuva },
  61: { desc: "Chuva leve", img: ICONES_CLIMA.chuva },
  63: { desc: "Chuva moderada", img: ICONES_CLIMA.chuva },
  65: { desc: "Chuva forte", img: ICONES_CLIMA.chuva },
  80: { desc: "Pancadas de chuva", img: ICONES_CLIMA.chuva },
  81: { desc: "Pancadas moderadas", img: ICONES_CLIMA.chuva },
  82: { desc: "Pancadas fortes", img: ICONES_CLIMA.chuva },
  95: { desc: "Tempestade", img: ICONES_CLIMA.tempestade },
  96: { desc: "Tempestade com granizo", img: ICONES_CLIMA.tempestade },
  99: { desc: "Tempestade severa", img: ICONES_CLIMA.tempestade }
};

document.getElementById("app-title").textContent = APP_CONFIG.portalName;
const appLogo = document.getElementById("app-logo");
appLogo.src = APP_CONFIG.logoPath;
appLogo.onerror = () => {
  appLogo.src = ICONES_CLIMA.chuva;
};

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const feedbackBox = document.getElementById("feedback-box");
const loadingEl = document.getElementById("loading");
const weatherContent = document.getElementById("weather-content");

let wmoTable = {};

async function loadWmoCodes() {
  try {
    const response = await fetch(APP_CONFIG.wmoCsvPath);
    if (!response.ok) throw new Error("Não foi possível ler codigos_wmo.csv");

    const csvText = await response.text();
    const lines = csvText.trim().split(/\r?\n/);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const separator = line.includes(";") ? ";" : ",";
      const [code, description, iconFile] = line.split(separator).map(item => item.trim());

      if (code) {
        wmoTable[Number(code)] = {
          desc: description || "Condição não especificada",
          icon: iconFile || "nublado.svg"
        };
      }
    }
  } catch (error) {
    console.error("Erro ao carregar tabela WMO:", error);
  }
}

function getWeatherInfo(code) {
  const numCode = Number(code);
  const entry = wmoTable[numCode];
  const padrao = PADRAO_WMO[numCode] || { desc: "Nublado", img: ICONES_CLIMA.nublado };

  if (entry) {
    return {
      desc: entry.desc,
      iconPath: `${APP_CONFIG.iconsFolder}${entry.icon}`,
      fallbackImg: padrao.img
    };
  }

  return {
    desc: padrao.desc,
    iconPath: padrao.img,
    fallbackImg: padrao.img
  };
}

function showFeedback(message) {
  feedbackBox.textContent = message;
  feedbackBox.classList.remove("hidden");
}

function clearFeedback() {
  feedbackBox.textContent = "";
  feedbackBox.classList.add("hidden");
}

async function fetchWeatherByCity(cityName) {
  const query = cityName.trim();

  if (!query) {
    showFeedback("Por favor, preencha o nome de uma localidade antes de buscar.");
    return;
  }

  clearFeedback();
  loadingEl.classList.remove("hidden");

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=pt&format=json`;
    const geoRes = await fetch(geoUrl);

    if (!geoRes.ok) {
      throw new Error("Erro na resposta da API de geocodificação");
    }

    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      weatherContent.classList.add("hidden");
      showFeedback(`A localidade "${query}" não foi encontrada. Verifique a ortografia e tente novamente.`);
      return;
    }

    const location = geoData.results[0];
    const { latitude, longitude } = location;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=10`;
    const weatherRes = await fetch(weatherUrl);

    if (!weatherRes.ok) {
      throw new Error("Erro na resposta da API de clima");
    }

    const weatherData = await weatherRes.json();
    renderWeather(location, weatherData);

  } catch (error) {
    console.error("Falha na requisição:", error);
    weatherContent.classList.add("hidden");
    showFeedback("Não foi possível carregar os dados do clima no momento. Verifique sua conexão e tente novamente.");
  } finally {
    loadingEl.classList.add("hidden");
  }
}

function renderWeather(location, data) {
  const current = data.current;
  const daily = data.daily;
  const currentInfo = getWeatherInfo(current.weather_code);

  document.getElementById("city-name").textContent = location.name;
  document.getElementById("city-region").textContent = `${location.admin1 || ""} — ${location.country}`;
  document.getElementById("current-temp").textContent = `${Math.round(current.temperature_2m)}°C`;
  document.getElementById("current-desc").textContent = currentInfo.desc;

  const currentIconEl = document.getElementById("current-icon");
  currentIconEl.src = currentInfo.iconPath;
  currentIconEl.alt = currentInfo.desc;
  currentIconEl.onerror = () => {
    currentIconEl.src = currentInfo.fallbackImg;
  };

  const now = new Date();
  document.getElementById("last-updated").textContent = `Atualizado às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

  document.getElementById("apparent-temp").textContent = `${Math.round(current.apparent_temperature)}°C`;
  document.getElementById("humidity").textContent = `${current.relative_humidity_2m}%`;
  document.getElementById("wind-speed").textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  document.getElementById("precipitation").textContent = `${current.precipitation} mm`;
  document.getElementById("uv-index").textContent = daily.uv_index_max[0];

  const sunrise = daily.sunrise[0].split("T")[1];
  const sunset = daily.sunset[0].split("T")[1];
  document.getElementById("sun-times").textContent = `${sunrise} / ${sunset}`;

  const forecastGrid = document.getElementById("forecast-grid");
  forecastGrid.innerHTML = "";

  const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  for (let i = 0; i < daily.time.length; i++) {
    const dateParts = daily.time[i].split("-");
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const formattedDate = `${dateParts[2]}/${dateParts[1]}`;

    let dayLabel = weekDays[dateObj.getDay()];
    if (i === 0) dayLabel = "Hoje";
    if (i === 1) dayLabel = "Amanhã";

    const dayInfo = getWeatherInfo(daily.weather_code[i]);
    const maxTemp = Math.round(daily.temperature_2m_max[i]);
    const minTemp = Math.round(daily.temperature_2m_min[i]);
    const rainProb = daily.precipitation_probability_max[i] ?? 0;

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <div class="day-name">${dayLabel}</div>
      <div class="day-date">${formattedDate}</div>
      <div class="day-desc">${dayInfo.desc}</div>
      <div class="day-temps">${maxTemp}° <span style="opacity:0.5">${minTemp}°</span></div>
      <div class="day-rain">💧 ${rainProb}%</div>
    `;

    const img = document.createElement("img");
    img.src = dayInfo.iconPath;
    img.alt = dayInfo.desc;
    img.className = "day-icon-img";
    img.onerror = () => {
      img.src = dayInfo.fallbackImg;
    };
    card.insertBefore(img, card.querySelector(".day-desc"));

    forecastGrid.appendChild(card);
  }

  weatherContent.classList.remove("hidden");
}

searchBtn.addEventListener("click", () => fetchWeatherByCity(cityInput.value));

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") fetchWeatherByCity(cityInput.value);
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const city = chip.getAttribute("data-city");
    cityInput.value = city;
    fetchWeatherByCity(city);
  });
});

async function init() {
  await loadWmoCodes();
  cityInput.value = APP_CONFIG.defaultCity;
  fetchWeatherByCity(APP_CONFIG.defaultCity);
}

init();