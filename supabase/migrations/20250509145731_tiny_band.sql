/*
  # Create orders table and storage bucket

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `total_amount` (numeric)
      - `payment_method` (text)
      - `bolt_tracking_id` (text)
      - `proof_path` (text)
      - `items` (jsonb)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `orders` table
    - Add policy for authenticated users to insert their own orders
    - Add policy for authenticated users to read their own orders
    - Create a private storage bucket for payment proofs
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  total_amount numeric NOT NULL,
  payment_method text NOT NULL,
  bolt_tracking_id text NOT NULL,
  proof_path text,
  items jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own orders
CREATE POLICY "Users can insert their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to read their own orders
CREATE POLICY "Users can read their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a private storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('proofs', 'proofs', false);

-- Create policy to allow authenticated users to upload files to the proofs bucket
CREATE POLICY "Allow authenticated users to upload payment proofs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'proofs' AND
    (storage.foldername(name))[1] = 'payment_proofs' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Create policy to allow users to read their own proofs
CREATE POLICY "Allow users to read their own proofs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'proofs' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );