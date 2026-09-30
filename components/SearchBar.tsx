"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

// ==========================================
// 1. CONFIGURATION DU CLIENT SUPABASE
// ==========================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://VOTRE_PROJET.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "VOTRE_CLE_ANON";

// URL de base du bucket d'images Supabase
const SUPABASE_BUCKET_URL = `${supabaseUrl}/storage/v1/object/public/produits`;

// Initialisation du client
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// 2. TYPES
// ==========================================
interface SearchResult {
  reference: string;
  titre: string;
  prix_ttc: number;
}

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // 3. FERMETURE DU MENU AU CLIC EXTERNE
  // ==========================================
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==========================================
  // 4. LOGIQUE DE RECHERCHE AVEC DEBOUNCE (300ms)
  // ==========================================
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Le debounce retarde l'exécution de la requête pour éviter d'inonder la BDD
    const timer = setTimeout(async () => {
      const term = `%${searchTerm.trim()}%`;
      
      const { data, error } = await supabase
        .from("produits")
        .select("reference, titre, prix_ttc")
        .eq("en_ligne", true)
        // Recherche dans le titre OU la référence
        .or(`titre.ilike.${term},reference.ilike.${term}`)
        .limit(5); // Limite aux 5 résultats les plus pertinents

      if (error) {
        console.error("Erreur de recherche :", error);
      } else {
        setResults(data || []);
        setIsOpen(true);
      }
      
      setIsLoading(false);
    }, 300); // 300ms de délai

    // Nettoyage du timer si l'utilisateur tape à nouveau avant la fin des 300ms
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
      
      {/* ==========================================
          5. INPUT DE RECHERCHE
          ========================================== */}
      <div className="relative group">
        {/* Icône Loupe */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || searchTerm.length > 0) setIsOpen(true);
          }}
          placeholder="Rechercher un produit, une référence..."
          className="w-full h-11 bg-black/5 hover:bg-black/10 focus:bg-white focus:ring-2 focus:ring-black border-none rounded-full pl-11 pr-12 text-sm md:text-base font-medium text-slate-900 placeholder:text-slate-500 transition-all outline-none shadow-sm"
        />

        {/* Spinner de chargement */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {/* ==========================================
          6. MENU DÉROULANT DES RÉSULTATS
          ========================================== */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-black/5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {results.length > 0 ? (
            <ul className="divide-y divide-black/5">
              {results.map((produit) => (
                <li key={produit.reference}>
                  {/* Lien vers la future page produit */}
                  <a 
                    href={`/produit/${produit.reference}`}
                    className="flex items-center p-3 hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    {/* Miniature */}
                    <div className="relative w-12 h-12 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={`${SUPABASE_BUCKET_URL}/${produit.reference}.jpg`}
                        alt={produit.titre}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="48px"
                      />
                    </div>
                    
                    {/* Titre et Prix */}
                    <div className="ml-4 flex-grow min-w-0 flex justify-between items-center">
                      <h4 className="text-sm font-semibold text-slate-900 truncate pr-4">
                        {produit.titre}
                      </h4>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-black text-black">
                          {produit.prix_ttc.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                          TND
                        </span>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            !isLoading && searchTerm.length > 0 && (
              <div className="p-6 text-center text-sm text-slate-500 font-medium">
                Aucun résultat pour "<span className="text-slate-900">{searchTerm}</span>"
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
