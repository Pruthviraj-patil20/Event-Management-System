const app = require('./app');
const { connectDB } = require('./config/database');
const env = require('./config/environment');
const logger = require('./utils/logger');

const startServer = async () => {
  // Connect to Database (auto fallback to in-memory if needed)
  await connectDB();

  // Check if initial seed is needed (e.g. fresh in-memory database)
  const Event = require('./models/Event');
  const eventCount = await Event.countDocuments();
  if (eventCount === 0) {
    logger.info('Database is empty. Automatically initializing demo dataset...');
    try {
      const User = require('./models/User');
      const Venue = require('./models/Venue');
      const { ROLES, EVENT_STATUS } = require('./config/constants');

      const adminUser = await User.create({
        name: 'Alexander Vance',
        email: 'admin@example.com',
        password: 'Admin123!',
        role: ROLES.ADMIN,
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Lead System Administrator at EventSphere.'
      });

      const organizer1 = await User.create({
        name: 'Elena Rostova',
        email: 'organizer@example.com',
        password: 'Organizer123!',
        role: ROLES.ORGANIZER,
        organizationName: 'Apex Global Summits',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        bio: 'Curating world-class summits and developer conferences.'
      });

      const attendee1 = await User.create({
        name: 'Devon Chen',
        email: 'attendee@example.com',
        password: 'Attendee123!',
        role: ROLES.ATTENDEE,
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
      });

      const v1 = await Venue.create({
        name: 'Silicon Nexus Convention Center',
        address: 'Outer Ring Road, Kadubeesanahalli',
        city: 'Bangalore',
        capacity: 3500,
        createdBy: organizer1._id
      });

      const v2 = await Venue.create({
        name: 'The Grand Pavilion',
        address: 'Senapati Bapat Road',
        city: 'Pune',
        capacity: 2000,
        createdBy: organizer1._id
      });

      const v3 = await Venue.create({
        name: 'BKC Grand Amphitheater',
        address: 'Bandra Kurla Complex',
        city: 'Mumbai',
        capacity: 5000,
        createdBy: organizer1._id
      });

      const eventsData = [
        {
          title: 'FutureTech India 2026',
          description: 'Join over 3,000 engineers, CTOs, and tech innovators for India’s most influential deep tech conference. Keynotes on generative AI models, quantum computing, distributed systems, and decentralized web architectures.',
          shortDescription: 'The premier deep tech conference on AI, Cloud, and Engineering Innovations.',
          category: 'Technology',
          organizer: organizer1._id,
          venue: v1._id,
          venueDetails: { name: v1.name, address: v1.address, city: v1.city },
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          capacity: 3500,
          availableSeats: 3340,
          featured: true,
          status: EVENT_STATUS.PUBLISHED,
          averageRating: 4.9,
          totalReviews: 28,
          ticketTypes: [
            { name: 'Standard', price: 999, quantity: 2500, availableQuantity: 2400 },
            { name: 'VIP', price: 2999, quantity: 1000, availableQuantity: 940 }
          ]
        },
        {
          title: 'Pune Startup Summit 2026',
          description: 'The flagship gathering connecting early-stage founders, angel investors, venture capitalists, and ecosystem builders. Pitch competitions with $250K in non-dilutive grants, hyper-growth masterclasses, and curated matchmaking tables.',
          shortDescription: 'Connect with top venture capitalists, founders, and angel syndicates.',
          category: 'Business',
          organizer: organizer1._id,
          venue: v2._id,
          venueDetails: { name: v2.name, address: v2.address, city: v2.city },
          image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
          date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
          capacity: 2000,
          availableSeats: 1880,
          featured: true,
          status: EVENT_STATUS.PUBLISHED,
          averageRating: 4.8,
          totalReviews: 19,
          ticketTypes: [
            { name: 'Standard', price: 799, quantity: 1500, availableQuantity: 1400 },
            { name: 'VIP', price: 2499, quantity: 500, availableQuantity: 480 }
          ]
        },
        {
          title: 'Music Under The Stars: Acoustic Symphony',
          description: 'An enchanting open-air night celebrating contemporary jazz, acoustic soul, and classical indie crossover performances beneath the open Mumbai sky.',
          shortDescription: 'Magical open-air acoustic indie symphony and gourmet culinary experience.',
          category: 'Music',
          organizer: organizer1._id,
          venue: v3._id,
          venueDetails: { name: v3.name, address: v3.address, city: v3.city },
          image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          capacity: 5000,
          availableSeats: 4600,
          featured: true,
          status: EVENT_STATUS.PUBLISHED,
          averageRating: 4.9,
          totalReviews: 45,
          ticketTypes: [
            { name: 'Standard', price: 899, quantity: 3500, availableQuantity: 3200 },
            { name: 'VIP', price: 2499, quantity: 1500, availableQuantity: 1400 }
          ]
        },
        {
          title: 'AI & Neural Innovation Workshop',
          description: 'An intensive, code-along workshop on building production-grade Large Language Model pipelines, agentic workflows, fine-tuning techniques, and RAG systems.',
          shortDescription: 'Hands-on full-day masterclass on LLMs, Agentic Architectures and RAG.',
          category: 'Workshop',
          organizer: organizer1._id,
          venue: v1._id,
          venueDetails: { name: v1.name, address: v1.address, city: v1.city },
          image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          capacity: 250,
          availableSeats: 190,
          featured: true,
          status: EVENT_STATUS.PUBLISHED,
          averageRating: 4.9,
          totalReviews: 14,
          ticketTypes: [
            { name: 'Standard', price: 1499, quantity: 200, availableQuantity: 150 },
            { name: 'VIP', price: 2999, quantity: 50, availableQuantity: 40 }
          ]
        },
        {
          title: 'Creative Minds Conference & Expo',
          description: 'A sensory explosion of product design, typography, brand identity, UI/UX aesthetics, and creative storytelling.',
          shortDescription: 'World-class product design, brand identity, and creative leadership summit.',
          category: 'Conference',
          organizer: organizer1._id,
          venue: v2._id,
          venueDetails: { name: v2.name, address: v2.address, city: v2.city },
          image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
          date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          capacity: 2800,
          availableSeats: 2600,
          featured: true,
          status: EVENT_STATUS.PUBLISHED,
          averageRating: 5.0,
          totalReviews: 32,
          ticketTypes: [
            { name: 'Standard', price: 649, quantity: 2000, availableQuantity: 1850 },
            { name: 'VIP', price: 1999, quantity: 800, availableQuantity: 750 }
          ]
        },
        {
          title: 'Developer Connect Summit 2026',
          description: 'Two days of high-velocity coding, open source contributor sprints, WebAssembly benchmarks, Rust in production, and modern frontend architecture.',
          shortDescription: 'Hardcore engineering deep-dive on Rust, TypeScript, Distributed Systems & Cloud.',
          category: 'Technology',
          organizer: organizer1._id,
          venue: v1._id,
          venueDetails: { name: v1.name, address: v1.address, city: v1.city },
          image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
          date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
          capacity: 2500,
          availableSeats: 2200,
          featured: true,
          status: EVENT_STATUS.PUBLISHED,
          averageRating: 4.9,
          totalReviews: 22,
          ticketTypes: [
            { name: 'Standard', price: 499, quantity: 2000, availableQuantity: 1750 },
            { name: 'VIP', price: 1899, quantity: 500, availableQuantity: 450 }
          ]
        },
        {
          title: 'National Marathon & Fitness Expo',
          description: 'Lace up for India’s landmark city marathon. Includes full 42K marathon, 21K half-marathon, 10K corporate sprint, plus a 3-day health and sports tech exhibition.',
          shortDescription: 'The premier city endurance marathon and high-performance athletic expo.',
          category: 'Sports',
          organizer: organizer1._id,
          venue: v3._id,
          venueDetails: { name: v3.name, address: v3.address, city: v3.city },
          image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
          date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          capacity: 8000,
          availableSeats: 7200,
          featured: false,
          status: EVENT_STATUS.PUBLISHED,
          averageRating: 4.8,
          totalReviews: 16,
          ticketTypes: [
            { name: 'Standard', price: 750, quantity: 6000, availableQuantity: 5400 },
            { name: 'VIP', price: 1800, quantity: 2000, availableQuantity: 1800 }
          ]
        },
        {
          title: 'Global Fintech & DeFi Summit (Pending Review)',
          description: 'A forward-looking forum analyzing cross-border settlement rails, central bank digital currencies, algorithmic trading systems, and modern banking compliance protocols.',
          shortDescription: 'Examining the transformation of global capital and decentralized rails.',
          category: 'Business',
          organizer: organizer1._id,
          venue: v2._id,
          venueDetails: { name: v2.name, address: v2.address, city: v2.city },
          image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
          date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          capacity: 1200,
          availableSeats: 1200,
          featured: false,
          status: EVENT_STATUS.PENDING,
          ticketTypes: [
            { name: 'Standard', price: 1499, quantity: 1000, availableQuantity: 1000 },
            { name: 'VIP', price: 3499, quantity: 200, availableQuantity: 200 }
          ]
        }
      ];

      const createdEvents = await Event.create(eventsData);

      // Create a sample booking & QR ticket for attendee
      const { generateQRCode } = require('./utils/generateQRCode');
      const Ticket = require('./models/Ticket');
      const Registration = require('./models/Registration');
      const Payment = require('./models/Payment');
      const { generateTicketNumber, generateRegistrationNumber, generateTransactionId } = require('./utils/generateTicket');

      const targetEvent = createdEvents[0];
      const regNumber = generateRegistrationNumber();
      const reg = await Registration.create({
        registrationNumber: regNumber,
        user: attendee1._id,
        event: targetEvent._id,
        attendeeInfo: { name: attendee1.name, email: attendee1.email },
        items: [{ ticketType: 'VIP', price: 2999, quantity: 2, subtotal: 5998 }],
        totalAmount: 5998
      });

      await Payment.create({
        transactionId: generateTransactionId(),
        user: attendee1._id,
        event: targetEvent._id,
        registration: reg._id,
        amount: 5998
      });

      const ticketNum = generateTicketNumber();
      const qrData = await generateQRCode({ t: ticketNum, e: targetEvent._id.toString(), u: attendee1._id.toString(), n: attendee1.name, k: 'VIP' });
      await Ticket.create({
        ticketNumber: ticketNum,
        event: targetEvent._id,
        user: attendee1._id,
        registration: reg._id,
        ticketType: 'VIP',
        price: 2999,
        qrCodeData: qrData,
        attendeeName: attendee1.name,
        attendeeEmail: attendee1.email,
        seatNumber: 'VIP-014'
      });

      logger.success('Auto-seeding complete! Ready with sample events and demo users.');
    } catch (seedErr) {
      logger.error('Auto seed error:', seedErr.message);
    }
  }

  const PORT = env.port;
  const server = app.listen(PORT, () => {
    logger.success(`🚀 EventSphere Server is running in ${env.nodeEnv} mode on http://localhost:${PORT}`);
    logger.info(`✨ Portal: http://localhost:${PORT}`);
    logger.info(`📚 API Health: http://localhost:${PORT}/api/health`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Process terminated.');
    });
  });
};

startServer();
