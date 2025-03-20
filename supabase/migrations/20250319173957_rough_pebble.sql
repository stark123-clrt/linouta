/*
  # Correction des politiques RLS pour les réservations

  1. Modifications
    - Suppression des anciennes politiques restrictives
    - Ajout de nouvelles politiques permettant l'accès public
    - Ajout de politiques pour la mise à jour du statut

  2. Sécurité
    - Permettre l'insertion publique des réservations
    - Permettre la lecture publique des réservations
    - Permettre la mise à jour du statut par les administrateurs
*/

-- Suppression des anciennes politiques
DROP POLICY IF EXISTS "Enable insert for everyone" ON reservations;
DROP POLICY IF EXISTS "Enable read for admins" ON reservations;

-- Politique pour permettre l'insertion publique
CREATE POLICY "Enable insert for everyone"
ON reservations FOR INSERT
TO public
WITH CHECK (true);

-- Politique pour permettre la lecture publique
CREATE POLICY "Enable read access for everyone"
ON reservations FOR SELECT
TO public
USING (true);

-- Politique pour permettre la mise à jour du statut par les administrateurs
CREATE POLICY "Enable status update for admins"
ON reservations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
  )
);