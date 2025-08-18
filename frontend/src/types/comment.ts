export interface CommentAPIResponse {
  comments: Array<{
    beach_id: string;
    conditions: string;
    content: string;
    id: string;
    likes: number;
    rating: number;
    timestamp: string;
    user_id: string;
    user: {
      email: string;
      id: string;
      name: string;
      picture: string | null;
    };
    pictures: string[];
  }>;
  page: number;
  page_size: number;
}

export interface ReviewAPIResponse {
  number_of_reviews: number;
  number_of_reviews_per_rating: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
  overall_rating: number;
}
