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
