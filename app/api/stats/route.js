import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Total users
    const { count: userCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Total confirmed transactions
    const { count: txCount } = await supabaseAdmin
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed');

    // Total INR transferred
    const { data: txData } = await supabaseAdmin
      .from('transactions')
      .select('amount_inr')
      .eq('status', 'confirmed');

    const totalInr = txData?.reduce((sum, tx) => sum + parseFloat(tx.amount_inr || 0), 0) || 0;

    // Unique countries
    const { data: countryData } = await supabaseAdmin
      .from('users')
      .select('country')
      .not('country', 'is', null);

    const uniqueCountries = new Set(countryData?.map(u => u.country) || []).size;

    return NextResponse.json({
      users: userCount || 0,
      transactions: txCount || 0,
      totalInr: Math.round(totalInr),
      countries: uniqueCountries || 0,
    });
  } catch (error) {
    return NextResponse.json({ users: 0, transactions: 0, totalInr: 0, countries: 0 });
  }
}
