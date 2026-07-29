import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('rm_id')?.toUpperCase().trim();

  if (!query) {
    return NextResponse.json({ error: 'rm_id required' }, { status: 400 });
  }

  // Exact match
  if (query.length === 10) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, name, country, rm_id, country_code')
      .eq('rm_id', query)
      .single();
    if (user) return NextResponse.json({ users: [user] });
  }

  // Partial match — search by prefix/contains
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('id, name, country, rm_id, country_code')
    .ilike('rm_id', `%${query}%`)
    .limit(10);

  if (error) return NextResponse.json({ error: 'Search failed' }, { status: 500 });

  return NextResponse.json({ users: users || [] });
}
