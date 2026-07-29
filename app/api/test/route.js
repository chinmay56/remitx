import { NextResponse } from 'next/server';

export async function GET() {
  const results = {
    coingecko: { status: 'testing', data: null, error: null },
    googleMaps: { status: 'testing', data: null, error: null },
  };

  // Test CoinGecko API
  try {
    const coinGeckoResponse = await fetch(
      `${process.env.COINGECKO_API_URL}/simple/price?ids=polygon-ecosystem-token&vs_currencies=inr,usd,aed,sgd`,
      {
        headers: {
          'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
        }
      }
    );
    const coinGeckoData = await coinGeckoResponse.json();
    
    if (coinGeckoResponse.ok) {
      results.coingecko.status = 'success';
      results.coingecko.data = coinGeckoData;
    } else {
      results.coingecko.status = 'failed';
      results.coingecko.error = coinGeckoData;
    }
  } catch (error) {
    results.coingecko.status = 'error';
    results.coingecko.error = error.message;
  }

  // Test Google Maps API
  try {
    const googleMapsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=28.6139,77.2090&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    const googleMapsData = await googleMapsResponse.json();
    
    if (googleMapsResponse.ok && googleMapsData.status === 'OK') {
      results.googleMaps.status = 'success';
      results.googleMaps.data = {
        location: googleMapsData.results[0]?.formatted_address,
        country: googleMapsData.results[0]?.address_components?.find(
          c => c.types.includes('country')
        )?.long_name
      };
    } else {
      results.googleMaps.status = 'failed';
      results.googleMaps.error = googleMapsData;
    }
  } catch (error) {
    results.googleMaps.status = 'error';
    results.googleMaps.error = error.message;
  }

  return NextResponse.json(results);
}
