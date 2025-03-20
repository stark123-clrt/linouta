/*
  # Création des tables de commandes

  1. Nouvelles Tables
    - `orders`
      - Informations sur la commande et le client
      - Montant total et statut
    - `order_items`
      - Détails des produits commandés
      - Quantités et prix unitaires

  2. Relations
    - Clé étrangère entre order_items et orders
    - Clé étrangère entre order_items et products

  3. Sécurité
    - RLS activé pour les deux tables
    - Politiques d'accès pour la lecture et l'insertion
*/

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text NOT NULL,
    total_amount integer NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

-- Table des articles de commande
CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id),
    quantity integer NOT NULL,
    unit_price integer NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Activation de RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Politiques pour orders
CREATE POLICY "Enable read access for all users"
ON orders FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access for all users"
ON orders FOR INSERT
TO public
WITH CHECK (true);

-- Politiques pour order_items
CREATE POLICY "Enable read access for all users"
ON order_items FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access for all users"
ON order_items FOR INSERT
TO public
WITH CHECK (true);

-- Vue détaillée des commandes
CREATE OR REPLACE VIEW order_details_view AS
SELECT 
    o.id as order_id,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.status as order_status,
    o.created_at as order_date,
    p.name as product_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) as total_item_price,
    o.total_amount as total_order_amount
FROM 
    orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
ORDER BY 
    o.created_at DESC;

-- Commentaire sur la vue
COMMENT ON VIEW order_details_view IS 'Vue détaillée des commandes avec informations sur les produits et les clients';