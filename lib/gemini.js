const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function generateSavingsTip(userTransactions) {
  try {
    const totalSent = userTransactions.reduce((sum, tx) => sum + tx.amount_inr, 0);
    const avgTransaction = totalSent / userTransactions.length;
    
    const prompt = `User sent ₹${totalSent.toFixed(0)} in ${userTransactions.length} transactions this month. Average: ₹${avgTransaction.toFixed(0)}. Give ONE short savings tip in 15 words max.`;
    
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Save 10% of every transfer to build your emergency fund!';
  }
}

export async function generateInvestmentAdvice(savingsAmount) {
  try {
    const prompt = `User has ₹${savingsAmount} to invest. Suggest ONE investment option in 20 words max for migrant workers.`;
    
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Start with digital gold - low risk, high liquidity, perfect for beginners!';
  }
}
