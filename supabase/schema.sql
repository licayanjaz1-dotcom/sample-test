-- ====================================================================
-- BUTUAN CITY COMPLAINTS MANAGEMENT SYSTEM
-- PostgreSQL Database Schema & Row-Level Security Policies for Supabase
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS (OR CHECK CONSTRAINTS)
-- Roles: 'ADMIN', 'STAFF'
-- Priority: 'Low', 'Medium', 'High', 'Urgent'
-- Status: 'Pending', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed'

-- 3. PROFILES TABLE (Mirrors Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'STAFF' CHECK (role IN ('ADMIN', 'STAFF')),
  contact_number TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. BARANGAYS TABLE (Official Butuan City Barangays)
CREATE TABLE IF NOT EXISTS public.barangays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. COMPLAINT CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.complaint_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. COMPLAINANTS TABLE
CREATE TABLE IF NOT EXISTS public.complainants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  contact_number TEXT,
  email TEXT,
  address TEXT,
  barangay_id UUID REFERENCES public.barangays(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barangay_id UUID NOT NULL REFERENCES public.barangays(id) ON DELETE RESTRICT,
  purok_zone TEXT,
  street TEXT,
  landmark TEXT,
  location_description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_number TEXT NOT NULL UNIQUE,
  complainant_id UUID REFERENCES public.complainants(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES public.complaint_categories(id) ON DELETE RESTRICT,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed')),
  photo_path TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  date_reported TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  date_resolved TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. COMPLAINT ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.complaint_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assignment_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  instructions TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. COMPLAINT STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.complaint_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL CHECK (new_status IN ('Pending', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed')),
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. ACTION RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.action_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  action_taken TEXT NOT NULL,
  remarks TEXT,
  action_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category_id);
CREATE INDEX IF NOT EXISTS idx_complaints_location ON public.complaints(location_id);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON public.complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_complaints_date_reported ON public.complaints(date_reported);
CREATE INDEX IF NOT EXISTS idx_status_history_complaint ON public.complaint_status_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_assignments_complaint ON public.complaint_assignments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_action_records_complaint ON public.action_records(complaint_id);

-- 13. AUTO-UPDATE TRIGGER FOR complaints.updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_complaints_updated_at ON public.complaints;
CREATE TRIGGER trigger_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complainants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_records ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN' AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Authenticated users can view profiles; users can update own profile; admin can manage all
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin can manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- Barangays & Categories: Readable by public or authenticated; managed by Admin
CREATE POLICY "Barangays viewable by all" ON public.barangays FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Admin can manage barangays" ON public.barangays FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Categories viewable by all" ON public.complaint_categories FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Admin can manage categories" ON public.complaint_categories FOR ALL TO authenticated USING (public.is_admin());

-- Complaints, Complainants, Locations:
CREATE POLICY "Complaints viewable by authenticated" ON public.complaints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Complaints insertable by authenticated and anon" ON public.complaints FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Complaints updatable by authenticated" ON public.complaints FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin can delete complaints" ON public.complaints FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Locations viewable by authenticated" ON public.locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Locations insertable by authenticated and anon" ON public.locations FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Locations updatable by authenticated" ON public.locations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Complainants viewable by authenticated" ON public.complainants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Complainants insertable by authenticated and anon" ON public.complainants FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Complainants updatable by authenticated" ON public.complainants FOR UPDATE TO authenticated USING (true);

-- Assignments, Status History, Action Records
CREATE POLICY "Assignments viewable by authenticated" ON public.complaint_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Assignments insertable by authenticated" ON public.complaint_assignments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Status history viewable by authenticated" ON public.complaint_status_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Status history insertable by authenticated" ON public.complaint_status_history FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Action records viewable by authenticated" ON public.action_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Action records insertable by authenticated" ON public.action_records FOR INSERT TO authenticated WITH CHECK (true);

-- 15. STORAGE BUCKET FOR PHOTO EVIDENCE
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-evidence', 'complaint-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Evidence images are publicly accessible" ON storage.objects
FOR SELECT TO authenticated, anon USING (bucket_id = 'complaint-evidence');

CREATE POLICY "Authenticated users and citizens can upload evidence" ON storage.objects
FOR INSERT TO authenticated, anon WITH CHECK (bucket_id = 'complaint-evidence');
