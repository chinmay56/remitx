import { NextResponse } from 'next/server';
import { getExchangeRate, getCurrencySymbol } from '@/lib/forex';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from')?.toUpperCase();
  const to = searchParams.get('to')?.toUpperCase();

  if (!from || !to) {
    return NextResponse.json({ error: 'from and to query params required' }, { status: 400 });
  }

  try {
    const rate = await getExchangeRate(from, to);
    return NextResponse.json({
      rate,
      from,
      to,
      fromSymbol: getCurrencySymbol(from),
      toSymbol: getCurrencySymbol(to),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rate' }, { status: 500 });
  }
}
