const RestaurantArea = require('../models/RestaurantArea');
const RestaurantTable = require('../models/RestaurantTable');
const BusinessHours = require('../models/BusinessHours');
const Settings = require('../models/Settings');

/**
 * Auto-seeds initial restaurant data if database collections are empty.
 */
const seedData = async () => {
  try {
    // 1. Settings
    await Settings.getSettings();

    // 2. Business Hours (Open 7 days a week 11:00 - 23:30)
    const hoursCount = await BusinessHours.countDocuments();
    if (hoursCount === 0) {
      const defaultHours = [];
      for (let day = 0; day <= 6; day++) {
        defaultHours.push({
          dayOfWeek: day,
          isOpen: true,
          openTime: '11:00',
          closeTime: '23:30',
        });
      }
      await BusinessHours.insertMany(defaultHours);
      console.log('🌱 Seeded default BusinessHours (7 days 11:00-23:30)');
    }

    // 3. Restaurant Areas & Tables
    const areaCount = await RestaurantArea.countDocuments();
    if (areaCount === 0) {
      const indoorArea = await RestaurantArea.create({
        name: 'Indoor Seating',
        description: 'Air-conditioned dining with sports broadcasts & premium seating',
        displayOrder: 1,
        active: true,
      });

      const outdoorArea = await RestaurantArea.create({
        name: 'Outdoor Seating',
        description: 'Al-fresco open air garden seating surrounded by lush greenery',
        displayOrder: 2,
        active: true,
      });

      // Seed tables
      await RestaurantTable.insertMany([
        // Row A (6 seats)
        { name: 'A1', area: indoorArea._id, capacity: 6, minimumCapacity: 1, maximumCapacity: 6, positionX: 40, positionY: 30, width: 90, height: 60, shape: 'rectangle', bookable: true, active: true },
        { name: 'A2', area: indoorArea._id, capacity: 6, minimumCapacity: 1, maximumCapacity: 6, positionX: 160, positionY: 30, width: 90, height: 60, shape: 'rectangle', bookable: true, active: true },

        // Row B (4 seats)
        { name: 'B1', area: indoorArea._id, capacity: 4, minimumCapacity: 1, maximumCapacity: 4, positionX: 40, positionY: 120, width: 70, height: 60, shape: 'square', bookable: true, active: true },
        { name: 'B2', area: indoorArea._id, capacity: 4, minimumCapacity: 1, maximumCapacity: 4, positionX: 130, positionY: 120, width: 70, height: 60, shape: 'square', bookable: true, active: true },
        { name: 'B3', area: indoorArea._id, capacity: 4, minimumCapacity: 1, maximumCapacity: 4, positionX: 220, positionY: 120, width: 70, height: 60, shape: 'square', bookable: true, active: true },
        { name: 'B4', area: indoorArea._id, capacity: 4, minimumCapacity: 1, maximumCapacity: 4, positionX: 310, positionY: 120, width: 70, height: 60, shape: 'square', bookable: true, active: true },

        // Row C (2 seats)
        { name: 'C1', area: indoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, positionX: 40, positionY: 210, width: 55, height: 50, shape: 'square', bookable: true, active: true },
        { name: 'C2', area: indoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, positionX: 130, positionY: 210, width: 55, height: 50, shape: 'square', bookable: true, active: true },
        { name: 'C3', area: indoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, positionX: 220, positionY: 210, width: 55, height: 50, shape: 'square', bookable: true, active: true },

        // Outdoor 01 - 10 (2 seats)
        { name: 'Outdoor 01', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, positionX: 30, positionY: 30, width: 50, height: 50, shape: 'round', bookable: true, active: true },
        { name: 'Outdoor 02', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, positionX: 100, positionY: 30, width: 50, height: 50, shape: 'round', bookable: true, active: true },
        { name: 'Outdoor 03', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, positionX: 170, positionY: 30, width: 50, height: 50, shape: 'round', bookable: true, active: true },
        { name: 'Outdoor 04', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, positionX: 240, positionY: 30, width: 50, height: 50, shape: 'round', bookable: true, active: true },
        { name: 'Outdoor 05', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, positionX: 310, positionY: 30, width: 50, height: 50, shape: 'round', bookable: true, active: true },
        { name: 'Outdoor 06', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, positionX: 30, positionY: 110, width: 50, height: 50, shape: 'round', bookable: true, active: true },
        { name: 'Outdoor 07', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, positionX: 100, positionY: 110, width: 50, height: 50, shape: 'round', bookable: true, active: true },
        { name: 'Outdoor 08', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, shape: 'round', positionX: 170, positionY: 110, width: 50, height: 50, shape: 'round', bookable: true, active: true },
        { name: 'Outdoor 09', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, positionX: 240, positionY: 110, width: 50, height: 50, shape: 'round', bookable: true, active: true },
        { name: 'Outdoor 10', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, positionX: 310, positionY: 110, width: 50, height: 50, shape: 'round', bookable: true, active: true },
      ]);

      console.log('🌱 Seeded default RestaurantAreas and RestaurantTables');
    }

    // 4. Menu Items
    const MenuItem = require('../models/MenuItem');
    const menuCount = await MenuItem.countDocuments();
    if (menuCount === 0) {
      await MenuItem.insertMany([
        {
          name: 'THE ROYAL SMASH',
          category: 'SIGNATURE BURGER',
          desc: 'Premium handcrafted burger with double-smashed wagyu patties, aged cheddar, house-made brioche bun & truffle aioli.',
          price: '₹349',
          is_trending: true,
          accent: '#C8956C',
          display_order: 1,
        },
        {
          name: 'NAPOLI TRUFFLE',
          category: 'ARTISAN PIZZA',
          desc: 'Wood-fired sourdough crust topped with San Marzano tomatoes, burrata, fresh basil, black truffle shavings & extra virgin olive oil.',
          price: '₹449',
          is_trending: true,
          accent: '#D4A574',
          display_order: 2,
        },
        {
          name: 'BERRY ELIXIR',
          category: 'FRESH PRESSED JUICE',
          desc: 'Cold-pressed blend of wild berries, pomegranate, fresh mint & a hint of rose water. Served with clear ice.',
          price: '₹199',
          is_trending: true,
          accent: '#B07D9E',
          display_order: 3,
        },
        {
          name: 'VELVET LATTE',
          category: 'SPECIALTY COFFEE',
          desc: 'Single-origin Ethiopian beans, micro-foam art. Signature velvet texture with notes of dark chocolate & caramel.',
          price: '₹249',
          is_trending: true,
          accent: '#8B7355',
          display_order: 4,
        },
      ]);
      console.log('🌱 Seeded default MenuItems');
    }

    // 5. Reels
    const Reel = require('../models/Reel');
    const reelCount = await Reel.countDocuments();
    if (reelCount === 0) {
      await Reel.insertMany([
        {
          caption: 'Match day energy hits different ⚡',
          handle: '@rsports.cafe',
          videoUrl: '/src/assets/76a0979a18ee83e06060018a8b7a7307_0_2433333.mp4',
          likes: '2.4K',
          comments: '186',
          tag: 'MATCH DAY',
          display_order: 1,
        },
        {
          caption: 'Night sessions under the lights 🌙',
          handle: '@rsports.cafe',
          videoUrl: '/src/assets/485d721353ce43e12eaaf77390fe6d1a_0_2666666.mp4',
          likes: '3.1K',
          comments: '224',
          tag: 'NIGHT GAME',
          display_order: 2,
        },
        {
          caption: 'From the kitchen to the pitch 🍕⚽',
          handle: '@rsports.cafe',
          videoUrl: '/src/assets/ba96fc735a2ba8a8655b7eff7c37c9c9_0_2500000.mp4',
          likes: '1.8K',
          comments: '142',
          tag: 'LIFESTYLE',
          display_order: 3,
        },
        {
          caption: 'Weekend vibes at R Sports 🔥',
          handle: '@rsports.cafe',
          videoUrl: '/src/assets/92024e03856970a887b4fbcec6362831_0_2666666.mp4',
          likes: '4.2K',
          comments: '318',
          tag: 'WEEKEND',
          display_order: 4,
        },
      ]);
      console.log('🌱 Seeded default Reels');
    }
  } catch (error) {
    console.error('❌ Error seeding initial data:', error);
  }
};

module.exports = seedData;
