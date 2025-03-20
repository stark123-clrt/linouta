/*
  # Correction de l'authentification admin

  1. Modifications
    - Suppression des anciennes politiques qui causent des problèmes
    - Ajout d'une nouvelle politique plus claire pour les administrateurs
    - Ajout d'un index sur l'email pour optimiser les recherches

  2. Sécurité
    - Mise à jour des politiques RLS pour une meilleure sécurité
    - Restriction de l'accès aux administrateurs uniquement
*/

-- Suppression des anciennes politiques
DROP POLICY IF EXISTS "Users can read own data" ON admins;
DROP POLICY IF EXISTS "Admins can read admins" ON admins;

-- Création d'une nouvelle politique plus claire
CREATE POLICY "Allow admin access"
ON admins
FOR ALL
TO authenticated
USING (
  email = auth.jwt()->>'email'
);

-- Ajout d'un index sur l'email pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);