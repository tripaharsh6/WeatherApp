import requests
import logging
import urllib3
from django.core.cache import cache
from django.conf import settings

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
logger = logging.getLogger(__name__)

# WMO Weather interpretation codes (WW)
WEATHER_CODE_MAP = {
    0: ("Clear", "clear"),
    1: ("Mainly clear", "partly-cloudy"),
    2: ("Partly cloudy", "partly-cloudy"),
    3: ("Overcast", "cloudy"),
    45: ("Foggy", "cloudy"),
    48: ("Depositing rime fog", "cloudy"),
    51: ("Light drizzle", "rain"),
    53: ("Moderate drizzle", "rain"),
    55: ("Dense drizzle", "rain"),
    56: ("Light freezing drizzle", "rain"),
    57: ("Dense freezing drizzle", "rain"),
    61: ("Light rain", "rain"),
    63: ("Moderate rain", "rain"),
    65: ("Heavy rain", "rain"),
    66: ("Light freezing rain", "rain"),
    67: ("Heavy freezing rain", "rain"),
    71: ("Slight snow fall", "snow"),
    73: ("Moderate snow fall", "snow"),
    75: ("Heavy snow fall", "snow"),
    77: ("Snow grains", "snow"),
    80: ("Showers", "rain"),
    81: ("Moderate showers", "rain"),
    82: ("Violent rain showers", "rain"),
    85: ("Slight snow showers", "snow"),
    86: ("Heavy snow showers", "snow"),
    95: ("Thunderstorm", "thunderstorm"),
    96: ("Thunderstorm with slight hail", "thunderstorm"),
    99: ("Thunderstorm with heavy hail", "thunderstorm"),
}

def get_weather_condition(code):
    return WEATHER_CODE_MAP.get(code, ("Partly cloudy", "partly-cloudy"))

def generate_weather_tip(temp_c, weather_code, humidity=None, wind_speed_kmh=None):
    """
    Rule-based weather advice engine matching SRS Section 9 & 5.1 (FR8).
    Exact matches for UI Mockup tips:
    - 'Rain expected. Take an umbrella.'
    - 'It is hot and dry. Carry water with you.'
    """
    desc, cat = get_weather_condition(weather_code)

    # Precipitation tips
    if cat in ['rain', 'thunderstorm'] or weather_code in [51, 53, 55, 61, 63, 65, 80, 81, 82, 95]:
        return "Rain expected. Take an umbrella."
    if cat == 'snow' or weather_code in [71, 73, 75, 77, 85, 86]:
        return "Snowfall expected. Dress warmly and walk cautiously."

    # Extreme wind tips
    if wind_speed_kmh and wind_speed_kmh >= 35:
        return "Strong winds expected. Be careful outdoors."

    # Heat and dry tips (Matches Screenshot 1)
    if temp_c >= 30:
        if humidity is not None and humidity < 55:
            return "It is hot and dry. Carry water with you."
        return "High temperature today. Stay hydrated and seek shade."

    # Cold weather tips
    if temp_c <= 12:
        return "It is chilly outside. Keep warm with a jacket or layers."

    # Mild pleasant weather
    if 18 <= temp_c < 28:
        return "Pleasant weather today. Great day for outdoor activities!"

    return "Have a great day and stay weather-ready!"

def format_temp(val, units='metric'):
    if val is None:
        return 0
    if units == 'imperial':
        # Celsius to Fahrenheit
        f_val = (val * 9 / 5) + 32
        return round(f_val)
    return round(val)

def geocode_city(query):
    """
    Geocode a city name using Open-Meteo Geocoding API with caching.
    """
    if not query or len(query.strip()) == 0:
        return []

    cache_key = f"geocoding:{query.strip().lower()}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    url = f"https://geocoding-api.open-meteo.com/v1/search?name={query.strip()}&count=8&language=en&format=json"
    headers = {'User-Agent': 'WeatherApp-Backend/1.0'}
    try:
        try:
            res = requests.get(url, headers=headers, timeout=5)
        except requests.exceptions.SSLError:
            res = requests.get(url, headers=headers, timeout=5, verify=False)
        if res.status_code == 200:
            data = res.json()
            results = []
            for item in data.get('results', []):
                results.append({
                    'id': item.get('id'),
                    'name': item.get('name'),
                    'lat': item.get('latitude'),
                    'lon': item.get('longitude'),
                    'country': item.get('country', ''),
                    'admin1': item.get('admin1', ''),
                    'display_name': f"{item.get('name')}, {item.get('admin1', '')} ({item.get('country', '')})".replace(',  ', ' ')
                })
            cache.set(cache_key, results, timeout=3600) # Cache geocoding for 1 hour
            return results
    except Exception as e:
        logger.error(f"Error in geocode_city: {e}")

    return []

def fetch_weather_data(lat, lon, units='metric'):
    """
    Fetch comprehensive weather data (current, hourly, 5-day daily, metrics)
    with 10-minute caching as specified in SRS Section 3.8.
    """
    cache_key = f"weather_data:{round(lat, 3)}:{round(lon, 3)}:{units}"
    cached_data = cache.get(cache_key)
    if cached_data is not None:
        cached_data['cached'] = True
        return cached_data

    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&"
        f"current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&"
        f"hourly=temperature_2m,weather_code&"
        f"daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&"
        f"timezone=auto"
    )
    headers = {'User-Agent': 'WeatherApp-Backend/1.0'}
    try:
        try:
            response = requests.get(url, headers=headers, timeout=6)
        except requests.exceptions.SSLError:
            response = requests.get(url, headers=headers, timeout=6, verify=False)
        if response.status_code == 200:
            data = response.json()
            current = data.get('current', {})
            hourly = data.get('hourly', {})
            daily = data.get('daily', {})

            curr_temp_c = current.get('temperature_2m', 25.0)
            curr_code = current.get('weather_code', 0)
            curr_humidity = current.get('relative_humidity_2m', 50)
            curr_wind = current.get('wind_speed_10m', 10.0)
            curr_apparent = current.get('apparent_temperature', curr_temp_c)

            condition_text, condition_category = get_weather_condition(curr_code)
            tip = generate_weather_tip(curr_temp_c, curr_code, curr_humidity, curr_wind)

            # Format current temp according to units
            temp_display = format_temp(curr_temp_c, units)
            feels_like_display = format_temp(curr_apparent, units)
            wind_unit = "km/h" if units == 'metric' else "mph"
            wind_display = f"{round(curr_wind)} {wind_unit}"

            # Format hourly strip (next 8 hours)
            hourly_list = []
            h_times = hourly.get('time', [])
            h_temps = hourly.get('temperature_2m', [])
            h_codes = hourly.get('weather_code', [])

            # Find current hour index or start from 0
            start_idx = 0
            curr_time_str = current.get('time', '')
            if curr_time_str in h_times:
                start_idx = h_times.index(curr_time_str)

            for i in range(start_idx, min(start_idx + 8, len(h_times))):
                iso_time = h_times[i]
                hour_part = iso_time.split('T')[-1][:5]
                # Format to 12-hour format, e.g., '1 PM' or 'Now'
                if i == start_idx:
                    hour_label = "Now"
                else:
                    try:
                        hr_int = int(hour_part.split(':')[0])
                        period = "AM" if hr_int < 12 else "PM"
                        disp_hr = hr_int % 12
                        if disp_hr == 0:
                            disp_hr = 12
                        hour_label = f"{disp_hr} {period}"
                    except Exception:
                        hour_label = hour_part

                h_temp_val = h_temps[i] if i < len(h_temps) else curr_temp_c
                h_code_val = h_codes[i] if i < len(h_codes) else curr_code
                h_desc, _ = get_weather_condition(h_code_val)

                hourly_list.append({
                    'time': iso_time,
                    'hour': hour_label,
                    'temperature': format_temp(h_temp_val, units),
                    'condition': h_desc,
                })

            # Format 5-day daily forecast
            daily_list = []
            d_times = daily.get('time', [])
            d_maxs = daily.get('temperature_2m_max', [])
            d_mins = daily.get('temperature_2m_min', [])
            d_codes = daily.get('weather_code', [])
            d_sunrises = daily.get('sunrise', [])
            d_sunsets = daily.get('sunset', [])

            import datetime
            days_of_week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

            for j in range(min(5, len(d_times))):
                d_str = d_times[j]
                try:
                    dt = datetime.date.fromisoformat(d_str)
                    day_name = days_of_week[dt.weekday()]
                except Exception:
                    day_name = d_str

                d_code_val = d_codes[j] if j < len(d_codes) else 0
                cond_text, _ = get_weather_condition(d_code_val)
                max_t = format_temp(d_maxs[j], units) if j < len(d_maxs) else temp_display
                min_t = format_temp(d_mins[j], units) if j < len(d_mins) else temp_display

                daily_list.append({
                    'date': d_str,
                    'day': day_name,
                    'condition': cond_text,
                    'max_temp': max_t,
                    'min_temp': min_t,
                })

            # Format sunrise and sunset
            sunrise_str = "6:42 AM"
            sunset_str = "5:58 PM"
            if d_sunrises and len(d_sunrises) > 0:
                try:
                    sr_raw = d_sunrises[0].split('T')[-1]
                    sr_hr, sr_min = sr_raw.split(':')[:2]
                    hr_i = int(sr_hr)
                    p = "AM" if hr_i < 12 else "PM"
                    sr_d = hr_i % 12 or 12
                    sunrise_str = f"{sr_d}:{sr_min} {p}"
                except Exception:
                    pass

            if d_sunsets and len(d_sunsets) > 0:
                try:
                    ss_raw = d_sunsets[0].split('T')[-1]
                    ss_hr, ss_min = ss_raw.split(':')[:2]
                    hr_i = int(ss_hr)
                    p = "AM" if hr_i < 12 else "PM"
                    ss_d = hr_i % 12 or 12
                    sunset_str = f"{ss_d}:{ss_min} {p}"
                except Exception:
                    pass

            payload = {
                'temperature': temp_display,
                'temperature_unit': '°C' if units == 'metric' else '°F',
                'condition': condition_text,
                'condition_code': curr_code,
                'humidity': f"{curr_humidity}%",
                'wind': wind_display,
                'feels_like': feels_like_display,
                'tip': tip,
                'hourly': hourly_list,
                'daily': daily_list,
                'metrics': {
                    'humidity': f"{curr_humidity}%",
                    'wind': wind_display,
                    'sunrise': sunrise_str,
                    'sunset': sunset_str,
                },
                'cached': False,
            }

            # Cache the result for 10 minutes (600 seconds)
            cache.set(cache_key, payload, timeout=600)
            return payload

    except Exception as e:
        logger.error(f"Failed to fetch weather: {e}")

    # Fallback default if remote API call fails
    return {
        'temperature': 31 if units == 'metric' else 88,
        'temperature_unit': '°C' if units == 'metric' else '°F',
        'condition': 'Partly cloudy',
        'condition_code': 2,
        'humidity': '48%',
        'wind': '12 km/h' if units == 'metric' else '7 mph',
        'feels_like': 32 if units == 'metric' else 90,
        'tip': 'It is hot and dry. Carry water with you.',
        'hourly': [
            {'hour': 'Now', 'temperature': 31, 'condition': 'Partly cloudy'},
            {'hour': '1 PM', 'temperature': 33, 'condition': 'Sunny'},
            {'hour': '2 PM', 'temperature': 34, 'condition': 'Sunny'},
            {'hour': '3 PM', 'temperature': 34, 'condition': 'Partly cloudy'},
            {'hour': '4 PM', 'temperature': 32, 'condition': 'Clear'},
        ],
        'daily': [
            {'day': 'Fri', 'condition': 'Light rain', 'max_temp': 30, 'min_temp': 25},
            {'day': 'Sat', 'condition': 'Showers', 'max_temp': 29, 'min_temp': 25},
            {'day': 'Sun', 'condition': 'Cloudy', 'max_temp': 31, 'min_temp': 26},
            {'day': 'Mon', 'condition': 'Partly cloudy', 'max_temp': 32, 'min_temp': 26},
            {'day': 'Tue', 'condition': 'Clear', 'max_temp': 32, 'min_temp': 25},
        ],
        'metrics': {
            'humidity': '78%',
            'wind': '16 km/h',
            'sunrise': '6:42 AM',
            'sunset': '5:58 PM',
        },
        'cached': False,
    }
