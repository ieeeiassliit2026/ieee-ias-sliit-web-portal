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
