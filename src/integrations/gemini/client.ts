import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyCQ7PJ82gb_bCty38IxrFj2aXzRQ8tSJR0";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface PropertyData {
  id: string;
  title: string;
  area: string;
  price: number;
  type: string;
  beds?: number;
}

interface AgentData {
  id: string;
  name: string;
  agency: string;
  experience: number;
  area: string;
  phone: string;
  email: string;
}

/**
 * Fetch properties from database
 */
async function fetchPropertiesFromDB(query?: string): Promise<PropertyData[]> {
  try {
    const endpoint = query 
      ? `http://localhost:3001/api/properties/search/${encodeURIComponent(query)}`
      : `http://localhost:3001/api/properties`;
    
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Failed to fetch properties");
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
}

/**
 * Fetch agents from database
 */
async function fetchAgentsFromDB(query?: string): Promise<AgentData[]> {
  try {
    const endpoint = query
      ? `http://localhost:3001/api/agents/search/${encodeURIComponent(query)}`
      : `http://localhost:3001/api/agents`;
    
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Failed to fetch agents");
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
}

/**
 * Clean and format Gemini response
 */
function formatGeminiResponse(text: string): string {
  return text
    .replace(/\*\*\*/g, '') // Remove ***
    .replace(/\*\*/g, '') // Remove **
    .replace(/\*/g, '') // Remove single *
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .trim();
}

/**
 * Extract city/area from user prompt
 */
function extractCityFromPrompt(prompt: string): string | null {
  const cities = ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'quetta', 'gujranwala',
    'dha', 'bahria town', 'gulberg', 'cantt', 'defence', 'clifton', 'defence housing', 'phase', 'sector'];
  
  const lowerPrompt = prompt.toLowerCase();
  for (const city of cities) {
    if (lowerPrompt.includes(city)) {
      return city;
    }
  }
  return null;
}

/**
 * Build conversational context with qualifying questions
 */
function buildConversationalContext(userPrompt: string): string {
  let context = `You are a helpful real estate assistant for a Pakistani real estate platform.
Keep responses concise and conversational - maximum 2-3 lines per response.
Do NOT use any asterisks, bold formatting, or markdown symbols.
Use plain text only.

Your role:
- Ask clarifying questions to understand what the user needs
- Help them find properties or agents
- Provide real estate advice for Pakistan

When a user is looking for a property, ask about:
1. Location/Area (city/neighborhood)
2. Property type (apartment, house, villa, etc.)
3. Bedrooms or plot size (e.g., 5 Marla, 1 Kanal)
4. Buy or Rent preference

Format your questions naturally in 2 lines max. Example:
"I'd love to help! Are you looking for a flat or a house?"
"And would you prefer to buy or rent?"

Keep responses short, friendly, and direct.`;

  return context;
}

/**
 * Build database context from real properties and agents
 */
async function buildDatabaseContext(userPrompt: string): Promise<string> {
  const propertyKeywords = ['property', 'properties', 'house', 'apartment', 'villa', 'flat', 'plot', 'land', 'commercial', 'price', 'rent', 'buy', 'sell', 'marla', 'kanal', 'sqft', 'bedroom', 'bed'];
  const agentKeywords = ['agent', 'agents', 'broker', 'brokers', 'realtor', 'representative', 'contact', 'find agent'];
  
  const isPropertyQuery = propertyKeywords.some(kw => userPrompt.toLowerCase().includes(kw));
  const isAgentQuery = agentKeywords.some(kw => userPrompt.toLowerCase().includes(kw));
  const extractedCity = extractCityFromPrompt(userPrompt);
  
  let context = "Based on the user's request, search the database and provide real results.\n";
  context += "Use the following real data to answer user questions accurately.\n\n";
  
  // Try to fetch agents first if city is mentioned
  if (extractedCity) {
    try {
      const agents = await fetchAgentsFromDB(extractedCity);
      if (agents && agents.length > 0) {
        context += `Verified Real Estate Agents in ${extractedCity}:\n`;
        agents.slice(0, 8).forEach((agent, idx) => {
          context += `${idx + 1}. ${agent.name} - ${agent.agency} (${agent.experience}+ years)\n`;
          context += `   Area: ${agent.area} | Phone: ${agent.phone}\n`;
        });
        context += "\n";
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  }
  
  // Fetch properties if relevant
  if (isPropertyQuery || extractedCity) {
    try {
      const searchQuery = extractedCity || userPrompt;
      const properties = await fetchPropertiesFromDB(searchQuery);
      if (properties && properties.length > 0) {
        context += `Available Properties ${extractedCity ? 'in ' + extractedCity : ''}:\n`;
        properties.slice(0, 8).forEach((prop, idx) => {
          context += `${idx + 1}. ${prop.title} - PKR ${prop.price?.toLocaleString ? prop.price.toLocaleString() : prop.price}`;
          if (prop.beds) context += ` (${prop.beds} beds)`;
          if (prop.type) context += ` - ${prop.type}`;
          context += ` in ${prop.area}\n`;
        });
        context += "\n";
      } else if (properties && properties.length === 0 && extractedCity) {
        context += `No properties found in ${extractedCity}, but we have verified agents to help you.\n\n`;
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  }
  
  context += "Always present real data from the database when available.\n";
  context += "If a user asks about a specific city, provide agents and properties from that city.\n";
  context += "Format agent/property information clearly so the user can contact or view them.\n";
  
  return context;
}

export async function sendToGemini(prompt: string) {
  try {
    // Build conversational context
    const conversationalContext = buildConversationalContext(prompt);
    
    // Build database context from real properties/agents - this fetches actual data
    const databaseContext = await buildDatabaseContext(prompt);
    
    // If we have real data from database, use it directly
    if (databaseContext.includes('Available Properties') || databaseContext.includes('Verified Real Estate Agents')) {
      // We have real data, so let Gemini enhance it with conversational response
      const fullPrompt = conversationalContext + "\n\n" + databaseContext + "\n\nUser: " + prompt + 
        "\n\nProvide a natural response based on the real data shown above. Keep it to 2-3 lines max.";
      
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let text = response.text();
        text = formatGeminiResponse(text);
        return { text };
      } catch (geminiErr) {
        console.error("Gemini processing error:", geminiErr);
        // If Gemini fails, return the raw data we fetched
        return { text: databaseContext };
      }
    }
    
    // No real data found, ask clarifying questions via Gemini
    const fullPrompt = conversationalContext + "\n\nUser: " + prompt;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();
    text = formatGeminiResponse(text);
    
    return { text };
  } catch (error) {
    console.error("Gemini API error:", error);
    
    // Fallback: Try to return some helpful message or fetch from proxy
    try {
      const apiUrl = import.meta.env.VITE_GEMINI_API_URL;
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (apiUrl && apiKey) {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ prompt }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.text) {
            let formattedText = formatGeminiResponse(data.text);
            return { text: formattedText };
          }
        }
      }
    } catch (proxyError) {
      console.error("Proxy error:", proxyError);
    }
    
    return { text: "I'm having trouble processing your request right now. Please try again or search using the filters above." };
  }
}
