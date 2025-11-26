
export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  unit: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProfile {
  nickname: string;
  avatar: string;
  isGuest?: boolean; // Track if user is guest or registered
  username?: string; // Link to registered account
}

export interface RegisteredUser {
  id: string;
  username: string;
  password: string;
  nickname: string;
  avatar: string;
  joinDate: number;
}

export interface Order {
  id: string;
  user: UserProfile;
  items: CartItem[];
  total: number;
  timestamp: number;
  status: 'completed' | 'pending';
}

export interface RecipeResponse {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

export enum AppView {
  SHOPPER = 'SHOPPER',
  MERCHANT = 'MERCHANT'
}
