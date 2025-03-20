/*
  # Création des politiques de stockage pour les images

  1. Création du bucket
    - Bucket 'products' pour stocker les images des produits
  
  2. Politiques de sécurité
    - Permettre l'upload public
    - Permettre la lecture publique
    - Permettre la suppression pour tous
*/

-- Création du bucket pour les images des produits
INSERT INTO storage.buckets (id, name)
VALUES ('products', 'products')
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre l'upload public
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'products');

-- Politique pour permettre la lecture publique
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Politique pour permettre la suppression
CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'products');