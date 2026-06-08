-- ============================================
-- FITNESS CLASS BOOKING SYSTEM — SUPABASE SCHEMA
-- ============================================

-- 1. SERVICES
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 60,
  price numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. APPOINTMENTS
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  service_id uuid NOT NULL REFERENCES services(id),
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. BUSINESS HOURS
CREATE TABLE business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday integer NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  is_open boolean NOT NULL DEFAULT true,
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '18:00'
);

-- 4. BLOCKED DATES
CREATE TABLE blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date date NOT NULL,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. BUSINESS SETTINGS
CREATE TABLE business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL DEFAULT '',
  business_email text NOT NULL DEFAULT '',
  business_phone text NOT NULL DEFAULT '',
  business_address text NOT NULL DEFAULT '',
  slot_interval_minutes integer NOT NULL DEFAULT 60,
  booking_notice_hours integer NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. ADMIN USERS
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
$$;

-- SERVICES: public can read active, admin full access
CREATE POLICY "public_select_active" ON services
  FOR SELECT USING (is_active = true);
CREATE POLICY "admin_all" ON services
  FOR ALL USING (is_admin());

-- APPOINTMENTS: public can insert, admin full access
CREATE POLICY "public_insert" ON appointments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_all" ON appointments
  FOR ALL USING (is_admin());

-- BUSINESS HOURS: public can read, admin full access
CREATE POLICY "public_select" ON business_hours
  FOR SELECT USING (true);
CREATE POLICY "admin_all" ON business_hours
  FOR ALL USING (is_admin());

-- BLOCKED DATES: public can read, admin full access
CREATE POLICY "public_select" ON blocked_dates
  FOR SELECT USING (true);
CREATE POLICY "admin_all" ON blocked_dates
  FOR ALL USING (is_admin());

-- BUSINESS SETTINGS: public can read, admin full access
CREATE POLICY "public_select" ON business_settings
  FOR SELECT USING (true);
CREATE POLICY "admin_all" ON business_settings
  FOR ALL USING (is_admin());

-- ADMIN USERS: only admins can read
CREATE POLICY "admin_select" ON admin_users
  FOR SELECT USING (is_admin());

-- ============================================
-- SEED DATA
-- ============================================

-- Business settings
INSERT INTO business_settings (business_name, business_email, business_phone, business_address, slot_interval_minutes, booking_notice_hours)
VALUES ('ONE: Personal Training', 'hello@onepersonaltraining.co.uk', '+44 7740 461947', '56 South Audley Street, Mayfair, London W1K 2QT', 60, 2);

-- Business hours (0=Monday ... 6=Sunday)
INSERT INTO business_hours (weekday, is_open, start_time, end_time) VALUES
  (0, true, '06:00', '21:00'),
  (1, true, '06:00', '21:00'),
  (2, true, '06:00', '21:00'),
  (3, true, '06:00', '21:00'),
  (4, true, '06:00', '21:00'),
  (5, true, '07:00', '17:00'),
  (6, true, '08:00', '17:00');

-- Services
INSERT INTO services (name, description, duration_minutes, price, is_active) VALUES
  ('Personal Training', 'One-on-one sessions tailored to your goals, fitness level, and schedule. Our expert coaches design every rep, set, and rest period.', 60, 85.00, true),
  ('Rehab & Recovery', 'Guided recovery sessions combining soft tissue work, mobility drills, and corrective exercise to keep you moving pain-free.', 60, 75.00, true),
  ('Boxing', 'High-intensity pad work and bag drills that build cardiovascular endurance, coordination, and explosive power.', 60, 70.00, true),
  ('Mat Pilates', 'Core-focused mat work improving posture, flexibility, and muscular control. Suitable for all levels.', 50, 65.00, true),
  ('Yoga & Mobility', 'Flowing sequences combining breath, movement, and mobility work to improve flexibility and mental clarity.', 60, 60.00, true),
  ('HIIT & Conditioning', 'High-energy interval training designed to maximise calorie burn, build stamina, and improve metabolic fitness.', 45, 55.00, true);

-- To add an admin:
-- 1. Create a user in Supabase Auth (Authentication > Add User)
-- 2. Get the user's ID
-- 3. INSERT INTO admin_users (user_id) VALUES ('<user-id>');
