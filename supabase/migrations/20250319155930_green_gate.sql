/*
  # Création de la table des commandes

  1. Nouvelles Tables
    - `orders`
      - `id` (uuid, clé primaire)
      - `customer_name` (text, nom du client)
      - `customer_email` (text, email du client)
      - `customer_phone` (text, téléphone du client)
      - `total_amount` (integer, montant total en centimes)
      - `status` (text, statut de la commande)
      - `created_at` (timestamp avec fuseau horaire)
    
    - `order_items`
      - `id` (uuid, clé primaire)
      - `order_id` (uuid, référence à orders)
      - `product_id` (uuid, référence à products)
      - `quantity` (integer, quantité commandée)
      - `unit_price` (integer, prix unitaire en centimes)
      - `created_at` (timestamp avec fuseau horaire)

  2. Sécurité
    - Activation de RLS sur les deux tables
    - Politiques pour permettre l'insertion publique
    - Politiques pour la lecture des commandes par leur propriétaire
*/

-- Table des commandes
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  total_amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Table des éléments de commande
CREATE TABLE order_items (
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
CREATE POLICY "Allow public insert"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow read own orders"
  ON orders
  FOR SELECT
  TO public
  USING (customer_email = current_user);

-- Politiques pour order_items
CREATE POLICY "Allow public insert items"
  ON order_items
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow read own order items"
  ON order_items
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_email = current_user
    )
  );