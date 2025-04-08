import axios from 'axios';
import { appConfig } from './config';

// Define interface for weather data
export interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    dt: number; // Timestamp
    rain?: {
      '1h'?: number; // Rain volume for last hour in mm
    };
  };
  hourly: {
    dt: number; // Timestamp
    temp: number;
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    pop: number; // Probability of precipitation
    rain?: {
      '1h'?: number; // Rain volume for last hour in mm
    };
  }[];
}

interface WeatherCache {
  timestamp: number;
  data: WeatherData;
}

// Use a free API that doesn't require authentication
// Hong Kong's coordinates are approximately 22.3193° N, 114.1694° E
const HK_LAT = 22.3193;
const HK_LONG = 114.1694;
const WEATHER_API_BASE = 'https://api.open-meteo.com/v1/forecast';

// Cache system for weather data
let weatherCache: WeatherCache | null = null;
const CACHE_TTL = appConfig.apiCacheTTL;

/**
 * Gets current and hourly weather forecast for Hong Kong
 * Using open-meteo API which doesn't require authentication
 */
export async function getWeatherForLocation(
  latitude: number = HK_LAT,
  longitude: number = HK_LONG
): Promise<WeatherData> {
  const now = Date.now();
  
  // Return cached data if available and not expired
  if (weatherCache && now - weatherCache.timestamp < CACHE_TTL) {
    return weatherCache.data;
  }

  try {
    // Using open-meteo API which doesn't require API key
    const { data } = await axios.get(
      `${WEATHER_API_BASE}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m,weather_code,precipitation_probability&timezone=Asia/Hong_Kong&forecast_days=1`
    );
    
    // Transform the data to match our WeatherData interface
    const transformedData: WeatherData = {
      current: {
        temp: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        weather: [{
          id: data.current.weather_code,
          main: getWeatherTypeFromCode(data.current.weather_code),
          description: getWeatherTypeFromCode(data.current.weather_code),
          icon: getIconFromWeatherCode(data.current.weather_code)
        }],
        dt: now / 1000
      },
      hourly: data.hourly.time.slice(0, 6).map((time: string, i: number) => ({
        dt: new Date(time).getTime() / 1000,
        temp: data.hourly.temperature_2m[i],
        pop: data.hourly.precipitation_probability[i] / 100,
        weather: [{
          id: data.hourly.weather_code[i],
          main: getWeatherTypeFromCode(data.hourly.weather_code[i]),
          description: getWeatherTypeFromCode(data.hourly.weather_code[i]),
          icon: getIconFromWeatherCode(data.hourly.weather_code[i])
        }]
      }))
    };
    
    // Update cache
    weatherCache = {
      timestamp: now,
      data: transformedData
    };
    
    return transformedData;
  } catch (error) {
    console.error('Weather API request failed:', error);
    // Return mock data in case of failure
    return getMockWeatherData();
  }
}

/**
 * Provides mock weather data when API fails
 */
function getMockWeatherData(): WeatherData {
  const now = Date.now();
  return {
    current: {
      temp: 25,
      humidity: 65,
      weather: [{
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }],
      dt: now / 1000
    },
    hourly: Array(6).fill(0).map((_, i) => ({
      dt: (now / 1000) + (i * 3600),
      temp: 24 + Math.round(Math.random() * 3),
      pop: 0.1,
      weather: [{
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }]
    }))
  };
}

/**
 * Map weather codes from Open-Meteo to descriptive weather types
 */
function getWeatherTypeFromCode(code: number): string {
  const codeMap: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return codeMap[code] || 'Unknown';
}

/**
 * Map Open-Meteo weather codes to icon codes
 */
function getIconFromWeatherCode(code: number): string {
  if (code === 0) return '01d'; // Clear
  if (code <= 3) return '02d'; // Partly cloudy
  if (code <= 48) return '50d'; // Fog
  if (code <= 57) return '09d'; // Drizzle
  if (code <= 67) return '10d'; // Rain
  if (code <= 77) return '13d'; // Snow
  if (code <= 82) return '09d'; // Rain showers
  if (code <= 86) return '13d'; // Snow showers
  return '11d'; // Thunderstorm
}

/**
 * Gets weather score for journey planning
 * Higher score means better weather for walking
 */
export function calculateWeatherScore(weather: WeatherData): number {
  const current = weather.current;
  let score = 100; // Start with perfect score
  
  // Reduce score based on rain (using weather code as indicator)
  const weatherCode = current.weather[0]?.id || 0;
  if (weatherCode > 50) {
    // Precipitation codes start around 50+
    const intensity = Math.min(3, Math.floor((weatherCode % 10) / 2) + 1); // 1-3 scale
    score -= intensity * 20; // Up to -60 for heavy precipitation
  }
  
  // Reduce score based on extreme temperatures
  const temp = current.temp;
  if (temp < 15) {
    score -= (15 - temp) * 2; // Colder = worse
  } else if (temp > 30) {
    score -= (temp - 30) * 3; // Hotter = worse
  }
  
  // Check hourly forecast for rain probability
  const nextHour = weather.hourly[0];
  if (nextHour && nextHour.pop > 0.3) { // >30% chance of rain
    score -= nextHour.pop * 40; // Up to -40 for high chance of rain
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Returns weather icon name based on OpenWeatherMap icon code
 */
export function getWeatherIcon(iconCode: string): string {
  // Map OpenWeatherMap icon codes to our app's IconSymbol names
  const iconMap: Record<string, string> = {
    '01d': 'sun.max.fill', // clear sky day
    '01n': 'moon.stars.fill', // clear sky night
    '02d': 'cloud.sun.fill', // few clouds day
    '02n': 'cloud.moon.fill', // few clouds night
    '03d': 'cloud.fill', // scattered clouds
    '03n': 'cloud.fill',
    '04d': 'smoke.fill', // broken clouds
    '04n': 'smoke.fill',
    '09d': 'cloud.drizzle.fill', // shower rain
    '09n': 'cloud.drizzle.fill',
    '10d': 'cloud.rain.fill', // rain
    '10n': 'cloud.rain.fill',
    '11d': 'cloud.bolt.fill', // thunderstorm
    '11n': 'cloud.bolt.fill',
    '13d': 'snow', // snow
    '13n': 'snow',
    '50d': 'cloud.fog.fill', // mist
    '50n': 'cloud.fog.fill',
  };
  
  return iconMap[iconCode] || 'cloud.fill';
}
