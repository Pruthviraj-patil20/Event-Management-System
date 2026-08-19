const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../backend/config/database');
const User = require('../backend/models/User');
const Venue = require('../backend/models/Venue');
const Event = require('../backend/models/Event');
const Ticket = require('../backend/models/Ticket');
const Registration = require('../backend/models/Registration');
const Payment = require('../backend/models/Payment');
const Notification = require('../backend/models/Notification');
const Review = require('../backend/models/Review');
const AdminActivity = require('../backend/models/AdminActivity');
const SystemSettings = require('../backend/models/SystemSettings');
const { generateQRCode } = require('../backend/utils/generateQRCode');
const { generateTicketNumber, generateRegistrationNumber, generateTransactionId } = require('../backend/utils/generateTicket');
const logger = require('../backend/utils/logger');
const { ROLES, EVENT_STATUS, TICKET_STATUS, PAYMENT_STATUS, NOTIFICATION_TYPES } = require('../backend/config/constants');

const seedDatabase = async () => {
  try {
    logger.info('Connecting to database for seeding...');
    await connectDB();

    logger.info('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Venue.deleteMany({}),
      Event.deleteMany({}),
      Ticket.deleteMany({}),
      Registration.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
      Review.deleteMany({}),
      AdminActivity.deleteMany({}),
      SystemSettings.deleteMany({})
    ]);

    logger.info('Creating Demo Users...');
    // 1. Create Users
    const adminUser = await User.create({
      name: 'Alexander Vance',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: ROLES.ADMIN,
      phone: '+91 98201 11223',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Lead System Administrator and Operations Director at EventSphere.'
    });

    const organizer1 = await User.create({
      name: 'Elena Rostova',
      email: 'organizer@example.com',
      password: 'Organizer123!',
      role: ROLES.ORGANIZER,
      phone: '+91 98450 33445',
      organizationName: 'Apex Global Summits',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      bio: 'Curating world-class technology summits, innovation summits, and developer conferences across Asia.'
    });

    const organizer2 = await User.create({
      name: 'Sarah Lin',
      email: 'sarah.innovate@example.com',
      password: 'Organizer123!',
      role: ROLES.ORGANIZER,
      phone: '+91 99887 76655',
      organizationName: 'Hyperion Media & Music',
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      bio: 'Producing unforgettable live music festivals, acoustic nights, and creative arts exhibitions.'
    });

    const attendee1 = await User.create({
      name: 'Devon Chen',
      email: 'attendee@example.com',
      password: 'Attendee123!',
      role: ROLES.ATTENDEE,
      phone: '+91 98112 23344',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      bio: 'Tech enthusiast, full-stack engineer, and avid conference traveler.'
    });

    const attendee2 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      password: 'Attendee123!',
      role: ROLES.ATTENDEE,
      phone: '+91 97654 32100',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      bio: 'Product Designer and Community Builder.'
    });

    logger.info('Creating Premium Venues...');
    // 2. Create Venues
    const venues = await Venue.create([
      {
        name: 'Silicon Nexus Convention Center',
        address: 'Outer Ring Road, Kadubeesanahalli',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        capacity: 3500,
        amenities: ['Gigabit Wi-Fi', 'VIP Lounge', 'Underground Parking', '4K LED Projection', 'Catering Suites'],
        contactEmail: 'contact@siliconnexus.in',
        contactPhone: '+91 80 4455 6677',
        image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1000&q=80',
        createdBy: organizer1._id
      },
      {
        name: 'The Grand Pavilion at Senapati Bapat Road',
        address: 'Senapati Bapat Road, Shivajinagar',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        capacity: 2000,
        amenities: ['Acoustic Stage', 'Executive Suites', 'Valet Parking', 'Broadband Streaming'],
        contactEmail: 'events@grandpavilionpune.com',
        contactPhone: '+91 20 6677 8899',
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80',
        createdBy: organizer1._id
      },
      {
        name: 'BKC Grand Amphitheater',
        address: 'Bandra Kurla Complex, Bandra East',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        capacity: 5000,
        amenities: ['Open-air Stage', 'Laser Lighting Array', 'Food Court', 'Metro Access'],
        contactEmail: 'amphi@bkcevents.com',
        contactPhone: '+91 22 2654 3322',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
        createdBy: organizer2._id
      },
      {
        name: 'HITEC City Innovation Arena',
        address: 'HITEC City, Madhapur',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        capacity: 2800,
        amenities: ['High-speed Fiber', 'Breakout Rooms', 'Exhibition Stalls', 'Media Studio'],
        contactEmail: 'hello@hitecarena.com',
        contactPhone: '+91 40 4567 8900',
        image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1000&q=80',
        createdBy: organizer1._id
      },
      {
        name: 'Aerocity World Arena',
        address: 'Asset 5B, Hospitality District, Aerocity',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        capacity: 4000,
        amenities: ['International Airport Link', 'Luxury Hospitality', 'Multi-lingual Translation Booths'],
        contactEmail: 'booking@aerocityarena.in',
        contactPhone: '+91 11 4987 6543',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
        createdBy: organizer1._id
      }
    ]);

    logger.info('Creating 12+ Comprehensive Events...');
    // 3. Create Events
    const rawEvents = [
      {
        title: 'FutureTech India 2026',
        description: 'Join over 3,000 engineers, CTOs, and tech innovators for India’s most influential deep tech conference. Keynotes on generative AI models, quantum computing, distributed systems, and decentralized web architectures. Featuring over 40 global speakers and live technical workshops.',
        shortDescription: 'The premier deep tech conference on AI, Cloud, and Engineering Innovations.',
        category: 'Technology',
        organizer: organizer1._id,
        venue: venues[0]._id,
        venueDetails: { name: venues[0].name, address: venues[0].address, city: venues[0].city, state: venues[0].state },
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        startTime: '09:00 AM',
        endTime: '06:00 PM',
        capacity: 3500,
        availableSeats: 3340,
        featured: true,
        status: EVENT_STATUS.PUBLISHED,
        averageRating: 4.9,
        totalReviews: 28,
        tags: ['AI', 'Cloud', 'Engineering', 'Web3', 'Architecture'],
        ticketTypes: [
          { name: 'Standard', price: 999, quantity: 2500, availableQuantity: 2400, description: 'Access to main stages, expo hall & digital recordings', perks: ['Keynotes', 'Expo Hall', 'Lunch Box'] },
          { name: 'VIP', price: 2999, quantity: 800, availableQuantity: 760, description: 'Priority stage seating, speakers dinner & VIP lounge access', perks: ['VIP Lounge', 'Speaker Dinner', 'Front Row Seats', 'Swag Kit'] },
          { name: 'Premium', price: 5499, quantity: 200, availableQuantity: 180, description: 'All-inclusive executive pass with 1-on-1 VC mentorship sessions', perks: ['VC Networking', 'Private Briefings', 'All Access'] }
        ]
      },
      {
        title: 'Pune Startup Summit 2026',
        description: 'The flagship gathering connecting early-stage founders, angel investors, venture capitalists, and ecosystem builders. Pitch competitions with $250K in non-dilutive grants, hyper-growth masterclasses, and curated matchmaking tables.',
        shortDescription: 'Connect with top venture capitalists, founders, and angel syndicates.',
        category: 'Business',
        organizer: organizer1._id,
        venue: venues[1]._id,
        venueDetails: { name: venues[1].name, address: venues[1].address, city: venues[1].city, state: venues[1].state },
        image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        startTime: '10:00 AM',
        endTime: '07:00 PM',
        capacity: 2000,
        availableSeats: 1880,
        featured: true,
        status: EVENT_STATUS.PUBLISHED,
        averageRating: 4.8,
        totalReviews: 19,
        tags: ['Startups', 'Venture Capital', 'Pitching', 'Business', 'Growth'],
        ticketTypes: [
          { name: 'Standard', price: 799, quantity: 1500, availableQuantity: 1400, description: 'General attendee badge with access to all pitch sessions', perks: ['Founder Pitches', 'Networking Hall'] },
          { name: 'VIP', price: 2499, quantity: 500, availableQuantity: 480, description: 'Founder badge + 1:1 Investor matchmaking access', perks: ['Investor Matchmaking', 'Speed Dating with VCs', 'Private Lounge'] }
        ]
      },
      {
        title: 'Creative Minds Conference & Expo',
        description: 'A sensory explosion of product design, typography, brand identity, UI/UX aesthetics, and creative storytelling. Hands-on design crits, design system breakdowns by Figma leaders, and interactive creative installations.',
        shortDescription: 'World-class product design, brand identity, and creative leadership summit.',
        category: 'Conference',
        organizer: organizer2._id,
        venue: venues[3]._id,
        venueDetails: { name: venues[3].name, address: venues[3].address, city: venues[3].city, state: venues[3].state },
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        startTime: '09:30 AM',
        endTime: '05:30 PM',
        capacity: 2800,
        availableSeats: 2600,
        featured: true,
        status: EVENT_STATUS.PUBLISHED,
        averageRating: 5.0,
        totalReviews: 32,
        tags: ['Design', 'UI/UX', 'Creativity', 'Branding', 'Typography'],
        ticketTypes: [
          { name: 'Standard', price: 649, quantity: 2000, availableQuantity: 1850, description: 'Conference pass with access to design talks & exhibitor area' },
          { name: 'VIP', price: 1999, quantity: 800, availableQuantity: 750, description: 'Includes hands-on masterclass workshops & portfolio reviews' }
        ]
      },
      {
        title: 'Music Under The Stars: Acoustic Symphony',
        description: 'An enchanting open-air night celebrating contemporary jazz, acoustic soul, and classical indie crossover performances beneath the open Mumbai sky. Featuring multi-platinum instrumentalists and gourmet food pop-ups.',
        shortDescription: 'Magical open-air acoustic indie symphony and gourmet culinary experience.',
        category: 'Music',
        organizer: organizer2._id,
        venue: venues[2]._id,
        venueDetails: { name: venues[2].name, address: venues[2].address, city: venues[2].city, state: venues[2].state },
        image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        startTime: '06:00 PM',
        endTime: '11:30 PM',
        capacity: 5000,
        availableSeats: 4600,
        featured: true,
        status: EVENT_STATUS.PUBLISHED,
        averageRating: 4.9,
        totalReviews: 45,
        tags: ['Music', 'Concert', 'Live Music', 'Acoustic', 'Festival'],
        ticketTypes: [
          { name: 'Standard', price: 899, quantity: 3500, availableQuantity: 3200, description: 'Lawn standing & amphitheater seating entry' },
          { name: 'VIP', price: 2499, quantity: 1200, availableQuantity: 1120, description: 'Reserved premium lounge seating with 2 complimentary drinks' },
          { name: 'Premium', price: 4999, quantity: 300, availableQuantity: 280, description: 'Backstage pass and artist meet & greet' }
        ]
      },
      {
        title: 'AI & Neural Innovation Workshop',
        description: 'An intensive, code-along workshop on building production-grade Large Language Model pipelines, agentic workflows, fine-tuning techniques, and RAG systems using modern Python frameworks and vector databases.',
        shortDescription: 'Hands-on full-day masterclass on LLMs, Agentic Architectures and RAG.',
        category: 'Workshop',
        organizer: organizer1._id,
        venue: venues[0]._id,
        venueDetails: { name: venues[0].name, address: venues[0].address, city: venues[0].city, state: venues[0].state },
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        startTime: '10:00 AM',
        endTime: '05:00 PM',
        capacity: 250,
        availableSeats: 190,
        featured: true,
        status: EVENT_STATUS.PUBLISHED,
        averageRating: 4.9,
        totalReviews: 14,
        tags: ['AI', 'Machine Learning', 'Python', 'Workshop', 'LLM'],
        ticketTypes: [
          { name: 'Standard', price: 1499, quantity: 200, availableQuantity: 150, description: 'Workshop seat, code repository access & GPU cloud credits' },
          { name: 'VIP', price: 2999, quantity: 50, availableQuantity: 40, description: 'Personal mentorship review of your AI product architecture' }
        ]
      },
      {
        title: 'Global Business Leaders Forum',
        description: 'Exclusive executive summit gathering Fortune 500 CEOs, global trade ministers, and economic strategists discussing supply chain resilience, corporate governance, ESG transformations, and multi-market expansion.',
        shortDescription: 'Premier dialogue for enterprise leaders and macroeconomic decision makers.',
        category: 'Business',
        organizer: organizer1._id,
        venue: venues[4]._id,
        venueDetails: { name: venues[4].name, address: venues[4].address, city: venues[4].city, state: venues[4].state },
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startTime: '08:30 AM',
        endTime: '06:00 PM',
        capacity: 1000,
        availableSeats: 850,
        featured: false,
        status: EVENT_STATUS.PUBLISHED,
        averageRating: 4.7,
        totalReviews: 8,
        tags: ['Business', 'Leadership', 'Executive', 'Economy'],
        ticketTypes: [
          { name: 'Standard', price: 3499, quantity: 700, availableQuantity: 600, description: 'Full plenary session pass and delegate luncheon' },
          { name: 'VIP', price: 8999, quantity: 300, availableQuantity: 250, description: 'Gala dinner with keynote ministers and reserved roundtable seat' }
        ]
      },
      {
        title: 'DesignX India Annual Expo',
        description: 'Explore the vanguard of spatial computing, generative UI design, industrial product design, and architectural visualization with live device demos, interactive creative pods, and design talent spotlights.',
        shortDescription: 'The greatest annual gathering of industrial and digital product designers.',
        category: 'Conference',
        organizer: organizer2._id,
        venue: venues[1]._id,
        venueDetails: { name: venues[1].name, address: venues[1].address, city: venues[1].city, state: venues[1].state },
        image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        startTime: '09:00 AM',
        endTime: '06:00 PM',
        capacity: 1500,
        availableSeats: 1350,
        featured: false,
        status: EVENT_STATUS.PUBLISHED,
        averageRating: 4.8,
        totalReviews: 12,
        tags: ['Design', 'UI', 'UX', 'Expo', 'Creativity'],
        ticketTypes: [
          { name: 'Standard', price: 599, quantity: 1200, availableQuantity: 1100, description: 'Full expo access across 3 exhibitor halls' },
          { name: 'VIP', price: 1699, quantity: 300, availableQuantity: 250, description: 'VIP design leader networking breakfast & priority seating' }
        ]
      },
      {
        title: 'Developer Connect Summit 2026',
        description: 'Two days of high-velocity coding, open source contributor sprints, WebAssembly benchmarks, Rust in production, and modern frontend architecture keynotes. Packed with real-world demos and zero sales pitches.',
        shortDescription: 'Hardcore engineering deep-dive on Rust, TypeScript, Distributed Systems & Cloud.',
        category: 'Technology',
        organizer: organizer1._id,
        venue: venues[0]._id,
        venueDetails: { name: venues[0].name, address: venues[0].address, city: venues[0].city, state: venues[0].state },
        image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        startTime: '09:00 AM',
        endTime: '06:00 PM',
        capacity: 2500,
        availableSeats: 2200,
        featured: true,
        status: EVENT_STATUS.PUBLISHED,
        averageRating: 4.9,
        totalReviews: 22,
        tags: ['Developers', 'Engineering', 'TypeScript', 'Rust', 'OpenSource'],
        ticketTypes: [
          { name: 'Standard', price: 499, quantity: 2000, availableQuantity: 1750, description: 'All talk tracks, lunch, coffee & official developer hoodie' },
          { name: 'VIP', price: 1899, quantity: 500, availableQuantity: 450, description: 'Speaker lounge access & VIP hackathon team registration' }
        ]
      },
      {
        title: 'National Marathon & Fitness Expo',
        description: 'Lace up for India’s landmark city marathon. Includes full 42K marathon, 21K half-marathon, 10K corporate sprint, plus a 3-day health and sports tech exhibition featuring Olympian athletic coaches.',
        shortDescription: 'The premier city endurance marathon and high-performance athletic expo.',
        category: 'Sports',
        organizer: organizer2._id,
        venue: venues[2]._id,
        venueDetails: { name: venues[2].name, address: venues[2].address, city: venues[2].city, state: venues[2].state },
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        startTime: '05:30 AM',
        endTime: '01:00 PM',
        capacity: 8000,
        availableSeats: 7200,
        featured: false,
        status: EVENT_STATUS.PUBLISHED,
        averageRating: 4.8,
        totalReviews: 16,
        tags: ['Sports', 'Marathon', 'Fitness', 'Athletics'],
        ticketTypes: [
          { name: 'Standard', price: 750, quantity: 6000, availableQuantity: 5400, description: 'BIB with RFID timing chip, dry-fit finisher t-shirt & medal' },
          { name: 'VIP', price: 1800, quantity: 2000, availableQuantity: 1800, description: 'Priority starting coral, physio recovery lounge & VIP tent' }
        ]
      },
      {
        title: 'Indie Fusion Festival 2026',
        description: 'A 3-day weekend festival uniting 24 independent bands, indie-folk artists, electro-acoustic producers, art bazaars, artisan coffee roasters, and culinary craftsmen.',
        shortDescription: 'Multi-genre indie bands, art bazaar, and handcrafted food popups.',
        category: 'Festival',
        organizer: organizer2._id,
        venue: venues[2]._id,
        venueDetails: { name: venues[2].name, address: venues[2].address, city: venues[2].city, state: venues[2].state },
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        startTime: '02:00 PM',
        endTime: '11:00 PM',
        capacity: 6000,
        availableSeats: 5500,
        featured: true,
        status: EVENT_STATUS.PUBLISHED,
        averageRating: 4.9,
        totalReviews: 38,
        tags: ['Festival', 'Music', 'Food', 'Culture', 'Indie'],
        ticketTypes: [
          { name: 'Standard', price: 1299, quantity: 4500, availableQuantity: 4100, description: 'Single-day festival pass with full stage access' },
          { name: 'VIP', price: 2999, quantity: 1500, availableQuantity: 1400, description: 'Full 3-Day Season Pass with elevated viewing deck' }
        ]
      },
      {
        title: 'CyberSec World Congress',
        description: 'Elite gathering of global CISOs, ethical security researchers, and defense architects exploring zero-trust architectures, quantum cryptography threats, and AI-driven threat mitigation.',
        shortDescription: 'Zero-trust defense, cyber threat intelligence, and red-team warfare.',
        category: 'Technology',
        organizer: organizer1._id,
        venue: venues[4]._id,
        venueDetails: { name: venues[4].name, address: venues[4].address, city: venues[4].city, state: venues[4].state },
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        startTime: '09:00 AM',
        endTime: '05:30 PM',
        capacity: 1800,
        availableSeats: 1600,
        featured: false,
        status: EVENT_STATUS.PUBLISHED,
        averageRating: 4.8,
        totalReviews: 11,
        tags: ['Security', 'CyberSec', 'Cloud', 'Enterprise'],
        ticketTypes: [
          { name: 'Standard', price: 1999, quantity: 1400, availableQuantity: 1250, description: 'General delegate pass and technical whitepaper access' },
          { name: 'VIP', price: 4499, quantity: 400, availableQuantity: 350, description: 'Closed-door CISO roundtables and executive dinner' }
        ]
      },
      {
        title: 'NextGen Robotics & Autonomous Systems Workshop',
        description: 'Hands-on lab exploring ROS2, computer vision edge processing, LIDAR mapping, and robotic arm kinematics with real hardware kits and simulation environments.',
        shortDescription: 'Hardware & software deep dive into autonomous mobile robotics and ROS2.',
        category: 'Education',
        organizer: organizer1._id,
        venue: venues[3]._id,
        venueDetails: { name: venues[3].name, address: venues[3].address, city: venues[3].city, state: venues[3].state },
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        startTime: '09:00 AM',
        endTime: '04:30 PM',
        capacity: 150,
        availableSeats: 120,
        featured: false,
        status: EVENT_STATUS.PUBLISHED,
        averageRating: 4.9,
        totalReviews: 9,
        tags: ['Robotics', 'Education', 'Hardware', 'AI', 'Engineering'],
        ticketTypes: [
          { name: 'Standard', price: 1200, quantity: 120, availableQuantity: 95, description: 'Workshop seat with microcontroller toolkit to keep' },
          { name: 'VIP', price: 2500, quantity: 30, availableQuantity: 25, description: 'Includes advanced sensor kit and 1-on-1 project mentoring' }
        ]
      },
      {
        title: 'Global Fintech & DeFi Summit (Pending Review)',
        description: 'A forward-looking forum analyzing cross-border settlement rails, central bank digital currencies, algorithmic trading systems, and modern banking compliance protocols.',
        shortDescription: 'Examining the transformation of global capital and decentralized rails.',
        category: 'Business',
        organizer: organizer1._id,
        venue: venues[1]._id,
        venueDetails: { name: venues[1].name, address: venues[1].address, city: venues[1].city, state: venues[1].state },
        image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        startTime: '10:00 AM',
        endTime: '06:00 PM',
        capacity: 1200,
        availableSeats: 1200,
        featured: false,
        status: EVENT_STATUS.PENDING, // Pending event for admin approval demonstration
        averageRating: 5.0,
        totalReviews: 0,
        tags: ['Fintech', 'Banking', 'DeFi', 'Finance'],
        ticketTypes: [
          { name: 'Standard', price: 1499, quantity: 1000, availableQuantity: 1000, description: 'Standard delegate admission' },
          { name: 'VIP', price: 3499, quantity: 200, availableQuantity: 200, description: 'Executive pass with private reception access' }
        ]
      }
    ];

    const createdEvents = await Event.create(rawEvents);
    logger.info(`Successfully created ${createdEvents.length} events.`);

    // 4. Create Sample Registrations and Tickets with QR Codes for Attendee 1
    logger.info('Creating Sample Bookings & Dynamic QR Tickets for Demo Attendee...');
    const targetEvent = createdEvents[0]; // FutureTech India
    const regNumber = generateRegistrationNumber();

    const registration = await Registration.create({
      registrationNumber: regNumber,
      user: attendee1._id,
      event: targetEvent._id,
      attendeeInfo: {
        name: attendee1.name,
        email: attendee1.email,
        phone: attendee1.phone
      },
      items: [
        {
          ticketType: 'VIP',
          price: 2999,
          quantity: 2,
          subtotal: 5998
        }
      ],
      totalAmount: 5998,
      paymentStatus: PAYMENT_STATUS.COMPLETED,
      paymentMethod: 'Credit Card',
      paymentId: generateTransactionId()
    });

    await Payment.create({
      transactionId: registration.paymentId,
      user: attendee1._id,
      event: targetEvent._id,
      registration: registration._id,
      amount: 5998,
      currency: 'INR',
      paymentMethod: 'Credit Card',
      status: PAYMENT_STATUS.COMPLETED
    });

    for (let i = 1; i <= 2; i++) {
      const ticketNum = generateTicketNumber();
      const qrData = await generateQRCode({
        t: ticketNum,
        e: targetEvent._id.toString(),
        u: attendee1._id.toString(),
        n: attendee1.name,
        k: 'VIP',
        v: targetEvent.venueDetails.name,
        d: targetEvent.date
      });

      await Ticket.create({
        ticketNumber: ticketNum,
        event: targetEvent._id,
        user: attendee1._id,
        registration: registration._id,
        ticketType: 'VIP',
        price: 2999,
        qrCodeData: qrData,
        status: TICKET_STATUS.CONFIRMED,
        attendeeName: i === 1 ? attendee1.name : 'Sarah Chen (Guest)',
        attendeeEmail: attendee1.email,
        seatNumber: `VIP-0${i + 12}`
      });
    }

    // Also create 1 ticket for Pune Startup Summit for attendee 1
    const event2 = createdEvents[1];
    const regNumber2 = generateRegistrationNumber();
    const reg2 = await Registration.create({
      registrationNumber: regNumber2,
      user: attendee1._id,
      event: event2._id,
      attendeeInfo: { name: attendee1.name, email: attendee1.email, phone: attendee1.phone },
      items: [{ ticketType: 'Standard', price: 799, quantity: 1, subtotal: 799 }],
      totalAmount: 799,
      paymentStatus: PAYMENT_STATUS.COMPLETED,
      paymentMethod: 'UPI',
      paymentId: generateTransactionId()
    });

    const ticketNum2 = generateTicketNumber();
    const qrData2 = await generateQRCode({
      t: ticketNum2,
      e: event2._id.toString(),
      u: attendee1._id.toString(),
      n: attendee1.name,
      k: 'Standard',
      v: event2.venueDetails.name,
      d: event2.date
    });

    await Ticket.create({
      ticketNumber: ticketNum2,
      event: event2._id,
      user: attendee1._id,
      registration: reg2._id,
      ticketType: 'Standard',
      price: 799,
      qrCodeData: qrData2,
      status: TICKET_STATUS.CONFIRMED,
      attendeeName: attendee1.name,
      attendeeEmail: attendee1.email,
      seatNumber: 'STD-104'
    });

    // Additional bookings across events so dashboards, payments & reports feel real
    const bookingSpecs = [
      { event: createdEvents[2], user: attendee2, type: 'Standard', price: 649, qty: 2, method: 'UPI' },
      { event: createdEvents[3], user: attendee2, type: 'VIP', price: 2499, qty: 1, method: 'Credit Card' },
      { event: createdEvents[4], user: attendee1, type: 'Standard', price: 1499, qty: 1, method: 'Net Banking' },
      { event: createdEvents[5], user: attendee2, type: 'VIP', price: 8999, qty: 1, method: 'Credit Card' },
      { event: createdEvents[7], user: attendee1, type: 'Standard', price: 499, qty: 3, method: 'UPI' },
      { event: createdEvents[9], user: attendee2, type: 'VIP', price: 2999, qty: 2, method: 'Credit Card' },
      { event: createdEvents[10], user: attendee1, type: 'Standard', price: 1999, qty: 1, method: 'Net Banking' }
    ];

    for (const spec of bookingSpecs) {
      const reg = await Registration.create({
        registrationNumber: generateRegistrationNumber(),
        user: spec.user._id,
        event: spec.event._id,
        attendeeInfo: { name: spec.user.name, email: spec.user.email, phone: spec.user.phone },
        items: [{ ticketType: spec.type, price: spec.price, quantity: spec.qty, subtotal: spec.price * spec.qty }],
        totalAmount: spec.price * spec.qty,
        paymentStatus: PAYMENT_STATUS.COMPLETED,
        paymentMethod: spec.method,
        paymentId: generateTransactionId()
      });

      await Payment.create({
        transactionId: reg.paymentId,
        user: spec.user._id,
        event: spec.event._id,
        registration: reg._id,
        amount: spec.price * spec.qty,
        currency: 'INR',
        paymentMethod: spec.method,
        status: PAYMENT_STATUS.COMPLETED
      });

      for (let i = 0; i < spec.qty; i++) {
        const ticketNum = generateTicketNumber();
        const qrData = await generateQRCode({
          t: ticketNum,
          e: spec.event._id.toString(),
          u: spec.user._id.toString(),
          n: spec.user.name,
          k: spec.type,
          v: spec.event.venueDetails.name,
          d: spec.event.date
        });
        await Ticket.create({
          ticketNumber: ticketNum,
          event: spec.event._id,
          user: spec.user._id,
          registration: reg._id,
          ticketType: spec.type,
          price: spec.price,
          qrCodeData: qrData,
          status: TICKET_STATUS.CONFIRMED,
          attendeeName: spec.user.name,
          attendeeEmail: spec.user.email,
          seatNumber: `${spec.type.slice(0, 3).toUpperCase()}-${100 + i}`
        });
      }
    }

    // A failed payment + a pending registration for admin insight
    const failedReg = await Registration.create({
      registrationNumber: generateRegistrationNumber(),
      user: attendee2._id,
      event: createdEvents[8]._id,
      attendeeInfo: { name: attendee2.name, email: attendee2.email, phone: attendee2.phone },
      items: [{ ticketType: 'Standard', price: 750, quantity: 2, subtotal: 1500 }],
      totalAmount: 1500,
      paymentStatus: PAYMENT_STATUS.FAILED,
      paymentMethod: 'Credit Card',
      paymentId: generateTransactionId()
    });
    await Payment.create({
      transactionId: failedReg.paymentId,
      user: attendee2._id,
      event: createdEvents[8]._id,
      registration: failedReg._id,
      amount: 1500,
      currency: 'INR',
      paymentMethod: 'Credit Card',
      status: PAYMENT_STATUS.FAILED
    });

    await Registration.create({
      registrationNumber: generateRegistrationNumber(),
      user: attendee1._id,
      event: createdEvents[11]._id,
      attendeeInfo: { name: attendee1.name, email: attendee1.email, phone: attendee1.phone },
      items: [{ ticketType: 'Standard', price: 1200, quantity: 1, subtotal: 1200 }],
      totalAmount: 1200,
      paymentStatus: PAYMENT_STATUS.PENDING,
      paymentMethod: 'UPI',
      paymentId: generateTransactionId()
    });

    // 5. Create Reviews
    logger.info('Creating Sample Reviews...');
    await Review.create([
      {
        event: targetEvent._id,
        user: attendee1._id,
        rating: 5,
        title: 'Outstanding speaker lineup and organization!',
        comment: 'The venue facilities, stage production, and tech talks were truly world class. Cannot wait for next year!'
      },
      {
        event: targetEvent._id,
        user: attendee2._id,
        rating: 5,
        title: 'Mind-blowing AI demos',
        comment: 'High density of actionable engineering insights. Networking lounge was top-tier.'
      },
      {
        event: event2._id,
        user: attendee2._id,
        rating: 5,
        title: 'Met our lead seed investor here!',
        comment: 'The structured pitch tables were unmatched. High ROI for any early-stage startup.'
      },
      {
        event: createdEvents[3]._id,
        user: attendee1._id,
        rating: 2,
        title: 'Audio mix was off for the front rows',
        comment: 'The lineup was great but the front-row sound balancing ruined the first act for us.',
        status: 'hidden'
      }
    ]);

    // 6. Create Notifications
    logger.info('Creating Sample In-App Notifications...');
    await Notification.create([
      {
        recipient: attendee1._id,
        title: 'Ticket Booking Confirmed! 🎉',
        message: 'Your 2 VIP tickets for "FutureTech India 2026" are ready. Download your digital QR pass anytime.',
        type: NOTIFICATION_TYPES.TICKET_CONFIRMED,
        link: '/dashboard/tickets.html',
        isRead: false
      },
      {
        recipient: attendee1._id,
        title: 'Event Reminder ⏰',
        message: 'FutureTech India 2026 starts in 10 days at Silicon Nexus Convention Center.',
        type: NOTIFICATION_TYPES.REMINDER,
        link: `/event-details.html?id=${targetEvent._id}`,
        isRead: true
      },
      {
        recipient: organizer1._id,
        title: 'New Registration Alert',
        message: 'Devon Chen booked 2 VIP tickets for FutureTech India 2026 (₹5,998).',
        type: NOTIFICATION_TYPES.REGISTRATION,
        link: '/dashboard/attendees.html',
        isRead: false
      },
      {
        recipient: adminUser._id,
        title: 'Event Moderation Required',
        message: 'A new event "Global Fintech & DeFi Summit" was submitted by Elena Rostova for platform approval.',
        type: NOTIFICATION_TYPES.SYSTEM,
        link: '/admin/event-approvals.html',
        isRead: false
      },
      {
        recipient: adminUser._id,
        title: 'New Registration Alert',
        message: 'Priya Patel booked 1 VIP ticket for Music Under The Stars (₹2,499).',
        type: NOTIFICATION_TYPES.REGISTRATION,
        link: '/admin/registrations.html',
        isRead: false
      },
      {
        recipient: adminUser._id,
        title: 'Payment Failed',
        message: 'A payment of ₹1,500 for National Marathon & Fitness Expo failed and needs attention.',
        type: NOTIFICATION_TYPES.SYSTEM,
        link: '/admin/payments.html',
        isRead: false
      }
    ]);

    // 7. Seed default system settings
    logger.info('Creating Default System Settings...');
    await SystemSettings.create({ key: 'platform' });

    // 8. Seed admin activity audit trail
    logger.info('Creating Admin Activity Log...');
    await AdminActivity.create([
      {
        admin: adminUser._id,
        adminName: adminUser.name,
        action: 'SYSTEM_SEEDED',
        targetType: 'system',
        targetLabel: 'EventSphere Database',
        details: 'Initial platform seed with demo data completed.',
        status: 'success'
      },
      {
        admin: adminUser._id,
        adminName: adminUser.name,
        action: 'EVENT_APPROVED',
        targetType: 'event',
        targetId: createdEvents[0]._id,
        targetLabel: createdEvents[0].title,
        details: 'Approved and published.',
        status: 'success'
      },
      {
        admin: adminUser._id,
        adminName: adminUser.name,
        action: 'EVENT_REJECTED',
        targetType: 'event',
        targetId: createdEvents[12]._id,
        targetLabel: createdEvents[12].title,
        details: 'Duplicate of an already scheduled summit.',
        status: 'success'
      },
      {
        admin: adminUser._id,
        adminName: adminUser.name,
        action: 'USER_SUSPENDED',
        targetType: 'user',
        targetId: attendee2._id,
        targetLabel: attendee2.name,
        details: 'Temporary suspension during spam investigation.',
        status: 'success'
      },
      {
        admin: adminUser._id,
        adminName: adminUser.name,
        action: 'REVIEW_HIDDEN',
        targetType: 'review',
        targetLabel: 'Music Under The Stars review',
        details: 'Hidden pending content review.',
        status: 'success'
      },
      {
        admin: adminUser._id,
        adminName: adminUser.name,
        action: 'SETTINGS_UPDATED',
        targetType: 'settings',
        targetLabel: 'System Settings',
        details: 'Default notification preferences applied.',
        status: 'success'
      }
    ]);

    logger.success('✅ EventSphere Database seeded successfully with high-fidelity realistic data!');
    logger.info('----------------------------------------------------');
    logger.info('Demo Credentials:');
    logger.info('  Admin:     admin@example.com      / Admin123!');
    logger.info('  Organizer: organizer@example.com  / Organizer123!');
    logger.info('  Attendee:  attendee@example.com   / Attendee123!');
    logger.info('----------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    logger.error(`Database seeding failed: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();
