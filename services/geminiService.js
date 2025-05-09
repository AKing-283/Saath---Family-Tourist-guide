import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Travel Expert Chat Model
const travelExpertModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export const getTravelExpertResponse = async (message, chatHistory = []) => {
  try {
    // Format chat history for Gemini API, ensuring first message is from user
    const formattedHistory = chatHistory
      .filter(msg => msg.type === 'user' || (msg.type === 'bot' && chatHistory.indexOf(msg) > 0))
      .map(msg => ({
        role: msg.type === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

    const chat = travelExpertModel.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting travel expert response:', error);
    throw new Error('Failed to get response from travel expert');
  }
};

// Tourist Guide Model
const touristGuideModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export const getTouristTips = async (location) => {
  try {
    const prompt = `Generate tourist tips for ${location}. Format the response as a JSON array with objects containing title, icon, and content fields. Each object should have this structure:
    {
      "title": "Category name",
      "icon": "ionicon-name",
      "content": "Detailed information"
    }
    
    Use these exact categories and their corresponding Ionicons names:
    1. "Best Time to Visit" - use icon: "calendar"
    2. "Local Transportation" - use icon: "car"
    3. "Must-Try Foods" - use icon: "restaurant"
    4. "Cultural Etiquette" - use icon: "people"
    5. "Popular Attractions" - use icon: "compass"
    6. "Safety Tips" - use icon: "shield-checkmark"
    
    Return ONLY the JSON array, no other text. Make sure to use the exact icon names provided.`;

    const result = await touristGuideModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text to ensure it's valid JSON
    const jsonStr = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    
    try {
      const tips = JSON.parse(jsonStr);
      if (!Array.isArray(tips)) {
        throw new Error('Response is not an array');
      }
      return tips;
    } catch (parseError) {
      console.error('JSON Parse error:', parseError);
      throw new Error('Invalid response format from AI');
    }
  } catch (error) {
    console.error('Error getting tourist tips:', error);
    throw new Error('Failed to get tourist tips');
  }
};

export const interpretQuery = async (userQuery) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Convert this natural language query into a structured search intent for finding places: "${userQuery}"
    Return the response in this format:
    {
      "type": "cafe|restaurant|store|etc",
      "keywords": ["keyword1", "keyword2"],
      "requirements": ["requirement1", "requirement2"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    return JSON.parse(text);
  } catch (error) {
    console.error('Error interpreting query:', error);
    throw error;
  }
}; 