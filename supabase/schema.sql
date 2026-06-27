-- =====================================================
-- PRONÓSTICO: Colombia vs Portugal
-- Supabase Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: profiles
-- Stores user display names linked to auth users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: predictions
-- Stores match predictions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_slug TEXT NOT NULL DEFAULT 'colombia-vs-portugal-2026',
  colombia_score INTEGER NOT NULL CHECK (colombia_score >= 0 AND colombia_score <= 99),
  portugal_score INTEGER NOT NULL CHECK (portugal_score >= 0 AND portugal_score <= 99),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, match_slug)
);

-- =====================================================
-- TABLE: app_config
-- Stores app configuration (match info, deadline, branding)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_slug ON public.predictions(match_slug);

-- =====================================================
-- FUNCTION: Auto-create profile on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Usuario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNCTION: Update updated_at on predictions
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_prediction_updated ON public.predictions;
CREATE TRIGGER on_prediction_updated
  BEFORE UPDATE ON public.predictions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: profiles
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profile is created via trigger, but allow insert for safety
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- RLS POLICIES: predictions
-- =====================================================

-- Users can view their own prediction
CREATE POLICY "Users can view own prediction"
  ON public.predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own prediction
CREATE POLICY "Users can insert own prediction"
  ON public.predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own prediction
CREATE POLICY "Users can update own prediction"
  ON public.predictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: app_config
-- =====================================================

-- Anyone can read app config (public info)
CREATE POLICY "Anyone can read app config"
  ON public.app_config FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- ADMIN POLICIES (using app_metadata role)
-- =====================================================

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  );

-- Admin can view all predictions
CREATE POLICY "Admin can view all predictions"
  ON public.predictions FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  );

-- Admin can update app config
CREATE POLICY "Admin can update app config"
  ON public.app_config FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  )
  WITH CHECK (
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  );

-- =====================================================
-- GRANT ACCESS TO ROLES (Data API exposure)
-- =====================================================
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.predictions TO authenticated;
GRANT SELECT ON public.app_config TO authenticated;
GRANT ALL ON public.app_config TO service_role;

-- =====================================================
-- SEED: Default app configuration
-- =====================================================
INSERT INTO public.app_config (key, value) VALUES
  ('match_info', '{
    "title": "Colombia vs Portugal",
    "subtitle": "Último partido de grupos · Mundial FIFA 2026",
    "date": "28 de Junio, 2026",
    "time": "8:00 PM UTC",
    "venue": "Por confirmar",
    "slug": "colombia-vs-portugal-2026"
  }'::jsonb),
  ('deadline', '{
    "datetime": "2026-06-28T20:00:00Z",
    "label": "Cierra el 28 de Junio a las 8:00 PM UTC"
  }'::jsonb),
  ('branding', '{
    "colombia": {
      "primary": "#FCD116",
      "secondary": "#003893",
      "accent": "#CE1126"
    },
    "portugal": {
      "primary": "#006600",
      "secondary": "#FF0000",
      "accent": "#FFCC00"
    }
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
