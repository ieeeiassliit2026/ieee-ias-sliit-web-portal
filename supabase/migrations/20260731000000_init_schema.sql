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
