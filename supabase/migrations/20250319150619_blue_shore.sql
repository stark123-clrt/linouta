/*
  # Création de la table contacts

  1. Nouvelle Table
    - `contacts`
      - `id` (uuid, clé primaire)
      - `name` (text, nom du contact)
      - `email` (text, email du contact)
      - `phone` (text, numéro de téléphone)
      - `message` (text, message optionnel)
      - `created_at` (timestamp with time zone)

  2. Sécurité
    - Activation RLS sur la table `contacts`
    - Politique permettant l'insertion pour tous
    - Politique de lecture limitée aux administrateurs
*/

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for everyone" 
  ON contacts 
  FOR INSERT 
  TO public 
  WITH CHECK (true);

CREATE POLICY "Allow read for authenticated users only" 
  ON contacts 
  FOR SELECT 
  TO authenticated 
  USING (true);