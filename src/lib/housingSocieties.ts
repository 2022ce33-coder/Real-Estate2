/**
 * Housing Societies Data Structure for Pakistan Real Estate
 * Contains major societies in Lahore with their phases, sectors, and blocks
 */

export interface Block {
  name: string;
  type: 'block' | 'sector' | 'extension';
}

export interface Phase {
  name: string;
  blocks: Block[];
}

export interface HousingSociety {
  id: string;
  name: string;
  city: string;
  description?: string;
  phases: Phase[];
}

// Housing Societies Data
export const HOUSING_SOCIETIES: HousingSociety[] = [
  // ==================== LAHORE SOCIETIES ====================
  {
    id: '1',
    name: 'DHA Lahore',
    city: 'Lahore',
    description: 'Defence Housing Authority - One of the largest planned communities in Lahore',
    phases: [
      {
        name: 'Phase 1',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Block D', type: 'block' },
          { name: 'Block E', type: 'block' },
          { name: 'Block F', type: 'block' },
          { name: 'Block G', type: 'block' },
          { name: 'Block H', type: 'block' },
          { name: 'Block J', type: 'block' },
          { name: 'Block K', type: 'block' },
          { name: 'Block L', type: 'block' },
          { name: 'Block M', type: 'block' },
          { name: 'Block N', type: 'block' },
          { name: 'Block P', type: 'block' },
          { name: 'Block Q', type: 'block' },
          { name: 'Block R', type: 'block' },
          { name: 'Block S', type: 'block' },
          { name: 'Block T', type: 'block' },
        ]
      },
      {
        name: 'Phase 2',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Block D', type: 'block' },
          { name: 'Block E', type: 'block' },
        ]
      },
      {
        name: 'Phase 3',
        blocks: [
          { name: 'Block W', type: 'block' },
          { name: 'Block X', type: 'block' },
          { name: 'Block XX', type: 'block' },
          { name: 'Block Y', type: 'block' },
          { name: 'Block Z', type: 'block' },
        ]
      },
      {
        name: 'Phase 4',
        blocks: [
          { name: 'Block AA', type: 'block' },
          { name: 'Block BB', type: 'block' },
          { name: 'Block CC', type: 'block' },
          { name: 'Block CCA', type: 'block' },
          { name: 'Block DD', type: 'block' },
          { name: 'Block EE', type: 'block' },
          { name: 'Block FF', type: 'block' },
          { name: 'Block GG', type: 'block' },
          { name: 'Block HH', type: 'block' },
          { name: 'Block JJ', type: 'block' },
          { name: 'Block KK', type: 'block' },
        ]
      },
      {
        name: 'Phase 5',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Block D', type: 'block' },
          { name: 'Block E', type: 'block' },
          { name: 'Block F', type: 'block' },
          { name: 'Block G', type: 'block' },
          { name: 'Block H', type: 'block' },
          { name: 'Block J', type: 'block' },
          { name: 'Block K', type: 'block' },
          { name: 'Block L', type: 'block' },
          { name: 'Block M', type: 'block' },
        ]
      },
      {
        name: 'Phase 6',
        blocks: [
          { name: 'Sector A', type: 'sector' },
          { name: 'Sector B', type: 'sector' },
          { name: 'Sector C', type: 'sector' },
          { name: 'Sector D', type: 'sector' },
          { name: 'Sector E', type: 'sector' },
          { name: 'Sector F', type: 'sector' },
          { name: 'Sector G', type: 'sector' },
          { name: 'Sector H', type: 'sector' },
        ]
      },
      {
        name: 'Phase 7',
        blocks: [
          { name: 'Block P', type: 'block' },
          { name: 'Block Q', type: 'block' },
          { name: 'Block R', type: 'block' },
          { name: 'Block S', type: 'block' },
          { name: 'Block T', type: 'block' },
          { name: 'Block U', type: 'block' },
          { name: 'Block V', type: 'block' },
          { name: 'Block W', type: 'block' },
          { name: 'Block X', type: 'block' },
          { name: 'Block Y', type: 'block' },
          { name: 'Block Z', type: 'block' },
          { name: 'Block Z1', type: 'block' },
          { name: 'Block Z2', type: 'block' },
        ]
      },
      {
        name: 'Phase 8',
        blocks: [
          { name: 'Park View - Block A', type: 'block' },
          { name: 'Park View - Block B', type: 'block' },
          { name: 'Park View - Block C', type: 'block' },
          { name: 'Park View - Block D', type: 'block' },
          { name: 'Park View - Block E', type: 'block' },
          { name: 'Park View - Block F', type: 'block' },
          { name: 'Park View - Block G', type: 'block' },
          { name: 'Park View - Block H', type: 'block' },
          { name: 'Park View - Block J', type: 'block' },
          { name: 'Park View - Block K', type: 'block' },
          { name: 'Ivy Green', type: 'block' },
          { name: 'Air Avenue - Block L', type: 'block' },
          { name: 'Air Avenue - Block M', type: 'block' },
          { name: 'Air Avenue - Block N', type: 'block' },
          { name: 'Air Avenue - Block P', type: 'block' },
          { name: 'Air Avenue - Block Q', type: 'block' },
          { name: 'Air Avenue - Block R', type: 'block' },
          { name: 'Broadway Commercial', type: 'block' },
        ]
      },
      {
        name: 'Phase 9 Town',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Block D', type: 'block' },
          { name: 'Block E', type: 'block' },
        ]
      },
      {
        name: 'Phase 9 Prism',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Block D', type: 'block' },
          { name: 'Block E', type: 'block' },
          { name: 'Block F', type: 'block' },
          { name: 'Block G', type: 'block' },
          { name: 'Block H', type: 'block' },
          { name: 'Block J', type: 'block' },
          { name: 'Block K', type: 'block' },
        ]
      },
      {
        name: 'Phase 10',
        blocks: [
          { name: 'Sector 1', type: 'sector' },
          { name: 'Sector 2', type: 'sector' },
          { name: 'Sector 3', type: 'sector' },
          { name: 'Sector 4', type: 'sector' },
        ]
      },
      {
        name: 'Phase 11',
        blocks: [
          { name: 'Rahbar - Sector 1', type: 'sector' },
          { name: 'Rahbar - Sector 2', type: 'sector' },
          { name: 'Rahbar - Sector 3', type: 'sector' },
          { name: 'Rahbar - Sector 4', type: 'sector' },
          { name: 'Halloki Gardens', type: 'sector' },
        ]
      },
      {
        name: 'Phase 12 (EME)',
        blocks: [
          { name: 'Sector 1', type: 'sector' },
          { name: 'Sector 2', type: 'sector' },
          { name: 'Sector 3', type: 'sector' },
        ]
      },
      {
        name: 'Phase 13',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
        ]
      },
    ]
  },
  {
    id: 'bahria-town-lahore',
    name: 'Bahria Town Lahore',
    city: 'Lahore',
    description: 'A massive community with sector/block structure',
    phases: [
      {
        name: 'Sector A',
        blocks: [
          { name: 'Block AA', type: 'block' },
          { name: 'Block AB', type: 'block' },
        ]
      },
      {
        name: 'Sector B',
        blocks: [
          { name: 'Block BA', type: 'block' },
          { name: 'Block BB', type: 'block' },
          { name: 'Block BC', type: 'block' },
        ]
      },
      {
        name: 'Sector C',
        blocks: [
          { name: 'Gulbahar Block', type: 'block' },
          { name: 'Gulmohar Block', type: 'block' },
          { name: 'Gardenia Block', type: 'block' },
          { name: 'Iris Block', type: 'block' },
          { name: 'Janiper Block', type: 'block' },
          { name: 'Jasmine Block', type: 'block' },
          { name: 'Nargis Block', type: 'block' },
          { name: 'Chambeli Block', type: 'block' },
          { name: 'Sunflower Block', type: 'block' },
          { name: 'Tauheed Block', type: 'block' },
          { name: 'Tipu Sultan Block', type: 'block' },
          { name: 'Umer Block', type: 'block' },
          { name: 'Usman Block', type: 'block' },
        ]
      },
      {
        name: 'Sector D',
        blocks: [
          { name: 'Block DA', type: 'block' },
          { name: 'Block DB', type: 'block' },
          { name: 'Block DC', type: 'block' },
        ]
      },
      {
        name: 'Sector E',
        blocks: [
          { name: 'Block EA', type: 'block' },
          { name: 'Block EB', type: 'block' },
          { name: 'Block EC', type: 'block' },
          { name: 'Safari Villas 1', type: 'block' },
          { name: 'Safari Villas 2', type: 'block' },
          { name: 'Safari Villas 3', type: 'block' },
        ]
      },
      {
        name: 'Sector F',
        blocks: [
          { name: 'Block FA', type: 'block' },
          { name: 'Block FB', type: 'block' },
          { name: 'Block FC', type: 'block' },
        ]
      },
      {
        name: 'Overseas Enclave',
        blocks: [
          { name: 'Overseas Block 1', type: 'block' },
          { name: 'Overseas Block 2', type: 'block' },
          { name: 'Overseas Block 3', type: 'block' },
          { name: 'Overseas Block 4', type: 'block' },
          { name: 'Overseas Block 5', type: 'block' },
          { name: 'Overseas Block 6', type: 'block' },
          { name: 'Overseas Block 7', type: 'block' },
        ]
      },
      {
        name: 'Golf View Residencia',
        blocks: [
          { name: 'GVR Block A', type: 'block' },
          { name: 'GVR Block B', type: 'block' },
          { name: 'GVR Block C', type: 'block' },
        ]
      },
      {
        name: 'Bahria Orchard',
        blocks: [
          { name: 'Phase 1', type: 'block' },
          { name: 'Phase 2', type: 'block' },
          { name: 'Phase 3', type: 'block' },
          { name: 'Phase 4', type: 'block' },
          { name: 'Eastern Extension', type: 'extension' },
          { name: 'Western Extension', type: 'extension' },
          { name: 'OLC Block A', type: 'block' },
          { name: 'OLC Block B', type: 'block' },
          { name: 'OLC Block C', type: 'block' },
        ]
      },
    ]
  },
  {
    id: 'lake-city-lahore',
    name: 'Lake City Lahore',
    city: 'Lahore',
    description: 'A large gated community along Raiwind Road',
    phases: [
      {
        name: 'Bella Vista',
        blocks: [
          { name: 'M1', type: 'sector' },
          { name: 'M2', type: 'sector' },
          { name: 'M3', type: 'sector' },
          { name: 'M4', type: 'sector' },
          { name: 'M5', type: 'sector' },
          { name: 'M6', type: 'sector' },
          { name: 'M7', type: 'sector' },
          { name: 'M7-A', type: 'sector' },
          { name: 'M7-B', type: 'sector' },
        ]
      },
      {
        name: 'Bella Verde',
        blocks: [
          { name: 'M7-C', type: 'sector' },
          { name: 'M8', type: 'sector' },
        ]
      },
      {
        name: 'Raiwind Road Sector',
        blocks: [
          { name: 'R1', type: 'sector' },
          { name: 'R2', type: 'sector' },
          { name: 'R3', type: 'sector' },
        ]
      },
    ]
  },
  {
    id: 'park-view-city-lahore',
    name: 'Park View City Lahore',
    city: 'Lahore',
    description: 'A developing society on Multan Road',
    phases: [
      {
        name: 'Main',
        blocks: [
          { name: 'Jade Block', type: 'block' },
          { name: 'Rose Block', type: 'block' },
          { name: 'Tulip Block', type: 'block' },
          { name: 'Tulip Extension', type: 'extension' },
          { name: 'Tulip Overseas Block', type: 'block' },
          { name: 'Topaz Block', type: 'block' },
          { name: 'Crystal Block', type: 'block' },
          { name: 'Jasmine Block', type: 'block' },
          { name: 'Gold Block', type: 'block' },
          { name: 'Platinum Block', type: 'block' },
          { name: 'Diamond Block', type: 'block' },
          { name: 'Pearl Block', type: 'block' },
        ]
      },
    ]
  },
  {
    id: 'askari-lahore',
    name: 'Askari Lahore',
    city: 'Lahore',
    description: 'Askari Housing Societies in Lahore',
    phases: [
      {
        name: 'Askari 9',
        blocks: [
          { name: 'Sector A', type: 'sector' },
          { name: 'Sector B', type: 'sector' },
          { name: 'Sector C', type: 'sector' },
        ]
      },
      {
        name: 'Askari 10',
        blocks: [
          { name: 'Sector A', type: 'sector' },
          { name: 'Sector B', type: 'sector' },
          { name: 'Sector C', type: 'sector' },
          { name: 'Sector D', type: 'sector' },
          { name: 'Sector E', type: 'sector' },
          { name: 'Sector F', type: 'sector' },
        ]
      },
      {
        name: 'Askari 11',
        blocks: [
          { name: 'Sector A', type: 'sector' },
          { name: 'Sector B', type: 'sector' },
          { name: 'Sector C', type: 'sector' },
          { name: 'Sector D', type: 'sector' },
        ]
      },
      {
        name: 'Askari 12',
        blocks: [
          { name: 'Sector 1', type: 'sector' },
          { name: 'Sector 2', type: 'sector' },
          { name: 'Sector 3', type: 'sector' },
        ]
      },
    ]
  },
  {
    id: 'model-town-lahore',
    name: 'Model Town Lahore',
    city: 'Lahore',
    description: 'One of the oldest residential areas in Lahore',
    phases: [
      {
        name: 'Main',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Block D', type: 'block' },
          { name: 'Block E', type: 'block' },
          { name: 'Block F', type: 'block' },
          { name: 'Block G', type: 'block' },
          { name: 'Block H', type: 'block' },
          { name: 'Block J', type: 'block' },
          { name: 'Block K', type: 'block' },
          { name: 'Block L', type: 'block' },
          { name: 'Block M', type: 'block' },
          { name: 'Block N', type: 'block' },
          { name: 'Block P', type: 'block' },
          { name: 'Block Q', type: 'block' },
          { name: 'Block R', type: 'block' },
        ]
      },
      {
        name: 'Extension',
        blocks: [
          { name: 'Model Town Extension', type: 'extension' },
          { name: 'Model Town Link Road', type: 'extension' },
        ]
      },
    ]
  },
  {
    id: 'johar-town-lahore',
    name: 'Johar Town Lahore',
    city: 'Lahore',
    description: 'A well-planned residential area in Lahore',
    phases: [
      {
        name: 'Phase 1',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block A1', type: 'block' },
          { name: 'Block A2', type: 'block' },
          { name: 'Block A3', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block B1', type: 'block' },
          { name: 'Block B2', type: 'block' },
          { name: 'Block B3', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Block C1', type: 'block' },
          { name: 'Block C2', type: 'block' },
          { name: 'Block D', type: 'block' },
          { name: 'Block D1', type: 'block' },
          { name: 'Block D2', type: 'block' },
          { name: 'Block E', type: 'block' },
          { name: 'Block E1', type: 'block' },
          { name: 'Block E2', type: 'block' },
          { name: 'Block F', type: 'block' },
          { name: 'Block F1', type: 'block' },
          { name: 'Block F2', type: 'block' },
          { name: 'Block G', type: 'block' },
          { name: 'Block G1', type: 'block' },
          { name: 'Block G2', type: 'block' },
          { name: 'Block G3', type: 'block' },
          { name: 'Block H', type: 'block' },
          { name: 'Block H1', type: 'block' },
          { name: 'Block H2', type: 'block' },
          { name: 'Block H3', type: 'block' },
          { name: 'Block J', type: 'block' },
          { name: 'Block J1', type: 'block' },
          { name: 'Block J2', type: 'block' },
          { name: 'Block J3', type: 'block' },
          { name: 'Block K', type: 'block' },
          { name: 'Block L', type: 'block' },
          { name: 'Block M', type: 'block' },
          { name: 'Block N', type: 'block' },
          { name: 'Block P', type: 'block' },
          { name: 'Block Q', type: 'block' },
          { name: 'Block R', type: 'block' },
        ]
      },
      {
        name: 'Phase 2',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Block D', type: 'block' },
          { name: 'Block E', type: 'block' },
          { name: 'Block F', type: 'block' },
          { name: 'Block G', type: 'block' },
          { name: 'Block H', type: 'block' },
          { name: 'Block J', type: 'block' },
          { name: 'Block K', type: 'block' },
          { name: 'Block L', type: 'block' },
          { name: 'Block M', type: 'block' },
          { name: 'Block N', type: 'block' },
          { name: 'Block P', type: 'block' },
          { name: 'Block Q', type: 'block' },
          { name: 'Block R', type: 'block' },
        ]
      },
    ]
  },
  {
    id: 'wapda-town-lahore',
    name: 'Wapda Town Lahore',
    city: 'Lahore',
    description: 'WAPDA employees cooperative housing society',
    phases: [
      {
        name: 'Phase 1',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block A1', type: 'block' },
          { name: 'Block A2', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block B1', type: 'block' },
          { name: 'Block B2', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Block C1', type: 'block' },
          { name: 'Block C2', type: 'block' },
          { name: 'Block D', type: 'block' },
          { name: 'Block D1', type: 'block' },
          { name: 'Block D2', type: 'block' },
          { name: 'Block E', type: 'block' },
          { name: 'Block E1', type: 'block' },
          { name: 'Block E2', type: 'block' },
          { name: 'Block F', type: 'block' },
          { name: 'Block F1', type: 'block' },
          { name: 'Block F2', type: 'block' },
          { name: 'Block G', type: 'block' },
          { name: 'Block G1', type: 'block' },
          { name: 'Block H', type: 'block' },
          { name: 'Block J', type: 'block' },
          { name: 'Block K', type: 'block' },
        ]
      },
      {
        name: 'Phase 2',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Block D', type: 'block' },
          { name: 'Block E', type: 'block' },
          { name: 'Block F', type: 'block' },
          { name: 'Block G', type: 'block' },
          { name: 'Block H', type: 'block' },
          { name: 'Block J', type: 'block' },
          { name: 'Block K', type: 'block' },
        ]
      },
    ]
  },
  {
    id: 'cantt-lahore',
    name: 'Lahore Cantt',
    city: 'Lahore',
    description: 'Lahore Cantonment Area',
    phases: [
      {
        name: 'Main Cantt',
        blocks: [
          { name: 'Sarwar Road', type: 'block' },
          { name: 'Shami Road', type: 'block' },
          { name: 'Gulberg Main Boulevard', type: 'block' },
          { name: 'Mall Road', type: 'block' },
          { name: 'Circular Road', type: 'block' },
          { name: 'Fortress Stadium', type: 'block' },
        ]
      },
    ]
  },
  {
    id: 'gulberg-lahore',
    name: 'Gulberg Lahore',
    city: 'Lahore',
    description: 'Premium commercial and residential area',
    phases: [
      {
        name: 'Gulberg I',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
        ]
      },
      {
        name: 'Gulberg II',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Block D', type: 'block' },
        ]
      },
      {
        name: 'Gulberg III',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Block D', type: 'block' },
          { name: 'Block E', type: 'block' },
          { name: 'Main Market', type: 'block' },
          { name: 'Liberty Market', type: 'block' },
          { name: 'M.M. Alam Road', type: 'block' },
        ]
      },
    ]
  },
  {
    id: 'garden-town-lahore',
    name: 'Garden Town Lahore',
    city: 'Lahore',
    description: 'Central Lahore residential area',
    phases: [
      {
        name: 'Main',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Block D', type: 'block' },
          { name: 'Block E', type: 'block' },
          { name: 'Block F', type: 'block' },
          { name: 'Tipu Block', type: 'block' },
          { name: 'Tariq Block', type: 'block' },
          { name: 'Ahmed Block', type: 'block' },
        ]
      },
    ]
  },

  // ==================== ISLAMABAD SOCIETIES ====================
  {
    id: 'dha-islamabad',
    name: 'DHA Islamabad',
    city: 'Islamabad',
    description: 'Defence Housing Authority - Islamabad/Rawalpindi',
    phases: [
      {
        name: 'Phase 1',
        blocks: [
          { name: 'Sector A', type: 'sector' },
          { name: 'Sector B', type: 'sector' },
          { name: 'Sector C', type: 'sector' },
          { name: 'Sector D', type: 'sector' },
          { name: 'Sector E', type: 'sector' },
          { name: 'Sector F', type: 'sector' },
          { name: 'Sector G', type: 'sector' },
          { name: 'Sector H', type: 'sector' },
          { name: 'Sector J', type: 'sector' },
        ]
      },
      {
        name: 'Phase 2',
        blocks: [
          { name: 'Sector A', type: 'sector' },
          { name: 'Sector B', type: 'sector' },
          { name: 'Sector C', type: 'sector' },
          { name: 'Sector D', type: 'sector' },
          { name: 'Sector E', type: 'sector' },
          { name: 'Sector F', type: 'sector' },
          { name: 'Sector G', type: 'sector' },
          { name: 'Sector H', type: 'sector' },
          { name: 'Sector J', type: 'sector' },
          { name: 'Sector K', type: 'sector' },
        ]
      },
      {
        name: 'Phase 3',
        blocks: [
          { name: 'Sector A', type: 'sector' },
          { name: 'Sector B', type: 'sector' },
          { name: 'Sector C', type: 'sector' },
        ]
      },
      {
        name: 'Phase 4',
        blocks: [
          { name: 'Sector A', type: 'sector' },
          { name: 'Sector B', type: 'sector' },
          { name: 'Sector C', type: 'sector' },
        ]
      },
      {
        name: 'Phase 5',
        blocks: [
          { name: 'Sector A', type: 'sector' },
          { name: 'Sector B', type: 'sector' },
          { name: 'Sector C', type: 'sector' },
          { name: 'Sector D', type: 'sector' },
          { name: 'Sector E', type: 'sector' },
          { name: 'Sector F', type: 'sector' },
          { name: 'Sector G', type: 'sector' },
          { name: 'Sector H', type: 'sector' },
        ]
      },
    ]
  },
  {
    id: 'bahria-town-islamabad',
    name: 'Bahria Town Islamabad',
    city: 'Islamabad',
    description: 'Bahria Town Phase 1-8 Islamabad/Rawalpindi',
    phases: [
      {
        name: 'Phase 1',
        blocks: [
          { name: 'Safari Villas', type: 'block' },
          { name: 'Overseas Block', type: 'block' },
        ]
      },
      {
        name: 'Phase 2',
        blocks: [
          { name: 'Safari Villas', type: 'block' },
          { name: 'Civic Center', type: 'block' },
        ]
      },
      {
        name: 'Phase 3',
        blocks: [
          { name: 'Safari Villas', type: 'block' },
          { name: 'Executive Lodges', type: 'block' },
        ]
      },
      {
        name: 'Phase 4',
        blocks: [
          { name: 'Safari Villas', type: 'block' },
          { name: 'Civic Center', type: 'block' },
        ]
      },
      {
        name: 'Phase 5',
        blocks: [
          { name: 'Safari Villas', type: 'block' },
          { name: 'Executive Lodges', type: 'block' },
        ]
      },
      {
        name: 'Phase 6',
        blocks: [
          { name: 'Safari Villas', type: 'block' },
          { name: 'Executive Lodges', type: 'block' },
        ]
      },
      {
        name: 'Phase 7',
        blocks: [
          { name: 'Safari Villas', type: 'block' },
          { name: 'Executive Lodges', type: 'block' },
          { name: 'Overseas Sector', type: 'sector' },
        ]
      },
      {
        name: 'Phase 8',
        blocks: [
          { name: 'Safari Villas', type: 'block' },
          { name: 'Executive Lodges', type: 'block' },
          { name: 'Umer Block', type: 'block' },
          { name: 'Usman Block', type: 'block' },
          { name: 'Awami Villas', type: 'block' },
          { name: 'Sector M', type: 'sector' },
          { name: 'Sector N', type: 'sector' },
          { name: 'Sector O', type: 'sector' },
        ]
      },
    ]
  },

  // ==================== KARACHI SOCIETIES ====================
  {
    id: 'dha-karachi',
    name: 'DHA Karachi',
    city: 'Karachi',
    description: 'Defence Housing Authority - Karachi',
    phases: [
      {
        name: 'Phase 1',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
        ]
      },
      {
        name: 'Phase 2',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Extension', type: 'extension' },
        ]
      },
      {
        name: 'Phase 3',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
        ]
      },
      {
        name: 'Phase 4',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
        ]
      },
      {
        name: 'Phase 5',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Khayaban-e-Tanzeem', type: 'block' },
          { name: 'Badar Commercial', type: 'block' },
          { name: 'Saba Commercial', type: 'block' },
        ]
      },
      {
        name: 'Phase 6',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
          { name: 'Ittehad Commercial', type: 'block' },
          { name: 'Khayaban-e-Shahbaz', type: 'block' },
        ]
      },
      {
        name: 'Phase 7',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Extension', type: 'extension' },
        ]
      },
      {
        name: 'Phase 8',
        blocks: [
          { name: 'Block A', type: 'block' },
          { name: 'Block B', type: 'block' },
          { name: 'Block C', type: 'block' },
        ]
      },
    ]
  },
  {
    id: 'bahria-town-karachi',
    name: 'Bahria Town Karachi',
    city: 'Karachi',
    description: 'Bahria Town Karachi - Super Highway',
    phases: [
      {
        name: 'Precinct 1',
        blocks: [
          { name: 'P1', type: 'block' },
        ]
      },
      {
        name: 'Precinct 2',
        blocks: [
          { name: 'P2', type: 'block' },
        ]
      },
      {
        name: 'Precinct 10',
        blocks: [
          { name: 'P10A', type: 'block' },
          { name: 'P10B', type: 'block' },
        ]
      },
      {
        name: 'Precinct 11',
        blocks: [
          { name: 'P11A', type: 'block' },
          { name: 'P11B', type: 'block' },
        ]
      },
      {
        name: 'Precinct 12',
        blocks: [
          { name: 'P12', type: 'block' },
          { name: 'Ali Block', type: 'block' },
        ]
      },
      {
        name: 'Precinct 15',
        blocks: [
          { name: 'P15A', type: 'block' },
          { name: 'P15B', type: 'block' },
        ]
      },
      {
        name: 'Precinct 27',
        blocks: [
          { name: 'P27', type: 'block' },
        ]
      },
      {
        name: 'Precinct 31',
        blocks: [
          { name: 'P31', type: 'block' },
        ]
      },
      {
        name: 'Bahria Heights',
        blocks: [
          { name: 'Bahria Heights 1', type: 'block' },
          { name: 'Bahria Heights 2', type: 'block' },
          { name: 'Bahria Heights 3', type: 'block' },
          { name: 'Bahria Heights 4', type: 'block' },
          { name: 'Bahria Heights 5', type: 'block' },
          { name: 'Bahria Heights 6', type: 'block' },
        ]
      },
    ]
  },
];

// Helper Functions

/**
 * Get all housing societies
 */
export function getAllSocieties(): HousingSociety[] {
  return HOUSING_SOCIETIES;
}

/**
 * Get societies by city
 */
export function getSocietiesByCity(city: string): HousingSociety[] {
  return HOUSING_SOCIETIES.filter(s => 
    s.city.toLowerCase() === city.toLowerCase()
  );
}

/**
 * Get a society by ID
 */
export function getSocietyById(id: string): HousingSociety | undefined {
  return HOUSING_SOCIETIES.find(s => s.id === id);
}

/**
 * Get phases for a society
 */
export function getPhasesForSociety(societyId: string): Phase[] {
  const society = getSocietyById(societyId);
  return society?.phases || [];
}

/**
 * Get blocks for a specific phase in a society
 */
export function getBlocksForPhase(societyId: string, phaseName: string): Block[] {
  const society = getSocietyById(societyId);
  const phase = society?.phases.find(p => p.name === phaseName);
  return phase?.blocks || [];
}

/**
 * Get unique cities that have housing societies
 */
export function getCitiesWithSocieties(): string[] {
  const cities = new Set(HOUSING_SOCIETIES.map(s => s.city));
  return Array.from(cities);
}

/**
 * Search societies by name or location
 */
export function searchSocieties(query: string): HousingSociety[] {
  const lowerQuery = query.toLowerCase();
  return HOUSING_SOCIETIES.filter(s => 
    s.name.toLowerCase().includes(lowerQuery) ||
    s.city.toLowerCase().includes(lowerQuery) ||
    s.description?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get full location string for a property
 */
export function getFullLocationString(
  societyId: string,
  phase: string,
  block: string
): string {
  const society = getSocietyById(societyId);
  if (!society) return '';
  
  const parts = [society.name];
  if (phase && phase !== 'Main') parts.push(phase);
  if (block) parts.push(block);
  
  return parts.join(', ');
}
