/*
  # Correction des politiques RLS pour les commandes

  1. Modifications
    - Suppression des anciennes politiques
    - Création de nouvelles politiques permettant l'accès public
    - Maintien de la sécurité de base avec RLS activé

  2. Changements
    - Permettre l'insertion publique sans authentification
    - Permettre la lecture publique des commandes
    - Simplification des politiques pour order_items
*/

-- Suppression des anciennes politiques
DROP POLICY IF EXISTS "Allow read own orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert" ON orders;
DROP POLICY IF EXISTS "Allow read own order items" ON order_items;
DROP POLICY IF EXISTS "Allow public insert items" ON order_items;

-- Nouvelles politiques pour orders
CREATE POLICY "Enable read access for all users"
ON orders FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access for all users"
ON orders FOR INSERT
TO public
WITH CHECK (true);

-- Nouvelles politiques pour order_items
CREATE POLICY "Enable read access for all users"
ON order_items FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access for all users"
ON order_items FOR INSERT
TO public
WITH CHECK (true);