import axios from 'axios';
import { appConfig } from './config';

// Define interface for weather data
// 定义天气数据接口
export interface WeatherData {
  current: {
    temp: number;         // Current temperature | 当前温度
    humidity: number;     // Humidity percentage | 湿度百分比
    weather: {
      id: number;         // Weather condition ID | 天气状况ID
      main: string;       // Main weather condition | 主要天气状况
      description: string; // Weather description | 天气描述
      icon: string;       // Weather icon code | 天气图标代码
    }[];
    dt: number;           // Timestamp | 时间戳
    rain?: {
      '1h'?: number;      // Rain volume for last hour in mm | 过去一小时的降雨量(毫米)
    };
  };
  hourly: {
    dt: number;           // Timestamp of the forecast hour | 预报小时的时间戳
    temp: number;         // Temperature in Celsius | 摄氏温度
    weather: {
      id: number;         // Weather condition ID used for categorization | 用于分类的天气状况ID
      main: string;       // Brief weather description (e.g., "Rain", "Clear") | 简短天气描述（如"雨"、"晴"）
      description: string; // Detailed weather description | 详细天气描述
      icon: string;       // Icon code for weather visualization | 用于天气可视化的图标代码
    }[];
    pop: number;          // Probability of precipitation (0-1 scale) | 降水概率（0-1范围）
    rain?: {
      '1h'?: number;      // Rain volume for the hour in millimeters (optional) | 该小时的降雨量（毫米，可选）
    };
  }[];  // Array of hourly forecasts, typically for the next 24-48 hours | 每小时预报数组，通常包含未来24-48小时
}

// Interface for weather data cache
// 天气数据缓存接口
interface WeatherCache {
  timestamp: number;     // Unix timestamp when data was fetched (milliseconds) | 数据获取时的Unix时间戳（毫秒）
  data: WeatherData;     // Cached weather data structure | 已缓存的天气数据结构
}

// Use a free API that doesn't require authentication
// 使用不需要认证的免费API
// Hong Kong's coordinates are approximately 22.3193° N, 114.1694° E
// 香港的坐标大约是北纬22.3193°, 东经114.1694°
const HK_LAT = 22.3193;
const HK_LONG = 114.1694;
const WEATHER_API_BASE = 'https://api.open-meteo.com/v1/forecast';

// Cache system for weather data
// 天气数据的缓存系统
let weatherCache: WeatherCache | null = null;
const CACHE_TTL = appConfig.apiCacheTTL;

/**
 * Gets current and hourly weather forecast for Hong Kong
 * Using open-meteo API which doesn't require authentication
 * 
 * 获取香港当前和每小时天气预报
 * 使用不需要认证的open-meteo API
 */
export async function getWeatherForLocation(
  latitude: number = HK_LAT,
  longitude: number = HK_LONG
): Promise<WeatherData> {
  const now = Date.now();
  
  // Return cached data if available and not expired
  // 如果缓存数据可用且未过期，则返回缓存数据
  if (weatherCache && now - weatherCache.timestamp < CACHE_TTL) {
    return weatherCache.data;
  }

  try {
    // Using open-meteo API which doesn't require API key
    // 使用不需要API密钥的open-meteo API
    const { data } = await axios.get(
      `${WEATHER_API_BASE}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m,weather_code,precipitation_probability&timezone=Asia/Hong_Kong&forecast_days=1`
    );
    
    // Transform the data to match our WeatherData interface
    // 转换数据以匹配我们的WeatherData接口
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
    // 更新缓存
    weatherCache = {
      timestamp: now,
      data: transformedData
    };
    
    return transformedData;
  } catch (error) {
    console.error('Weather API request failed:', error);
    // Return mock data in case of failure
    // 请求失败时返回模拟数据
    return getMockWeatherData();
  }
}

/**
 * Provides mock weather data when API fails
 * 当API请求失败时提供模拟天气数据
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
 * 将Open-Meteo的天气代码映射为描述性天气类型
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
 * 将Open-Meteo天气代码映射为图标代码
 */
function getIconFromWeatherCode(code: number): string {
  if (code === 0) return '01d'; // Clear | 晴朗
  if (code <= 3) return '02d'; // Partly cloudy | 部分多云
  if (code <= 48) return '50d'; // Fog | 雾
  if (code <= 57) return '09d'; // Drizzle | 毛毛雨
  if (code <= 67) return '10d'; // Rain | 雨
  if (code <= 77) return '13d'; // Snow | 雪
  if (code <= 82) return '09d'; // Rain showers | 阵雨
  if (code <= 86) return '13d'; // Snow showers | 阵雪
  return '11d'; // Thunderstorm | 雷暴
}

/**
 * Gets weather score for journey planning
 * Higher score means better weather for walking
 * 
 * 获取旅程规划的天气评分
 * 更高的分数意味着更适合步行的天气
 */
export function calculateWeatherScore(weather: WeatherData): number {
  const current = weather.current;
  let score = 100; // Start with perfect score | 从满分开始
  
  // Reduce score based on rain (using weather code as indicator)
  // 根据降雨情况降低分数（使用天气代码作为指标）
  const weatherCode = current.weather[0]?.id || 0;
  if (weatherCode > 50) {
    // Precipitation codes start around 50+ | 降水代码大约从50开始
    const intensity = Math.min(3, Math.floor((weatherCode % 10) / 2) + 1); // 1-3 scale | 1-3级
    score -= intensity * 20; // Up to -60 for heavy precipitation | 大雨最多减60分
  }
  
  // Reduce score based on extreme temperatures
  // 根据极端温度降低分数
  const temp = current.temp;
  if (temp < 15) {
    score -= (15 - temp) * 2; // Colder = worse | 越冷越差
  } else if (temp > 30) {
    score -= (temp - 30) * 3; // Hotter = worse | 越热越差
  }
  
  // Check hourly forecast for rain probability
  // 检查每小时降雨概率预报
  const nextHour = weather.hourly[0];
  if (nextHour && nextHour.pop > 0.3) { // >30% chance of rain | >30%降雨几率
    score -= nextHour.pop * 40; // Up to -40 for high chance of rain | 高降雨概率最多减40分
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Returns weather icon name based on OpenWeatherMap icon code
 * 根据OpenWeatherMap图标代码返回天气图标名称
 */
export function getWeatherIcon(iconCode: string): string {
  // Map OpenWeatherMap icon codes to our app's IconSymbol names
  // 将OpenWeatherMap图标代码映射到我们应用的IconSymbol名称
  const iconMap: Record<string, string> = {
    '01d': 'sun.max.fill', // clear sky day | 晴天
    '01n': 'moon.stars.fill', // clear sky night | 晴夜
    '02d': 'cloud.sun.fill', // few clouds day | 少云天
    '02n': 'cloud.moon.fill', // few clouds night | 少云夜
    '03d': 'cloud.fill', // scattered clouds | 散云
    '03n': 'cloud.fill',
    '04d': 'smoke.fill', // broken clouds | 碎云
    '04n': 'smoke.fill',
    '09d': 'cloud.drizzle.fill', // shower rain | 阵雨
    '09n': 'cloud.drizzle.fill',
    '10d': 'cloud.rain.fill', // rain | 雨
    '10n': 'cloud.rain.fill',
    '11d': 'cloud.bolt.fill', // thunderstorm | 雷暴
    '11n': 'cloud.bolt.fill',
    '13d': 'snow', // snow | 雪
    '13n': 'snow',
    '50d': 'cloud.fog.fill', // mist | 雾
    '50n': 'cloud.fog.fill',
  };
  
  return iconMap[iconCode] || 'cloud.fill';
}
