const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

// IMPORTANT: this file is required at module-load time (via authRoutes.js,
// which server.js imports unconditionally). createClient() throws
// synchronously if the URL is missing, which used to take the ENTIRE app
// down on every single request - including static pages - whenever
// SUPABASE_URL/SUPABASE_KEY weren't set (e.g. not yet configured in
// Vercel's Project Settings -> Environment Variables). Guard it instead so
// a missing config only breaks the specific Supabase-backed routes that
// need it, not the whole server.
let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Kulang ang SUPABASE_URL o SUPABASE_KEY sa iyong .env file! ' +
    '(On Vercel: set these in Project Settings -> Environment Variables, not .env.)'
  );
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.error('Failed to create Supabase client:', err.message);
  }
}

module.exports = supabase;