export interface RiptideRiskAPIResponse {
  alerts: string[];
  cached: boolean;
  conditions: {
    overall: string;
    recommendation: string;
    score: number;
  };
  last_updated: string;
  nearby_stations: string[];
  risk_level: string;
  surf_forecast: null;
}

export interface RedtideRiskAPIResponse {
  karena_brevis_risk: number;
  abundance: string;
  latitude: number;
  longitude: number;
}
