/*
  # Simplification de l'accès admin

  1. Modifications
    - Suppression des anciennes politiques restrictives
    - Ajout de nouvelles politiques permettant l'accès public
    - Suppression de la vérification d'authentification

  2. Sécurité
    - Accès public temporaire pour la table admins
    - Accès public aux produits pour toutes les opérations
*/

-- Suppression des anciennes politiques restrictives
DROP POLICY IF EXISTS "Allow admin access" ON admins;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Nouvelles politiques pour un accès public
CREATE POLICY "Allow public access to admins"
ON admins FOR ALL
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public access to products"
ON products FOR ALL
TO public
USING (true)
WITH CHECK (true);