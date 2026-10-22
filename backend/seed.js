const dotenv = require('dotenv');
dotenv.config();
const { db } = require('./config/firebase');


const sampleEvents = [
  {
    title: 'HackCampus 2026: AI & Web3 Hackathon',
    description: 'Join the premier 36-hour collegiate hackathon exploring cutting-edge generative AI, cloud systems, and decentralization. Cash prizes, tech mentorship, and sponsor bounties.',
    category: 'Technical',
    date: '2026-11-15',
    time: '09:00 AM',
    venue: 'Main Auditorium & Innovation Lab',
    maxParticipants: 350,
    registeredCount: 0,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    status: 'approved',
    isDeleted: false,
  },
  {
    title: 'Spring Rhythm: Inter-College Cultural Fest',
    description: 'An electrifying celebration of collegiate dance, vocal performances, battle of the bands, and theatrical arts across campuses.',
    category: 'Cultural',
    date: '2026-11-20',
    time: '05:00 PM',
    venue: 'Open Air Amphitheatre',
    maxParticipants: 800,
    registeredCount: 0,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    status: 'approved',
    isDeleted: false,
  },
  {
    title: 'Campus Champions: Annual Football Championship',
    description: 'Cheer on your department in the grand finals of the inter-branch football tournament.',
    category: 'Sports',
    date: '2026-11-25',
    time: '03:30 PM',
    venue: 'University Sports Complex',
    maxParticipants: 500,
    registeredCount: 0,
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    status: 'approved',
    isDeleted: false,
  },
  {
    title: 'Full-Stack Cloud Architecture Workshop',
    description: 'Hands-on intensive masterclass on microservices, cloud deployments, and resilient API architectures.',
    category: 'Workshop',
    date: '2026-12-01',
    time: '10:00 AM',
    venue: 'Seminar Hall 3',
    maxParticipants: 120,
    registeredCount: 0,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    status: 'approved',
    isDeleted: false,
  },
  {
    title: 'Valorant & BGMI Campus Esports Arena',
    description: 'LAN tournament featuring high-stakes tactical shooter matchups, custom spectator displays, and tournament trophies.',
    category: 'Gaming',
    date: '2026-12-05',
    time: '11:00 AM',
    venue: 'Computer Center Lab 2',
    maxParticipants: 200,
    registeredCount: 0,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    status: 'approved',
    isDeleted: false,
  },
];

const seedData = async () => {
  try {
    console.log('🔥 Initializing Firestore seeding for CampusConnect...');

    // 1. Seed Organizer in Firestore
    const organizerId = 'organizer_demo_user';
    const orgRef = db.collection('users').doc(organizerId);
    await orgRef.set({
      name: 'Campus Organizer',
      email: 'organizer@campusconnect.com',
      role: 'organizer',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    // 2. Seed Student in Firestore
    const studentId = 'student_demo_user';
    const studRef = db.collection('users').doc(studentId);
    await studRef.set({
      name: 'Campus Student',
      email: 'student@campusconnect.com',
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    // 3. Seed Existing Google Account
    const googleId = 'student_demo_sujith';
    const googleRef = db.collection('users').doc(googleId);
    await googleRef.set({
      name: 'Sujith',
      email: 'sujithvarvadi17@gmail.com',
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    console.log('✅ Firestore seeding completed successfully!');
    console.log(' - Users provisioned: organizer@campusconnect.com, student@campusconnect.com, sujithvarvadi17@gmail.com');
    console.log(' - Only real events provided by organizers will be hosted.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Firestore database:', error);
    process.exit(1);
  }
};

seedData();
