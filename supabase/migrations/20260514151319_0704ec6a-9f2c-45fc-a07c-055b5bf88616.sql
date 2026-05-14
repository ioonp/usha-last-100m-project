ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS street_arrival_photo_url text,
  ADD COLUMN IF NOT EXISTS street_arrival_caption text;