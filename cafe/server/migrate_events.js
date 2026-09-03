require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/r-sports-cafe?retryWrites=false';

async function migrateEvents() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find all events with old categories
    const oldCategories = ['workshop', 'birthday', 'anniversary', 'corporate', 'general'];
    const result = await Event.updateMany(
      { category: { $in: oldCategories } },
      { $set: { category: 'special' } }
    );
    console.log(`Migrated ${result.modifiedCount} events to 'special' category.`);

    // Map old status 'active' -> 'upcoming'
    const statusResult = await Event.updateMany(
      { status: 'active' },
      { $set: { status: 'upcoming' } }
    );
    console.log(`Migrated ${statusResult.modifiedCount} events from 'active' to 'upcoming' status.`);

    // Check if there are any weekly events
    const weeklyCount = await Event.countDocuments({ category: 'weekly' });
    if (weeklyCount === 0) {
      // Create a dummy weekly event to test the recurrence logic
      await Event.create({
        title: 'Saturday Night Football',
        description: 'Join us every Saturday for high-octane 5-a-side turf matches.',
        category: 'weekly',
        sportType: 'Football Turf',
        date: '2026-08-22', // will be overwritten by compute logic anyway
        recurrenceDay: 'Saturday',
        status: 'upcoming',
        price: 1200,
        capacity: 14,
        spotsLeft: 4,
        tags: ['Trending', 'Filling Fast'],
        is_trending: true,
        trending_score: 10,
        is_featured: true,
      });
      console.log('Created dummy weekly event.');
    }
    
    // Check if there are any tournaments
    const tourneyCount = await Event.countDocuments({ category: 'tournament' });
    if (tourneyCount === 0) {
      // Create a dummy tournament event
      await Event.create({
        title: 'R Sports Cup 2026',
        description: 'The ultimate amateur football tournament. Cash prizes and glory await.',
        category: 'tournament',
        sportType: '5-a-side Football',
        date: '2026-09-15',
        status: 'upcoming',
        price: 5000,
        capacity: 16,
        spotsLeft: 2,
        tags: ['Tournament', 'Cash Prize'],
        is_featured: true,
      });
      console.log('Created dummy tournament event.');
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateEvents();
