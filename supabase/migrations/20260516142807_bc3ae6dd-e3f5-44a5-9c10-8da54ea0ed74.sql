CREATE TABLE public.page_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('page_opened','arrival_confirmed','checkpoint_viewed','completed')),
  checkpoint_index integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_events_location_created ON public.page_events(location_id, created_at DESC);

ALTER TABLE public.page_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page events"
ON public.page_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.locations l
    WHERE l.id = page_events.location_id
      AND l.published = true
      AND l.archived = false
  )
);

CREATE POLICY "Owners view own location events"
ON public.page_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.locations l
    WHERE l.id = page_events.location_id
      AND l.owner_id = auth.uid()
  )
);