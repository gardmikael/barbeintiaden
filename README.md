# Barbeintiaden

En webapplikasjon for å dele bilder og kommentarer fra det årlige Barbeintiaden-arrangementet.

## Funksjoner

- 📸 Offentlig bildegalleri - alle kan se bilder uten innlogging
- 🔐 Google OAuth-autentisering
- ✅ Brukergodkjenning - kun godkjente brukere kan laste opp bilder
- 💬 Kommentarer - alle innloggede brukere kan kommentere
- 🖼️ Bildekomprimering - automatisk komprimering til 500KB før opplasting
- 👨‍💼 Admin-panel - godkjenn nye brukere

## Teknologi

- **Next.js 16** (App Router)
- **NextAuth.js** (Google OAuth)
- **Supabase** (PostgreSQL + Storage)
- **Zod** (Validering)
- **browser-image-compression** (Bildekomprimering)
- **TypeScript**
- **Tailwind CSS**

## Oppsett

### 1. Installer avhengigheter

```bash
npm install
```

### 2. Opprett Supabase-prosjekt

1. Gå til [supabase.com](https://supabase.com) og opprett et nytt prosjekt
   - Logg inn eller opprett konto
   - Klikk "New Project"
   - Velg "Free" plan
   - Lag et sikkert database-passord (lagre det!)
2. Gå til "Project Settings" > "API" og kopier:
   - **Project URL**
   - **Publishable key** (ny terminologi) eller **anon public key** (gammel)
   - **Secret key** (ny terminologi) eller **service_role key** (gammel)
3. Gå til SQL Editor og kjør `supabase-setup.sql`-filen
4. Kjør deretter `supabase-migration-add-year.sql` for å legge til årstall-funksjonalitet
5. Gå til Storage og sjekk at "photos" bucket er opprettet

### 3. Konfigurer Google OAuth

1. Gå til [Google Cloud Console](https://console.cloud.google.com/)
2. Opprett et nytt prosjekt eller velg eksisterende
3. Aktiver Google+ API
4. Opprett OAuth 2.0 credentials
5. Legg til autoriserte redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for lokal utvikling)
   - `https://ditt-domene.com/api/auth/callback/google` (for produksjon)

### 4. Konfigurer miljøvariabler

Opprett en `.env.local` fil i rotmappen:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generer-en-tilfeldig-streng>

# Google OAuth
GOOGLE_CLIENT_ID=<fra-google-cloud-console>
GOOGLE_CLIENT_SECRET=<fra-google-cloud-console>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<din-project-url>
# Bruk "Publishable key" (ny terminologi) eller "anon public key" (gammel)
NEXT_PUBLIC_SUPABASE_ANON_KEY=<din-publishable-key-eller-anon-key>
# Bruk "Secret key" (ny terminologi) eller "service_role key" (gammel)
SUPABASE_SERVICE_ROLE_KEY=<din-secret-key-eller-service-role-key>
```

For å generere `NEXTAUTH_SECRET`, kan du kjøre:
```bash
openssl rand -base64 32
```

### 5. Opprett første admin-bruker

Etter at du har logget inn første gang, gå til Supabase dashboard og oppdater din bruker:

```sql
UPDATE users 
SET is_admin = true, approved = true 
WHERE email = 'din-email@example.com';
```

### 6. Start utviklingsserveren

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

## Database Schema

- **users**: Brukere med godkjenningsstatus og admin-rettigheter
- **photos**: Opplastede bilder med metadata
- **comments**: Kommentarer på bilder

Se `supabase-setup.sql` for fullstendig schema og Row Level Security policies.

## Bildekomprimering

Bilder komprimeres automatisk før opplasting:
- Maks dimensjoner: 1600x1600px
- Maks filstørrelse: 500KB
- Format: WebP (fallback til JPEG)
- Kvalitet: 70%

## Sikkerhet

- Row Level Security (RLS) på alle tabeller
- Kun godkjente brukere kan laste opp bilder
- Kun admin kan godkjenne brukere
- Alle kan se bilder og kommentarer (offentlig galleri)

## Deployment

Applikasjonen kan deployes til Vercel, Netlify eller andre Next.js-kompatible plattformer. Husk å sette alle miljøvariabler i deployment-miljøet.
