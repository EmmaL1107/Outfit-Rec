import type { WeatherData, WeatherCondition } from '../types';
import { settingsDB } from '../store/db';

const WEATHER_CODE_MAP: Record<number, WeatherCondition> = {
  0: '晴', 1: '晴', 2: '多云', 3: '阴',
  45: '阴', 48: '阴',
  51: '雨', 53: '雨', 55: '雨', 56: '雨', 57: '雨',
  61: '雨', 63: '雨', 65: '雨', 66: '雨', 67: '雨',
  71: '雪', 73: '雪', 75: '雪', 77: '雪',
  80: '雨', 81: '雨', 82: '雨', 85: '雪', 86: '雪',
  95: '雨', 96: '雨', 99: '雨',
};

const QWEATHER_TEXT_MAP: Record<string, WeatherCondition> = {
  '晴': '晴', '多云': '多云', '少云': '多云', '晴间多云': '多云',
  '阴': '阴', '有风': '阴',
  '阵雨': '雨', '雷阵雨': '雨', '雷阵雨伴有冰雹': '雨',
  '小雨': '雨', '中雨': '雨', '大雨': '雨', '暴雨': '雨',
  '大暴雨': '雨', '特大暴雨': '雨', '强阵雨': '雨',
  '极端降雨': '雨', '毛毛雨': '雨', '细雨': '雨',
  '雨': '雨', '小到中雨': '雨', '中到大雨': '雨', '大到暴雨': '雨',
  '暴雨到大暴雨': '雨', '大暴雨到特大暴雨': '雨',
  '雨雪天气': '雪', '雨夹雪': '雪', '阵雨夹雪': '雪',
  '小雪': '雪', '中雪': '雪', '大雪': '雪', '暴雪': '雪',
  '小到中雪': '雪', '中到大雪': '雪', '大到暴雪': '雪',
  '冻雨': '雨', '雾': '阴', '浓雾': '阴', '霾': '阴',
};

export interface LocationResult {
  latitude: number;
  longitude: number;
  cityName: string;
  method: 'browser' | 'ip';
}

async function locateByBrowser(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    if (!navigator.geolocation) return null;
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      });
    });
    console.log(`[定位] 浏览器: ${pos.coords.latitude}, ${pos.coords.longitude}`);
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch (err) {
    console.log('[定位] 浏览器失败:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function locateByIP(): Promise<LocationResult | null> {
  const apis = [locateByIPWhoIs, locateByGeoDB, locateByIPApi];
  for (const api of apis) {
    const result = await api();
    if (result) return result;
  }
  return null;
}

async function locateByIPWhoIs(): Promise<LocationResult | null> {
  try {
    const res = await fetch('https://ipwho.is/');
    const data = await res.json();
    if (data.success && data.latitude && data.longitude) {
      const cityName = data.city || data.region || '';
      if (cityName) {
        console.log(`[定位] ipwho.is: ${cityName}`);
        return { latitude: data.latitude, longitude: data.longitude, cityName, method: 'ip' };
      }
    }
    return null;
  } catch { return null; }
}

async function locateByGeoDB(): Promise<LocationResult | null> {
  try {
    const res = await fetch('https://geolocation-db.com/json/');
    const data = await res.json();
    if (data.latitude && data.longitude) {
      const cityName = data.city || data.state || '';
      if (cityName && cityName !== 'Not found') {
        console.log(`[定位] geolocation-db: ${cityName}`);
        return { latitude: data.latitude, longitude: data.longitude, cityName, method: 'ip' };
      }
    }
    return null;
  } catch { return null; }
}

async function locateByIPApi(): Promise<LocationResult | null> {
  try {
    const res = await fetch('http://ip-api.com/json/?lang=zh-CN');
    const data = await res.json();
    if (data.status === 'success' && data.lat && data.lon) {
      const cityName = data.city || data.regionName || '';
      if (cityName) {
        console.log(`[定位] ip-api.com: ${cityName}`);
        return { latitude: data.lat, longitude: data.lon, cityName, method: 'ip' };
      }
    }
    return null;
  } catch { return null; }
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`,
    );
    const data = await res.json();
    const city = data.city || data.principalSubdivision || '';
    console.log(`[定位] BigDataCloud: ${city}`);
    return city;
  } catch (err) {
    console.log('[定位] BigDataCloud 失败:', err instanceof Error ? err.message : err);
    return '';
  }
}

async function fetchQWeatherByLocation(lat: number, lon: number, cityName: string, apiKey: string): Promise<WeatherData | null> {
  try {
    const location = `${lon.toFixed(2)},${lat.toFixed(2)}`;
    const [nowRes, dailyRes] = await Promise.all([
      fetch(`https://devapi.qweather.com/v7/weather/now?location=${location}&key=${apiKey}&lang=zh`),
      fetch(`https://devapi.qweather.com/v7/weather/3d?location=${location}&key=${apiKey}&lang=zh`),
    ]);
    const nowData = await nowRes.json();
    const dailyData = await dailyRes.json();

    if (nowData.code !== '200') {
      console.log('[天气] 和风天气请求失败, code:', nowData.code);
      return null;
    }

    const now = nowData.now;
    const today = dailyData?.daily?.[0];
    const rawText = now.text || '';
    const condition = QWEATHER_TEXT_MAP[rawText] || '多云';

    return {
      temperature: Math.round(Number(now.temp)),
      tempMax: today ? Math.round(Number(today.tempMax)) : Math.round(Number(now.temp)),
      tempMin: today ? Math.round(Number(today.tempMin)) : Math.round(Number(now.temp)),
      condition,
      isRaining: condition === '雨',
      isSnowing: condition === '雪',
      city: cityName,
      humidity: Math.round(Number(now.humidity)),
      windSpeed: Math.round(Number(now.windSpeed)),
    };
  } catch (err) {
    console.log('[天气] 和风天气异常:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function fetchQWeatherByCity(city: string, apiKey: string): Promise<WeatherData | null> {
  try {
    const lookupRes = await fetch(
      `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(city)}&key=${apiKey}&lang=zh`,
    );
    const lookupData = await lookupRes.json();
    if (lookupData.code !== '200' || !lookupData.location?.length) {
      console.log('[天气] 和风城市查找失败, code:', lookupData.code);
      return null;
    }
    const loc = lookupData.location[0];
    const locationId = loc.id;
    const cityName = loc.name || city;

    const [nowRes, dailyRes] = await Promise.all([
      fetch(`https://devapi.qweather.com/v7/weather/now?location=${locationId}&key=${apiKey}&lang=zh`),
      fetch(`https://devapi.qweather.com/v7/weather/3d?location=${locationId}&key=${apiKey}&lang=zh`),
    ]);
    const nowData = await nowRes.json();
    const dailyData = await dailyRes.json();

    if (nowData.code !== '200') {
      console.log('[天气] 和风天气请求失败, code:', nowData.code);
      return null;
    }

    const now = nowData.now;
    const today = dailyData?.daily?.[0];
    const rawText = now.text || '';
    const condition = QWEATHER_TEXT_MAP[rawText] || '多云';

    return {
      temperature: Math.round(Number(now.temp)),
      tempMax: today ? Math.round(Number(today.tempMax)) : Math.round(Number(now.temp)),
      tempMin: today ? Math.round(Number(today.tempMin)) : Math.round(Number(now.temp)),
      condition,
      isRaining: condition === '雨',
      isSnowing: condition === '雪',
      city: cityName,
      humidity: Math.round(Number(now.humidity)),
      windSpeed: Math.round(Number(now.windSpeed)),
    };
  } catch (err) {
    console.log('[天气] 和风天气城市查询异常:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function fetchOpenMeteoByCoords(lat: number, lon: number, cityName: string): Promise<WeatherData> {
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=1`,
  );
  const weatherData = await weatherRes.json();
  const current = weatherData.current;
  const daily = weatherData.daily;
  const code = (daily?.weather_code?.[0] ?? current.weather_code) as number;
  const condition = WEATHER_CODE_MAP[code] || '多云';
  return {
    temperature: Math.round(current.temperature_2m),
    tempMax: daily ? Math.round(daily.temperature_2m_max[0]) : Math.round(current.temperature_2m),
    tempMin: daily ? Math.round(daily.temperature_2m_min[0]) : Math.round(current.temperature_2m),
    condition,
    isRaining: condition === '雨',
    isSnowing: condition === '雪',
    city: cityName,
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round(daily?.wind_speed_10m_max?.[0] ?? current.wind_speed_10m),
  };
}

async function fetchOpenMeteoByCity(city: string): Promise<WeatherData> {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh`,
  );
  const geoData = await geoRes.json();
  if (!geoData.results?.length) {
    return getDefaultWeather(city);
  }
  const { latitude, longitude } = geoData.results[0];
  return fetchOpenMeteoByCoords(latitude, longitude, city);
}

async function getApiKey(): Promise<string> {
  try {
    return await settingsDB.get('weatherApiKey') || '';
  } catch {
    return '';
  }
}

export async function fetchWeather(city?: string): Promise<WeatherData> {
  try {
    const apiKey = await getApiKey();
    const shouldAutoDetect = !city || city === 'auto' || city === 'Beijing';

    if (shouldAutoDetect) {
      console.log('[定位] 开始自动定位...');

      const browserCoords = await locateByBrowser();
      const ipLocation = await locateByIP();

      let lat: number | undefined;
      let lon: number | undefined;
      let cityName = '';

      if (browserCoords) {
        lat = browserCoords.latitude;
        lon = browserCoords.longitude;
        const geoName = await reverseGeocode(lat, lon);
        if (geoName) cityName = geoName;
      }

      if (!cityName && ipLocation) {
        cityName = ipLocation.cityName;
        if (!lat) {
          lat = ipLocation.latitude;
          lon = ipLocation.longitude;
        }
      }

      if (lat && lon) {
        if (!cityName) cityName = '当前位置';
        console.log(`[定位] 最终: ${cityName} (${lat}, ${lon})`);

        if (apiKey) {
          const qResult = await fetchQWeatherByLocation(lat, lon, cityName, apiKey);
          if (qResult) return qResult;
          console.log('[天气] 和风天气失败，回退到 Open-Meteo');
        }

        return await fetchOpenMeteoByCoords(lat, lon, cityName);
      }

      if (ipLocation) {
        if (apiKey) {
          const qResult = await fetchQWeatherByLocation(ipLocation.latitude, ipLocation.longitude, ipLocation.cityName, apiKey);
          if (qResult) return qResult;
        }
        return await fetchOpenMeteoByCoords(ipLocation.latitude, ipLocation.longitude, ipLocation.cityName);
      }
    }

    if (city && city !== 'auto' && city !== 'Beijing') {
      if (apiKey) {
        const qResult = await fetchQWeatherByCity(city, apiKey);
        if (qResult) return qResult;
        console.log('[天气] 和风天气失败，回退到 Open-Meteo');
      }
      return await fetchOpenMeteoByCity(city);
    }

    return await fetchOpenMeteoByCity('Shanghai');
  } catch {
    return getDefaultWeather('上海');
  }
}

function getDefaultWeather(city: string): WeatherData {
  return {
    temperature: 22,
    tempMax: 26,
    tempMin: 18,
    condition: '多云',
    isRaining: false,
    isSnowing: false,
    city,
    humidity: 50,
    windSpeed: 10,
  };
}

export function getDressingIndex(weather: WeatherData): string {
  const t = weather.tempMax;
  if (t >= 30) return '炎热，建议穿薄款短袖短裤';
  if (t >= 25) return '较热，建议穿短袖薄款';
  if (t >= 20) return '舒适，建议穿薄款长袖或短袖';
  if (t >= 15) return '微凉，建议穿长袖加薄外套';
  if (t >= 10) return '较冷，建议穿厚款加外套';
  if (t >= 5) return '寒冷，建议穿加厚外套';
  return '严寒，建议穿加厚外套和毛衣';
}

export function getSeasonFromMonth(): '春' | '夏' | '秋' | '冬' {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return '春';
  if (month >= 6 && month <= 8) return '夏';
  if (month >= 9 && month <= 11) return '秋';
  return '冬';
}

export function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}
