import { createClient } from "@supabase/supabase-js";
import ProductCard, { Produit } from "../components/ProductCard";

// ==========================================
// 1. CONFIGURATION DU CLIENT SUPABASE
// ==========================================
// Idéalement, ces variables doivent être définies dans votre fichier .env.local
// Exemple : NEXT_PUBLIC_SUPABASE_URL=... et NEXT_PUBLIC_SUPABASE_ANON_KEY=...
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://VOTRE_PROJET.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "VOTRE_CLE_ANON";

// Initialisation du client (utilisable de manière sûre côté serveur)
const supabase = createClient(supabaseUrl, supabaseKey);

// Optionnel: Revalidation de la page toutes les heures (Incremental Static Regeneration)
// Cela permet d'avoir de hautes performances tout en rafraichissant les stocks et prix
export const revalidate = 3600;

export default async function HomePage() {
  // ==========================================
  // 2. REQUÊTE ASYNCHRONE DES DONNÉES
  // ==========================================
  // On récupère uniquement les produits en ligne, triés par ordre alphabétique
  const { data: produits, error } = await supabase
    .from("produits")
    .select("reference, titre, prix_ttc, stock")
    .eq("en_ligne", true)
    .order("titre", { ascending: true });

  if (error) {
    console.error("Erreur critique lors du chargement des produits :", error);
  }

  const produitsList: Produit[] = produits || [];

  return (
    <div className="space-y-6 md:space-y-8">
      
      {/* En-tête de la section avec le compteur dynamique */}
      <div className="flex items-end justify-between border-b border-black/5 pb-4">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
          Sélection du moment
        </h1>
        <span className="text-sm font-semibold text-slate-500 mb-1">
          {produitsList.length} article{produitsList.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* ==========================================
          3. AFFICHAGE (GRILLE OU MESSAGE VIDE)
          ========================================== */}
      {produitsList.length === 0 ? (
        
        /* État "Vide" élégant */
        <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center px-4">
          <div className="bg-slate-50 p-6 rounded-full mb-6">
            <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
            Aucun produit disponible pour le moment
          </h2>
          <p className="text-slate-500 max-w-md text-sm md:text-base">
            Notre catalogue est en cours de mise à jour. Nous ajoutons de nouvelles pépites, revenez nous voir très bientôt !
          </p>
        </div>

      ) : (

        /* Grille ultra-responsive */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 xl:gap-8">
          {produitsList.map((produit) => (
            <ProductCard 
              key={produit.reference} 
              produit={produit} 
            />
          ))}
        </div>

      )}
    </div>
  );
}
