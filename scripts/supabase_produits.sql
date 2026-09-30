-- Création de la table produits
CREATE TABLE produits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL, -- Correspond au 'Code' A2Soft
  titre TEXT NOT NULL,
  prix_ht NUMERIC NOT NULL,
  tva INTEGER NOT NULL,
  prix_ttc NUMERIC NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT DEFAULT '',
  en_ligne BOOLEAN DEFAULT true
);

-- Activation de la Row Level Security (RLS)
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;

-- Création de la politique pour autoriser la lecture publique
CREATE POLICY "Lecture publique des produits en ligne" 
ON produits 
FOR SELECT 
USING (en_ligne = true);
