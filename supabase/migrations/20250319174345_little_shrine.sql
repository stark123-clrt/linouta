/*
  # Mise à jour de la vue des réservations

  1. Modifications
    - Ajout des détails des produits dans la vue des réservations
    - Ajout du total par réservation
    - Amélioration de l'affichage des informations

  2. Changements
    - Suppression de l'ancienne vue
    - Création d'une nouvelle vue avec plus de détails
*/

DROP VIEW IF EXISTS reservation_details_view;

CREATE VIEW reservation_details_view AS
WITH reservation_totals AS (
  SELECT 
    reservation_id,
    string_agg(
      product_name || ' (x' || quantity || ' - ' || unit_price || '€)',
      ', '
    ) as products_summary,
    SUM(quantity * unit_price) as total_amount
  FROM (
    SELECT 
      ri.reservation_id,
      p.name as product_name,
      ri.quantity,
      ri.unit_price
    FROM 
      reservation_items ri
      JOIN products p ON ri.product_id = p.id
    ORDER BY 
      p.name
  ) subq
  GROUP BY 
    reservation_id
)
SELECT 
  r.id as reservation_id,
  r.customer_name,
  r.customer_email,
  r.customer_phone,
  r.message,
  r.status as reservation_status,
  r.created_at as reservation_date,
  COALESCE(rt.products_summary, 'Aucun produit') as products_summary,
  COALESCE(rt.total_amount, 0) as total_amount
FROM 
  reservations r
  LEFT JOIN reservation_totals rt ON r.id = rt.reservation_id
ORDER BY 
  r.created_at DESC;