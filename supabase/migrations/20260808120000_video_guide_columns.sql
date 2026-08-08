-- Video Guide: add a guide-type discriminator and the video payload columns to
-- the locations table.
--
-- `type` defaults to 'photo', so Postgres fills every existing row with 'photo'
-- automatically — existing guides are unaffected and there is no separate
-- backfill. `video_url`, `manifest`, and `video_version` stay null until a video
-- guide is populated manually via Supabase.
--
-- No other table is touched. The existing "Public can view published
-- non-archived locations" SELECT policy already covers these new columns, so no
-- RLS change is required.
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'photo';
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS manifest jsonb;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS video_version text;
