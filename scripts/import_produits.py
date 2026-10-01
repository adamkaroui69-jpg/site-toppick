import os
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

# 1. Charger les variables d'environnement depuis le fichier .env.local
load_dotenv('../.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Les variables d'environnement SUPABASE_URL et SUPABASE_KEY sont introuvables. Vérifiez votre fichier .env.")

# 2. Initialiser le client Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def importer_articles():
    # Le fichier est dans le dossier BD/ à la racine
    fichier = '../BD/articles.xlsx'
    
    print(f"Lecture du fichier {fichier}...")
    try:
        # Lire la feuille 'A' du fichier excel
        df = pd.read_excel(fichier, sheet_name='A')
    except Exception as e:
        print(f"Erreur lors de la lecture du fichier : {e}")
        return

    # 3. Nettoyage et transformation des données
    # Remplacer les valeurs nulles du stock par 0 avant conversion
    df['STOCK\nPrincipal'] = df['STOCK\nPrincipal'].fillna(0)
    
    # Convertir les stocks négatifs en 0
    df.loc[df['STOCK\nPrincipal'] < 0, 'STOCK\nPrincipal'] = 0

    # Mapper les colonnes du fichier Excel vers les colonnes de la table Supabase
    colonnes_mapping = {
        'Code': 'reference',
        'Désignation': 'titre',
        'PU.V.HT': 'prix_ht',
        'Tva%': 'tva',
        'PU.V.TTC': 'prix_ttc',
        'STOCK\nPrincipal': 'stock'
    }
    
    # Renommer les colonnes
    df_mapped = df.rename(columns=colonnes_mapping)
    
    # Ne conserver que les colonnes utiles
    colonnes_finales = ['reference', 'titre', 'prix_ht', 'tva', 'prix_ttc', 'stock']
    df_mapped = df_mapped[colonnes_finales]

    # Convertir le type 'reference' en texte (string) par sécurité et stock en int
    df_mapped['reference'] = df_mapped['reference'].astype(str)
    df_mapped['stock'] = df_mapped['stock'].astype(int)

    # Convertir le DataFrame en une liste de dictionnaires pour Supabase
    donnees = df_mapped.to_dict(orient='records')

    print(f"Préparation de l'envoi de {len(donnees)} produits vers Supabase...")

    # 4. Upsert (Mise à jour ou Création)
    try:
        response = supabase.table('produits').upsert(
            donnees, 
            on_conflict='reference'
        ).execute()
        
        print("Opération terminée avec succès !")
        print(f"{len(response.data)} produits ont été insérés ou mis à jour.")
        
    except Exception as e:
        print(f"Une erreur est survenue lors de l'upsert vers Supabase : {e}")

if __name__ == "__main__":
    importer_articles()
