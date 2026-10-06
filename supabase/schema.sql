-- ====================================================================
-- BUTUAN CITY COMPLAINTS MANAGEMENT SYSTEM
-- PostgreSQL Database Schema for Supabase
-- Project: tmjyxsiwuojgsiqjtpql (butuan-city-complaints)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('ADMIN', 'CLERK', 'STAFF', 'CLIENT')),
  contact_number TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  department TEXT,
  assigned_barangay TEXT,
  notification_email BOOLEAN DEFAULT true,
  notification_sms BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. BARANGAYS TABLE (86 Official Butuan Barangays)
CREATE TABLE IF NOT EXISTS public.barangays (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. COMPLAINT CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.complaint_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. COMPLAINANTS TABLE
CREATE TABLE IF NOT EXISTS public.complainants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  full_name TEXT,
  contact_number TEXT,
  email TEXT,
  address TEXT,
  barangay_id TEXT REFERENCES public.barangays(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  barangay_id TEXT REFERENCES public.barangays(id) ON DELETE RESTRICT,
  barangay_name TEXT,
  purok_zone TEXT,
  street TEXT,
  landmark TEXT,
  location_description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  complaint_number TEXT NOT NULL UNIQUE,
  complainant_id TEXT REFERENCES public.complainants(id) ON DELETE SET NULL,
  category_id TEXT REFERENCES public.complaint_categories(id) ON DELETE RESTRICT,
  location_id TEXT REFERENCES public.locations(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed')),
  photo_path TEXT,
  created_by TEXT,
  assigned_to TEXT,
  date_reported TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  date_resolved TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. COMPLAINT ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.complaint_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  assigned_to TEXT NOT NULL,
  assigned_by TEXT,
  assignment_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  instructions TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. COMPLAINT STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.complaint_status_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL CHECK (new_status IN ('Pending', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed')),
  changed_by TEXT,
  changed_by_name TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. ACTION RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.action_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  action_taken TEXT NOT NULL,
  remarks TEXT,
  action_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  user_id TEXT,
  user_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. INDEXES
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category_id);
CREATE INDEX IF NOT EXISTS idx_complaints_location ON public.complaints(location_id);
CREATE INDEX IF NOT EXISTS idx_complaints_date_reported ON public.complaints(date_reported);

-- 11. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complainants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_records ENABLE ROW LEVEL SECURITY;

-- Public / Anonymous & Authenticated Permissions
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public read barangays" ON public.barangays FOR SELECT USING (true);
CREATE POLICY "Allow public insert barangays" ON public.barangays FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read categories" ON public.complaint_categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert categories" ON public.complaint_categories FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read complainants" ON public.complainants FOR SELECT USING (true);
CREATE POLICY "Allow public insert complainants" ON public.complainants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update complainants" ON public.complainants FOR UPDATE USING (true);

CREATE POLICY "Allow public read locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Allow public insert locations" ON public.locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update locations" ON public.locations FOR UPDATE USING (true);

CREATE POLICY "Allow public read complaints" ON public.complaints FOR SELECT USING (true);
CREATE POLICY "Allow public insert complaints" ON public.complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update complaints" ON public.complaints FOR UPDATE USING (true);
CREATE POLICY "Allow public delete complaints" ON public.complaints FOR DELETE USING (true);

CREATE POLICY "Allow public read assignments" ON public.complaint_assignments FOR SELECT USING (true);
CREATE POLICY "Allow public insert assignments" ON public.complaint_assignments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read status history" ON public.complaint_status_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert status history" ON public.complaint_status_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read action records" ON public.action_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert action records" ON public.action_records FOR INSERT WITH CHECK (true);
