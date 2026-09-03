const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Import Models
const Area = require('./models/Area');
const Table = require('./models/Table');
const Event = require('./models/Event');
const Customer = require('./models/Customer');
const Booking = require('./models/Booking');
const Admin = require('./models/Admin');
const MenuItem = require('./models/MenuItem');
const Reel = require('./models/Reel');
const Newsletter = require('./models/Newsletter');

const seedDB = async () => {
  try {
    console.log('Clearing existing data...');
    await Area.deleteMany({});
    await Table.deleteMany({});
    await Event.deleteMany({});
    await Customer.deleteMany({});
    await Booking.deleteMany({});
    await Admin.deleteMany({});
    await MenuItem.deleteMany({});
    await Reel.deleteMany({});
    await Newsletter.deleteMany({});

    console.log('Inserting mock areas...');
    const mainDining = await Area.create({ name: 'Main Dining', description: 'Central indoor dining area' });
    const patio = await Area.create({ name: 'Patio', description: 'Outdoor seating with cafe view' });

    console.log('Inserting mock tables...');
    const tables = await Table.insertMany([
      { name: 'T01', capacity: 2, area: mainDining._id },
      { name: 'T02', capacity: 2, area: mainDining._id },
      { name: 'T03', capacity: 4, area: mainDining._id },
      { name: 'T04', capacity: 4, area: mainDining._id },
      { name: 'T05', capacity: 6, area: patio._id },
    ]);

    console.log('Inserting mock events...');
    await Event.insertMany([
      {
        title: 'Live Acoustic Night',
        description: 'Join us for a relaxing evening with live acoustic music featuring local artists.',
        date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Next week
        time: '7:00 PM',
        location: 'Patio',
        status: 'upcoming'
      },
      {
        title: 'FIFA Weekend Tournament',
        description: 'Compete in our weekend FIFA tournament. Great prizes to be won!',
        date: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        time: '5:00 PM',
        location: 'Turf Area',
        status: 'upcoming'
      }
    ]);

    console.log('Inserting mock customers...');
    const customer = await Customer.create({
      name: 'John Doe',
      phone: '+91 9876543210',
      email: 'john@example.com',
      totalBookings: 1
    });

    console.log('Inserting mock bookings...');
    await Booking.create({
      bookingNumber: 'BK-1001',
      customer: customer._id,
      table: tables[0]._id,
      area: mainDining._id,
      bookingDate: new Date(),
      startTime: '19:00',
      guestCount: 2,
      status: 'CONFIRMED'
    });

    console.log('Inserting default admin...');
    await Admin.create({
      username: 'admin',
      password: 'password123'
    });

    console.log('Inserting mock menu items...');
    await MenuItem.insertMany([
      { name: 'Classic Burger', description: 'Beef patty with lettuce and tomato', price: 12.99, category: 'Mains' },
      { name: 'Iced Latte', description: 'Chilled espresso with milk', price: 4.50, category: 'Drinks' },
      { name: 'Caesar Salad', description: 'Crispy romaine with parmesan', price: 9.99, category: 'Starters' }
    ]);

    console.log('Inserting mock reels...');
    await Reel.insertMany([
      { title: 'Cafe Ambience', videoUrl: '/uploads/sample-reel-1.mp4', isActive: true },
      { title: 'Making our Signature Burger', videoUrl: '/uploads/sample-reel-2.mp4', isActive: true }
    ]);

    console.log('Database seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();
