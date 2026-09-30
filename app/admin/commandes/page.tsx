import { createClient } from "@supabase/supabase-js";
import LogoutButton from "../../../components/LogoutButton";

// ==========================================
// CONFIGURATION SUPABASE (Côté Serveur)
// ==========================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://VOTRE_PROJET.supabase.co";
// ⚠️ Attention: Pour lire les commandes privées (protégées par la RLS), 
// vous devez utiliser la clé secrète "service_role" dans votre fichier .env.local
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "VOTRE_CLE_SERVICE_ROLE";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Désactiver complètement le cache pour avoir un tableau de bord à jour à chaque rafraîchissement
export const dynamic = 'force-dynamic';

export default async function AdminCommandesPage() {
  // ==========================================
  // REQUÊTE AVEC JOINTURE
  // ==========================================
  // La puissance de Supabase : on récupère les commandes ET leurs lignes associées en une seule requête SQL
  const { data: commandes, error } = await supabase
    .from('commandes')
    .select('*, lignes_commande(*)')
    .order('cree_le', { ascending: false });

  if (error) {
    console.error("Erreur de récupération des commandes :", error);
  }

  // ==========================================
  // FONCTIONS DE FORMATAGE
  // ==========================================
  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'en_attente':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">En attente</span>;
      case 'expedie':
      case 'expédié':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">Expédié</span>;
      case 'livre':
      case 'livré':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200 shadow-sm">Livré</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">{statut}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête du Dashboard */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Commandes</h1>
            <p className="text-slate-500 mt-2">Consultez et préparez les commandes reçues sur votre boutique.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <LogoutButton />
            <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm text-sm font-bold text-slate-700 flex items-center gap-3 w-fit">
              <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            {commandes?.length || 0} commande(s)
          </div>
        </div>

        {/* ==========================================
            TABLEAU DE BORD (Liste des commandes)
            ========================================== */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          
          {/* En-têtes des colonnes (Visible uniquement sur grands écrans) */}
          <div className="hidden lg:grid grid-cols-12 gap-4 p-4 bg-slate-100/50 border-b border-gray-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-2 pl-2">ID / Date</div>
            <div className="col-span-3">Client</div>
            <div className="col-span-4">Adresse de Livraison</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-2 text-center pr-6">Statut</div>
          </div>

          {/* Liste déroulante des commandes */}
          {(!commandes || commandes.length === 0) ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              <h3 className="text-lg font-bold text-slate-900">Aucune commande</h3>
              <p className="text-slate-500 mt-1">Les commandes validées apparaîtront ici.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {commandes.map((cmd: any) => (
                // Astuce PRO : Utilisation de <details> natif HTML pour faire un accordéon sans JavaScript (Server Component friendly)
                <details key={cmd.id} className="group [&_summary::-webkit-details-marker]:hidden">
                  
                  {/* ==========================================
                      LIGNE PRINCIPALE DE LA COMMANDE
                      ========================================== */}
                  <summary className="lg:grid lg:grid-cols-12 gap-4 p-5 md:p-6 items-center cursor-pointer hover:bg-slate-50 transition-colors list-none relative">
                    
                    {/* Colonne 1 : ID & Date */}
                    <div className="col-span-2 mb-4 lg:mb-0">
                      <div className="text-xs font-mono font-bold text-slate-400 mb-1" title={cmd.id}>
                        #{cmd.id.split('-')[0]}...
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {formatDateTime(cmd.cree_le)}
                      </div>
                    </div>
                    
                    {/* Colonne 2 : Client */}
                    <div className="col-span-3 mb-4 lg:mb-0">
                      <div className="text-sm font-bold text-slate-900">{cmd.nom_client}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {cmd.telephone}
                      </div>
                    </div>
                    
                    {/* Colonne 3 : Adresse */}
                    <div className="col-span-4 mb-4 lg:mb-0 pr-4">
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {cmd.adresse}
                      </p>
                    </div>

                    {/* Colonne 4 : Total */}
                    <div className="col-span-1 text-left lg:text-right mb-4 lg:mb-0">
                      <span className="text-base font-black text-slate-900">{cmd.total_ttc}</span>
                      <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase">TND</span>
                    </div>

                    {/* Colonne 5 : Statut & Flèche */}
                    <div className="col-span-2 flex items-center justify-between lg:justify-center">
                      {getStatusBadge(cmd.statut)}
                      
                      {/* Icône Chevron animée */}
                      <svg className="w-5 h-5 text-slate-400 transform group-open:rotate-180 transition-transform lg:absolute lg:right-6 lg:top-1/2 lg:-translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>

                  {/* ==========================================
                      DÉTAILS (Articles à mettre dans le colis)
                      ========================================== */}
                  <div className="p-6 bg-slate-900 border-t border-slate-800 text-white rounded-b-xl lg:rounded-none">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-700 pb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      Détails du colis ({cmd.lignes_commande?.length || 0} articles)
                    </h4>
                    
                    <ul className="space-y-3">
                      {cmd.lignes_commande?.map((ligne: any) => (
                        <li key={ligne.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors gap-4">
                          
                          <div className="flex items-center gap-4">
                            {/* Pastille Quantité */}
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 font-black flex items-center justify-center text-sm border border-blue-500/30 flex-shrink-0">
                              {ligne.quantite}x
                            </div>
                            
                            <div>
                              <p className="font-bold text-sm text-slate-100">{ligne.titre_produit}</p>
                              <p className="font-mono text-xs text-slate-400 mt-1 uppercase tracking-wider">Réf: {ligne.produit_reference}</p>
                            </div>
                          </div>

                          <div className="text-left sm:text-right bg-slate-900/50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none">
                            <span className="text-xs text-slate-400 mr-2 sm:hidden">Sous-total :</span>
                            <span className="font-black text-sm text-white">
                              {(ligne.prix_unitaire_ttc * ligne.quantite).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">TND</span>
                          </div>

                        </li>
                      ))}
                    </ul>
                  </div>

                </details>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
