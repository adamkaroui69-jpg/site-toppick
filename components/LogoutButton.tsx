"use client";

import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://VOTRE_PROJET.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "VOTRE_CLE_ANON";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // 1. Déconnexion Supabase
    await supabase.auth.signOut();
    
    // 2. Destruction du cookie lu par le Middleware
    document.cookie = "admin-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // 3. Redirection
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm flex items-center gap-2"
      title="Se déconnecter"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
      <span className="hidden sm:inline">Déconnexion</span>
    </button>
  );
}
