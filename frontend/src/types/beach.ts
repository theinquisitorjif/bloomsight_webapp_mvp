export interface BeachPicturesAPIResponse {
  beach_id: string;
  comment_id: number;
  id: number;
  image_url: string;
  timestamp: string;
  user_id: string;
}

export interface BeachAPIResponse {
  created_at: string;
  description: string;
  id: number;
  location: string; // Lat-lon separated by comma
  mapbox_id: string;
  name: string;
  preview_picture: string | null;
}
