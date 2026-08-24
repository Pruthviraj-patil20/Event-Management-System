/**
 * EVENTSPHERE — CURATED EVENTS DATASET & RENDER UTILITIES
 * Pure Vanilla JavaScript ES6+
 */

const EVENT_DATASET = [
  {
    id: 1,
    title: "AI Future Summit 2026",
    category: "Technology",
    state: "Maharashtra",
    city: "Mumbai",
    date: "2026-09-15",
    formattedDate: "Sep 15, 2026",
    time: "09:30 AM IST",
    location: "Jio World Convention Centre, BKC",
    price: 1499,
    isFree: false,
    featured: true,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
    description: "Asia's premier artificial intelligence conference gathering frontier researchers, LLM founders, and enterprise leaders to discuss autonomous agents, multimodal architectures, and ethical AI deployment.",
    organizer: {
      name: "NeuralSphere India",
      role: "Global AI Consortium",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Dr. Ananya Roy", role: "Chief Scientist @ DeepMind Labs", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" },
      { name: "Vikram Malhotra", role: "VP of Engineering @ HyperScale", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
      { name: "Sarah Jenkins", role: "AI Ethicist @ OpenSystems", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80" }
    ],
    schedule: [
      { time: "09:30 AM", title: "Keynote: Autonomous Reasoning Models in 2027", desc: "Opening address by Dr. Ananya Roy exploring next-gen inference architectures." },
      { time: "11:30 AM", title: "Panel: Enterprise LLM Deployment at Scale", desc: "Live debate with infrastructure architects and Fortune 500 CTOs." },
      { time: "02:00 PM", title: "Hands-on Workshop: Fine-Tuning Open Source Agents", desc: "Interactive coding session with provided GPU cloud access." },
      { time: "04:30 PM", title: "Startup Showcase & VIP Networking Mixer", desc: "Connect with angel investors and tech founders over coffee." }
    ],
    venueInfo: {
      address: "G Block BKC, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400098",
      landmark: "Near Jio Garden & BKC Metro",
      metro: "Bandra Kurla Complex Metro Station (5 min walk)"
    }
  },
  {
    id: 2,
    title: "Sunburn Arena Global Music Fest",
    category: "Music & Concerts",
    state: "Goa",
    city: "Panaji",
    date: "2026-10-18",
    formattedDate: "Oct 18, 2026",
    time: "04:00 PM IST",
    location: "Vagator Beach Arena, North Goa",
    price: 2499,
    isFree: false,
    featured: true,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80",
    description: "An electrifying sunset-to-midnight electronic dance music experience featuring world-touring DJs, immersive laser stages, and coastal festival vibes.",
    organizer: {
      name: "Percept Live Events",
      role: "Official Festival Host",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "DJ Kyron (Live)", role: "Headlining International Producer", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80" },
      { name: "Aria Wave", role: "Progressive Trance Vocalist", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" }
    ],
    schedule: [
      { time: "04:00 PM", title: "Gates Open & Sunset Acoustic Lounge", desc: "Chill house music and beachside food stalls." },
      { time: "06:30 PM", title: "Opening Set: Progressive Waves", desc: "Energetic beats ramping up the festival energy." },
      { time: "09:00 PM", title: "Grand Headline Performance: DJ Kyron", desc: "2.5-hour mega set with lasers and synchronized pyrotechnics." }
    ],
    venueInfo: {
      address: "Vagator Hilltop, Bardez, Goa 403509",
      landmark: "Near Chapora Fort Viewpoint",
      metro: "Mopa Airport / Thivim Railway Station (30 min drive)"
    }
  },
  {
    id: 3,
    title: "Founders Unplugged & Venture Summit",
    category: "Startups & Business",
    state: "Karnataka",
    city: "Bengaluru",
    date: "2026-09-28",
    formattedDate: "Sep 28, 2026",
    time: "10:00 AM IST",
    location: "Koramangala Tech Club, 5th Block",
    price: 0,
    isFree: true,
    featured: true,
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80",
    description: "Bengaluru's premier gathering for high-growth tech founders, seed investors, and product creators. Authentic unscripted teardowns and venture dealmaking.",
    organizer: {
      name: "Bangalore Venture Guild",
      role: "Startup Accelerator",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Rohan Singhal", role: "Founder & CEO @ CloudPulse (Series B)", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" },
      { name: "Pooja Varma", role: "Managing Partner @ Peak Ventures", avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80" }
    ],
    schedule: [
      { time: "10:00 AM", title: "Breakfast & Fast Pitch Arena", desc: "10 curated seed stage startups pitch in 90 seconds." },
      { time: "11:30 AM", title: "Fireside: Bootstrapping to $10M ARR vs VC Blitzscale", desc: "Honest metrics, customer acquisition costs, and hiring lessons." },
      { time: "01:30 PM", title: "Curated 1-on-1 Investor Speed Dating", desc: "Direct 10-minute meetings with verified venture partners." }
    ],
    venueInfo: {
      address: "80 Feet Road, 5th Block Koramangala, Bengaluru, Karnataka 560095",
      landmark: "Opposite Sony World Junction",
      metro: "Koramangala Metro Station (Under construction - 10 min from Indiranagar)"
    }
  },
  {
    id: 4,
    title: "DesignX India: Future of Interaction",
    category: "Design",
    state: "Delhi",
    city: "New Delhi",
    date: "2026-10-05",
    formattedDate: "Oct 05, 2026",
    time: "10:30 AM IST",
    location: "India Habitat Centre, Lodhi Road",
    price: 899,
    isFree: false,
    featured: true,
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80",
    description: "Explore the intersection of spatial computing, micro-interactions, AI design tooling, and design systems with India's most celebrated product designers.",
    organizer: {
      name: "DesignCraft Guild",
      role: "Design Collective",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Kunal Mehra", role: "Head of Design @ Fintech Unicorn", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80" },
      { name: "Tanvi Iyer", role: "Staff Product Designer @ SpatialWorks", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" }
    ],
    schedule: [
      { time: "10:30 AM", title: "Mastering Spatial UI: Beyond the 2D Screen", desc: "Design principles for VisionOS and WebXR interfaces." },
      { time: "01:00 PM", title: "Design Systems that Scale to 100M Daily Users", desc: "Component architecture, tokens, and multi-brand theming." }
    ],
    venueInfo: {
      address: "Lodhi Road, Near Air Force Bal Bharati School, New Delhi 110003",
      landmark: "Near Lodhi Gardens",
      metro: "JLN Stadium Metro Station (Violet Line)"
    }
  },
  {
    id: 5,
    title: "Deep Learning & Generative Agents Workshop",
    category: "AI Workshops",
    state: "Maharashtra",
    city: "Pune",
    date: "2026-09-20",
    formattedDate: "Sep 20, 2026",
    time: "11:00 AM IST",
    location: "CoEP Auditorium, Shivajinagar",
    price: 499,
    isFree: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80",
    description: "An intensive full-day masterclass on building autonomous LLM agents with LangChain, LlamaIndex, memory persistence, and tool-calling workflows.",
    organizer: {
      name: "Pune Tech Circle",
      role: "Developer Community",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Aditya Kulkarni", role: "AI Research Lead @ CogniTech", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" }
    ],
    schedule: [
      { time: "11:00 AM", title: "Agent Memory Architectures & Graph RAG", desc: "Hands-on implementation of hybrid search and long-term memory." },
      { time: "03:00 PM", title: "Multi-Agent Orchestration & Real-World APIs", desc: "Building self-correcting tool execution pipelines." }
    ],
    venueInfo: {
      address: "Wellesley Rd, Shivajinagar, Pune, Maharashtra 411005",
      landmark: "Near Sancheti Hospital & CoEP Campus",
      metro: "Shivajinagar Metro Station"
    }
  },
  {
    id: 6,
    title: "Hyderabad Marathon & Fitness Expo 2026",
    category: "Sports",
    state: "Telangana",
    city: "Hyderabad",
    date: "2026-10-12",
    formattedDate: "Oct 12, 2026",
    time: "05:30 AM IST",
    location: "Gachibowli Stadium Complex",
    price: 799,
    isFree: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1000&q=80",
    description: "Join over 15,000 running enthusiasts across 10K, Half-Marathon, and Full Marathon categories, featuring hydration hubs and medal ceremonies.",
    organizer: {
      name: "Hyderabad Runners Society",
      role: "Sports Association",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Coach Raman Murthy", role: "Olympic Training Advisor", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" }
    ],
    schedule: [
      { time: "05:30 AM", title: "Flag-Off 42K & 21K Runs", desc: "Main race flag-off with pacing pacers." },
      { time: "08:30 AM", title: "Finish Line Expo & Recovery Lounge", desc: "Physiotherapy zones, protein bars, and medals." }
    ],
    venueInfo: {
      address: "Old Mumbai Highway, Gachibowli, Hyderabad, Telangana 500032",
      landmark: "Near IIIT Hyderabad Junction",
      metro: "Raidurg Metro Station (10 min auto)"
    }
  },
  {
    id: 7,
    title: "Culinary Alchemy: Food & Wine Festival",
    category: "Food & Lifestyle",
    state: "Maharashtra",
    city: "Mumbai",
    date: "2026-10-24",
    formattedDate: "Oct 24, 2026",
    time: "12:00 PM IST",
    location: "Mahalaxmi Racecourse Pavilions",
    price: 1200,
    isFree: false,
    featured: true,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80",
    description: "A gourmet weekend celebrating artisanal wines, celebrity chef live tastings, masterclasses in mixology, and organic food popups from 40+ brands.",
    organizer: {
      name: "Epicurean Collective",
      role: "Gourmet Society",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Chef Ranveer Brar", role: "Celebrity Masterchef", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" }
    ],
    schedule: [
      { time: "12:00 PM", title: "Grand Tasting Pavilion Opens", desc: "Explore 40+ artisan vineyards and craft cheese makers." },
      { time: "04:00 PM", title: "Live Masterclass: Modern Molecular Indian Gastronomy", desc: "Demonstration and tasting by Michelin-starred guest chefs." }
    ],
    venueInfo: {
      address: "Dr E Moses Rd, Keshavrao Khadye Marg, Mahalaxmi, Mumbai 400034",
      landmark: "Opposite Famous Studios",
      metro: "Mahalaxmi Railway Station"
    }
  },
  {
    id: 8,
    title: "Global Tech Leaders & CTO Roundtable",
    category: "Networking",
    state: "Karnataka",
    city: "Bengaluru",
    date: "2026-11-05",
    formattedDate: "Nov 05, 2026",
    time: "06:00 PM IST",
    location: "The Ritz-Carlton, Residency Road",
    price: 3499,
    isFree: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
    description: "An invite-grade evening for Chief Technology Officers, VP of Product, and Enterprise Architects focusing on Cloud-Native Security and High-Availability.",
    organizer: {
      name: "Enterprise Architecture Guild",
      role: "Executive Network",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Deepak Chopra", role: "Global Chief Security Officer", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80" }
    ],
    schedule: [
      { time: "06:00 PM", title: "Cocktail Networking & Welcome Remarks", desc: "Private lounge mixer with senior executives." },
      { time: "07:30 PM", title: "Chatham House Rule Roundtable", desc: "Unrecorded strategic exchange on sovereign cloud infrastructure." }
    ],
    venueInfo: {
      address: "99 Residency Rd, Shanthala Nagar, Ashok Nagar, Bengaluru 560025",
      landmark: "Near Brigade Road junction",
      metro: "MG Road Metro Station (5 min walk)"
    }
  },
  {
    id: 9,
    title: "Jaipur Literature & Cultural Festival",
    category: "Festivals",
    state: "Rajasthan",
    city: "Jaipur",
    date: "2026-11-18",
    formattedDate: "Nov 18, 2026",
    time: "09:00 AM IST",
    location: "Diggi Palace Gardens, Shivaji Marg",
    price: 0,
    isFree: true,
    featured: true,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
    description: "The greatest literary show on Earth. 5 days of debates, poetry recitals, book launches, and heritage music under the regal skies of Rajasthan.",
    organizer: {
      name: "Teamwork Arts",
      role: "Cultural Foundation",
      avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "William Dalrymple", role: "Historian & Author", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" }
    ],
    schedule: [
      { time: "09:00 AM", title: "Morning Ragas & Heritage Chants", desc: "Soulful musical start to the festival proceedings." },
      { time: "11:00 AM", title: "Panel: The Future of Global Storytelling", desc: "Nobel laureates discuss contemporary fiction." }
    ],
    venueInfo: {
      address: "Shivaji Marg, C-Scheme, Sangram Colony, Jaipur 302004",
      landmark: "Near SMS Hospital",
      metro: "Sindhi Camp / Railway Station (10 min drive)"
    }
  },
  {
    id: 10,
    title: "Web3 & Zero Knowledge Summit 2026",
    category: "Technology",
    state: "Delhi",
    city: "New Delhi",
    date: "2026-10-30",
    formattedDate: "Oct 30, 2026",
    time: "10:00 AM IST",
    location: "Pragati Maidan Bharat Mandapam",
    price: 1999,
    isFree: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1000&q=80",
    description: "Dive deep into cryptographic proofs, rollups, decentralized identity protocols, and enterprise blockchain integrations with global core developers.",
    organizer: {
      name: "ZeroKnowledge Collective",
      role: "Protocol Alliance",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Vitaly Chen", role: "Cryptographic Researcher", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" }
    ],
    schedule: [
      { time: "10:00 AM", title: "Keynote: ZK-SNARKs in Consumer Scale Systems", desc: "Scaling trustless verifications with constant time complexity." }
    ],
    venueInfo: {
      address: "Bharat Mandapam, Pragati Maidan, New Delhi 110001",
      landmark: "Near Supreme Court",
      metro: "Supreme Court Metro Station (Blue Line)"
    }
  },
  {
    id: 11,
    title: "Indie Acoustic Sessions & Sunset Lawn",
    category: "Music & Concerts",
    state: "Maharashtra",
    city: "Pune",
    date: "2026-11-14",
    formattedDate: "Nov 14, 2026",
    time: "05:00 PM IST",
    location: "The Orchid Open Amphitheater, Balewadi",
    price: 499,
    isFree: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
    description: "A cozy twilight gathering under the stars with 5 breakthrough independent singer-songwriters, fairy lights, wood-fired pizzas, and warm cider.",
    organizer: {
      name: "Acoustic Unplugged",
      role: "Indie Music Collective",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Prateek Sharma", role: "Folk & Acoustic Guitarist", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" }
    ],
    schedule: [
      { time: "05:00 PM", title: "Acoustic Warmup & Lawn Picnic", desc: "Grab your cushions and artisan snacks." },
      { time: "07:00 PM", title: "Main Stage Candlelight Performances", desc: "Unplugged vocal sets from top independent chart toppers." }
    ],
    venueInfo: {
      address: "Balewadi High St, Baner, Pune, Maharashtra 411045",
      landmark: "Near Balewadi Sports Complex",
      metro: "Balewadi Phata Metro Station"
    }
  },
  {
    id: 12,
    title: "SaaS Scale & Product Growth Summit",
    category: "Startups & Business",
    state: "Tamil Nadu",
    city: "Chennai",
    date: "2026-11-22",
    formattedDate: "Nov 22, 2026",
    time: "09:30 AM IST",
    location: "ITC Grand Chola, Guindy",
    price: 1999,
    isFree: false,
    featured: true,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80",
    description: "Learn how India's top B2B software powerhouses unlock international pipeline growth, product-led expansion, and world-class customer retention.",
    organizer: {
      name: "SaaSBoomi Chapter",
      role: "Product Community",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
    },
    speakers: [
      { name: "Suresh Sambandam", role: "SaaS Veteran & Board Advisor", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80" }
    ],
    schedule: [
      { time: "09:30 AM", title: "Cracking US Enterprise Accounts from India", desc: "Outbound playbooks, positioning, and contract negotiation." }
    ],
    venueInfo: {
      address: "63 Mount Road, Guindy, Chennai, Tamil Nadu 600032",
      landmark: "Opposite Little Mount Metro",
      metro: "Little Mount Metro Station (Direct skywalk)"
    }
  }
];

// Indian States and Cascading Cities Map
const LOCATIONS_MAP = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
  "Delhi": ["New Delhi", "Dwarka", "South Delhi", "Connaught Place"],
  "Telangana": ["Hyderabad", "Warangal", "Secunderabad"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  "Goa": ["Panaji", "Vagator", "Calangute", "Margao"],
  "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara"]
};

// Categories List with curated SVG Icons
const CATEGORIES_LIST = [
  { id: "all", name: "All Events", icon: "✨" },
  { id: "Technology", name: "Technology", icon: "💻" },
  { id: "Music & Concerts", name: "Music & Concerts", icon: "🎵" },
  { id: "Startups & Business", name: "Startups & Business", icon: "🚀" },
  { id: "AI Workshops", name: "AI Workshops", icon: "🧠" },
  { id: "Design", name: "Design", icon: "🎨" },
  { id: "Sports", name: "Sports", icon: "⚡" },
  { id: "Food & Lifestyle", name: "Food & Lifestyle", icon: "🍷" },
  { id: "Festivals", name: "Festivals", icon: "🎪" },
  { id: "Networking", name: "Networking", icon: "🌐" }
];

/**
 * Generates an event card HTML string
 * @param {Object} event 
 * @param {boolean} isBookmarked 
 * @returns {string} HTML markup
 */
function createEventCardHTML(event, isBookmarked = false) {
  const priceDisplay = event.isFree 
    ? `<span class="price-value free">FREE</span>` 
    : `<span class="price-value">₹${event.price.toLocaleString('en-IN')}</span>`;

  return `
    <article class="event-card" data-id="${event.id}">
      <div class="event-card-media">
        <img class="event-card-img" src="${event.image}" alt="${event.title}" loading="lazy" />
        <div class="event-card-overlay"></div>
        <div class="event-card-badges">
          <span class="event-category-pill">${event.category}</span>
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
          <span>${event.formattedDate} • ${event.time.split(' ')[0]} ${event.time.split(' ')[1]}</span>
        </div>
      </div>
      <div class="event-card-body">
        <h3 class="event-card-title">${event.title}</h3>
        <div class="event-card-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>${event.city}, ${event.state}</span>
        </div>
        <p class="event-card-desc">${event.description}</p>
        <div class="event-card-footer">
          <div class="event-card-price">
            <span class="price-label">Starting from</span>
            ${priceDisplay}
          </div>
          <div class="event-card-actions">
            <button class="btn btn-secondary btn-sm" data-action="quick-view" data-id="${event.id}">
              Quick View
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
