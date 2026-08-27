const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const seedData = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MongoDB connection string is missing. Set MONGO_URI or MONGODB_URI in backend/.env.');
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Event.deleteMany();
    await Registration.deleteMany();

    console.log('Cleared existing data.');

    // Create Default Users
    const organizer = await User.create({
      name: 'sujith',
      email: 'organizer@campusconnect.com',
      password: 'organizerpass',
      role: 'organizer',
    });

    console.log('Users created successfully:');
    console.log(' - Organizer: organizer@campusconnect.com / organizerpass');

    console.log('No default events created.');
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
