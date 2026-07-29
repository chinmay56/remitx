require('dotenv').config({path: '.env.local'});

async function run() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const sql = `
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_token TEXT;
    ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS confirmation_token TEXT;
    ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS confirmation_status TEXT DEFAULT 'none';
  `;
  
  // Use the Supabase SQL endpoint  
  const res = await fetch(`${url}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({})
  });
  
  // Alternative: use the pg endpoint if available
  // Try via the management API
  console.log('Attempting via Supabase management...');
  
  // Actually, let's use the PostgREST schema cache workaround
  // We can create a function that does ALTER TABLE
  const createFn = await fetch(`${url}/rest/v1/rpc/`, {
    method: 'POST', 
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    }
  });
  console.log('Status:', createFn.status);
  
  // Let's try the direct approach via Supabase's built-in SQL support
  // Use the /pg endpoint  
  const pgRes = await fetch(`${url}/pg`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  console.log('PG Status:', pgRes.status);
  const pgData = await pgRes.text();
  console.log('PG Response:', pgData.substring(0, 200));
}
run().catch(console.error);
