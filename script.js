// Import configuration from config.js
const apiKey = CONFIG.API_KEY;
let currentCity = CONFIG.DEFAULT_CITY;
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

// DOM Elements
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const favoritesToggle = document.getElementById('favorites-toggle');
const favoritesSidebar = document.getElementById('favorites-sidebar');
const closeSidebar = document.getElementById('close-sidebar');
const addFavoriteBtn = document.getElementById('add-favorite-btn');
const forecastList = document.getElementById('forecast-list');
const scrollLeft = document.getElementById('scroll-left');
const scrollRight = document.getElementById('scroll-right');
const loading = document.getElementById('loading');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

favoritesToggle.addEventListener('click', () => {
    favoritesSidebar.classList.toggle('active');
});

closeSidebar.addEventListener('click', () => {
    favoritesSidebar.classList.remove('active');
});

addFavoriteBtn.addEventListener('click', toggleFavorite);

scrollLeft.addEventListener('click', () => {
    forecastList.scrollBy({ left: -220, behavior: 'smooth' });
});

scrollRight.addEventListener('click', () => {
    forecastList.scrollBy({ left: 220, behavior: 'smooth' });
});

// Initialize
initApp();

function initApp() {
    renderFavorites();
    fetchWeather(currentCity);
}

function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
        cityInput.value = '';
    }
}

async function fetchWeather(city) {
    showLoading(true);
    try {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/forecast.json?key=${apiKey}&q=${city}&days=${CONFIG.FORECAST_DAYS}&aqi=yes`
        );
        
        if (!response.ok) throw new Error('City not found');
        
        const data = await response.json();
        currentCity = data.location.name;
        updateUI(data);
        updateFavoriteButton();
    } catch (error) {
        alert('City not found! Please try again.');
    } finally {
        showLoading(false);
    }
}

function updateUI(data) {
    const { location, current, forecast } = data;
    
    // Location and Date
    document.getElementById('city-name').textContent = location.name;
    const date = new Date(location.localtime);
    document.getElementById('date-text').textContent = formatDate(date);
    document.getElementById('local-time').textContent = formatTime(date);
    
    // Current Weather
    document.getElementById('weather-icon').src = `https:${current.condition.icon}`;
    document.getElementById('temp').textContent = `${Math.round(current.temp_c)}°`;
    document.getElementById('condition-text').textContent = current.condition.text;
    document.getElementById('feels-like-temp').textContent = `${Math.round(current.feelslike_c)}°`;
    
    // Temperature Range (from today's forecast)
    const todayForecast = forecast.forecastday[0].day;
    document.getElementById('max-temp').textContent = `${Math.round(todayForecast.maxtemp_c)}°`;
    document.getElementById('min-temp').textContent = `${Math.round(todayForecast.mintemp_c)}°`;
    
    // Weather Details
    document.getElementById('wind-speed').textContent = `${current.wind_kph} km/h`;
    document.getElementById('wind-direction').textContent = current.wind_dir;
    document.getElementById('humidity').textContent = `${current.humidity}%`;
    document.getElementById('visibility').textContent = `${current.vis_km} km`;
    document.getElementById('pressure').textContent = `${current.pressure_mb} mb`;
    
    // UV Index
    const uvIndex = current.uv;
    const uvLevel = getUVLevel(uvIndex);
    document.getElementById('uv-index').textContent = uvIndex;
    document.getElementById('uv-level').textContent = uvLevel;
    
    // Air Quality
    const aqi = current.air_quality ? current.air_quality['us-epa-index'] : 1;
    const aqiText = getAQIText(aqi);
    document.getElementById('aqi-value').textContent = aqi;
    document.getElementById('aqi-text').textContent = aqiText;
    
    // Sunrise/Sunset
    document.getElementById('sunrise-time').textContent = forecast.forecastday[0].astro.sunrise;
    document.getElementById('sunset-time').textContent = forecast.forecastday[0].astro.sunset;
    
    // 7-Day Forecast
    renderForecast(forecast.forecastday);
}

function renderForecast(forecastDays) {
    forecastList.innerHTML = '';
    
    forecastDays.forEach((day, index) => {
        const date = new Date(day.date);
        const dayName = index === 0 ? 'Today' : formatDayName(date);
        
        const card = document.createElement('div');
        card.className = 'forecast-card glass';
        card.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-date">${formatShortDate(date)}</div>
            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            <div class="forecast-temp">${Math.round(day.day.avgtemp_c)}°</div>
            <div class="forecast-condition">${day.day.condition.text}</div>
            <div class="forecast-temp-range">
                <span><i class="fas fa-arrow-up"></i> ${Math.round(day.day.maxtemp_c)}°</span>
                <span><i class="fas fa-arrow-down"></i> ${Math.round(day.day.mintemp_c)}°</span>
            </div>
        `;
        forecastList.appendChild(card);
    });
}

function toggleFavorite() {
    const index = favorites.findIndex(fav => fav.city === currentCity);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({ city: currentCity, addedAt: Date.now() });
    }
    
    saveFavorites();
    updateFavoriteButton();
    renderFavorites();
}

function updateFavoriteButton() {
    const isFavorite = favorites.some(fav => fav.city === currentCity);
    addFavoriteBtn.classList.toggle('active', isFavorite);
}

function renderFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-favorites">No favorite locations yet. Add one!</p>';
        return;
    }
    
    favoritesList.innerHTML = favorites.map(fav => `
        <div class="favorite-item" onclick="loadFavorite('${fav.city}')">
            <div class="favorite-info">
                <h3>${fav.city}</h3>
                <p>Added ${formatRelativeTime(fav.addedAt)}</p>
            </div>
            <button class="remove-favorite" onclick="event.stopPropagation(); removeFavorite('${fav.city}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function loadFavorite(city) {
    fetchWeather(city);
    favoritesSidebar.classList.remove('active');
}

function removeFavorite(city) {
    favorites = favorites.filter(fav => fav.city !== city);
    saveFavorites();
    renderFavorites();
    updateFavoriteButton();
}

function saveFavorites() {
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
}

function showLoading(show) {
    loading.classList.toggle('active', show);
}

// Utility Functions
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
}

function formatDayName(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatShortDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatRelativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
}

function getUVLevel(uv) {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
}

function getAQIText(aqi) {
    const levels = ['Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
    return levels[aqi - 1] || 'Unknown';
}
