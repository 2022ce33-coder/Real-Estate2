/**
 * Agent Service - Fetch agents from database by area/city
 */

interface DatabaseAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  agency: string;
  experience: number;
  cnic: string;
  address: string;
  attachments?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgentData {
  id: string;
  name: string;
  agency: string;
  avatar: string;
  experience: number;
  properties: number;
  rating: number;
  reviews: number;
  verified: boolean;
  area: string;
  email: string;
  phone: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Fetch agents by city/area from the database
 */
export async function fetchAgentsByArea(area: string): Promise<AgentData[]> {
  try {
    // Check if the query looks like a property search (contains property-related keywords)
    const propertyKeywords = ['marla', 'kanal', 'apartment', 'flat', 'house', 'villa', 'commercial', 'office', 'shop', 'plot', 'bedroom', 'bed'];
    const isPropertyQuery = propertyKeywords.some(keyword => area.toLowerCase().includes(keyword));
    
    let endpoint = `${API_BASE_URL}/agents/search/${encodeURIComponent(area)}`;
    
    // Use the property-specific search for complex queries
    if (isPropertyQuery) {
      endpoint = `${API_BASE_URL}/agents/by-property/${encodeURIComponent(area)}`;
    }
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !Array.isArray(data.data)) {
      console.warn('No agents found for area:', area);
      return [];
    }
    
    // Transform database agents to AgentData format
    return data.data.map((agent: DatabaseAgent) => ({
      id: agent.id,
      name: agent.name,
      agency: agent.agency,
      avatar: generateAvatarUrl(agent.name),
      experience: agent.experience,
      properties: 0, // Will be fetched separately if needed
      rating: 4.5 + Math.random() * 0.5, // Placeholder - can be updated when rating system is added
      reviews: Math.floor(Math.random() * 300) + 50, // Placeholder
      verified: true, // Agents in database are verified
      area: agent.address || area,
      email: agent.email,
      phone: agent.phone,
    }));
  } catch (error) {
    console.error('Error fetching agents by area:', error);
    return [];
  }
}

/**
 * Generate a consistent avatar URL based on agent name
 */
function generateAvatarUrl(name: string): string {
  const avatarServices = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
  ];
  
  // Use first service
  return avatarServices[0];
}

/**
 * Fetch agent by ID with full details
 */
export async function fetchAgentById(agentId: string): Promise<AgentData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/${agentId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch agent: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      return null;
    }
    
    const agent = data.data as DatabaseAgent;
    
    return {
      id: agent.id,
      name: agent.name,
      agency: agent.agency,
      avatar: generateAvatarUrl(agent.name),
      experience: agent.experience,
      properties: 0,
      rating: 4.5 + Math.random() * 0.5,
      reviews: Math.floor(Math.random() * 300) + 50,
      verified: true,
      area: agent.address,
      email: agent.email,
      phone: agent.phone,
    };
  } catch (error) {
    console.error('Error fetching agent by ID:', error);
    return null;
  }
}

/**
 * Get all agents from database
 */
export async function fetchAllAgents(): Promise<AgentData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/agents`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !Array.isArray(data.data)) {
      return [];
    }
    
    return data.data.map((agent: DatabaseAgent) => ({
      id: agent.id,
      name: agent.name,
      agency: agent.agency,
      avatar: generateAvatarUrl(agent.name),
      experience: agent.experience,
      properties: 0,
      rating: 4.5 + Math.random() * 0.5,
      reviews: Math.floor(Math.random() * 300) + 50,
      verified: true,
      area: agent.address,
      email: agent.email,
      phone: agent.phone,
    }));
  } catch (error) {
    console.error('Error fetching all agents:', error);
    return [];
  }
}
