import os
import requests
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import math
from bs4 import BeautifulSoup
import re

class NOAAMarineData:
    """
    Python class for fetching marine data and assessing rip current risks using NOAA APIs
    """
    
    def __init__(self):
        self.base_url = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"
        self.weather_url = "https://api.weather.gov"
        self.session = requests.Session()
        # Set user agent as required by NWS API
        self.session.headers.update({
            'User-Agent': '(YourAppName, your-email@example.com)'  # Replace with your info
        })
        
        # In-memory cache
        ttl_min = int(os.getenv("RIPCACHE_TTL_MIN", "10"))
        self._ttl = timedelta(minutes=ttl_min)
        self._cache = {}  # key -> {'data': <dict>, 'ts': datetime}
        
    # Cache Helpers
    def _key(self, lat: float, lon: float) -> str:
        return f"{lat:.4f},{lon:.4f}"

    def _get_cached(self, lat: float, lon: float):
        key = self._key(lat, lon)
        entry = self._cache.get(key)
        if not entry:
            return None
        if datetime.utcnow() - entry['ts'] > self._ttl:
            # expired
            self._cache.pop(key, None)
            return None
        print(f"[CACHE HIT] {self._key(lat, lon)}")
        return entry['data']

    def _set_cached(self, lat: float, lon: float, data: dict):
        key = self._key(lat, lon)
        self._cache[key] = {'data': data, 'ts': datetime.utcnow()}
        print(f"[CACHE SET] {self._key(lat, lon)}")

    def invalidate(self, lat: float, lon: float):
        self._cache.pop(self._key(lat, lon), None)
    
    def get_tide_data(self, station_id: str, start_date: str, end_date: str) -> Optional[Dict]:
        """Get water levels and tide data from NOAA station"""
        params = {
            'product': 'water_level',
            'application': 'YourAppName',  # Replace with your app name
            'begin_date': start_date,  # Format: YYYYMMDD
            'end_date': end_date,
            'datum': 'MLLW',
            'station': station_id,
            'time_zone': 'lst_ldt',
            'units': 'english',
            'format': 'json'
        }
        
        try:
            response = self.session.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error fetching tide data: {e}")
            return None
    
    def get_wind_data(self, station_id: str, start_date: str, end_date: str) -> Optional[Dict]:
        """Get wind data from NOAA station"""
        params = {
            'product': 'wind',
            'application': 'YourAppName',
            'begin_date': start_date,
            'end_date': end_date,
            'station': station_id,
            'time_zone': 'lst_ldt',
            'units': 'english',
            'format': 'json'
        }
        
        try:
            response = self.session.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error fetching wind data: {e}")
            return None
    
    def get_wave_data(self, station_id: str, start_date: str, end_date: str) -> Optional[Dict]:
        """Get wave height data from NOAA station"""
        params = {
            'product': 'wave_height',
            'application': 'YourAppName',
            'begin_date': start_date,
            'end_date': end_date,
            'station': station_id,
            'time_zone': 'lst_ldt',
            'units': 'english',
            'format': 'json'
        }
        
        try:
            response = self.session.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error fetching wave data: {e}")
            return None
    
    def get_rip_current_alerts(self, lat: float, lon: float) -> List[Dict]:
        """Get active weather alerts including rip current warnings"""
        try:
            url = f"{self.weather_url}/alerts/active"
            params = {'point': f"{lat},{lon}"}
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            alert_data = response.json()
            
            # Filter for rip current related alerts
            rip_current_alerts = []
            for alert in alert_data.get('features', []):
                properties = alert.get('properties', {})
                event = properties.get('event', '').lower()
                description = properties.get('description', '').lower()
                
                if any(keyword in event or keyword in description for keyword in 
                       ['rip current', 'beach hazard', 'surf', 'marine']):
                    rip_current_alerts.append(alert)
            
            return rip_current_alerts
            
        except requests.RequestException as e:
            print(f"Error fetching rip current alerts: {e}")
            return []
    
    def get_surf_conditions(self, lat: float, lon: float) -> Optional[Dict]:
        """Get surf conditions and marine forecasts from NWS"""
        try:
            # Get point data first
            point_url = f"{self.weather_url}/points/{lat},{lon}"
            response = self.session.get(point_url, timeout=30)
            response.raise_for_status()
            point_data = response.json()
            
            # Get marine zone forecast
            properties = point_data.get('properties', {})
            forecast_zone = properties.get('forecastZone')
            
            if forecast_zone:
                zone_url = f"{self.weather_url}/zones/forecast/{forecast_zone}/forecast"
                zone_response = self.session.get(zone_url, timeout=30)
                zone_response.raise_for_status()
                return zone_response.json()
            
            return None
            
        except requests.RequestException as e:
            print(f"Error fetching surf conditions: {e}")
            return None
    
    def find_nearby_stations(self, lat: float, lon: float, radius: int = 50) -> List[Dict]:
        """Find NOAA stations within specified radius (miles)"""
        try:
            params = {
                'product': 'stations',
                'application': 'YourAppName',
                'format': 'json'
            }
            
            response = self.session.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            nearby_stations = []
            stations = data.get('stations', [])
            
            for station in stations:
                try:
                    station_lat = float(station.get('lat', 0))
                    station_lon = float(station.get('lng', 0))
                    distance = self.calculate_distance(lat, lon, station_lat, station_lon)
                    
                    if distance <= radius:
                        station['distance'] = distance
                        nearby_stations.append(station)
                except (ValueError, TypeError):
                    continue
            
            # Sort by distance
            nearby_stations.sort(key=lambda x: x.get('distance', float('inf')))
            return nearby_stations
            
        except requests.RequestException as e:
            print(f"Error finding nearby stations: {e}")
            return []
    
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two coordinates in miles"""
        R = 3959  # Earth's radius in miles
        
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = (math.sin(dlat/2)**2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    def get_nearby_station_data(self, stations: List[Dict], start_date: str, end_date: str) -> Dict:
        """Get data from multiple nearby stations"""
        station_data = {}
        
        # Get data from up to 3 closest stations
        for station in stations[:3]:
            station_id = station.get('id')
            if not station_id:
                continue
            
            try:
                tide_data = self.get_tide_data(station_id, start_date, end_date)
                wind_data = self.get_wind_data(station_id, start_date, end_date)
                wave_data = self.get_wave_data(station_id, start_date, end_date)
                
                station_data[station_id] = {
                    'station': station,
                    'tides': tide_data,
                    'wind': wind_data,
                    'waves': wave_data
                }
                
            except Exception as e:
                print(f"Error getting data for station {station_id}: {e}")
                continue
        
        return station_data
    
    def calculate_rip_current_risk(self, data: Dict) -> Dict:
        """Calculate rip current risk based on conditions"""
        risk_score = 0
        factors = {}
        
        # Check for active rip current alerts (highest priority)
        alerts = data.get('alerts', [])
        if alerts:
            active_rip_alerts = [alert for alert in alerts 
                               if 'rip current' in alert.get('properties', {}).get('event', '').lower()]
            
            if active_rip_alerts:
                risk_score += 5
                headline = active_rip_alerts[0].get('properties', {}).get('headline', 'Rip Current Warning')
                factors['alerts'] = f"ACTIVE RIP CURRENT WARNING - {headline}"
            else:
                risk_score += 2
                factors['alerts'] = 'Beach hazard or surf advisory active'
        
        # Analyze wave conditions from station data
        max_wave_height = 0
        avg_wave_height = 0
        wave_count = 0
        
        station_data = data.get('station_data', {})
        for station_id, station_info in station_data.items():
            wave_data = station_info.get('waves')
            if wave_data and wave_data.get('data'):
                for wave in wave_data['data']:
                    try:
                        height = float(wave.get('v', 0))
                        max_wave_height = max(max_wave_height, height)
                        avg_wave_height += height
                        wave_count += 1
                    except (ValueError, TypeError):
                        continue
        
        if wave_count > 0:
            avg_wave_height /= wave_count
            
            # Wave height risk assessment
            if max_wave_height > 8 or avg_wave_height > 5:
                risk_score += 4
                factors['waves'] = f"HIGH RISK - Large waves (max: {max_wave_height:.1f}ft, avg: {avg_wave_height:.1f}ft)"
            elif max_wave_height > 5 or avg_wave_height > 3:
                risk_score += 3
                factors['waves'] = f"ELEVATED - Moderate to large waves (max: {max_wave_height:.1f}ft, avg: {avg_wave_height:.1f}ft)"
            elif max_wave_height > 3 or avg_wave_height > 2:
                risk_score += 2
                factors['waves'] = f"MODERATE - Some wave activity (max: {max_wave_height:.1f}ft, avg: {avg_wave_height:.1f}ft)"
            else:
                risk_score += 1
                factors['waves'] = f"LOW - Small waves (max: {max_wave_height:.1f}ft, avg: {avg_wave_height:.1f}ft)"
        
        # Wind analysis
        max_wind_speed = 0
        for station_id, station_info in station_data.items():
            wind_data = station_info.get('wind')
            if wind_data and wind_data.get('data'):
                for wind in wind_data['data']:
                    try:
                        speed = float(wind.get('s', 0))
                        max_wind_speed = max(max_wind_speed, speed)
                    except (ValueError, TypeError):
                        continue
        
        if max_wind_speed > 0:
            if max_wind_speed > 25:
                risk_score += 3
                factors['wind'] = f"HIGH - Strong winds ({max_wind_speed:.1f} mph) likely creating dangerous surf"
            elif max_wind_speed > 15:
                risk_score += 2
                factors['wind'] = f"MODERATE - Moderate winds ({max_wind_speed:.1f} mph) may affect surf conditions"
            else:
                risk_score += 1
                factors['wind'] = f"LOW - Light winds ({max_wind_speed:.1f} mph)"
        
        # Tide analysis (rip currents often strongest during outgoing/low tide)
        for station_id, station_info in station_data.items():
            tide_data = station_info.get('tides')
            if tide_data and tide_data.get('data') and len(tide_data['data']) >= 2:
                try:
                    recent_tides = tide_data['data'][-6:]  # Last 6 readings
                    if len(recent_tides) >= 2:
                        current = float(recent_tides[-1].get('v', 0))
                        previous = float(recent_tides[-2].get('v', 0))
                        
                        if current < previous:
                            risk_score += 1
                            factors['tide'] = 'OUTGOING TIDE - Increased rip current risk during outgoing tide'
                        else:
                            factors['tide'] = 'INCOMING TIDE - Lower rip current risk'
                        break  # Only need one station for tide info
                except (ValueError, TypeError, IndexError):
                    continue
        
        # Overall risk assessment
        if risk_score >= 8:
            overall = 'EXTREME'
            recommendation = 'Stay out of the water. Dangerous rip currents likely.'
        elif risk_score >= 6:
            overall = 'HIGH'
            recommendation = 'High risk of rip currents. Swim near lifeguards only.'
        elif risk_score >= 4:
            overall = 'MODERATE'
            recommendation = 'Moderate rip current risk. Use caution and swim near lifeguards.'
        elif risk_score >= 2:
            overall = 'LOW-MODERATE'
            recommendation = 'Some risk present. Be aware of changing conditions.'
        else:
            overall = 'LOW'
            recommendation = 'Low rip current risk, but always use caution in the ocean.'
        
        return {
            'overall': overall,
            'score': risk_score,
            'recommendation': recommendation,
            **factors
        }
    
    def get_rip_current_risk(self, lat: float, lon: float, force_refresh: bool = False) -> Dict:
        result = None
        try:
            if not force_refresh:
                cached = self._get_cached(lat, lon)
                if cached is not None:
                    # return a COPY so you don’t mutate cached object
                    out = dict(cached)
                    out['cached'] = True
                    return out

            # ... SLOW path ...
            stations = self.find_nearby_stations(lat, lon)
            today = datetime.now()
            start_date = today.strftime('%Y%m%d')
            end_date = (today + timedelta(days=1)).strftime('%Y%m%d')

            alerts = self.get_rip_current_alerts(lat, lon)
            surf_conditions = self.get_surf_conditions(lat, lon)
            nearby_station_data = self.get_nearby_station_data(stations, start_date, end_date)

            risk_factors = self.calculate_rip_current_risk({
                'alerts': alerts,
                'surf_conditions': surf_conditions,
                'station_data': nearby_station_data,
                'stations': stations
            })

            result = {
                'risk_level': risk_factors.get('overall', 'LOW'),
                'alerts': alerts or [],
                'conditions': risk_factors,
                'surf_forecast': surf_conditions,
                'nearby_stations': stations[:3],
                'last_updated': datetime.now().isoformat()
            }

            self._set_cached(lat, lon, result)
            # return a COPY with flag
            return {**result, 'cached': False}

        except Exception as e:
            # IMPORTANT: don’t reference 'result' here
            raise


def check_rip_current_alerts(lat: float, lon: float):
    noaa = NOAAMarineData()
    
    try:
        alerts = noaa.get_rip_current_alerts(lat, lon)
        return alerts
        
    except Exception as e:
        print(f'Error checking alerts: {e}')
        return []

# Popular NOAA station IDs for reference:
POPULAR_STATIONS = {
    'miami': '8723214',      # Virginia Key, FL
    'virginia_beach': '8638610',  # Sewells Point, VA
    'ocean_city': '8570283', # Ocean City Inlet, MD
    'outer_banks': '8652587', # Oregon Inlet Marina, NC
    'myrtle_beach': '8661070',    # Springmaid Pier, SC
    'san_francisco': '9414290',   # San Francisco, CA
    'los_angeles': '9410840',     # San Pedro, CA
}

def get_rip_info(lat, lon):
    noaa = NOAAMarineData()
    
    try:
        assessment = noaa.get_rip_current_risk(lat, lon)
        if not assessment:
            return {
                "latitude": lat,
                "longitude": lon,
                "risk_level": "unknown",
                "recommendation": "No data available",
                "alerts": [],
                "conditions": {},
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        
        result = {
            "latitude": lat,
            "longitude": lon,
            "risk_level": assessment.get('risk_level', 'unknown'),
            "recommendation": assessment.get('conditions', {}).get('recommendation', 'No recommendation'),
            "alerts": [],
            "conditions": {},
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        for alert in assessment.get('alerts', []):
            headline = alert.get('properties', {}).get('headline', 'Alert')
            result["alerts"].append(headline)
        
        conditions = assessment.get('conditions', {})
        for key, value in conditions.items():
            if key not in ['overall', 'score', 'recommendation']:
                result["conditions"][key] = value
        
        return result
    
    except Exception as e:
        print(f"Error in get_rip_info: {e}")
        return {
            "latitude": lat,
            "longitude": lon,
            "risk_level": "error",
            "recommendation": f"Error fetching data: {e}",
            "alerts": [],
            "conditions": {},
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
