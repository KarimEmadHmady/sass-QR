export interface Translation {
  en: string;
  ar: string;
}

export interface Review {
  _id: string;
  name: string;
  comment: string;
  rating: number;
}

export interface Category {
  _id: string;
  name: Translation;
  image: string;
  description?: Translation;
}

export interface Meal {
  name: Translation;
  description: Translation;
  price: string;
  category: string;
  image: string | null;
  reviews: Review[];
}