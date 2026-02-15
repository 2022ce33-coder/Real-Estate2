import Bytez from "bytez.js";

const BYTEZ_API_KEY = "9b9fcd249b61ec762cb4314b43269e54";
const sdk = new Bytez(BYTEZ_API_KEY);
const model = sdk.model("google/gemini-2.5-pro");

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
        const { error, output } = await model.run([
          { role: "user", content: fullPrompt }
        ]);
        
        if (error) {
          console.error("Bytez processing error:", error);
          return { text: databaseContext };
        }
        
        let text = output?.content || output?.message?.content || databaseContext;
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
    
    const { error, output } = await model.run([
      { role: "user", content: fullPrompt }
    ]);
    
    if (error) {
      console.error("Bytez API error:", error);
      return { text: "I'm having trouble processing your request right now. Please try again." };
    }
    
    let text = output?.content || output?.message?.content || "Sorry, I couldn't process that.";
    text = formatGeminiResponse(text);
    
    return { text };
  } catch (error) {
    console.error("Gemini API error:", error);
    return { text: "I'm having trouble processing your request right now. Please try again or search using the filters above." };
  }
}

/**
 * Send to Gemini with GENERAL mode - Web-based real estate info, market trends, area details
 */
export async function sendToGeminiGeneral(prompt: string) {
  try {
    const generalContext = `You are a knowledgeable real estate advisor for Pakistan.
Provide general information, market insights, and area details based on web knowledge.
Do NOT use any asterisks, bold formatting, or markdown symbols. Use plain text only.

Topics you can help with:
- Real estate market trends in Pakistan
- Area information (schools, hospitals, parks, transport)
- Investment advice and tips
- Property buying/selling guidance
- Housing society comparisons (DHA, Bahria Town, etc.)
- Neighborhood safety and amenities
- Legal aspects of property transactions

Keep responses informative but concise (3-5 lines).
Format information clearly with line breaks between points.

User question: ${prompt}

Provide a helpful, well-organized response with relevant information:`;

    const { error, output } = await model.run([
      { role: "user", content: generalContext }
    ]);
    
    if (error) {
      console.error("Bytez General API error:", error);
      return { text: "I'm having trouble fetching general information right now. Please try again." };
    }
    
    let text = output?.content || output?.message?.content || "Sorry, I couldn't process that.";
    text = formatGeminiResponse(text);
    
    return { text };
  } catch (error) {
    console.error("Gemini General API error:", error);
    return { text: "I'm having trouble fetching general information right now. Please try again." };
  }
}

/**
 * Send to Gemini with DATABASE mode - Real properties, agents, and prices from database
 */
export async function sendToGeminiDatabase(prompt: string) {
  try {
    // Fetch real data from database
    const extractedCity = extractCityFromPrompt(prompt);
    const searchQuery = extractedCity || prompt;
    
    let databaseInfo = "";
    let properties: PropertyData[] = [];
    let agents: AgentData[] = [];
    
    // Fetch properties
    try {
      properties = await fetchPropertiesFromDB(searchQuery);
    } catch (e) {
      console.error("Error fetching properties:", e);
    }
    
    // Fetch agents
    try {
      agents = await fetchAgentsFromDB(extractedCity || "");
    } catch (e) {
      console.error("Error fetching agents:", e);
    }
    
    // Build database info string
    if (properties && properties.length > 0) {
      databaseInfo += "📍 AVAILABLE PROPERTIES:\n\n";
      properties.slice(0, 6).forEach((prop, idx) => {
        databaseInfo += `${idx + 1}. ${prop.title}\n`;
        databaseInfo += `   💰 Price: PKR ${prop.price?.toLocaleString ? prop.price.toLocaleString() : prop.price}\n`;
        if (prop.beds) databaseInfo += `   🛏️ Bedrooms: ${prop.beds}\n`;
        if (prop.type) databaseInfo += `   🏠 Type: ${prop.type}\n`;
        databaseInfo += `   📌 Area: ${prop.area}\n\n`;
      });
    }
    
    if (agents && agents.length > 0) {
      databaseInfo += "👤 VERIFIED AGENTS:\n\n";
      agents.slice(0, 5).forEach((agent, idx) => {
        databaseInfo += `${idx + 1}. ${agent.name}\n`;
        databaseInfo += `   🏢 Agency: ${agent.agency}\n`;
        databaseInfo += `   📅 Experience: ${agent.experience}+ years\n`;
        databaseInfo += `   📞 Phone: ${agent.phone}\n`;
        databaseInfo += `   ✉️ Email: ${agent.email}\n\n`;
      });
    }
    
    if (!databaseInfo) {
      // No data found, ask Gemini to help with suggestions
      const noDataPrompt = `User is searching for: "${prompt}"
      
We don't have exact matches in our database right now. 
Suggest what they might be looking for and ask clarifying questions.
Keep response to 2-3 lines. Use plain text only, no markdown.`;
      
      const { error, output } = await model.run([
        { role: "user", content: noDataPrompt }
      ]);
      
      if (error) {
        return { text: "No properties or agents found matching your search. Try searching for a different area or property type." };
      }
      
      let text = output?.content || output?.message?.content || "No results found. Try a different search.";
      text = formatGeminiResponse(text);
      return { text };
    }
    
    // Format the database results with Gemini
    const databasePrompt = `You are a real estate assistant. Present this REAL database information to the user in a friendly way.
Do NOT use asterisks or markdown. Keep it clean and readable.

User asked: "${prompt}"

Database Results:
${databaseInfo}

Summarize the key findings in 2-3 lines, then show the actual listings/agents.
If there are properties, highlight the best options.
If there are agents, recommend contacting them for more listings.`;

    try {
      const { error, output } = await model.run([
        { role: "user", content: databasePrompt }
      ]);
      
      if (error) {
        return { text: "Here's what I found in our database:\n\n" + databaseInfo };
      }
      
      let text = output?.content || output?.message?.content || "";
      text = formatGeminiResponse(text);
      
      // Append the actual database info
      text += "\n\n" + databaseInfo;
      
      return { text };
    } catch (geminiErr) {
      // If Gemini fails, just return the raw database info
      return { text: "Here's what I found in our database:\n\n" + databaseInfo };
    }
  } catch (error) {
    console.error("Gemini Database API error:", error);
    return { text: "I'm having trouble accessing the database right now. Please try again or use the property search filters." };
  }
}
