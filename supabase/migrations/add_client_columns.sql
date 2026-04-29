-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/wrjgjxltgpksjgifqszt/sql
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS middle_name TEXT,
  ADD COLUMN IF NOT EXISTS ssn TEXT,
  ADD COLUMN IF NOT EXISTS street_address TEXT,
  ADD COLUMN IF NOT EXISTS mobile_phone TEXT,
  ADD COLUMN IF NOT EXISTS home_phone TEXT,
  ADD COLUMN IF NOT EXISTS work_phone TEXT,
  ADD COLUMN IF NOT EXISTS assign_to TEXT,
  ADD COLUMN IF NOT EXISTS registration_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS client_portal_access BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS credit_card_number TEXT,
  ADD COLUMN IF NOT EXISTS cvv TEXT,
  ADD COLUMN IF NOT EXISTS expiration_date TEXT,
  ADD COLUMN IF NOT EXISTS credit_monitoring_username TEXT,
  ADD COLUMN IF NOT EXISTS credit_monitoring_password TEXT,
  ADD COLUMN IF NOT EXISTS credit_monitoring_ssn4 TEXT,
  ADD COLUMN IF NOT EXISTS credit_monitoring_provider TEXT;
