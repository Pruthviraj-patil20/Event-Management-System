/**
 * EVENTSPHERE — CURATED LIVE & UPCOMING EVENTS DATASET & DATA ACCESS LAYER
 * Pure Vanilla JavaScript ES6+
 * API-Ready Architecture for seamless backend integration
 */

// API Configuration Block (Toggleable for future real backend API)
const API_CONFIG = {
  enabled: false,
  baseURL: "https://api.eventsphere.io/v1",
  eventsEndpoint: "/events"
};

/**
 * Generates dynamic timestamps relative to current client time so there are always
 * realistic LIVE, TODAY, TOMORROW, and UPCOMING events.
 */
function createRelativeDate(offsetHours = 0) {
  const d = new Date();
  d.setTime(d.getTime() + offsetHours * 60 * 60 * 1000);
  return d.toISOString();
}

// 28+ Rich Curated Mock Events across Indian Metros & 18 Categories
const MOCK_EVENTS = [
  // --- 🔴 LIVE EVENTS (Happening Right Now) ---
  {
    id: 1,
    title: "Pune Startup & Founder Networking Night",
    category: "Startups",
    city: "Pune",
    state: "Maharashtra",
    venue: "Viman Nagar Tech Hub, Phoenix Marketcity Area",
    startDateTime: createRelativeDate(-1.5), // Started 1.5 hours ago
    endDateTime: createRelativeDate(2),    // Ends in 2 hours
    price: 0,
    isFree: true,
    featured: true,
    popularity: 98,
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80",
    description: "An electric live mixer connecting high-growth SaaS founders, angel investors, and product innovators over coffee and live pitch teardowns in Pune.",
    organizer: {
      name: "Pune Tech Collective",
      role: "Venture Accelerator",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Siddharth Deshmukh", role: "Founder @ NeoCloud Pune", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" }
    ],
    venueInfo: {
      address: "S No 207, Viman Nagar Road, Pune, Maharashtra 411014",
      landmark: "Near Symbiosis Campus",
      metro: "Ramwadi Metro Station (10 min walk)"
    }
  },
  {
    id: 2,
    title: "Mumbai Late-Night Sunset Jazz & Fusion Lounge",
    category: "Music",
    city: "Mumbai",
    state: "Maharashtra",
    venue: "The St. Regis Penthouse Lounge, Lower Parel",
    startDateTime: createRelativeDate(-2), // Started 2 hours ago
    endDateTime: createRelativeDate(2.5),    // Ends in 2.5 hours
    price: 1499,
    isFree: false,
    featured: true,
    popularity: 96,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
    description: "An intimate live jazz and contemporary blues experience with panoramic sea view terraces and artisan cocktails.",
    organizer: {
      name: "Bombay Sound Project",
      role: "Music Collective",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Anandita Mukherjee", role: "Contemporary Saxophonist", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" }
    ],
    venueInfo: {
      address: "462 Senapati Bapat Marg, Lower Parel, Mumbai 400013",
      landmark: "Palladium High Street Phoenix",
      metro: "Lower Parel Railway & Monorail"
    }
  },
  {
    id: 3,
    title: "Bengaluru AI Agents & LLM Hackathon Live Demo",
    category: "AI",
    city: "Bengaluru",
    state: "Karnataka",
    venue: "Koramangala 80ft Road Innovation Labs",
    startDateTime: createRelativeDate(-3), // Started 3 hours ago
    endDateTime: createRelativeDate(3),  // Ends in 3 hours
    price: 0,
    isFree: true,
    featured: true,
    popularity: 99,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80",
    description: "Witness 20 finalist developer teams demo autonomous AI coding agents and multimodal tools in real time before top Tier-1 VCs.",
    organizer: {
      name: "Bangalore AI Guild",
      role: "Developer Network",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Rohan Iyer", role: "Principal Architect @ DevGen AI", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80" }
    ],
    venueInfo: {
      address: "80 Feet Road, 4th Block Koramangala, Bengaluru 560034",
      landmark: "Opposite Maharaja Signal",
      metro: "Indiranagar Metro (15 min auto)"
    }
  },
  {
    id: 4,
    title: "Delhi Standup Comedy Open Mic Nights",
    category: "Comedy",
    city: "Delhi",
    state: "Delhi",
    venue: "The Comedy Club, Hauz Khas Village",
    startDateTime: createRelativeDate(-1),
    endDateTime: createRelativeDate(2),
    price: 399,
    isFree: false,
    featured: false,
    popularity: 88,
    image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1000&q=80",
    description: "Non-stop laughter featuring 8 of the NCR circuit's sharpest rising comedic talents testing brand-new unreleased material.",
    organizer: {
      name: "Delhi Laugh Factory",
      role: "Comedy Guild",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [],
    venueInfo: {
      address: "Building 12, Hauz Khas Village, New Delhi 110016",
      landmark: "Near Deer Park Gate",
      metro: "IIT Delhi Metro Station (Magenta Line)"
    }
  },

  // --- ⏰ STARTING SOON (In 30 mins to a few hours) ---
  {
    id: 5,
    title: "Hyderabad CyberSec & Cloud Defense Summit",
    category: "Technology",
    city: "Hyderabad",
    state: "Telangana",
    venue: "HITEC City Cyber Towers Arena",
    startDateTime: createRelativeDate(0.75), // Starts in 45 mins
    endDateTime: createRelativeDate(4),
    price: 799,
    isFree: false,
    featured: true,
    popularity: 94,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80",
    description: "Deep dive into zero-trust architectures, sovereign cloud protection, and automated threat hunting with enterprise cybersecurity heads.",
    organizer: {
      name: "Telangana Security Council",
      role: "Tech Association",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Dr. K. Srinivas", role: "Chief Security Officer", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" }
    ],
    venueInfo: {
      address: "Cyber Towers, Hitech City Rd, Madhapur, Hyderabad 500081",
      landmark: "Next to Inorbit Mall Junction",
      metro: "Hitec City Metro Station (Direct walk)"
    }
  },
  {
    id: 6,
    title: "Pune UI/UX Design Systems Workshop",
    category: "Design",
    city: "Pune",
    state: "Maharashtra",
    venue: "Kalyani Nagar Creative Hub",
    startDateTime: createRelativeDate(1.5), // Starts in 1.5 hours
    endDateTime: createRelativeDate(5.5),
    price: 499,
    isFree: false,
    featured: false,
    popularity: 91,
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80",
    description: "Hands-on masterclass in structuring multi-brand Figma tokens, component libraries, and accessibility standards for enterprise web apps.",
    organizer: {
      name: "Pune Design Collective",
      role: "Design Community",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Ruchi Joshi", role: "Staff Designer @ FinPulse", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" }
    ],
    venueInfo: {
      address: "East Avenue, Kalyani Nagar, Pune, Maharashtra 411006",
      landmark: "Opposite Jogger's Park",
      metro: "Kalyani Nagar Metro Station"
    }
  },

  // --- 📅 TOMORROW & THIS WEEK ---
  {
    id: 7,
    title: "AI Future Summit India 2026",
    category: "AI",
    city: "Mumbai",
    state: "Maharashtra",
    venue: "Jio World Convention Centre, BKC",
    startDateTime: createRelativeDate(20), // Tomorrow morning
    endDateTime: createRelativeDate(29),
    price: 1999,
    isFree: false,
    featured: true,
    popularity: 100,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
    description: "Asia's marquee AI conference gathering global AI researchers, LLM founders, and Fortune 500 engineering leaders.",
    organizer: {
      name: "NeuralSphere India",
      role: "Global AI Consortium",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Dr. Ananya Roy", role: "Chief Scientist @ DeepMind Labs", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" }
    ],
    venueInfo: {
      address: "G Block BKC, Bandra Kurla Complex, Bandra East, Mumbai 400098",
      landmark: "Near Jio Garden & BKC Metro",
      metro: "Bandra Kurla Complex Metro Station (5 min walk)"
    }
  },
  {
    id: 8,
    title: "Goa Sunset Electronic Beach Carnival",
    category: "Festivals",
    city: "Goa",
    state: "Goa",
    venue: "Vagator Hilltop Arena, North Goa",
    startDateTime: createRelativeDate(26), // Tomorrow evening
    endDateTime: createRelativeDate(36),
    price: 2499,
    isFree: false,
    featured: true,
    popularity: 97,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80",
    description: "An unforgettable sunset-to-dawn coastal festival with world-class international producers, immersive stage lasers, and artisan beach markets.",
    organizer: {
      name: "Percept Live Events",
      role: "Official Festival Host",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [],
    venueInfo: {
      address: "Vagator Hilltop, Bardez, Goa 403509",
      landmark: "Near Chapora Fort Viewpoint",
      metro: "Mopa Airport (30 min drive)"
    }
  },
  {
    id: 9,
    title: "Bengaluru Product Management Masterclass",
    category: "Workshops",
    city: "Bengaluru",
    state: "Karnataka",
    venue: "Indiranagar 100ft Rd Executive Center",
    startDateTime: createRelativeDate(42),
    endDateTime: createRelativeDate(48),
    price: 999,
    isFree: false,
    featured: false,
    popularity: 89,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=80",
    description: "Proven frameworks for product-market fit, enterprise roadmapping, and data-informed feature prioritization from top tech PMs.",
    organizer: {
      name: "Product Leaders Forum",
      role: "Career Accelerator",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [],
    venueInfo: {
      address: "100 Feet Rd, Indiranagar, Bengaluru 560038",
      landmark: "Near CMH Hospital junction",
      metro: "Indiranagar Metro Station"
    }
  },
  {
    id: 10,
    title: "Chennai SaaS Scaling & US Enterprise Playbook",
    category: "Business",
    city: "Chennai",
    state: "Tamil Nadu",
    venue: "ITC Grand Chola, Guindy",
    startDateTime: createRelativeDate(50),
    endDateTime: createRelativeDate(58),
    price: 1899,
    isFree: false,
    featured: true,
    popularity: 93,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80",
    description: "Learn how India's top B2B software companies build high-velocity international pipelines and close $100k+ ACV contracts.",
    organizer: {
      name: "SaaS Growth Guild",
      role: "B2B Alliance",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [],
    venueInfo: {
      address: "63 Mount Road, Guindy, Chennai 600032",
      landmark: "Opposite Little Mount Metro",
      metro: "Little Mount Metro Station (Direct skywalk)"
    }
  },
  {
    id: 11,
    title: "Ahmedabad Food Truck & Artisan Gastronomy Festival",
    category: "Food",
    city: "Ahmedabad",
    state: "Gujarat",
    venue: "Riverfront Event Ground, Sabarmati",
    startDateTime: createRelativeDate(64),
    endDateTime: createRelativeDate(72),
    price: 150,
    isFree: false,
    featured: false,
    popularity: 85,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80",
    description: "A mouthwatering celebration with over 50 gourmet food trucks, artisan bakery popups, live acoustic bands, and interactive cooking battles.",
    organizer: {
      name: "Gujarat Foodies Guild",
      role: "Culinary Association",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [],
    venueInfo: {
      address: "Sabarmati Riverfront West, Ahmedabad, Gujarat 380009",
      landmark: "Near Ellis Bridge",
      metro: "Old High Court Metro Station"
    }
  },
  {
    id: 12,
    title: "Jaipur Heritage Art & Classical Fusion Nights",
    category: "Art & Culture",
    city: "Jaipur",
    state: "Rajasthan",
    venue: "Diggi Palace Open Lawns",
    startDateTime: createRelativeDate(70),
    endDateTime: createRelativeDate(76),
    price: 0,
    isFree: true,
    featured: false,
    popularity: 87,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
    description: "An evocative evening of Rajasthani folk fusion, miniature painting exhibits, and heritage storytelling under the palace lanterns.",
    organizer: {
      name: "Rajasthan Cultural Foundation",
      role: "Heritage Society",
      avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [],
    venueInfo: {
      address: "Shivaji Marg, C-Scheme, Jaipur 302004",
      landmark: "Near SMS Hospital",
      metro: "Sindhi Camp Station"
    }
  },
  {
    id: 13,
    title: "Kolkata Indie Cinema & Short Film Screening",
    category: "Movies",
    city: "Kolkata",
    state: "West Bengal",
    venue: "Nandan Cultural Complex, Rabindra Sadan",
    startDateTime: createRelativeDate(85),
    endDateTime: createRelativeDate(92),
    price: 200,
    isFree: false,
    featured: false,
    popularity: 82,
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80",
    description: "Exclusive premiere screenings of 6 international festival-selected short films followed by an interactive Q&A with the directors.",
    organizer: {
      name: "Bengal Film Guild",
      role: "Cinema Society",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [],
    venueInfo: {
      address: "1/1 AJC Bose Road, Rabindra Sadan, Kolkata 700020",
      landmark: "Opposite Exide Building",
      metro: "Rabindra Sadan Metro Station"
    }
  },
  {
    id: 14,
    title: "Chandigarh 10K Marathon & Urban Run",
    category: "Sports",
    city: "Chandigarh",
    state: "Punjab",
    venue: "Sukhna Lake Promenade",
    startDateTime: createRelativeDate(110),
    endDateTime: createRelativeDate(116),
    price: 599,
    isFree: false,
    featured: false,
    popularity: 84,
    image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1000&q=80",
    description: "Lace up for a scenic morning run along the Shivalik foothills with timed RFID bibs, recovery zones, and finisher medals.",
    organizer: {
      name: "Chandigarh Athletics Club",
      role: "Sports Club",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [],
    venueInfo: {
      address: "Sector 1, Sukhna Lake, Chandigarh 160001",
      landmark: "Main Lake Entrance",
      metro: "Chandigarh Bus Terminus (10 min drive)"
    }
  },
  {
    id: 15,
    title: "Lucknow Awadhi Heritage Food Trail",
    category: "Food",
    city: "Lucknow",
    state: "Uttar Pradesh",
    venue: "Hazratganj Heritage Square",
    startDateTime: createRelativeDate(130),
    endDateTime: createRelativeDate(136),
    price: 499,
    isFree: false,
    featured: false,
    popularity: 86,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
    description: "Guided royal gastronomy walk tasting slow-cooked dum biryani, melt-in-mouth galouti kebabs, and traditional shahi tukda.",
    organizer: {
      name: "Awadh Heritage Walks",
      role: "Culture Group",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [],
    venueInfo: {
      address: "Hazratganj, Lucknow, Uttar Pradesh 226001",
      landmark: "Near Capitol Cinema",
      metro: "Hazratganj Metro Station"
    }
  },
  {
    id: 16,
    title: "Indore Tech & DevOps Community Day",
    category: "Education",
    city: "Indore",
    state: "Madhya Pradesh",
    venue: "Brilliant Convention Centre, Vijay Nagar",
    startDateTime: createRelativeDate(145),
    endDateTime: createRelativeDate(153),
    price: 0,
    isFree: true,
    featured: false,
    popularity: 89,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80",
    description: "Deep dive into Kubernetes, Terraform, Platform Engineering, and GitOps workflows for cloud architects in Central India.",
    organizer: {
      name: "Indore DevOps Chapter",
      role: "Developer Community",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [],
    venueInfo: {
      address: "Plot No. 5, Scheme No 78, Part II, Vijay Nagar, Indore 452010",
      landmark: "Near Radisson Blu Square",
      metro: "Vijay Nagar Metro Junction"
    }
  },
  {
    id: 17,
    title: "Nagpur Electric Mobility & Clean Energy Expo",
    category: "Conferences",
    city: "Nagpur",
    state: "Maharashtra",
    venue: "Suresh Bhat Auditorium, Reshim Bagh",
    startDateTime: createRelativeDate(160),
    endDateTime: createRelativeDate(168),
    price: 350,
    isFree: false,
    featured: false,
    popularity: 81,
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1000&q=80",
    description: "India's central logistics hub gathers EV battery manufacturers, charging station operators, and urban mobility innovators.",
    organizer: {
      name: "CleanTech India",
      role: "Sustainability Forum",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [],
    venueInfo: {
      address: "Great Nag Rd, Reshim Bagh, Nagpur, Maharashtra 440009",
      landmark: "Near CPWD Quarters",
      metro: "Congress Nagar Metro Station"
    }
  },
  {
    id: 18,
    title: "Surat Diamond City Textile & Fashion Showcase",
    category: "Entertainment",
    city: "Surat",
    state: "Gujarat",
    venue: "Surat International Exhibition Centre (SIECC)",
    startDateTime: createRelativeDate(180),
    endDateTime: createRelativeDate(188),
    price: 800,
    isFree: false,
    featured: false,
    popularity: 83,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
    description: "Grand runway presentations, sustainable couture showcases, and luxury apparel buyers trade meet.",
    organizer: {
      name: "Surat Fashion Guild",
      role: "Apparel Alliance",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [],
    venueInfo: {
      address: "Sarsana, Khajod, Surat, Gujarat 395007",
      landmark: "Near Surat Diamond Bourse",
      metro: "Surat Airport Road"
    }
  },
  {
    id: 19,
    title: "Pune Web3 Cryptography & Smart Contract Security",
    category: "Technology",
    city: "Pune",
    state: "Maharashtra",
    venue: "Amanora Park Town Town Centre",
    startDateTime: createRelativeDate(200),
    endDateTime: createRelativeDate(208),
    price: 0,
    isFree: true,
    featured: false,
    popularity: 90,
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1000&q=80",
    description: "Audit vulnerabilities, EVM gas optimization tricks, and cryptographic proof verifications in a live red-team coding arena.",
    organizer: {
      name: "Pune Web3 Club",
      role: "Security Community",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [],
    venueInfo: {
      address: "Magarpatta Rd, Hadapsar, Pune, Maharashtra 411028",
      landmark: "Amanora Mall Plaza",
      metro: "Hadapsar Bus Terminus"
    }
  },
  {
    id: 20,
    title: "Bengaluru Craft Coffee & Barista Championship",
    category: "Food",
    city: "Bengaluru",
    state: "Karnataka",
    venue: "Church Street Art & Coffee Pavilions",
    startDateTime: createRelativeDate(220),
    endDateTime: createRelativeDate(228),
    price: 300,
    isFree: false,
    featured: false,
    popularity: 88,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80",
    description: "Experience single-origin Chikmagalur roasts, latte art throwdowns, cupping workshops, and manual brew masterclasses.",
    organizer: {
      name: "Specialty Coffee Association India",
      role: "Roaster Guild",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [],
    venueInfo: {
      address: "Church Street, Shanthala Nagar, Ashok Nagar, Bengaluru 560001",
      landmark: "Near MG Road Metro Exit",
      metro: "MG Road Metro Station (2 min walk)"
    }
  }
];

// All India Supported Cities
const INDIA_CITIES = [
  "All India",
  "Pune",
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Goa",
  "Lucknow",
  "Chandigarh",
  "Indore",
  "Nagpur",
  "Surat"
];

// 18 Standard Categories with icons
const ALL_CATEGORIES = [
  { id: "all", name: "All Categories", icon: "✨" },
  { id: "Technology", name: "Technology", icon: "💻" },
  { id: "AI", name: "AI", icon: "🧠" },
  { id: "Startups", name: "Startups", icon: "🚀" },
  { id: "Business", name: "Business", icon: "💼" },
  { id: "Music", name: "Music", icon: "🎵" },
  { id: "Concerts", name: "Concerts", icon: "🎸" },
  { id: "Festivals", name: "Festivals", icon: "🎪" },
  { id: "Sports", name: "Sports", icon: "⚡" },
  { id: "Education", name: "Education", icon: "🎓" },
  { id: "Workshops", name: "Workshops", icon: "🛠️" },
  { id: "Conferences", name: "Conferences", icon: "🎙️" },
  { id: "Networking", name: "Networking", icon: "🌐" },
  { id: "Design", name: "Design", icon: "🎨" },
  { id: "Comedy", name: "Comedy", icon: "🎭" },
  { id: "Food", name: "Food", icon: "🍷" },
  { id: "Art & Culture", name: "Art & Culture", icon: "🏛️" },
  { id: "Movies", name: "Movies", icon: "🎬" },
  { id: "Entertainment", name: "Entertainment", icon: "🍿" }
];

// Backward-compatible alias
const CATEGORIES_LIST = ALL_CATEGORIES;
const LOCATIONS_MAP = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru"],
  "Delhi": ["New Delhi", "South Delhi", "Dwarka"],
  "Telangana": ["Hyderabad", "Secunderabad"],
  "Tamil Nadu": ["Chennai", "Coimbatore"],
  "Goa": ["Panaji", "Vagator", "Margao"],
  "Rajasthan": ["Jaipur", "Udaipur"],
  "Gujarat": ["Ahmedabad", "Surat"],
  "West Bengal": ["Kolkata"],
  "Punjab": ["Chandigarh"],
  "Uttar Pradesh": ["Lucknow"],
  "Madhya Pradesh": ["Indore"]
};

/**
 * ASYNC DATA ACCESS LAYER
 * Fetches events from API if enabled, otherwise returns enriched mock dataset.
 * Designed so API can be integrated without UI rewrites.
 */
async function getEvents() {
  if (API_CONFIG.enabled && API_CONFIG.baseURL) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.eventsEndpoint}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : data.events || [];
    } catch (err) {
      console.warn("EventSphere API unavailable, falling back to mock dataset:", err);
      return MOCK_EVENTS;
    }
  }

  // Simulated micro latency for realistic async feel
  await new Promise(resolve => setTimeout(resolve, 60));
  return MOCK_EVENTS;
}

// Global Dataset Reference
const EVENT_DATASET = MOCK_EVENTS;

/**
 * Determines whether an event is currently live based on client clock
 * @param {Object} event 
 * @returns {boolean}
 */
function isEventLive(event) {
  if (!event || !event.startDateTime || !event.endDateTime) return false;
  const now = new Date();
  const start = new Date(event.startDateTime);
  const end = new Date(event.endDateTime);
  return now >= start && now <= end;
}

/**
 * Returns the computed status: 'LIVE', 'UPCOMING', or 'ENDED'
 * @param {Object} event 
 * @returns {'LIVE' | 'UPCOMING' | 'ENDED'}
 */
function getEventStatus(event) {
  if (!event || !event.startDateTime || !event.endDateTime) return 'UPCOMING';
  const now = new Date();
  const start = new Date(event.startDateTime);
  const end = new Date(event.endDateTime);

  if (now >= start && now <= end) return 'LIVE';
  if (now < start) return 'UPCOMING';
  return 'ENDED';
}

/**
 * Calculates human-readable time remaining for upcoming events
 * @param {Object} event 
 * @returns {string}
 */
function getTimeRemainingString(event) {
  if (!event || !event.startDateTime) return "Upcoming";
  const now = new Date();
  const start = new Date(event.startDateTime);
  const diffMs = start - now;

  if (diffMs <= 0) return "Happening now";

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `Starts in ${diffMins} min${diffMins === 1 ? '' : 's'}`;
  } else if (diffHours < 24) {
    return `Starts in ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  } else if (diffDays === 1) {
    return `Starts tomorrow`;
  } else if (diffDays < 7) {
    return `Starts in ${diffDays} days`;
  } else {
    return `Starts on ${start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
  }
}

/**
 * Formats start and end times into clean range: "6:00 PM – 9:00 PM"
 */
function formatEventTimeRange(startISO, endISO) {
  const start = startISO ? new Date(startISO) : new Date();
  const end = endISO ? new Date(endISO) : new Date();

  const formatTime = (d) => d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const formattedDate = start.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return {
    date: formattedDate,
    timeRange: `${formatTime(start)} – ${formatTime(end)}`
  };
}

/**
 * Creates rich Event Card HTML with dynamic Live/Upcoming status badge
 */
function createEventCardHTML(event, isBookmarked = false) {
  const status = getEventStatus(event);
  const timeInfo = formatEventTimeRange(event.startDateTime, event.endDateTime);
  const countdown = getTimeRemainingString(event);

  const priceDisplay = event.isFree 
    ? `<span class="price-value free">FREE</span>` 
    : `<span class="price-value">₹${event.price.toLocaleString('en-IN')}</span>`;

  // Status Badge Markup
  let statusBadge = '';
  if (status === 'LIVE') {
    statusBadge = `
      <span class="badge-live-now" title="Happening Right Now">
        <span class="live-pulse-dot"></span> LIVE NOW
      </span>
    `;
  } else if (status === 'UPCOMING') {
    const isSoon = countdown.includes('min') || countdown.includes('hour');
    statusBadge = `
      <span class="badge-upcoming ${isSoon ? 'soon' : ''}">
        ${isSoon ? '⏰ ' : ''}${countdown}
      </span>
    `;
  } else {
    statusBadge = `<span class="badge-ended">ENDED</span>`;
  }

  return `
    <article class="event-card ${status === 'LIVE' ? 'is-live-card' : ''}" data-id="${event.id}">
      <div class="event-card-media">
        <img class="event-card-img" src="${event.image}" alt="${event.title}" loading="lazy" />
        <div class="event-card-overlay"></div>
        <div class="event-card-badges">
          <div style="display: flex; gap: 6px; align-items: center;">
            ${statusBadge}
            <span class="event-category-pill">${event.category}</span>
          </div>
          <button class="event-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                  data-action="bookmark" 
                  data-id="${event.id}" 
                  aria-label="Save ${event.title}" 
                  title="${isBookmarked ? 'Remove bookmark' : 'Save event'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>
        <div class="event-date-chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>${timeInfo.date} • ${timeInfo.timeRange}</span>
        </div>
      </div>
      <div class="event-card-body">
        <h3 class="event-card-title">${event.title}</h3>
        <div class="event-card-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span><strong>${event.city}</strong> • ${event.venue || event.location}</span>
        </div>
        <p class="event-card-desc">${event.description}</p>
        <div class="event-card-footer">
          <div class="event-card-price">
            <span class="price-label">Price</span>
            ${priceDisplay}
          </div>
          <div class="event-card-actions">
            <button class="btn btn-secondary btn-sm" data-action="quick-view" data-id="${event.id}">
              View Event
            </button>
            <a href="event-details.html?id=${event.id}" class="btn btn-primary btn-sm">
              Details →
            </a>
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Creates Large Featured Live Card markup for "Happening Right Now" spotlight
 */
function createFeaturedLiveCardHTML(event, isBookmarked = false) {
  const timeInfo = formatEventTimeRange(event.startDateTime, event.endDateTime);
  const priceDisplay = event.isFree ? 'FREE ENTRY' : `₹${event.price.toLocaleString('en-IN')}`;

  return `
    <div class="featured-live-card" data-id="${event.id}">
      <div class="featured-live-media">
        <img src="${event.image}" alt="${event.title}" class="featured-live-img" />
        <div class="featured-live-overlay"></div>
        <div class="featured-live-badge-row">
          <span class="badge-live-now large">
            <span class="live-pulse-dot"></span> LIVE NOW
          </span>
          <span class="event-category-pill">${event.category}</span>
        </div>
      </div>
      <div class="featured-live-content">
        <div class="featured-live-time">⏰ ${timeInfo.timeRange}</div>
        <h3 class="featured-live-title">${event.title}</h3>
        <p class="featured-live-desc">${event.description}</p>
        <div class="featured-live-location">
          <span>📍 <strong>${event.city}</strong>, ${event.state} • ${event.venue || event.location}</span>
        </div>
        <div class="featured-live-footer">
          <div class="featured-live-price">${priceDisplay}</div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" data-action="quick-view" data-id="${event.id}">
              Quick View
            </button>
            <a href="event-details.html?id=${event.id}" class="btn btn-primary btn-sm">
              Join Experience →
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Attach all functions & datasets to window for global access
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
  window.MOCK_EVENTS = MOCK_EVENTS;
  window.EVENT_DATASET = MOCK_EVENTS;
  window.ALL_CATEGORIES = ALL_CATEGORIES;
  window.CATEGORIES_LIST = ALL_CATEGORIES;
  window.INDIA_CITIES = INDIA_CITIES;
  window.LOCATIONS_MAP = LOCATIONS_MAP;
  window.isEventLive = isEventLive;
  window.getEventStatus = getEventStatus;
  window.getTimeRemainingString = getTimeRemainingString;
  window.formatEventTimeRange = formatEventTimeRange;
  window.createEventCardHTML = createEventCardHTML;
  window.createFeaturedLiveCardHTML = createFeaturedLiveCardHTML;
  window.getEvents = getEvents;
}
