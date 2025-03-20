/*
  # Mise à jour des quantités minimales des produits

  1. Modifications
    - Mise à jour de la quantité minimum à 1 pour tous les produits
    - Ajustement des prix pour refléter le prix à l'unité

  2. Changements
    - Modification des prix existants pour correspondre au prix unitaire
    - Mise à jour de minimum_quantity à 1 pour tous les produits
*/

-- Mise à jour des produits existants
UPDATE products 
SET 
  price = CASE 
    WHEN name = 'Cornes de Gazelle' THEN 2
    WHEN name = 'Briouates aux Amandes' THEN 2
    WHEN name = 'Ghriba' THEN 1
    WHEN name = 'Fekkas aux Amandes' THEN 1
  END,
  minimum_quantity = 1;