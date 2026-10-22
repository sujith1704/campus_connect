require('dotenv').config();
const { db, formatDoc } = require('./config/firebase');
const backup = require('./mongodb_backup.json');

async function migrateData() {
  console.log('🚀 Starting Data Migration to Live Firebase Firestore...');
  console.log('Target Project:', process.env.FIREBASE_PROJECT_ID);

  try {
    // 1. Migrate Users
    console.log(`\n--- Migrating ${backup.collections.users.length} Users ---`);
    for (const user of backup.collections.users) {
      const clerkId = user.clerkUserId || user._id;
      const userRef = db.collection('users').doc(clerkId);
      
      const userData = {
        clerkUserId: clerkId,
        clerkId: clerkId,
        name: user.name,
        email: user.email.toLowerCase().trim(),
        role: user.role,
        avatar: user.avatar || user.profileImage || null,
        profileImage: user.avatar || user.profileImage || null,
        createdAt: new Date(user.createdAt || Date.now()),
        updatedAt: new Date(user.updatedAt || Date.now())
      };

      await userRef.set(userData, { merge: true });
      console.log(`✅ Migrated user: ${user.email} (${clerkId}) -> role: ${user.role}`);
    }

    // 2. Migrate Events
    console.log(`\n--- Migrating ${backup.collections.events.length} Events ---`);
    for (const event of backup.collections.events) {
      const eventId = event._id || event.id;
      const eventRef = db.collection('events').doc(eventId);

      const eventData = {
        title: event.title,
        description: event.description,
        category: event.category || 'Technical',
        date: event.date,
        time: event.time,
        venue: event.venue,
        maxParticipants: event.maxParticipants || 1000,
        registeredCount: event.registeredCount || 0,
        image: event.image,
        status: event.status || 'approved',
        isDeleted: event.isDeleted || false,
        deletedAt: event.deletedAt ? new Date(event.deletedAt) : null,
        organizer: event.organizer,
        organizerData: event.organizerData || {
          name: 'Campus Organizer',
          email: 'organizer@campusconnect.com'
        },
        createdAt: new Date(event.createdAt || Date.now()),
        updatedAt: new Date(event.updatedAt || Date.now())
      };

      await eventRef.set(eventData, { merge: true });
      console.log(`✅ Migrated event: "${event.title}" (${eventId})`);
    }

    // 3. Verify Collections
    console.log('\n--- Verifying Live Firestore Data ---');
    const usersSnap = await db.collection('users').get();
    console.log(`Verified Users in Firestore: ${usersSnap.size}`);

    const eventsSnap = await db.collection('events').get();
    console.log(`Verified Events in Firestore: ${eventsSnap.size}`);

    console.log('\n🎉 ALL DATA SUCCESSFULLY MIGRATED TO FIREBASE FIRESTORE!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateData();
