export interface ParkingSpotsAPIResponse {
  beach_address: string;
  beach_name: string;
  top_access_points: Array<{
    address: string;
    coordinates: string;
    distance_miles: number;
    parking_fee: number;
    parking_fee_str: string;
    score: number;
    walk_time_min: number;
  }>;
}
