-- Opprett users tabell
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  approved BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opprett photos tabell
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opprett comments tabell
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opprett indekser for bedre ytelse
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_photo_id ON comments(photo_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_approved ON users(approved);

-- Row Level Security (RLS) Policies
-- MERK: Siden vi bruker NextAuth (ikke Supabase Auth), håndterer vi sikkerhet i applikasjonskoden
-- RLS er kun aktivert for SELECT for å tillate offentlig lesing

-- Aktiver RLS på alle tabeller
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Users policies
-- Alle kan lese users (for å vise navn/bilde)
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Photos policies
-- Alle kan lese photos
CREATE POLICY "Photos are viewable by everyone" ON photos
  FOR SELECT USING (true);

-- Comments policies
-- Alle kan lese comments
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

-- MERK: INSERT, UPDATE og DELETE håndteres i applikasjonskoden med NextAuth session-sjekk
-- Service role key brukes for å omgå RLS ved skriveoperasjoner

-- Opprett Storage bucket for bilder
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
-- Alle kan lese bilder
CREATE POLICY "Photos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

-- MERK: INSERT og DELETE håndteres i applikasjonskoden med NextAuth session-sjekk
-- Service role key brukes for å omgå RLS ved skriveoperasjoner
