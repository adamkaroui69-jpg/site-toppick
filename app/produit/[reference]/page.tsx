import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import AddToCartButton from "../../../components/AddToCartButton";

// ==========================================
// CONFIGURATION SUPABASE
// ==========================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://VOTRE_PROJET.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "VOTRE_CLE_ANON";
const SUPABASE_BUCKET_URL = `${supabaseUrl}/storage/v1/object/public/produits-images`;
const supabase = createClient(supabaseUrl, supabaseKey);

// Revalidation d'une heure (ISR) pour les performances SEO
export const revalidate = 3600;

interface PageProps {
  params: {
    reference: string;
  };
}

export default async function ProductPage({ params }: PageProps) {
  // Décodage au cas où la référence contient des caractères bizarres (espaces, slash...)
  const reference = decodeURIComponent(params.reference);

  // ==========================================
  // REQUÊTE BASE DE DONNÉES
  // ==========================================
  const { data: produit, error } = await supabase
    .from("produits")
    .select("*")
    .eq("reference", reference)
    .single(); // On attend un seul produit (car la ref est UNIQUE)

  // Si erreur réseau, ou si le produit n'existe pas, ou s'il n'est pas en ligne -> Page 404
  if (error || !produit || !produit.en_ligne) {
    notFound();
  }

  const isOutOfStock = produit.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-16 px-4 md:px-8">
      
      {/* Container principal : 2 colonnes sur desktop, 1 sur mobile */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* ==========================================
            COLONNE GAUCHE : IMAGE
            ========================================== */}
        <div className="w-full lg:w-1/2">
          {/* Fond gris très clair pour faire ressortir l'objet de façon très esthétique */}
          <div className="relative aspect-square w-full rounded-3xl bg-slate-50 border border-black/5 overflow-hidden flex items-center justify-center p-8 md:p-12">
            <Image
              src={`${SUPABASE_BUCKET_URL}/${produit.reference}.jpg`}
              alt={produit.titre}
              fill
              className={`object-contain mix-blend-multiply transition-transform duration-700 ease-out hover:scale-105 ${isOutOfStock ? 'opacity-60 grayscale-[50%]' : ''}`}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority // Force le navigateur à charger cette image en priorité (LCP)
            />
            
            {/* Badge optionnel si rupture */}
            {isOutOfStock && (
              <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-red-600/95 backdrop-blur-sm text-white text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-md shadow-lg">
                Rupture de stock
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            COLONNE DROITE : DÉTAILS
            ========================================== */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest font-mono mb-3">
              Réf : {produit.reference}
            </h2>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {produit.titre}
            </h1>
          </div>

          <div className="mt-8 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
                {produit.prix_ttc.toFixed(2)}
              </span>
              <span className="text-lg md:text-xl font-bold text-slate-500 uppercase">
                TND
              </span>
            </div>
            {/* Information de taxe discrète (Légal / Réassurance) */}
            <p className="text-sm text-slate-400 mt-2 font-medium">
              Prix TTC incluant {produit.tva}% de TVA
            </p>
          </div>
          
          {/* Composant Interactif (Client) gérant l'état du panier */}
          <AddToCartButton 
            produit={{
              reference: produit.reference,
              titre: produit.titre,
              prix_ttc: produit.prix_ttc,
              stock: produit.stock
            }} 
          />

          {/* Points de Réassurance (Marketing) */}
          <div className="mt-14 grid grid-cols-2 gap-6 pt-8 border-t border-black/5">
            <div className="flex items-start gap-4 text-slate-600">
              <div className="bg-slate-50 p-2.5 rounded-full text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Livraison Express</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Expédition garantie sous 24h/48h.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 text-slate-600">
              <div className="bg-slate-50 p-2.5 rounded-full text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Paiement Sécurisé</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Transactions 100% cryptées et fiables.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
