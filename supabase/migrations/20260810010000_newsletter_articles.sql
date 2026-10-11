-- ============================================================
-- Newsletter module: author attribution for member-submitted articles
-- (news_items is the article table behind the Newsletter page).
-- ============================================================

ALTER TABLE public.news_items
  ADD COLUMN IF NOT EXISTS author_name  TEXT,
  ADD COLUMN IF NOT EXISTS author_title TEXT;

ALTER TABLE public.news_items
  ADD CONSTRAINT news_author_len CHECK (
    length(coalesce(author_name, '')) <= 100 AND length(coalesce(author_title, '')) <= 150
  );

-- Non-admin submissions always carry the submitter's registered name, so a
-- member cannot publish an article under someone else's name. The client only
-- supplies author_title (free text, e.g. "Intern at Mountain Solutions").
CREATE OR REPLACE FUNCTION public.set_news_author()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.author_name := (SELECT full_name FROM public.member_registrations WHERE id = auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_news_author() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER news_items_set_author
  BEFORE INSERT ON public.news_items
  FOR EACH ROW EXECUTE FUNCTION public.set_news_author();

-- Pagination/ordering support for the public list.
CREATE INDEX IF NOT EXISTS news_items_status_published_idx
  ON public.news_items (status, published_at DESC, created_at DESC);
