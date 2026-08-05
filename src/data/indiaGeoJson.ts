// Accurate GeoJSON Boundaries & Metadata for Key Indian States & NGO Operational Hubs

export interface NGOProjectLocation {
  id: string;
  name: string;
  location: string;
  state: string;
  lat: number;
  lng: number;
  scale: 'major' | 'regional' | 'local';
  program: string;
  beneficiaries: number;
  fundingLakhs: number;
  status: 'Active' | 'On Track' | 'At Risk' | 'Completed';
}

export interface StateGeoMetadata {
  stateId: string;
  name: string;
  center: [number, number]; // [lat, lng]
  bounds?: [[number, number], [number, number]];
  reach: number;
  fundingLakhs: number;
  projectsCount: number;
  beneficiaries: number;
  volunteers: number;
  impactScore: number;
  momGrowth: string;
  topPrograms: string[];
}

export const STATE_METADATA_MAP: Record<string, StateGeoMetadata> = {
  'Uttar Pradesh': {
    stateId: 'IN-UP',
    name: 'Uttar Pradesh',
    center: [26.8467, 80.9462],
    reach: 18500,
    fundingLakhs: 425, // ₹4.25 Cr
    projectsCount: 18,
    beneficiaries: 18500,
    volunteers: 110,
    impactScore: 86,
    momGrowth: '+14.2%',
    topPrograms: ['Healthcare', 'Education', 'Women Empowerment']
  },
  'Maharashtra': {
    stateId: 'IN-MH',
    name: 'Maharashtra',
    center: [19.7515, 75.7139],
    reach: 12100,
    fundingLakhs: 312, // ₹3.12 Cr
    projectsCount: 12,
    beneficiaries: 12100,
    volunteers: 85,
    impactScore: 90,
    momGrowth: '+18.5%',
    topPrograms: ['Environment', 'Healthcare', 'Skill Development']
  },
  'Bihar': {
    stateId: 'IN-BR',
    name: 'Bihar',
    center: [25.0961, 85.3131],
    reach: 9800,
    fundingLakhs: 195, // ₹1.95 Cr
    projectsCount: 9,
    beneficiaries: 9800,
    volunteers: 75,
    impactScore: 68,
    momGrowth: '+9.4%',
    topPrograms: ['Education', 'Women Empowerment', 'Healthcare']
  },
  'Haryana': {
    stateId: 'IN-HR',
    name: 'Haryana',
    center: [29.0588, 76.0856],
    reach: 8400,
    fundingLakhs: 280, // ₹2.80 Cr
    projectsCount: 14,
    beneficiaries: 8400,
    volunteers: 95,
    impactScore: 88,
    momGrowth: '+12.1%',
    topPrograms: ['Education', 'Skill Development', 'Healthcare']
  },
  'Delhi': {
    stateId: 'IN-DL',
    name: 'Delhi',
    center: [28.6139, 77.2090],
    reach: 6200,
    fundingLakhs: 245, // ₹2.45 Cr
    projectsCount: 11,
    beneficiaries: 6200,
    volunteers: 140,
    impactScore: 92,
    momGrowth: '+15.8%',
    topPrograms: ['Skill Development', 'Education', 'Environment']
  },
  'Rajasthan': {
    stateId: 'IN-RJ',
    name: 'Rajasthan',
    center: [27.0238, 74.2179],
    reach: 5400,
    fundingLakhs: 185, // ₹1.85 Cr
    projectsCount: 8,
    beneficiaries: 5400,
    volunteers: 65,
    impactScore: 82,
    momGrowth: '+8.7%',
    topPrograms: ['Women Empowerment', 'Environment', 'Education']
  }
};

export const NGO_PROJECT_LOCATIONS: NGOProjectLocation[] = [
  {
    id: 'LOC-01',
    name: 'Pratham Shiksha — Digital STEM Labs',
    location: 'Gurugram, Haryana',
    state: 'Haryana',
    lat: 28.4595,
    lng: 77.0266,
    scale: 'major',
    program: 'Education',
    beneficiaries: 5420,
    fundingLakhs: 45,
    status: 'On Track'
  },
  {
    id: 'LOC-02',
    name: 'Aarogya Seva — Mobile Health Fleet',
    location: 'Varanasi, Uttar Pradesh',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lng: 82.9739,
    scale: 'major',
    program: 'Healthcare',
    beneficiaries: 11450,
    fundingLakhs: 68,
    status: 'At Risk'
  },
  {
    id: 'LOC-03',
    name: 'Nari Shakti — Micro-Enterprise Incubator',
    location: 'Jaipur, Rajasthan',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    scale: 'regional',
    program: 'Women Empowerment',
    beneficiaries: 2980,
    fundingLakhs: 32,
    status: 'On Track'
  },
  {
    id: 'LOC-04',
    name: 'Kaushal Vikas — Youth Apprenticeships',
    location: 'South Delhi, Delhi',
    state: 'Delhi',
    lat: 28.5355,
    lng: 77.2610,
    scale: 'regional',
    program: 'Skill Development',
    beneficiaries: 1920,
    fundingLakhs: 50,
    status: 'Completed'
  },
  {
    id: 'LOC-05',
    name: 'Jal Raksha — Rainwater Harvesting',
    location: 'Pune, Maharashtra',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    scale: 'regional',
    program: 'Environment',
    beneficiaries: 10500,
    fundingLakhs: 42,
    status: 'On Track'
  },
  {
    id: 'LOC-06',
    name: 'Shiksha Setu — Girls Secondary Education',
    location: 'Patna, Bihar',
    state: 'Bihar',
    lat: 25.5941,
    lng: 85.1376,
    scale: 'regional',
    program: 'Education',
    beneficiaries: 2800,
    fundingLakhs: 38,
    status: 'On Track'
  },
  {
    id: 'LOC-07',
    name: 'Lucknow Maternal Health Screening',
    location: 'Lucknow, Uttar Pradesh',
    state: 'Uttar Pradesh',
    lat: 26.8467,
    lng: 80.9462,
    scale: 'local',
    program: 'Healthcare',
    beneficiaries: 1840,
    fundingLakhs: 18,
    status: 'Active'
  },
  {
    id: 'LOC-08',
    name: 'Faridabad Digital Pedagogy Unit',
    location: 'Faridabad, Haryana',
    state: 'Haryana',
    lat: 28.4089,
    lng: 77.3178,
    scale: 'local',
    program: 'Education',
    beneficiaries: 1200,
    fundingLakhs: 15,
    status: 'Active'
  }
];

// Simplified Accurate GeoJSON FeatureCollection for Key Indian States
export const INDIA_STATES_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Haryana', stateId: 'IN-HR' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76.8, 30.9], [77.6, 30.5], [77.4, 29.8], [77.1, 28.8], [76.9, 28.1],
          [76.2, 27.8], [75.3, 28.2], [75.1, 29.5], [76.0, 30.3], [76.8, 30.9]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Delhi', stateId: 'IN-DL' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.0, 28.88], [77.34, 28.88], [77.34, 28.4], [77.0, 28.4], [77.0, 28.88]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Uttar Pradesh', stateId: 'IN-UP' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.4, 29.8], [78.5, 30.2], [80.2, 28.8], [82.5, 28.3], [84.3, 27.2],
          [84.6, 26.2], [83.4, 24.5], [81.8, 24.7], [79.8, 24.3], [78.2, 24.7],
          [77.5, 27.2], [77.1, 28.8], [77.4, 29.8]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Rajasthan', stateId: 'IN-RJ' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [73.8, 29.9], [75.3, 28.2], [76.2, 27.8], [77.5, 27.2], [78.2, 24.7],
          [75.8, 24.2], [73.5, 24.5], [70.5, 26.2], [69.6, 27.2], [71.5, 29.2],
          [73.8, 29.9]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Maharashtra', stateId: 'IN-MH' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [72.8, 20.2], [74.5, 21.8], [78.5, 21.5], [80.8, 21.2], [80.3, 18.8],
          [77.5, 18.2], [74.2, 15.8], [73.3, 16.2], [72.8, 18.9], [72.8, 20.2]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Bihar', stateId: 'IN-BR' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [84.3, 27.2], [87.5, 27.4], [88.2, 26.2], [87.5, 25.2], [85.8, 24.5],
          [83.4, 24.5], [84.6, 26.2], [84.3, 27.2]
        ]]
      }
    }
  ]
};
