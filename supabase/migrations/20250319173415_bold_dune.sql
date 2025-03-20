/*
  # Mise à jour des politiques de sécurité pour les réservations

  1. Modifications
    - Ajout de politiques de sécurité pour la table reservations
    - Permettre l'insertion publique
    - Permettre la lecture aux administrateurs

  2. Sécurité
    - Politiques RLS pour contrôler l'accès aux réservations
*/

-- Suppression des anciennes politiques si elles existent
DROP POLICY IF EXISTS "Enable insert for everyone" ON reservations;
DROP POLICY IF EXISTS "Enable read for admins" ON reservations;

-- Politique pour permettre l'insertion publique
CREATE POLICY "Enable insert for everyone" 
ON reservations FOR INSERT 
TO public 
WITH CHECK (true);

-- Politique pour permettre la lecture aux administrateurs
CREATE POLICY "Enable read for admins" 
ON reservations FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid()
  )
);