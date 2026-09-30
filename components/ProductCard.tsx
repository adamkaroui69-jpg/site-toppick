import Image from "next/image";

// Définition de la structure des données du produit
export interface Produit {
  reference: string;
  titre: string;
  prix_ttc: number;
  stock: number;
}

interface ProductCardProps {
  produit: Produit;
}

export default function ProductCard({ produit }: ProductCardProps) {
  const isOutOfStock = produit.stock <= 0;
  
  // URL de base de votre bucket Supabase (à remplacer par votre vraie URL de projet)
  const SUPABASE_BUCKET_URL = "https://VOTRE_PROJET.supabase.co/storage/v1/object/public/produits";
  const imageUrl = `${SUPABASE_BUCKET_URL}/${produit.reference}.jpg`;

  return (
    <div className="group flex flex-col bg-white rounded-lg border border-black/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      
      {/* Conteneur de l'image avec ratio carré */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <Image
          src={imageUrl}
          alt={produit.titre}
          fill
          className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            isOutOfStock ? "opacity-50 grayscale-[50%]" : ""
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Badge "Rupture de stock" minimaliste */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 bg-red-600/95 backdrop-blur text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm shadow-sm">
            Rupture de stock
          </div>
        )}
      </div>

      {/* Contenu textuel */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* Titre (limité à 2 lignes via Tailwind) */}
        <h3 
          className="text-sm md:text-base font-semibold text-slate-900 leading-tight line-clamp-2 mb-3"
          title={produit.titre}
        >
          {produit.titre}
        </h3>

        {/* Espaceur flexible pour repousser les éléments vers le bas */}
        <div className="flex-grow"></div>

        <div className="flex items-end justify-between mt-1">
          {/* Prix en gras avec la devise */}
          <div className="flex items-baseline space-x-1">
            <span className="text-lg md:text-xl font-black text-black tracking-tight">
              {produit.prix_ttc.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase">
              TND
            </span>
          </div>

          {/* Bouton Ajouter au panier (masqué si en rupture) */}
          {!isOutOfStock && (
            <button 
              className="p-2.5 bg-black text-white hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 active:scale-95"
              aria-label="Ajouter au panier"
            >
              {/* Icône Plus */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
}
