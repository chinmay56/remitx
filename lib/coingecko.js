const COINGECKO_URL = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const COIN_ID = 'polygon-ecosystem-token';

const headers = COINGECKO_API_KEY ? { 'x-cg-demo-api-key': COINGECKO_API_KEY } : {};

export async function getMaticToInrRate() {
  try {
    const response = await fetch(
      `${COINGECKO_URL}/simple/price?ids=${COIN_ID}&vs_currencies=inr`,
      { headers }
    );
    const data = await response.json();
    const rate = data[COIN_ID]?.inr;
    // Sanity check: 1 MATIC should be between ₹5 and ₹500
    if (!rate || rate < 5 || rate > 500) throw new Error(`Bad rate: ${rate}`);
    return rate;
  } catch (error) {
    console.error('CoinGecko API error, using fallback:', error.message);
    return 8.84; // fallback ₹/MATIC
  }
}

export async function convertMaticToInr(matic) {
  const rate = await getMaticToInrRate();
  return matic * rate;
}

export async function convertInrToMatic(inr) {
  const rate = await getMaticToInrRate();
  return inr / rate;
}

export async function getExchangeRates() {
  try {
    const response = await fetch(`${COINGECKO_URL}/simple/price?ids=${COIN_ID}&vs_currencies=inr,usd,aed,sgd`, {
      headers
    });
    const data = await response.json();
    return {
      matic_inr: data[COIN_ID].inr,
      matic_usd: data[COIN_ID].usd,
      matic_aed: data[COIN_ID].aed,
      matic_sgd: data[COIN_ID].sgd
    };
  } catch (error) {
    console.error('Exchange rates error:', error);
    return { matic_inr: 8.84, matic_usd: 0.09, matic_aed: 0.34, matic_sgd: 0.12 };
  }
}

export async function convertCurrency(amount, fromCurrency, toCurrency) {
  try {
    const currencyIds = {
      INR: 'inr',
      USD: 'usd',
      AED: 'aed',
      SGD: 'sgd',
      EUR: 'eur',
      GBP: 'gbp'
    };

    const response = await fetch(
      `${COINGECKO_URL}/simple/price?ids=${COIN_ID}&vs_currencies=${currencyIds[fromCurrency]},${currencyIds[toCurrency]}`,
      { headers }
    );
    const data = await response.json();
    
    const fromRate = data[COIN_ID][currencyIds[fromCurrency]];
    const toRate = data[COIN_ID][currencyIds[toCurrency]];
    
    return (amount / fromRate) * toRate;
  } catch (error) {
    console.error('Currency conversion error:', error);
    return amount;
  }
}
