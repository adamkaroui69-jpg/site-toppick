"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "../../store/useCartStore";

// ==========================================
// CONFIGURATION SUPABASE
// ==========================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://VOTRE_PROJET.supabase.co";
// Assurez-vous d'utiliser le même nom de bucket que pour vos uploads
const SUPABASE_BUCKET_URL = `${supabaseUrl}/storage/v1/object/public/produits-images`;

export default function CartPage() {
  // ==========================================
  // HYDRATATION (Évite les erreurs de rendu avec Zustand + LocalStorage)
  // ==========================================
  const [mounted, setMounted] = useState(false);
  
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // État de chargement élégant avant la lecture du localStorage
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  // ==========================================
  // ÉTAT 1 : PANIER VIDE
  // ==========================================
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center px-4 max-w-lg mx-auto">
        <div className="bg-slate-50 p-6 rounded-full mb-6 text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Votre panier est vide</h1>
        <p className="text-slate-500 mb-8">
          Vous n'avez pas encore ajouté d'articles. Découvrez nos nouveautés pour trouver l'inspiration.
        </p>
        <Link 
          href="/" 
          className="bg-black text-white font-bold py-3.5 px-8 rounded-xl hover:bg-slate-800 active:scale-95 transition-all"
        >
          Continuer mes achats
        </Link>
      </div>
    );
  }

  // ==========================================
  // ÉTAT 2 : PANIER REMPLI
  // ==========================================
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 md:px-8">
      
      {/* En-tête du panier */}
      <div className="flex items-end justify-between border-b border-gray-200 pb-6 mb-8">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">
          Votre Panier
        </h1>
        <button 
          onClick={clearCart}
          className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors"
        >
          Vider le panier
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* COLONNE GAUCHE : Liste des articles */}
        <div className="flex-1">
          <ul className="divide-y divide-gray-200 border-b border-gray-200">
            {items.map((item) => (
              <li key={item.reference} className="py-6 flex flex-col sm:flex-row gap-6">
                
                {/* Image miniature */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-black/5">
                  <Image
                    src={`${SUPABASE_BUCKET_URL}/${item.reference}.jpg`}
                    alt={item.titre}
                    fill
                    className="object-cover mix-blend-multiply" // mix-blend permet de fondre l'image avec le fond gris si elle n'est pas carrée
                    sizes="(max-width: 640px) 96px, 128px"
                  />
                </div>

                {/* Détails de l'article */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      {/* Titre tronqué */}
                      <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-tight">
                        {item.titre}
                      </h3>
                      {/* Prix */}
                      <p className="text-lg font-black text-slate-900 flex-shrink-0">
                        {item.prix_ttc.toFixed(2)} <span className="text-xs text-slate-500 font-bold uppercase">TND</span>
                      </p>
                    </div>
                    <p className="text-sm text-slate-400 mt-1 font-mono uppercase tracking-widest">Ref: {item.reference}</p>
                  </div>

                  {/* Contrôles (Quantité + Suppression) */}
                  <div className="flex items-center justify-between mt-6 sm:mt-0">
                    
                    {/* Boutons - et + */}
                    <div className="flex items-center bg-slate-50 rounded-full border border-gray-200 p-1">
                      <button 
                        onClick={() => updateQuantity(item.reference, item.quantite - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none"
                        disabled={item.quantite <= 1}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                      
                      <span className="w-10 text-center font-bold text-sm text-slate-900">
                        {item.quantite}
                      </span>
                      
                      <button 
                        onClick={() => updateQuantity(item.reference, item.quantite + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none"
                        disabled={item.quantite >= item.stock_max}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                    </div>

                    {/* Bouton de suppression discret */}
                    <button 
                      onClick={() => removeFromCart(item.reference)}
                      className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5 p-2 rounded-md hover:bg-red-50"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      <span className="hidden sm:inline">Supprimer</span>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* COLONNE DROITE : Résumé de la commande */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          {/* Un sticky position permet au résumé de suivre le scroll si la liste d'articles est très longue */}
          <div className="bg-slate-50 rounded-3xl p-6 lg:p-8 border border-black/5 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Résumé de la commande</h2>
            
            <div className="space-y-4 text-sm text-slate-600 border-b border-gray-200 pb-6 mb-6">
              <div className="flex justify-between">
                <span>Sous-total HT</span>
                <span>{(getTotalPrice() / 1.19).toFixed(2)} TND</span> {/* Estimation simplifiée */}
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span className="text-slate-400 italic">Calculée à l'étape suivante</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline mb-8">
              <span className="text-base font-bold text-slate-900">Total TTC</span>
              <div className="text-right flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">
                  {getTotalPrice().toFixed(2)}
                </span>
                <span className="text-sm font-bold text-slate-500 uppercase">TND</span>
              </div>
            </div>

            <button className="w-full h-14 bg-black text-white font-bold rounded-2xl hover:bg-slate-800 transition-all focus:ring-4 focus:ring-black/10 active:scale-95 flex justify-center items-center gap-2 shadow-lg shadow-black/10">
              <span>Valider la commande</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
            
            {/* Badge de réassurance (Sécurité) */}
            <div className="mt-5 text-center">
              <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Paiement 100% sécurisé (C2P)
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
