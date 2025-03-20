/*
  # Mise à jour des statuts de réservation

  1. Modifications
    - Ajout d'une contrainte CHECK pour limiter les valeurs possibles du statut
    - Seuls les statuts 'pending' et 'confirmed' sont autorisés
    - Mise à jour des réservations existantes pour respecter ces valeurs

  2. Sécurité
    - Garantit que seuls les statuts valides peuvent être utilisés
    - Empêche l'insertion de valeurs non autorisées
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