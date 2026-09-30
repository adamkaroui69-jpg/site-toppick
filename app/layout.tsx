import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Top Pick | E-commerce",
  description: "Les meilleures sélections du moment.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-slate-900 font-sans antialiased flex flex-col selection:bg-black selection:text-white">
        
        {/* ================= HEADER FIXE ================= */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 md:px-8 bg-white/70 backdrop-blur-lg border-b border-black/5 shadow-sm">
          
          {/* Hamburger (Mobile) + Logo */}
          <div className="flex items-center gap-4">
            <label 
              htmlFor="mobile-menu" 
              className="p-2 -ml-2 cursor-pointer md:hidden hover:bg-black/5 rounded-full transition-colors"
            >
              {/* Icône Menu (Hamburger) */}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </label>
            
            <a href="/" className="text-xl md:text-2xl font-black tracking-tighter text-black">
              Top Pick.
            </a>
          </div>

          {/* Espace central : Future Barre de Recherche */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="w-full h-10 bg-black/5 rounded-full flex items-center px-4 text-gray-500 hover:bg-black/10 transition-colors cursor-text">
              {/* Icône Loupe */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span className="text-sm">Rechercher des produits...</span>
            </div>
          </div>

          {/* Icône Panier */}
          <div className="flex items-center">
            <button className="relative p-2 hover:bg-black/5 rounded-full transition-colors group">
              {/* Icône Panier */}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800 group-hover:text-black transition-colors"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              
              {/* Pastille de notification (Optionnelle) */}
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-black border-2 border-white rounded-full"></span>
            </button>
          </div>
        </header>

        {/* INPUT INVISIBLE : Gestion de l'état du menu mobile (sans JavaScript) */}
        <input type="checkbox" id="mobile-menu" className="peer hidden" />

        {/* OVERLAY SOMBRE (Mobile) : Ferme le menu en cliquant à côté */}
        <label 
          htmlFor="mobile-menu" 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 hidden peer-checked:block md:peer-checked:hidden cursor-pointer opacity-0 peer-checked:opacity-100 transition-opacity"
        ></label>

        {/* ================= CORPS DE LA PAGE ================= */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* SIDEBAR GAUCHE (Filtres) */}
          <aside className="fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-black/5 shadow-2xl transform -translate-x-full transition-transform duration-300 ease-in-out peer-checked:translate-x-0 md:relative md:translate-x-0 md:shadow-none md:z-0 md:w-64 pt-16 md:pt-0">
            
            {/* Header Sidebar (visible sur mobile uniquement) */}
            <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 md:hidden border-b border-black/5 bg-white">
              <span className="font-bold text-lg">Filtres</span>
              <label htmlFor="mobile-menu" className="p-2 cursor-pointer hover:bg-black/5 rounded-full transition-colors">
                {/* Icône Fermer (X) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </label>
            </div>

            {/* Contenu de la sidebar */}
            <div className="p-6 md:p-8 space-y-10 overflow-y-auto h-full pb-24">
              
              {/* Section Filtres : Catégories */}
              <div className="space-y-5">
                <h3 className="text-xs font-bold text-black uppercase tracking-widest">
                  Catégories
                </h3>
                <div className="space-y-4">
                  {['Scolaire', 'Jouets', 'En promotion'].map((item) => (
                    <label key={item} className="flex items-center group cursor-pointer">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="peer appearance-none w-5 h-5 border border-slate-300 rounded-sm bg-white checked:bg-black checked:border-black cursor-pointer transition-all" 
                        />
                        {/* Coche custom pour le checkbox */}
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none">
                          <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="ml-3 text-sm font-medium text-slate-600 group-hover:text-black transition-colors">
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Exemple de section filtre supplémentaire */}
              <div className="space-y-5">
                <h3 className="text-xs font-bold text-black uppercase tracking-widest">
                  Prix
                </h3>
                <div className="space-y-4">
                  {['Moins de 20€', '20€ - 50€', 'Plus de 50€'].map((item) => (
                    <label key={item} className="flex items-center group cursor-pointer">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="peer appearance-none w-5 h-5 border border-slate-300 rounded-sm bg-white checked:bg-black checked:border-black cursor-pointer transition-all" 
                        />
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                          <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="ml-3 text-sm font-medium text-slate-600 group-hover:text-black transition-colors">
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* CONTENU PRINCIPAL (Grille de produits etc.) */}
          <main className="flex-1 overflow-y-auto bg-white border-l border-black/5">
            <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
              {children}
            </div>
          </main>

        </div>
      </body>
    </html>
  );
}
