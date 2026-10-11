-- Add photographer credit field to gallery images, matching the
-- cs.ieeesliit.com gallery reference pattern ("Photographer: Name" overlay).
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS photographer TEXT;
