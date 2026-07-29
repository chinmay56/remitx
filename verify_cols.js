require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await sb.from('users').select('email, is_verified, verification_token').limit(1);
  if (error) { console.log('ERROR:', error.message); return; }
  console.log('Users cols OK');
  const { data: d2, error: e2 } = await sb.from('transactions').select('confirmation_token, confirmation_status').limit(1);
  if (e2) { console.log('TX ERROR:', e2.message); return; }
  console.log('Transactions cols OK');
}
run();
