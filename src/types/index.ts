export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  nom: string;
  ordre: number;
  // Compatibility helpers
  name: string;
  order?: number;
  description?: string;
  iconName?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  nom: string;
  description: string;
  prix: number; // en DA
  photoUrl: string;
  categorieId: string;
  disponible: boolean;
  ordre: number;
  // Compatibility helpers
  name: string;
  price: number;
  image: string;
  categoryId: string;
  isAvailable: boolean;
  order?: number;
  badge?: string;
  comboAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string; // unique item id (productId + combo modifier)
  product: Product;
  quantity: number;
  isCombo: boolean;
  comboDrink?: string;
  notes?: string;
  unitPrice: number;
  subtotal: number;
}

export type OrderStatus =
  | 'Nouvelle'
  | 'En préparation'
  | 'Prête'
  | 'En livraison'
  | 'Livrée'
  | 'Refusée'
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderProductItem {
  nom: string;
  quantite: number;
  prix: number;
  subtotal: number;
  productId?: string;
  isCombo?: boolean;
  comboDrink?: string;
  // Compatibility
  productName?: string;
  quantity?: number;
  price?: number;
}

export interface Order {
  id: string;
  numeroCommande: string; // e.g. #SM-8921
  nomClient: string;
  telephone: string;
  adresse: string;
  commune: string;
  notes?: string;
  items: OrderProductItem[];
  total: number; // total en DA
  deliveryFee?: number;
  subtotal?: number;
  modePaiement: string; // "cash à la livraison"
  statut: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  // Compatibility getters
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  status?: OrderStatus;
}

export interface RestaurantSettings {
  restaurantName: string;
  phone: string;
  address: string;
  deliveryFee: number;
  openingHours: string;
  isOpen: boolean;
  announcement: string;
  minOrderAmount?: number;
}
