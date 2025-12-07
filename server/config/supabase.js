const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key not found. Make sure to set SUPABASE_URL and SUPABASE_KEY in your .env file if you intend to use Supabase for storage.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
