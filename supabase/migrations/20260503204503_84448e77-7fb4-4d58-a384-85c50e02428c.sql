-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Locations
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  studio_name TEXT NOT NULL DEFAULT 'My Studio',
  logo_url TEXT,
  accent_color TEXT NOT NULL DEFAULT '#b45309',
  welcome_message TEXT NOT NULL DEFAULT 'Welcome! Follow the photos to find us.',
  start_lat DOUBLE PRECISION,
  start_lng DOUBLE PRECISION,
  start_note TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_locations_owner ON public.locations(owner_id);
CREATE INDEX idx_locations_slug ON public.locations(slug);

CREATE POLICY "Public can view published non-archived locations"
  ON public.locations FOR SELECT
  USING (published = true AND archived = false);
CREATE POLICY "Owners view all their locations"
  ON public.locations FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert own locations"
  ON public.locations FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own locations"
  ON public.locations FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete own locations"
  ON public.locations FOR DELETE USING (auth.uid() = owner_id);

-- Checkpoints
CREATE TABLE public.checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT NOT NULL,
  arrow_direction TEXT NOT NULL DEFAULT 'up',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_checkpoints_location ON public.checkpoints(location_id, position);

CREATE POLICY "Public can view checkpoints of published locations"
  ON public.checkpoints FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.published = true AND l.archived = false));
CREATE POLICY "Owners view own checkpoints"
  ON public.checkpoints FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.owner_id = auth.uid()));
CREATE POLICY "Owners insert own checkpoints"
  ON public.checkpoints FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.owner_id = auth.uid()));
CREATE POLICY "Owners update own checkpoints"
  ON public.checkpoints FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.owner_id = auth.uid()));
CREATE POLICY "Owners delete own checkpoints"
  ON public.checkpoints FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.owner_id = auth.uid()));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_locations_updated BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_checkpoints_updated BEFORE UPDATE ON public.checkpoints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- View count increment (public)
CREATE OR REPLACE FUNCTION public.increment_location_view(p_slug TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.locations SET view_count = view_count + 1
  WHERE slug = p_slug AND published = true AND archived = false;
END; $$;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('location-assets', 'location-assets', true);

CREATE POLICY "Public read location-assets" ON storage.objects FOR SELECT USING (bucket_id = 'location-assets');
CREATE POLICY "Authenticated upload to own folder" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'location-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own files" ON storage.objects FOR UPDATE
  USING (bucket_id = 'location-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own files" ON storage.objects FOR DELETE
  USING (bucket_id = 'location-assets' AND auth.uid()::text = (storage.foldername(name))[1]);