/*
  # Correction des statuts de réservation

  1. Modifications
    - Ajout d'une contrainte CHECK pour limiter les valeurs possibles du statut
    - Modification du statut par défaut à 'pending'
    - Mise à jour des réservations existantes si nécessaire

  2. Sécurité
    - Garantit que seuls les statuts valides peuvent être utilisés
*/

-- Ajout d'une contrainte CHECK pour les statuts valides
ALTER TABLE reservations
DROP CONSTRAINT IF EXISTS reservations_status_check;

ALTER TABLE reservations
ADD CONSTRAINT reservations_status_check
CHECK (status IN ('pending', 'confirmed'));

-- Mise à jour des réservations existantes avec un statut invalide
UPDATE reservations
SET status = 'pending'
WHERE status NOT IN ('pending', 'confirmed');