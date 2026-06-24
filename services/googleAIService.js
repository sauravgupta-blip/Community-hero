const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const analyzeIssue = async (imageBase64, description) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Analyze this street infrastructure issue.
Description: "${description}"

Return ONLY valid JSON:
{
  "category": "Pothole|Water Leak|Broken Light|Garbage|Damaged Road|Other",
  "severity": 1-5,
  "actionRequired": "brief action",
  "estimatedDays": number
}`;

    const response = await model.generateContent({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
        ]
      }]
    });
    
    const text = response.response.text();
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('AI analysis failed:', error.message);
    // Fallback: keyword-based categorization when AI is unavailable
    const text = description.toLowerCase();
    let category = 'Other';
    if (text.includes('pothole') || text.includes('pot hole') || text.includes('road')) category = 'Pothole';
    else if (text.includes('water') || text.includes('leak') || text.includes('pipe')) category = 'Water Leak';
    else if (text.includes('light') || text.includes('lamp') || text.includes('electric')) category = 'Broken Light';
    else if (text.includes('garbage') || text.includes('trash') || text.includes('waste')) category = 'Garbage';
    else if (text.includes('damaged') || text.includes('crack')) category = 'Damaged Road';
    return { category, severity: 3, actionRequired: 'Review', estimatedDays: 5 };
}
};

module.exports = { analyzeIssue };