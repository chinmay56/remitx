// ── Forex conversion utilities (replaces blockchain/CoinGecko) ──

const COUNTRY_CODE_TO_CURRENCY = {
  '+91': 'INR', '+1': 'USD', '+971': 'AED', '+65': 'SGD',
  '+44': 'GBP', '+49': 'EUR', '+33': 'EUR', '+81': 'JPY',
  '+86': 'CNY', '+61': 'AUD', '+64': 'NZD', '+55': 'BRL',
  '+7': 'RUB', '+82': 'KRW', '+66': 'THB', '+60': 'MYR',
  '+63': 'PHP', '+62': 'IDR', '+92': 'PKR', '+880': 'BDT',
  '+94': 'LKR', '+977': 'NPR', '+234': 'NGN', '+254': 'KES',
  '+27': 'ZAR', '+20': 'EGP', '+52': 'MXN', '+48': 'PLN',
  '+46': 'SEK', '+47': 'NOK', '+45': 'DKK', '+41': 'CHF',
  '+90': 'TRY', '+966': 'SAR', '+974': 'QAR', '+968': 'OMR',
  '+973': 'BHD', '+965': 'KWD', '+962': 'JOD',
};

const CURRENCY_SYMBOLS = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ',
  SGD: 'S$', JPY: '¥', CNY: '¥', AUD: 'A$', NZD: 'NZ$',
  BRL: 'R$', KRW: '₩', THB: '฿', MYR: 'RM', PHP: '₱',
  IDR: 'Rp', PKR: '₨', BDT: '৳', LKR: 'Rs', NPR: 'रू',
  NGN: '₦', KES: 'KSh', ZAR: 'R', EGP: 'E£', MXN: 'MX$',
  PLN: 'zł', SEK: 'kr', NOK: 'kr', DKK: 'kr', CHF: 'CHF',
  TRY: '₺', SAR: '﷼', QAR: 'QR', OMR: 'OMR', BHD: 'BD',
  KWD: 'KD', JOD: 'JD', RUB: '₽',
};

export function getCurrencyFromCountryCode(countryCode) {
  if (!countryCode) return 'USD';
  return COUNTRY_CODE_TO_CURRENCY[countryCode] || 'USD';
}

export function getCurrencySymbol(currencyCode) {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode + ' ';
}

// ── Rate cache (5 min TTL) ──
let rateCache = {};
let cacheTimestamps = {};
const CACHE_TTL = 5 * 60 * 1000;

export async function getExchangeRate(from, to) {
  if (from === to) return 1;

  const key = `${from}_${to}`;
  const now = Date.now();

  if (rateCache[key] && (now - (cacheTimestamps[key] || 0)) < CACHE_TTL) {
    return rateCache[key];
  }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await res.json();

    if (data.result === 'success' && data.rates?.[to]) {
      // Cache all returned pairs for this base
      Object.entries(data.rates).forEach(([cur, rate]) => {
        rateCache[`${from}_${cur}`] = rate;
        cacheTimestamps[`${from}_${cur}`] = now;
      });
      return data.rates[to];
    }
    throw new Error(`Rate not available for ${from}→${to}`);
  } catch (err) {
    console.error('Forex API error, using fallback:', err.message);
    const fb = {
      INR_USD: 0.012, USD_INR: 83.5,
      INR_AED: 0.044, AED_INR: 22.7,
      INR_GBP: 0.0095, GBP_INR: 105.5,
      INR_EUR: 0.011, EUR_INR: 91.0,
      INR_SGD: 0.016, SGD_INR: 62.0,
      USD_AED: 3.67, AED_USD: 0.27,
      USD_GBP: 0.79, GBP_USD: 1.27,
      USD_EUR: 0.92, EUR_USD: 1.09,
    };
    return fb[key] || 1;
  }
}

export async function convertCurrency(amount, from, to) {
  const rate = await getExchangeRate(from, to);
  return { convertedAmount: +(amount * rate).toFixed(2), rate, from, to };
}
