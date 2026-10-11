
-- ==========================================
-- Migration: 20260731000000_init_schema.sql
-- ==========================================

-- ============================================================
-- IEEE IAS SLIIT - Website schema
-- Contact form, newsletter, events, gallery, member wall, admin auth
-- ============================================================

-- 1. Admin profiles (extends auth.users)
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL CHECK (length(trim(full_name)) > 0),
  role       TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Contact form submissions (contains PII - public can INSERT, only admins can SELECT)
CREATE TABLE public.contact_submissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL CHECK (length(trim(name)) > 0),
  email      TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  subject    TEXT,
  message    TEXT NOT NULL CHECK (length(trim(message)) > 0),
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can read contact messages" ON public.contact_submissions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Only admins can update contact messages" ON public.contact_submissions
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. Newsletter subscribers (email capture - public INSERT only, admin-read)
CREATE TABLE public.newsletter_subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view subscriber list" ON public.newsletter_subscribers
  FOR SELECT USING (public.is_admin());

-- 4. Newsletter issues (published editions - public read, admin write)
CREATE TABLE public.newsletter_issues (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description  TEXT,
  cover_image_url TEXT,
  file_url     TEXT NOT NULL,
  published_at DATE NOT NULL DEFAULT current_date,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view newsletter issues" ON public.newsletter_issues
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage newsletter issues" ON public.newsletter_issues
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Events (ongoing/past - public read, admin write)
CREATE TABLE public.events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT,
  event_type  TEXT NOT NULL DEFAULT 'workshop' CHECK (event_type IN ('workshop', 'industrial_visit', 'seminar', 'competition', 'social', 'other')),
  image_url   TEXT,
  event_date  DATE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Gallery images (public read, admin write)
CREATE TABLE public.gallery_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url  TEXT NOT NULL,
  caption    TEXT,
  event_id   UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view gallery" ON public.gallery_images
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage gallery" ON public.gallery_images
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. Member wall (registered members + volunteer recognition - public read, admin write)
CREATE TABLE public.member_wall (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name          TEXT NOT NULL CHECK (length(trim(full_name)) > 0),
  photo_url          TEXT,
  role_title         TEXT,
  contribution_note  TEXT,
  is_top_volunteer   BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.member_wall ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view member wall" ON public.member_wall
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage member wall" ON public.member_wall
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ==========================================
-- Migration: 20260808235900_add_gallery_photographer.sql
-- ==========================================

-- Add photographer credit field to gallery images, matching the
-- cs.ieeesliit.com gallery reference pattern ("Photographer: Name" overlay).
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS photographer TEXT;


-- ==========================================
-- Migration: 20260809000000_mock_seed_data.sql
-- ==========================================

-- ============================================================
-- IEEE IAS SLIIT - Mock seed data
-- Placeholder content so the site isn't empty during development/demo.
-- Replace every row here with real content before launch - image URLs
-- point to Unsplash placeholders, not real IAS photos.
-- ============================================================

-- 1. Events (mix of upcoming + completed, different types)
INSERT INTO public.events (title, description, event_type, image_url, event_date, status) VALUES
  ('Industrial Automation Bootcamp', 'A hands-on workshop covering PLC programming, SCADA systems, and basic industrial automation practices for undergraduates.', 'workshop', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop', '2026-09-15', 'upcoming'),
  ('Power Grid Site Visit - CEB Substation', 'An exclusive tour of a Ceylon Electricity Board substation, exploring real-world power distribution and grid management.', 'industrial_visit', 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1200&auto=format&fit=crop', '2026-09-28', 'upcoming'),
  ('IAS Annual General Meeting 2026', 'Chapter-wide meeting to review the year''s activities and elect the incoming executive committee.', 'seminar', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop', '2026-10-10', 'upcoming'),
  ('Robotics & Automation Challenge', 'An inter-university robotics competition testing automated navigation and object-handling systems.', 'competition', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop', '2026-06-20', 'completed'),
  ('Welcome Social - New Members Meetup', 'A casual meetup to welcome new IAS members and introduce them to the chapter''s activities.', 'social', 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop', '2026-05-05', 'completed'),
  ('Introduction to Renewable Energy Systems', 'A technical seminar on solar and wind energy integration into industrial power systems, led by an industry professional.', 'seminar', 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1200&auto=format&fit=crop', '2026-04-12', 'completed');

-- 2. Gallery images (event photos)
INSERT INTO public.gallery_images (image_url, caption, photographer) VALUES
  ('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop', 'Robotics Challenge - final round', 'Kavindu Perera'),
  ('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop', 'Automation Bootcamp - PLC session', 'Dulan Wijesinghe'),
  ('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=800&auto=format&fit=crop', 'AGM 2026 - committee address', 'Dulan Wijesinghe'),
  ('https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop', 'Site visit - substation walkthrough', 'Ishara Fernando'),
  ('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop', 'Welcome Social - new member mixer', 'Kavindu Perera'),
  ('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop', 'Renewable Energy seminar - Q&A', 'Dulan Wijesinghe'),
  ('https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop', 'Robotics Challenge - team briefing', 'Kavindu Perera'),
  ('https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?q=80&w=800&auto=format&fit=crop', 'Automation Bootcamp - group photo', 'Dulan Wijesinghe');

-- 3. Newsletter issues
INSERT INTO public.newsletter_issues (title, description, cover_image_url, file_url, published_at) VALUES
  ('IAS Quarterly - Issue 04', 'Highlights from the Industrial Automation Bootcamp, our latest site visit, and upcoming events for the term.', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=800&auto=format&fit=crop', '/magazine/magazine.pdf', '2026-07-01'),
  ('IAS Quarterly - Issue 03', 'A recap of the Robotics & Automation Challenge and interviews with our top volunteers.', 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=800&auto=format&fit=crop', '/magazine/magazine.pdf', '2026-04-01');

-- 4. Member wall (mock registered members + volunteer recognition)
INSERT INTO public.member_wall (full_name, role_title, contribution_note, photo_url, is_top_volunteer) VALUES
  ('Kavindu Perera', 'IEEE Student Member', 'Led logistics for the Robotics & Automation Challenge.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop', true),
  ('Ishara Fernando', 'IEEE Student Member', 'Coordinated the industrial site visit program for two consecutive terms.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop', true),
  ('Dulan Wijesinghe', 'IEEE Student Member', 'Volunteer photographer for all chapter events in 2026.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop', true),
  ('Thanuja Gunasekara', 'IEEE Student Member', NULL, NULL, false),
  ('Ravindi Silva', 'IEEE Student Member', NULL, NULL, false),
  ('Chamath Ranasinghe', 'IEEE Student Member', NULL, NULL, false);


-- ==========================================
-- Migration: 20260809010000_member_system.sql
-- ==========================================

-- ============================================================
-- Member registration/approval system + News items
-- Mirrors the CS site's register → pending → admin-activate flow
-- ============================================================

-- 1. Member registrations (public self-registered members - NOT admins)
CREATE TABLE public.member_registrations (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL CHECK (length(trim(full_name)) > 0),
  email      TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'activated', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.member_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their own registration" ON public.member_registrations
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all registrations" ON public.member_registrations
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update registration status" ON public.member_registrations
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Redefine the signup trigger to branch by account type, so that public
-- member self-registration no longer falls into the admin `profiles` table
-- (the original trigger inserted every new auth.users row into `profiles`,
-- which would have silently granted admin rights to every registering member).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'account_type' = 'member' THEN
    INSERT INTO public.member_registrations (id, full_name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Member'), NEW.email);
  ELSE
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin'));
  END IF;
  RETURN NEW;
END;
$$;

-- 2. News items (announcements distinct from events - public read, admin write)
CREATE TABLE public.news_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description  TEXT,
  image_url    TEXT,
  published_at DATE NOT NULL DEFAULT current_date,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view news items" ON public.news_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage news items" ON public.news_items
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ==========================================
-- Migration: 20260809020000_mock_news_seed.sql
-- ==========================================

-- ============================================================
-- Mock seed data for news_items - placeholder content, replace before launch.
-- ============================================================

INSERT INTO public.news_items (title, description, image_url, published_at) VALUES
  ('Official IAS Merchandise Pack', 'IEEE IAS SLIIT is launching an official merchandise pack to raise funds for upcoming chapter events. Available for purchase by all members.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop', '2026-08-01'),
  ('IAS SLIIT Recognized as Outstanding Student Branch Chapter', 'Our chapter was recognized by the IEEE Sri Lanka Section for outstanding activity and member engagement over the past year.', 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop', '2026-06-15');


-- ==========================================
-- Migration: 20260810000000_security_hardening.sql
-- ==========================================

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


-- ==========================================
-- Migration: 20260810010000_newsletter_articles.sql
-- ==========================================

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


-- ==========================================
-- Migration: 20260810020000_repair_seed_encoding.sql
-- ==========================================

-- ============================================================
-- Repair mojibake in seeded content.
--
-- The seed SQL was pasted through the Windows clipboard, which re-read the
-- UTF-8 bytes of an em dash (E2 80 94) as CP437, storing the three characters
-- GAMMA + C-cedilla + o-umlaut instead. Written with chr() so this file stays
-- pure ASCII and cannot be corrupted the same way.
-- ============================================================

DO $$
DECLARE
  bad TEXT := chr(915) || chr(199) || chr(246);  -- the CP437 mojibake sequence
BEGIN
  UPDATE public.newsletter_issues SET title = replace(title, bad, '-') WHERE title LIKE '%' || bad || '%';
  UPDATE public.newsletter_issues SET description = replace(description, bad, '-') WHERE description LIKE '%' || bad || '%';
  UPDATE public.events SET title = replace(title, bad, '-') WHERE title LIKE '%' || bad || '%';
  UPDATE public.events SET description = replace(description, bad, '-') WHERE description LIKE '%' || bad || '%';
  UPDATE public.news_items SET title = replace(title, bad, '-') WHERE title LIKE '%' || bad || '%';
  UPDATE public.news_items SET description = replace(description, bad, '-') WHERE description LIKE '%' || bad || '%';
  UPDATE public.gallery_images SET caption = replace(caption, bad, '-') WHERE caption LIKE '%' || bad || '%';
  UPDATE public.member_wall SET role_title = replace(role_title, bad, '-') WHERE role_title LIKE '%' || bad || '%';
  UPDATE public.member_wall SET contribution_note = replace(contribution_note, bad, '-') WHERE contribution_note LIKE '%' || bad || '%';
END $$;

