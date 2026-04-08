
  # Premium Portfolio Website Design

  This is a code bundle for Premium Portfolio Website Design. The original project is available at https://www.figma.com/design/jdHngYykCM1vRXXkvtRGX6/Premium-Portfolio-Website-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  Run `npm run dev:server` in a second terminal to start the backend API for
  remote portfolio content.

  ## Remote admin setup

  The homepage and admin now read/write a shared portfolio document from
  MongoDB, while admin authentication uses Supabase.

  Copy `.env.example` to `.env` and fill in:

  - `MONGODB_URI`
  - `MONGODB_DB_NAME`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

  Then:

  1. Run `npm run dev:server`
  2. Run `npm run dev`
  3. Open `/admin` and sign in with a Supabase email/password account

  If MongoDB or Supabase is missing, the site still falls back to default
  content, but admin saves stay disabled until both are configured.
  
