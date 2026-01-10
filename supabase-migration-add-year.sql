-- Legg til year kolonne i photos tabellen
ALTER TABLE photos ADD COLUMN IF NOT EXISTS year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW());

-- Opprett indeks for year for bedre ytelse
CREATE INDEX IF NOT EXISTS idx_photos_year ON photos(year DESC);
