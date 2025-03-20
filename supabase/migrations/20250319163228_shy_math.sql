/*
  # Création de la table des administrateurs et des politiques de sécurité

  1. Nouvelle Table
    - `admins`
      - Stocke les identifiants des administrateurs
      - Lié à la table auth.users

  2. Sécurité
    - RLS activé
    - Politiques pour restreindre l'accès
*/

CREATE TABLE IF NOT EXISTS admins (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Seuls les administrateurs peuvent lire la table admins
CREATE POLICY "Admins can read admins"
    ON admins FOR SELECT
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM admins));

-- Modification des politiques des produits pour les administrateurs
CREATE POLICY "Admins can manage products"
    ON products
    FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM admins));