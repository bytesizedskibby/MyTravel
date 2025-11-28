import React, { createContext, useContext, useState, ReactNode } from 'react';
import posthog from 'posthog-js';

export type CartItemType = 'flight' | 'hotel' | 'tour';

export interface CartItem {
  id: string;
  type: CartItemType;
  title: string;
  details: string;
  price: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    setItems((prev) => [...prev, newItem]);
    // Track add to cart event in PostHog
    posthog.capture('item_added_to_cart', {
      item_type: item.type,
      item_title: item.title,
      item_price: item.price,
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    // Track purchase completed event in PostHog before clearing
    if (items.length > 0) {
      posthog.capture('cart_cleared', {
        total_items: items.length,
        total_value: total,
        item_types: items.map(i => i.type),
      });
    }
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
