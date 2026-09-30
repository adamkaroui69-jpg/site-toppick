-- ==========================================
-- 1. CRÉATION DES TABLES
-- ==========================================

-- Table principale des commandes
CREATE TABLE commandes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom_client TEXT NOT NULL,
  telephone TEXT NOT NULL,
  adresse TEXT NOT NULL,
  total_ttc NUMERIC NOT NULL,
  statut TEXT NOT NULL DEFAULT 'en_attente',
  cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des lignes (articles) liées à une commande
CREATE TABLE lignes_commande (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commande_id UUID NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
  produit_reference TEXT NOT NULL,
  titre_produit TEXT NOT NULL,
  quantite INTEGER NOT NULL,
  prix_unitaire_ttc NUMERIC NOT NULL
);

-- ==========================================
-- 2. ACTIVATION DE LA SÉCURITÉ (RLS)
-- ==========================================
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_commande ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. POLITIQUES DE SÉCURITÉ (POLICIES)
-- ==========================================

-- Politique pour la table 'commandes'
-- Autorise quiconque (même non authentifié) à CRÉER une nouvelle commande
CREATE POLICY "Autoriser l'insertion publique pour les commandes" 
ON commandes 
FOR INSERT 
WITH CHECK (true);

-- Politique pour la table 'lignes_commande'
-- Autorise quiconque à INSERER des lignes de commande
CREATE POLICY "Autoriser l'insertion publique pour les lignes de commande" 
ON lignes_commande 
FOR INSERT 
WITH CHECK (true);

-- NOTE IMPORTANTE DE SÉCURITÉ :
-- Comme nous n'avons créé AUCUNE politique pour l'opération "SELECT", 
-- la lecture est implicitement bloquée pour le public.
-- Seuls les administrateurs (via l'interface Supabase ou avec une clé service_role)
-- pourront voir la liste des commandes et les données clients.
