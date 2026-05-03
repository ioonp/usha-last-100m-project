-- Lock down SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_location_view(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_location_view(TEXT) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Replace broad storage SELECT with one that prevents listing the bucket root
DROP POLICY IF EXISTS "Public read location-assets" ON storage.objects;
CREATE POLICY "Public read individual location-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'location-assets' AND name IS NOT NULL AND position('/' in name) > 0);