-- ============================================================
-- Security hardening + schema/code reconciliation
--
-- 1. CRITICAL: handle_new_user() granted an admin `profiles` row to every
--    signup that did not send account_type='member'. Because the anon key
--    is public, anyone could call auth.signUp() without that metadata and
--    become an admin. Every self-signup is now a member; admins are only
--    ever created by hand (see "Creating an admin" at the bottom).
-- 2. News submissions by members are moderated at the DB level (RLS), not
--    just hidden in the UI.
-- 3. Columns/tables the frontend already uses but no migration created
--    (news_items.status, events.video_url, member_wall.linkedin_url/category,
--    magazine_editions).
-- 4. Input limits + URL scheme checks (blocks javascript: URLs in href/src).
-- ============================================================

-- ---------- 1. Signup trigger: never mint admins ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.member_registrations (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(left(trim(NEW.raw_user_meta_data->>'full_name'), 100), ''), 'Member'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ---------- 2. Active-member helper ----------
CREATE OR REPLACE FUNCTION public.is_active_member()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.member_registrations
    WHERE id = auth.uid() AND status = 'activated'
  );
$$;

-- ---------- 3. news_items moderation ----------
ALTER TABLE public.news_items
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid();

DROP POLICY IF EXISTS "Public can view news items" ON public.news_items;

CREATE POLICY "Public can view approved news" ON public.news_items
  FOR SELECT USING (status = 'approved');

-- Active members may submit articles, but only as pending and only as themselves.
CREATE POLICY "Active members can submit pending news" ON public.news_items
  FOR INSERT TO authenticated
  WITH CHECK (status = 'pending' AND submitted_by = auth.uid() AND public.is_active_member());

-- (existing "Admins can manage news items" FOR ALL policy still applies)

-- ---------- 4. Missing columns / table the frontend uses ----------
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE public.member_wall
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'member'
    CHECK (category IN ('member', 'executive', 'volunteer'));

CREATE TABLE IF NOT EXISTS public.magazine_editions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL CHECK (length(trim(title)) > 0),
  year            INTEGER NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  cover_image_url TEXT,
  file_url        TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.magazine_editions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view magazine editions" ON public.magazine_editions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage magazine editions" ON public.magazine_editions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- 5. Public-insert tables: pin status, cap sizes ----------
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_submissions;
CREATE POLICY "Anyone can submit a contact message" ON public.contact_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'new');

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (true);

ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_len CHECK (
    length(name) <= 100 AND length(email) <= 254
    AND length(coalesce(subject, '')) <= 200 AND length(message) <= 5000
  );

ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_email_len CHECK (length(email) <= 254);

ALTER TABLE public.news_items
  ADD CONSTRAINT news_len CHECK (length(title) <= 200 AND length(coalesce(description, '')) <= 10000);

-- ---------- 6. URL scheme checks (https://, http://, or site-relative /path) ----------
-- Stops `javascript:` / `data:` URLs reaching <a href> and <img src>.
ALTER TABLE public.events
  ADD CONSTRAINT events_url_chk CHECK (
    (image_url IS NULL OR image_url ~* '^(https?://|/[^/])')
    AND (video_url IS NULL OR video_url ~* '^https?://')
  );

ALTER TABLE public.gallery_images
  ADD CONSTRAINT gallery_url_chk CHECK (image_url ~* '^(https?://|/[^/])');

ALTER TABLE public.newsletter_issues
  ADD CONSTRAINT issues_url_chk CHECK (
    file_url ~* '^(https?://|/[^/])'
    AND (cover_image_url IS NULL OR cover_image_url ~* '^(https?://|/[^/])')
  );

ALTER TABLE public.member_wall
  ADD CONSTRAINT wall_url_chk CHECK (
    (photo_url IS NULL OR photo_url ~* '^(https?://|/[^/])')
    AND (linkedin_url IS NULL OR linkedin_url ~* '^https?://')
  );

ALTER TABLE public.news_items
  ADD CONSTRAINT news_url_chk CHECK (image_url IS NULL OR image_url ~* '^(https?://|/[^/])');

ALTER TABLE public.magazine_editions
  ADD CONSTRAINT magazine_url_chk CHECK (
    file_url ~* '^(https?://|/[^/])'
    AND (cover_image_url IS NULL OR cover_image_url ~* '^(https?://|/[^/])')
  );

-- ============================================================
-- Creating an admin (run manually in the SQL editor, never from the app):
--   1. Dashboard -> Authentication -> Users -> Add user (tick "Auto confirm").
--   2. Then:
--        INSERT INTO public.profiles (id, full_name)
--        SELECT id, 'Admin Name' FROM auth.users WHERE email = 'admin@example.com';
--        DELETE FROM public.member_registrations
--        WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
-- ============================================================
