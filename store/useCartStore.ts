import { create } from "zustand";
import { persist } from "zustand/middleware";

// ==========================================
// 1. TYPES ET INTERFACES
// ==========================================
export interface CartItem {
  reference: string;
  titre: string;
  prix_ttc: number;
  quantite: number;
  stock_max: number;
}

interface CartState {
  items: CartItem[];
  
  // Actions
  addToCart: (item: Omit<CartItem, 'quantite'> & { quantite?: number }) => void;
  removeFromCart: (reference: string) => void;
  updateQuantity: (reference: string, quantite: number) => void;
  clearCart: () => void;
  
  // Sélecteurs (fonctions utilitaires pour obtenir des valeurs calculées)
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// ==========================================
// 2. CRÉATION DU STORE (AVEC PERSISTANCE)
// ==========================================
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // État initial vide
      items: [],

      // --- ACTIONS ---

      addToCart: (newItem) => {
        const { items } = get();
        const existingItem = items.find((item) => item.reference === newItem.reference);
        const qtyToAdd = newItem.quantite || 1; // Si non précisé, on ajoute 1 par défaut

        if (existingItem) {
          // L'article est déjà dans le panier, on incrémente la quantité
          const projectedQuantity = existingItem.quantite + qtyToAdd;
          
          // Vérification stricte : bloquer si on dépasse le stock max
          const finalQuantity = Math.min(projectedQuantity, existingItem.stock_max);
          
          set({
            items: items.map((item) =>
              item.reference === newItem.reference
                ? { ...item, quantite: finalQuantity }
                : item
            ),
          });
        } else {
          // Nouvel article dans le panier
          const initialQuantity = Math.min(qtyToAdd, newItem.stock_max);
          
          // On ne l'ajoute que si la quantité résultante est > 0 (si le stock_max est > 0)
          if (initialQuantity > 0) {
            set({ 
              items: [...items, { ...newItem, quantite: initialQuantity }] 
            });
          }
        }
      },

      removeFromCart: (reference) => {
        set((state) => ({
          items: state.items.filter((item) => item.reference !== reference),
        }));
      },

      updateQuantity: (reference, quantite) => {
        const { items } = get();
        const existingItem = items.find((item) => item.reference === reference);
        
        if (existingItem) {
          // On sécurise la quantité : minimum 1, maximum stock_max
          let validQuantity = Math.max(1, quantite); 
          validQuantity = Math.min(validQuantity, existingItem.stock_max); 

          set({
            items: items.map((item) =>
              item.reference === reference
                ? { ...item, quantite: validQuantity }
                : item
            ),
          });
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      // --- SÉLECTEURS ---

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantite, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.prix_ttc * item.quantite), 0);
      },
    }),
    {
      // Configuration du middleware "persist"
      name: "top-pick-cart", // Le nom de la clé qui sera utilisée dans le localStorage
      // getStorage: () => localStorage, // (Optionnel, localStorage est utilisé par défaut)
    }
  )
);
