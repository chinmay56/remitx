'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function TestPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/test')
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">API Test Results</h1>

        <div className="space-y-6">
          {/* CoinGecko */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              {results?.coingecko?.status === 'success' ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
              <h2 className="text-2xl font-bold text-gray-900">CoinGecko API</h2>
            </div>
            
            {results?.coingecko?.status === 'success' && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Live Rates (1 POL):</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">INR</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{results.coingecko.data['polygon-ecosystem-token'].inr}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">USD</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${results.coingecko.data['polygon-ecosystem-token'].usd}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">AED</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {results.coingecko.data['polygon-ecosystem-token'].aed}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">SGD</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${results.coingecko.data['polygon-ecosystem-token'].sgd}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-semibold">
                    ✅ Currency conversion working!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Google Maps */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              {results?.googleMaps?.status === 'success' ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
              <h2 className="text-2xl font-bold text-gray-900">Google Maps API</h2>
            </div>
            
            {results?.googleMaps?.status === 'failed' && (
              <div className="bg-yellow-50 rounded-xl p-6">
                <p className="text-yellow-800 font-semibold mb-2">⚠️ Needs Billing</p>
                <p className="text-sm text-gray-700">
                  Enable billing in Google Cloud Console. Users can manually select country.
                </p>
              </div>
            )}
          </div>

          <div className="text-center">
            <a href="/" className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl">
              Go to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
