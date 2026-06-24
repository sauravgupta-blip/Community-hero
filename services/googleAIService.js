const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const analyzeIssue = async (imageBase64, description) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
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
  }  catch (error) {
    console.error('AI analysis failed:', error.message);
    return { category: 'Other', severity: 3, actionRequired: 'Review', estimatedDays: 5 };

  }
};

module.exports = { analyzeIssue };