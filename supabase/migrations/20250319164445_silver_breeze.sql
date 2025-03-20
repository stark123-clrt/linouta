/*
  # Correction de la politique RLS pour les administrateurs

  1. Changements
    - Suppression de l'ancienne politique qui causait une récursion infinie
    - Création d'une nouvelle politique plus simple et sécurisée
  
  2. Sécurité
    - La nouvelle politique permet aux utilisateurs authentifiés de lire leurs propres données
    - Évite la récursion en utilisant auth.uid() directement
*/

-- Suppression de l'ancienne politique qui cause la récursion
DROP POLICY IF EXISTS "Admins can read admins" ON admins;

-- Création d'une nouvelle politique plus simple
CREATE POLICY "Users can read own data"
ON admins
FOR SELECT
TO authenticated
USING (auth.uid() = id);