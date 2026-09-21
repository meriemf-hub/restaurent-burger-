import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  activeTrackingOrderId: string | null;
  toastMessage: string | null;
  addToCart: (
    product: Product,
    quantity?: number,
    isCombo?: boolean,
    comboDrink?: string,
    notes?: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  trackOrder: (orderId: string) => void;
  closeTracking: () => void;
  showToast: (message: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'smashart_cart_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage quota or incognito
    }
  }, [items]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
    }, 3200);
  };

  const addToCart = (
    product: Product,
    quantity: number = 1,
    isCombo: boolean = false,
    comboDrink?: string,
    notes?: string
  ) => {
    const comboAddon = isCombo ? 300 : 0;
    const unitPrice = product.price + comboAddon;
    const itemId = `${product.id}_${isCombo ? 'combo_' + (comboDrink || 'coca') : 'single'}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          subtotal: updated[existingIndex].unitPrice * newQty,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: itemId,
          product,
          quantity,
          isCombo,
          comboDrink: isCombo ? comboDrink || 'Coca-Cola 24cl' : undefined,
          notes,
          unitPrice,
          subtotal: unitPrice * quantity,
        };
        return [...prev, newItem];
      }
    });

    const label = isCombo ? `${product.name} (Menu Combo)` : product.name;
    showToast(`${label} (${unitPrice} DA) ajouté au panier !`);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              subtotal: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  const trackOrder = (orderId: string) => {
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setActiveTrackingOrderId(orderId);
  };

  const closeTracking = () => setActiveTrackingOrderId(null);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isCartOpen,
        isCheckoutOpen,
        activeTrackingOrderId,
        toastMessage,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        trackOrder,
        closeTracking,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
