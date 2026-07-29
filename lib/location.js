const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function detectUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const country = await getCountryFromCoords(latitude, longitude);
          resolve(country);
        } catch (error) {
          reject(error);
        }
      },
      (error) => reject(error)
    );
  });
}

export async function getCountryFromCoords(lat, lng) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const addressComponents = data.results[0].address_components;
      const countryComponent = addressComponents.find(
        component => component.types.includes('country')
      );
      
      if (countryComponent) {
        return {
          name: countryComponent.long_name,
          code: countryComponent.short_name,
          currency: getCurrencyForCountry(countryComponent.short_name)
        };
      }
    }
    
    return { name: 'India', code: 'IN', currency: 'INR' };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { name: 'India', code: 'IN', currency: 'INR' };
  }
}

export function getCurrencyForCountry(countryCode) {
  const currencyMap = {
    'IN': 'INR',
    'US': 'USD',
    'AE': 'AED',
    'SG': 'SGD',
    'GB': 'GBP',
    'EU': 'EUR',
    'SA': 'SAR',
    'QA': 'QAR',
    'KW': 'KWD',
    'OM': 'OMR',
    'BH': 'BHD',
  };
  
  return currencyMap[countryCode] || 'USD';
}

export const countries = [
  { name: 'India', code: 'IN', flag: '🇮🇳', currency: 'INR', dialCode: '+91' },
  { name: 'United States', code: 'US', flag: '🇺🇸', currency: 'USD', dialCode: '+1' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', currency: 'AED', dialCode: '+971' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬', currency: 'SGD', dialCode: '+65' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', currency: 'SAR', dialCode: '+966' },
  { name: 'Qatar', code: 'QA', flag: '🇶🇦', currency: 'QAR', dialCode: '+974' },
  { name: 'Kuwait', code: 'KW', flag: '🇰🇼', currency: 'KWD', dialCode: '+965' },
  { name: 'Oman', code: 'OM', flag: '🇴🇲', currency: 'OMR', dialCode: '+968' },
  { name: 'Bahrain', code: 'BH', flag: '🇧🇭', currency: 'BHD', dialCode: '+973' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', currency: 'GBP', dialCode: '+44' },
];
