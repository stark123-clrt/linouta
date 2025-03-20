/*
  # Création de la table des produits

  1. Nouvelle Table
    - `products`
      - `id` (uuid, clé primaire)
      - `name` (text, nom du produit)
      - `description` (text, description du produit)
      - `price` (integer, prix en euros)
      - `image` (text, URL de l'image)
      - `category` (text, catégorie du produit)
      - `minimum_quantity` (integer, quantité minimum de commande)
      - `created_at` (timestamp with time zone)

  2. Sécurité
    - Active RLS sur la table products
    - Ajoute une politique pour permettre la lecture publique
*/

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price integer NOT NULL,
  image text NOT NULL,
  category text NOT NULL,
  minimum_quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Activation de RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique
CREATE POLICY "Allow public read access"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Insertion des produits initiaux
INSERT INTO products (name, description, price, image, category, minimum_quantity) VALUES
  (
    'Cornes de Gazelle',
    'Délicieux croissants aux amandes et à la fleur d''oranger',
    25,
    'https://images.unsplash.com/photo-1593261890590-6862ba566751?auto=format&fit=crop&w=800',
    'Classiques',
    20
  ),
  (
    'Briouates aux Amandes',
    'Triangles feuilletés fourrés aux amandes et au miel',
    30,
    'https://images.unsplash.com/photo-1505253304499-671c55fb57fe?auto=format&fit=crop&w=800',
    'Classiques',
    25
  ),
  (
    'Ghriba',
    'Biscuits marocains moelleux aux amandes',
    20,
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800',
    'Biscuits',
    30
  ),
  (
    'Fekkas aux Amandes',
    'Croquants traditionnels aux amandes',
    22,
    'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=800',
    'Biscuits',
    25
  );