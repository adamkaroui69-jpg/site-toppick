"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useCartStore } from "../../store/useCartStore";
import { createClient } from "@supabase/supabase-js";

// ==========================================
// CONFIGURATION SUPABASE
// ==========================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://VOTRE_PROJET.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "VOTRE_CLE_ANON";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function CheckoutPage() {
  // ==========================================
  // ÉTATS LOCAUX
  // ==========================================
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Champs du formulaire
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");

  // Variables du store global Zustand
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Spinner de chargement le temps que le localStorage soit lu
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  // ==========================================
  // SÉCURITÉ : PANIER VIDE
  // ==========================================
  // Si le panier est vide et qu'on n'a pas encore passé de commande, on affiche une erreur
  if (items.length === 0 && !isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4 max-w-lg mx-auto">
        <div className="bg-slate-50 p-6 rounded-full mb-6 text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Oups ! Votre panier est vide.</h1>
        <p className="text-slate-500 mb-8">
          Vous ne pouvez pas accéder à la validation de commande sans articles.
        </p>
        <Link href="/" className="bg-black text-white font-bold py-3.5 px-8 rounded-xl hover:bg-slate-800 transition-all">
          Retourner à la boutique
        </Link>
      </div>
    );
  }

  // ==========================================
  // SOUMISSION DU FORMULAIRE
  // ==========================================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nom || !telephone || !adresse) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Insertion de la commande globale
      const { data: commande, error: commandeError } = await supabase
        .from('commandes')
        .insert({
          nom_client: nom.trim(),
          telephone: telephone.trim(),
          adresse: adresse.trim(),
          total_ttc: getTotalPrice() + 7.00 // Frais fixes de livraison
        })
        .select()
        .single(); // Récupère immédiatement l'ID généré

      if (commandeError) throw commandeError;

      // 2. Préparation du tableau (Bulk) pour les articles
      const lignes = items.map(item => ({
        commande_id: commande.id,
        produit_reference: item.reference,
        titre_produit: item.titre,
        quantite: item.quantite,
        prix_unitaire_ttc: item.prix_ttc
      }));

      // 3. Insertion en une seule requête de toutes les lignes
      const { error: lignesError } = await supabase
        .from('lignes_commande')
        .insert(lignes);

      if (lignesError) throw lignesError;

      // 4. Succès de la transaction
      setIsSuccess(true);
      clearCart(); // On vide le panier côté client

    } catch (err: any) {
      console.error("Erreur de sauvegarde:", err);
      setErrorMsg("Une erreur réseau est survenue lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // ÉCRAN DE SUCCÈS (APRÈS SOUMISSION)
  // ==========================================
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center px-4 max-w-lg mx-auto animate-in fade-in zoom-in duration-500">
        {/* Icône de validation verte */}
        <div className="bg-green-50 p-6 rounded-full mb-8 text-green-500 ring-8 ring-green-50/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Merci pour votre commande !</h1>
        
        <p className="text-slate-500 mb-10 leading-relaxed text-lg max-w-md">
          Votre commande a été enregistrée avec succès. Vous recevrez très bientôt un appel de notre équipe au <strong className="text-slate-900">{telephone}</strong> pour planifier la livraison.
        </p>
        
        <Link href="/" className="bg-black text-white font-bold py-4 px-10 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-black/10">
          Retourner à la boutique
        </Link>
      </div>
    );
  }

  // ==========================================
  // FORMULAIRE DE CHECKOUT STANDARD
  // ==========================================
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const fraisLivraison = 7.00; // Constante fixe pour l'exemple

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-12 px-4 md:px-8">
      
      {/* En-tête de la page */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
          Validation de la commande
        </h1>
        <p className="text-slate-500 mt-2">Veuillez renseigner vos coordonnées pour la livraison.</p>
      </div>

      <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-20">
        
        {/* ==========================================
            COLONNE GAUCHE : FORMULAIRE
            ========================================== */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-gray-200 pb-3">Informations de livraison</h2>
              
              {/* Message d'erreur potentiel */}
              {errorMsg && (
                <div className="bg-red-50 text-red-600 font-medium text-sm p-4 rounded-xl border border-red-200 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{errorMsg}</span>
                </div>
              )}
              
              {/* Champ Nom */}
              <div>
                <label htmlFor="nom" className="block text-sm font-bold text-slate-700 mb-2">Nom complet *</label>
                <input
                  id="nom"
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Foulen Ben Foulen"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:border-black focus:bg-white focus:ring-1 focus:ring-black transition-colors disabled:opacity-50"
                />
              </div>

              {/* Champ Téléphone */}
              <div>
                <label htmlFor="telephone" className="block text-sm font-bold text-slate-700 mb-2">Numéro de téléphone *</label>
                <input
                  id="telephone"
                  type="tel"
                  required
                  disabled={isSubmitting}
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Ex: 98 123 456"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:border-black focus:bg-white focus:ring-1 focus:ring-black transition-colors disabled:opacity-50"
                />
              </div>

              {/* Champ Adresse */}
              <div>
                <label htmlFor="adresse" className="block text-sm font-bold text-slate-700 mb-2">Adresse de livraison détaillée *</label>
                <textarea
                  id="adresse"
                  required
                  rows={3}
                  disabled={isSubmitting}
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Ex: 12 Rue de la République, Tunis..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:border-black focus:bg-white focus:ring-1 focus:ring-black transition-colors disabled:opacity-50 resize-none"
                />
              </div>
            </div>

            {/* Bouton de Soumission (Formulaire) */}
            <button 
              type="submit"
              disabled={isSubmitting || !nom || !telephone || !adresse}
              className="w-full h-16 mt-8 bg-black text-white font-bold rounded-2xl hover:bg-slate-800 transition-all focus:ring-4 focus:ring-black/10 active:scale-95 flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span className="text-lg">Traitement en cours...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  <span className="text-lg sm:text-base">Confirmer la commande (Paiement à la livraison)</span>
                </>
              )}
            </button>
            
          </form>
        </div>

        {/* ==========================================
            COLONNE DROITE : RÉSUMÉ
            ========================================== */}
        <div className="w-full lg:w-[420px] flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-200 lg:sticky lg:top-24 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Résumé de votre panier</h2>
            
            {/* Liste très simplifiée des articles */}
            <div className="max-h-48 overflow-y-auto mb-6 pr-2 space-y-4">
              {items.map(item => (
                <div key={item.reference} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 truncate mr-4">
                    <span className="font-bold text-black mr-2">{item.quantite}x</span> 
                    {item.titre}
                  </span>
                  <span className="font-medium text-slate-900 flex-shrink-0">
                    {(item.prix_ttc * item.quantite).toFixed(2)} TND
                  </span>
                </div>
              ))}
            </div>

            {/* Sous-Totaux */}
            <div className="space-y-4 text-sm text-slate-600 border-t border-gray-200 pt-6 mb-6">
              <div className="flex justify-between">
                <span>Sous-total ({totalItems} articles)</span>
                <span className="font-medium text-slate-900">{totalPrice.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de livraison</span>
                <span className="font-medium text-slate-900">{fraisLivraison.toFixed(2)} TND</span>
              </div>
            </div>

            {/* Total TTC final */}
            <div className="flex justify-between items-baseline pt-4 border-t border-gray-200">
              <span className="text-base font-bold text-slate-900">Total à payer</span>
              <div className="text-right flex items-baseline gap-1">
                <span className="text-3xl font-black text-black tracking-tighter">
                  {(totalPrice + fraisLivraison).toFixed(2)}
                </span>
                <span className="text-sm font-bold text-slate-500 uppercase">TND</span>
              </div>
            </div>

            {/* Avertissement / Info Paiement */}
            <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-black/5 flex gap-3">
              <svg className="w-6 h-6 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xs text-slate-500 leading-relaxed">
                Le paiement s'effectuera <strong>en espèces à la livraison</strong>. Merci de préparer le montant exact si possible pour le livreur.
              </p>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
