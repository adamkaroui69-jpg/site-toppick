"use client";

import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from "react-admin";
import { supabaseDataProvider } from "ra-data-supabase";
import { createClient } from "@supabase/supabase-js";

// Configuration Supabase pour React-Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// ⚠️ On utilise la clé service_role EXCLUSIVEMENT parce que React-Admin tourne en mode "Intranet privé" (Le dossier devra être protégé par mot de passe via Vercel ou Middleware)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const dataProvider = supabaseDataProvider({
    instance: supabase,
    apiKey: supabaseKey,
});

export default function ReactAdminApp() {
    return (
        <Admin dataProvider={dataProvider} title="Top Pick CMS (Style PrestaShop)" requireAuth={false}>
            {/* Le composant "Guesser" de React-Admin analyse automatiquement votre base de données et crée des tableaux et formulaires parfaits ! */}
            <Resource name="produits" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
            <Resource name="commandes" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
            <Resource name="lignes_commande" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
        </Admin>
    );
}
