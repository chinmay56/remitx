require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Test if columns already exist by selecting them
  const { data, error } = await sb.from('users').select('email, is_verified, verification_token').limit(1);
  if (!error) {
    console.log('Columns already exist:', Object.keys(data[0] || {}));
    return;
  }
  console.log('Columns missing, need to add via SQL. Error:', error.message);
  
  // Try using RPC to run SQL (if enabled)
  const { error: rpcErr } = await sb.rpc('exec_sql', {
    query: `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT;
    `
  });
  if (rpcErr) {
    console.log('RPC not available. Please run this SQL in Supabase Dashboard > SQL Editor:');
    console.log(`
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_token TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS confirmation_token TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS confirmation_status TEXT DEFAULT 'none';
    `);
  } else {
    console.log('Columns added successfully!');
  }
}
run();
