"use client";

import dynamic from "next/dynamic";

// Obligatoire pour React-Admin dans Next.js : Désactiver le rendu côté serveur (SSR)
const ReactAdminApp = dynamic(() => import("../../../components/ReactAdminApp"), { 
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-black font-bold">
            Chargement du module CRM...
        </div>
    )
});

export default function CRMPage() {
    return <ReactAdminApp />;
}
