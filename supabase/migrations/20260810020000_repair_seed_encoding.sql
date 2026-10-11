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
