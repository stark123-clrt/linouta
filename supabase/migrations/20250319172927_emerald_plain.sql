/*
  # Configuration du bucket products pour le stockage d'images

  1. Modifications
    - Configuration du bucket comme public
    - Définition de la taille limite des fichiers
    - Restriction des types MIME autorisés
*/

-- Configuration du bucket products
UPDATE storage.buckets
SET public = true,
    file_size_limit = 5242880, -- 5MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'products';

-- Mise à jour des paramètres de sécurité pour autoriser le CORS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;