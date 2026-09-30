"use client";

import { useState } from "react";
import { useCartStore } from "../store/useCartStore";

// Interface du produit limité aux données nécessaires
interface ProduitMin {
  reference: string;
  titre: string;
  prix_ttc: number;
  stock: number;
}

interface AddToCartButtonProps {
  produit: ProduitMin;
}

export default function AddToCartButton({ produit }: AddToCartButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  
  const items = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);

  // Vérification en temps réel du stock déjà présent dans le panier local
  const cartItem = items.find((item) => item.reference === produit.reference);
  const qtyInCart = cartItem ? cartItem.quantite : 0;
  
  // Le produit est en rupture s'il a 0 stock ou si l'utilisateur a déjà ajouté le stock max
  const isOutOfStock = produit.stock <= 0 || qtyInCart >= produit.stock;

  const handleAdd = () => {
    if (isOutOfStock) return;
    
    addToCart({
      reference: produit.reference,
      titre: produit.titre,
      prix_ttc: produit.prix_ttc,
      stock_max: produit.stock,
      quantite: 1
    });

    // Affichage temporaire de la notification
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col gap-4 mt-6 md:mt-8">
      
      {/* Bouton d'ajout */}
      <button
        onClick={handleAdd}
        disabled={isOutOfStock}
        className={`w-full h-14 md:w-80 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-black/10 ${
          isOutOfStock
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-slate-800 active:scale-95 shadow-xl shadow-black/10"
        }`}
      >
        {isOutOfStock ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            <span>Rupture de stock</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span>Ajouter au panier</span>
          </>
        )}
      </button>

      {/* Notification toast locale */}
      <div 
        className={`transition-opacity duration-300 ${
          showSuccess ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <p className="text-sm font-bold text-green-600 flex items-center gap-1.5 bg-green-50 w-fit px-4 py-2 rounded-lg border border-green-200">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Ajouté à votre panier !
        </p>
      </div>
    </div>
  );
}
