export type ConditionType =
  | "Beach Closed"
  | "Private Property"
  | "Poor Conditions"
  | "Wrong Directions"
  | "No bathrooms"
  | "Crowded"
  | "Hard to park"
  | "Fair Conditions"
  | "Good Conditions"
  | "Great Conditions"
  | "Good Views"
  | "Bad Views"
  | "Great Views"
  | "Easy to park"
  | "Easy to walk"
  | "Hard to walk"
  | "Dog-friendly"
  | "Bathrooms available";

export const POOR_RATING_CONDITIONS: ConditionType[] = [
  "Beach Closed",
  "Private Property",
  "Wrong Directions",
  "No bathrooms",
  "Crowded",
  "Hard to park",
];

export const OKAY_RATING_CONDITIONS: ConditionType[] = [
  "Fair Conditions",
  "Bad Views",
  "Hard to walk",
  "Hard to park",
  "No bathrooms",
];

export const GOOD_RATING_CONDITIONS: ConditionType[] = [
  "Good Conditions",
  "Good Views",
  "Easy to walk",
  "Dog-friendly",
  "Bathrooms available",
];

export const GREAT_RATING_CONDITIONS: ConditionType[] = [
  "Great Conditions",
  "Great Views",
  "Easy to park",
  "Easy to walk",
  "Dog-friendly",
  "Bathrooms available",
];
