/*
  # Création du système de réservations

  1. Nouvelle Table
    - `reservations`
      - `id` (uuid, clé primaire)
      - `customer_name` (text, nom du client)
      - `customer_email` (text, email du client)
      - `customer_phone` (text, téléphone)
      - `message` (text, message/demande)
      - `status` (text, statut de la réservation)
      - `created_at` (timestamp)

  2. Sécurité
    - RLS activé
    - Politiques pour insertion publique et lecture admin
*/

CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

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