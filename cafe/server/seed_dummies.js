const fs = require('fs');
const path = require('path');
const https = require('https');
const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('./models/Event');
const Reel = require('./models/Reel');
const Review = require('./models/Review');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const EVENTS_DIR = path.join(UPLOADS_DIR, 'events');
const REELS_DIR = path.join(UPLOADS_DIR, 'reels');
const REVIEWS_DIR = path.join(UPLOADS_DIR, 'reviews');

// Ensure directories exist
[UPLOADS_DIR, EVENTS_DIR, REELS_DIR, REVIEWS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Helper to download file
const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      console.log(`⏭️  File already exists: ${dest}`);
      return resolve(dest);
    }
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`⬇️  Downloaded: ${dest}`);
        resolve(dest);
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const DUMMY_DATA = {
  events: [
    {
      title: "Weekend Live Music",
      description: "Join us for an amazing night of live acoustic music by local artists. Enjoy great food and a relaxing vibe.",
      category: "weekly",
      recurrenceDay: "Saturday",
      date: new Date().toISOString().split('T')[0],
      time: "8:00 PM",
      photo: "/uploads/events/event1.jpg",
      status: "upcoming",
      is_featured: true,
      _url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"
    },
    {
      title: "FIFA 24 Tournament",
      description: "Compete in our grand FIFA 24 tournament. Huge prizes for the top 3 winners! Entry fee applies.",
      category: "tournament",
      sportType: "Esports",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: "10:00 AM",
      photo: "/uploads/events/event2.jpg",
      status: "upcoming",
      is_featured: true,
      _url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80"
    }
  ],
  reels: [
    {
      caption: "Amazing vibes at R Sports & Cafe! 🍔⚽",
      handle: "@rsports.cafe",
      videoUrl: "/uploads/reels/reel1.mp4",
      tag: "VIBES",
      status: "active",
      _url: "https://www.w3schools.com/html/mov_bbb.mp4"
    },
    {
      caption: "Our signature dishes are waiting for you 😋",
      handle: "@rsports.cafe",
      videoUrl: "/uploads/reels/reel2.mp4",
      tag: "FOOD",
      status: "active",
      _url: "https://www.w3schools.com/html/mov_bbb.mp4"
    }
  ],
  reviews: [
    {
      name: "Arun Kumar",
      text: "The best place to hang out with friends. The turf is amazing and the food is top-notch!",
      imageUrl: "/uploads/reviews/review1.jpg",
      order: 1,
      _url: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Sneha V",
      text: "Loved the ambience! Perfect place for weekend getaways.",
      imageUrl: "/uploads/reviews/review2.jpg",
      order: 2,
      _url: "https://randomuser.me/api/portraits/women/44.jpg"
    }
  ]
};

async function seed() {
  try {
    // 1. Download Files
    console.log('⏳ Downloading dummy files...');
    for (const event of DUMMY_DATA.events) {
      await downloadFile(event._url, path.join(__dirname, event.photo));
      delete event._url; // remove before db insert
    }
    for (const reel of DUMMY_DATA.reels) {
      await downloadFile(reel._url, path.join(__dirname, reel.videoUrl));
      delete reel._url;
    }
    for (const review of DUMMY_DATA.reviews) {
      await downloadFile(review._url, path.join(__dirname, review.imageUrl));
      delete review._url;
    }

    // 2. Connect DB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/r-sports-cafe';
    console.log(`\n⏳ Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    // 3. Clear existing
    console.log('🧹 Clearing old data...');
    await Event.deleteMany({});
    await Reel.deleteMany({});
    await Review.deleteMany({});

    // 4. Insert new
    console.log('🌱 Seeding new dummy data...');
    await Event.insertMany(DUMMY_DATA.events);
    await Reel.insertMany(DUMMY_DATA.reels);
    await Review.insertMany(DUMMY_DATA.reviews);

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seed();
