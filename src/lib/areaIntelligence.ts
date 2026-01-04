// Area Intelligence data fetching from web sources
interface AreaData {
  description: string;
  amenities: string[];
  facts: Record<string, string>;
}

// Fetch area description from Wikipedia
export async function fetchWikipediaDescription(areaName: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(areaName)}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.extract || null;
  } catch (error) {
    console.error("Error fetching from Wikipedia:", error);
    return null;
  }
}

// Fetch area information from Open Street Map
export async function fetchOSMAreaData(areaName: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(areaName)},Pakistan&format=json&limit=1`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching from OSM:", error);
    return null;
  }
}

// Local database of Pakistani areas with their characteristics (fallback)
const areaDatabase: Record<string, AreaData> = {
  "Karachi": {
    description: "Karachi, Pakistan's largest city and economic hub, is a vibrant metropolis with diverse neighborhoods. Home to major businesses, educational institutions, and shopping centers, it offers excellent transport links, world-class healthcare, and a thriving real estate market attracting investors globally.",
    amenities: ["Top Schools", "Healthcare", "Shopping", "Transport Links", "Parks", "Business Hub"],
    facts: {
      "population": "16+ Million",
      "established": "1729",
      "mainAreas": "Defence, Clifton, DHA, Gulberg",
      "avgPrice": "PKR 120M"
    }
  },
  "Lahore": {
    description: "Lahore is known as the heart of Pakistan with rich cultural heritage and modern development. The city boasts excellent educational institutions, healthcare facilities, shopping malls, and a thriving real estate market. DHA, Cantt, and Defense are premium residential areas with strong investment potential.",
    amenities: ["Heritage Sites", "Top Schools", "Healthcare", "Shopping", "Parks", "Safe Area"],
    facts: {
      "population": "12+ Million",
      "established": "1000 AD",
      "mainAreas": "DHA, Cantt, Gulberg, Bahria",
      "avgPrice": "PKR 80M"
    }
  },
  "Islamabad": {
    description: "Islamabad, the capital of Pakistan, is a modern planned city nestled in the Potohar Plateau. Known for its scenic beauty, peaceful environment, and excellent infrastructure, it offers premium residential communities like DHA Islamabad and F-7 with top-notch amenities and investment opportunities.",
    amenities: ["Parks", "Safe Area", "Top Schools", "Healthcare", "Shopping", "Natural Beauty"],
    facts: {
      "population": "2+ Million",
      "established": "1960",
      "mainAreas": "F-7, F-8, DHA, G-6",
      "avgPrice": "PKR 90M"
    }
  },
  "Rawalpindi": {
    description: "Rawalpindi is a bustling city known for its strategic location near Islamabad. With a rich military heritage, modern infrastructure, and affordable real estate, it attracts families and investors. Areas like Bahria Town and Pindi Point offer world-class amenities and excellent investment returns.",
    amenities: ["Safe Area", "Shopping", "Transport Links", "Top Schools", "Healthcare", "Business Hub"],
    facts: {
      "population": "2.5+ Million",
      "established": "1493",
      "mainAreas": "Bahria Town, Pindi Point, Adiala",
      "avgPrice": "PKR 50M"
    }
  },
  "Multan": {
    description: "Multan, known as the 'City of Saints,' is a historic city with growing economic importance. With affordable real estate, developing infrastructure, and business opportunities, it's becoming an attractive destination for investors seeking growth potential in emerging markets.",
    amenities: ["Heritage Sites", "Healthcare", "Shopping", "Top Schools", "Transport Links", "Business Hub"],
    facts: {
      "population": "2+ Million",
      "established": "Ancient",
      "mainAreas": "Cantt, Abdullahpur",
      "avgPrice": "PKR 30M"
    }
  },
  "Peshawar": {
    description: "Peshawar, the capital of Khyber Pakhtunkhwa, is known for its strategic trade location and cultural significance. With improving infrastructure, growing business opportunities, and affordable properties, it's becoming an emerging real estate destination with strong growth potential.",
    amenities: ["Market Hub", "Healthcare", "Shopping", "Transport Links", "Top Schools", "Culture"],
    facts: {
      "population": "2.3+ Million",
      "established": "500 BC",
      "mainAreas": "Hayatabad, Peshwar Cantt",
      "avgPrice": "PKR 25M"
    }
  },
  "DHA": {
    description: "Defence Housing Authority (DHA) is a premium residential community available in multiple cities. Known for its gated communities, excellent security, world-class amenities, and strong property values, DHA consistently attracts high-end investors and families.",
    amenities: ["Safe Area", "Top Schools", "Healthcare", "Parks", "Shopping", "Community Facilities"],
    facts: {
      "population": "500K+",
      "established": "1975",
      "mainAreas": "DHA Karachi, Lahore, Islamabad",
      "avgPrice": "PKR 150M"
    }
  },
  "Bahria Town": {
    description: "Bahria Town is a sprawling master-planned community offering complete lifestyle solutions. With residential, commercial, and entertainment facilities, superior security, and excellent ROI, it's one of Pakistan's most sought-after developments.",
    amenities: ["Safe Area", "Shopping", "Parks", "Top Schools", "Entertainment", "Healthcare"],
    facts: {
      "population": "300K+",
      "established": "1988",
      "mainAreas": "Multiple branches nationwide",
      "avgPrice": "PKR 120M"
    }
  },
  "Gulberg": {
    description: "Gulberg is an upscale residential area known for its tree-lined streets, elegant homes, and vibrant community. With top schools, shopping centers, and excellent connectivity, it's a preferred choice for families and investors seeking premium lifestyle.",
    amenities: ["Parks", "Top Schools", "Shopping", "Safe Area", "Healthcare", "Community Facilities"],
    facts: {
      "population": "100K+",
      "established": "1970s",
      "mainAreas": "Gulberg 2, 3, 4, 5",
      "avgPrice": "PKR 100M"
    }
  }
};

// Amenity-specific information
const amenityData: Record<string, Record<string, string[]>> = {
  "Top Schools": {
    "Karachi": ["Aitchison College", "Lycee Francais", "Karachi Grammar School", "Beaconhouse School System", "Nixor College"],
    "Lahore": ["Aitchison College", "Lahore Grammar School", "Beaconhouse School", "PAF College", "Fazaia Schools"],
    "Islamabad": ["Islamabad Model College", "FAST School", "Roots School", "Foundation School", "Cadet College Islamabad"],
    "Default": ["Government Schools", "Private Institutions", "International Curriculum Options", "Universities Nearby"]
  },
  "Healthcare": {
    "Karachi": ["Aga Khan Hospital", "Liaquat National Hospital", "Ziauddin Medical Center", "Sindh Institute of Urology", "Pacific Medical Complex"],
    "Lahore": ["Shaukat Khanum Hospital", "Fatima Memorial Hospital", "Combined Military Hospital", "Services Hospital", "Ittefaq Hospital"],
    "Islamabad": ["Pakistan Institute of Medical Sciences", "Poly Clinic Hospital", "HNP Civil Hospital", "Federal Government Hospital", "Shifa International"],
    "Default": ["Government Hospitals", "Private Clinics", "Emergency Services", "Specialized Centers"]
  },
  "Shopping": {
    "Karachi": ["Dolmen Mall", "Serena Hotel", "Atrium Mall", "Hyperstar", "Lucky One Mall"],
    "Lahore": ["Packages Mall", "Emporium Mall", "Centaurus Mall", "Liberty Market", "Galleria"],
    "Islamabad": ["Centaurus Mall", "F-7 Shopping Center", "Rawal Trade Centre", "Blue Area Market", "Jinnah Supermarket"],
    "Default": ["Shopping Malls", "Local Markets", "Supermarkets", "Retail Centers"]
  },
  "Transport Links": {
    "Karachi": ["Port Grand Terminal", "City Bus Service", "Orange Line Metro", "International Airport", "Motorway Access"],
    "Lahore": ["Orange Line Metro", "Lahore Railway Station", "Allama Iqbal International Airport", "Grand Trunk Road", "Lahore Circular Railway"],
    "Islamabad": ["New Islamabad Airport", "Grand Trunk Road", "Motorway Network", "Blue Bus Service", "Margalla Road Access"],
    "Default": ["Public Transportation", "Road Networks", "Railway Access", "Airport Proximity"]
  },
  "Parks": {
    "Karachi": ["Port Grand Park", "Jilani Park", "Clifton Beach", "Sea View Park", "Hill Park"],
    "Lahore": ["Jilani Park", "Racecourse Park", "Lawrence Garden", "Mall Road", "Race Course Ground"],
    "Islamabad": ["Margalla Hills", "Rawal Lake", "F-9 Park", "Zero Point Park", "Shakarparian"],
    "Default": ["Public Parks", "Green Spaces", "Recreational Areas", "Natural Attractions"]
  },
  "Safe Area": {
    "Karachi": ["Defence Community", "DHA Gated Area", "Clifton Enclave", "Bath Island Security", "Private Security"],
    "Lahore": ["DHA Lahore", "Cantt Area", "Defence Community", "Gulberg Security", "24/7 Armed Response"],
    "Islamabad": ["DHA Islamabad", "F-7 Security", "Diplomatic Enclave", "Secure Communities", "Police Patrol"],
    "Default": ["Security Guards", "Gated Community", "Police Presence", "CCTV Coverage"]
  }
};

export async function fetchAreaIntelligence(areaName: string): Promise<AreaData | null> {
  try {
    const normalizedArea = areaName.trim();
    
    // First, try to fetch real data from Wikipedia
    const wikiDescription = await fetchWikipediaDescription(normalizedArea);
    
    if (wikiDescription) {
      // Successfully got description from Wikipedia
      // Extract amenities from Wikipedia data using keyword analysis
      const amenities = extractAmenitiesFromDescription(wikiDescription, normalizedArea);
      
      return {
        description: wikiDescription,
        amenities,
        facts: {}
      };
    }
    
    // Fallback to local database
    for (const [key, value] of Object.entries(areaDatabase)) {
      if (key.toLowerCase() === normalizedArea.toLowerCase()) {
        return value;
      }
    }

    // Check for partial match in database
    for (const [key, value] of Object.entries(areaDatabase)) {
      if (key.toLowerCase().includes(normalizedArea.toLowerCase()) || 
          normalizedArea.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching area intelligence:", error);
    return null;
  }
}

// Extract amenities from text description using keyword analysis
function extractAmenitiesFromDescription(description: string, areaName: string): string[] {
  const amenityKeywords: Record<string, string[]> = {
    "Top Schools": ["school", "education", "university", "college", "academic", "learning", "institution"],
    "Healthcare": ["hospital", "medical", "health", "clinic", "healthcare", "doctor", "physician"],
    "Shopping": ["market", "shop", "retail", "mall", "bazaar", "commerce", "commercial", "store"],
    "Transport Links": ["transport", "road", "highway", "railway", "airport", "station", "metro", "bus", "train", "connectivity"],
    "Parks": ["park", "garden", "green", "nature", "forest", "recreation", "leisure", "outdoor", "playground"],
    "Business Hub": ["business", "commercial", "office", "corporate", "industry", "economic", "trade", "finance"],
    "Safe Area": ["safe", "secure", "security", "protected", "gated", "community", "peaceful", "crime"],
    "Nightlife": ["entertainment", "restaurant", "cafe", "dining", "club", "bar", "night", "leisure"],
    "Heritage": ["heritage", "historic", "culture", "monument", "historical", "archaeological", "ancient", "art"],
    "Residential": ["residential", "housing", "home", "apartment", "living", "neighborhood", "community"]
  };

  const foundAmenities = new Set<string>();
  const lowerDescription = description.toLowerCase();

  for (const [amenity, keywords] of Object.entries(amenityKeywords)) {
    for (const keyword of keywords) {
      if (lowerDescription.includes(keyword)) {
        foundAmenities.add(amenity);
        break;
      }
    }
  }

  // Return top 6 amenities, or at least some defaults
  const amenitiesArray = Array.from(foundAmenities).slice(0, 6);
  
  if (amenitiesArray.length === 0) {
    return ["Top Schools", "Healthcare", "Shopping", "Transport Links", "Parks", "Safe Area"];
  }
  
  return amenitiesArray;
}

export function getAmenityExamples(amenity: string, areaName: string): string[] {
  const normalizedAmenity = amenity.trim();
  const normalizedArea = areaName.trim();

  // Find the amenity in the database
  for (const [key, areas] of Object.entries(amenityData)) {
    if (key.toLowerCase() === normalizedAmenity.toLowerCase()) {
      // Find examples for the specific area
      for (const [areaKey, examples] of Object.entries(areas)) {
        if (areaKey.toLowerCase() === normalizedArea.toLowerCase()) {
          return examples;
        }
      }
      // Return default examples if area not found
      return areas["Default"] || [];
    }
  }

  return [];
}
