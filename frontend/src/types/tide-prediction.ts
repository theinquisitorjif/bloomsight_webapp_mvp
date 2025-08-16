export interface TidePredictionAPIResponse {
  beach_name: string;
  high_tide: {
    height: number; // In feet
    time: string; // ISO String
  };
  low_tide: {
    height: number; // In feet
    time: string; // ISO String
  };
  station_id: string;
  station_name: string;
  tides: Array<{
    height: number; // In feet
    time: string; // ISO String
  }>;
}
