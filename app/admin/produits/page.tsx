"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import LogoutButton from "../../../components/LogoutButton";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminProduitsPage() {
  const [produits, setProduits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 50;

  const fetchProduits = async () => {
    setIsLoading(true);
    
    let query = supabase
      .from("produits")
      .select("*", { count: "exact" });

    // Recherche
    if (searchTerm) {
      query = query.or(`titre.ilike.%${searchTerm}%,reference.ilike.%${searchTerm}%`);
    }

    // Pagination
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    query = query.range(from, to).order('titre', { ascending: true });

    const { data, count, error } = await query;

    if (!error && data) {
      setProduits(data);
      if (count !== null) setTotalCount(count);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProduits();
  }, [page, searchTerm]);

  // Fonction pour changer le statut en ligne/hors ligne
  const toggleStatut = async (id: string, currentStatut: boolean) => {
    const { error } = await supabase
      .from("produits")
      .update({ en_ligne: !currentStatut })
      .eq("id", id);
      
    if (!error) {
      setProduits(produits.map(p => p.id === id ? { ...p, en_ligne: !currentStatut } : p));
    } else {
      alert("Erreur de mise à jour. Avez-vous exécuté le script SQL RLS pour les admins ?");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Catalogue Produits</h1>
            <p className="text-slate-500 mt-2">Gérez vos {totalCount} articles, les stocks et la visibilité.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/admin/commandes" className="text-sm font-bold text-slate-500 hover:text-black">
              Commandes
            </Link>
            <Link href="/admin/media" className="text-sm font-bold text-slate-500 hover:text-black">
              Upload Images
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Barre d'outils (Recherche) */}
        <div className="bg-white p-4 rounded-t-2xl border border-gray-200 border-b-0 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text"
              placeholder="Chercher une référence ou un nom..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Retour page 1 lors d'une recherche
              }}
            />
          </div>
        </div>

        {/* Tableau de données */}
        <div className="bg-white border border-gray-200 rounded-b-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Réf.</th>
                <th className="p-4">Titre de l'article</th>
                <th className="p-4">Prix TTC</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-center">État (En ligne)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <svg className="animate-spin h-6 w-6 mx-auto mb-2 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Chargement...
                  </td>
                </tr>
              ) : produits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center font-bold text-slate-400">Aucun produit trouvé.</td>
                </tr>
              ) : (
                produits.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs font-bold text-slate-500">{p.reference}</td>
                    <td className="p-4 font-bold text-slate-900 line-clamp-1">{p.titre}</td>
                    <td className="p-4 font-black text-slate-900">{p.prix_ttc.toFixed(2)} <span className="text-[10px] text-slate-500">TND</span></td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${p.stock > 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => toggleStatut(p.id, p.en_ligne)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${p.en_ligne ? 'bg-green-500' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${p.en_ligne ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center text-sm font-bold text-slate-600">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            &larr; Précédent
          </button>
          <span>Page {page} / {Math.max(1, Math.ceil(totalCount / itemsPerPage))}</span>
          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(totalCount / itemsPerPage)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            Suivant &rarr;
          </button>
        </div>

      </div>
    </div>
  );
}
