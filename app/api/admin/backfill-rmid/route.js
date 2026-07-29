import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function generateRmId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'RM';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function POST() {
  try {
    // Fetch users without rm_id
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .is('rm_id', null);

    if (error) throw error;

    let updated = 0;
    for (const user of users) {
      let rmId;
      let unique = false;
      // Ensure uniqueness
      while (!unique) {
        rmId = generateRmId();
        const { data: existing } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('rm_id', rmId)
          .single();
        if (!existing) unique = true;
      }
      await supabaseAdmin.from('users').update({ rm_id: rmId }).eq('id', user.id);
      updated++;
    }

    return NextResponse.json({ message: `Backfilled ${updated} users with RM IDs` });
  } catch (error) {
    console.error('Backfill error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
