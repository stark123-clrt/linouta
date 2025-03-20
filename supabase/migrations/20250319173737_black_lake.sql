/*
  # Ajout des produits aux réservations

  1. Nouvelle Table
    - `reservation_items`
      - `id` (uuid, clé primaire)
      - `reservation_id` (uuid, référence à reservations)
      - `product_id` (uuid, référence à products)
      - `quantity` (integer, quantité commandée)
      - `unit_price` (integer, prix unitaire)
      - `created_at` (timestamp avec fuseau horaire)

  2. Relations
    - Clé étrangère vers la table reservations
    - Clé étrangère vers la table products

  3. Sécurité
    - RLS activé
    - Politiques pour l'insertion publique
    - Politiques pour la lecture par les administrateurs
*/

-- Table des produits de réservation
CREATE TABLE reservation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL,
  unit_price integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activation de RLS
ALTER TABLE reservation_items ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion publique
CREATE POLICY "Enable insert for everyone"
ON reservation_items FOR INSERT
TO public
WITH CHECK (true);

-- Politique pour permettre la lecture aux administrateurs
CREATE POLICY "Enable read for admins"
ON reservation_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
  )
);

-- Vue détaillée des réservations avec leurs produits
CREATE OR REPLACE VIEW reservation_details_view AS
SELECT 
  r.id as reservation_id,
  r.customer_name,
  r.customer_email,
  r.customer_phone,
  r.message,
  r.status as reservation_status,
  r.created_at as reservation_date,
  p.name as product_name,
  ri.quantity,
  ri.unit_price,
  (ri.quantity * ri.unit_price) as total_item_price,
  SUM(ri.quantity * ri.unit_price) OVER (PARTITION BY r.id) as total_reservation_amount
FROM 
  reservations r
  LEFT JOIN reservation_items ri ON r.id = ri.reservation_id
  LEFT JOIN products p ON ri.product_id = p.id
ORDER BY 
  r.created_at DESC;