/*
  # Création d'une vue détaillée des commandes

  1. Nouvelle Vue
    - `order_details_view`
      - Combine les informations des tables `orders`, `order_items` et `products`
      - Affiche tous les détails pertinents de chaque commande

  2. Sécurité
    - La vue hérite des politiques de sécurité des tables sous-jacentes
*/

-- Création de la vue détaillée des commandes
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