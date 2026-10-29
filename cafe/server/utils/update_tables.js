const mongoose = require('mongoose');
require('dotenv').config();

const RestaurantArea = require('../models/RestaurantArea');
const RestaurantTable = require('../models/RestaurantTable');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/r-sports-cafe';

async function updateTables() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // 1. Ensure Indoor Area
  let indoorArea = await RestaurantArea.findOne({
    name: { $in: ['Indoor Seating', 'Main Indoor'] },
  });
  if (!indoorArea) {
    indoorArea = await RestaurantArea.create({
      name: 'Indoor Seating',
      description: 'Air-conditioned dining with sports broadcasts & premium seating',
      displayOrder: 1,
      active: true,
    });
  } else {
    indoorArea.name = 'Indoor Seating';
    indoorArea.description = 'Air-conditioned dining with sports broadcasts & premium seating';
    await indoorArea.save();
  }

  // 2. Ensure Outdoor Area
  let outdoorArea = await RestaurantArea.findOne({
    name: { $in: ['Outdoor Seating', 'Outdoor Terrace'] },
  });
  if (!outdoorArea) {
    outdoorArea = await RestaurantArea.create({
      name: 'Outdoor Seating',
      description: 'Al-fresco open air garden seating surrounded by lush greenery',
      displayOrder: 2,
      active: true,
    });
  } else {
    outdoorArea.name = 'Outdoor Seating';
    outdoorArea.description = 'Al-fresco open air garden seating surrounded by lush greenery';
    await outdoorArea.save();
  }

  // Remove old demo tables that don't match the new naming
  const newTableNames = [
    'A1', 'A2',
    'B1', 'B2', 'B3', 'B4',
    'C1', 'C2', 'C3',
    'Outdoor 01', 'Outdoor 03', 'Outdoor 05', 'Outdoor 07', 'Outdoor 09',
    'Outdoor 02', 'Outdoor 04', 'Outdoor 06', 'Outdoor 08', 'Outdoor 10',
  ];

  // Delete tables not in new schema (e.g. old "Table 1", "Terrace 1", etc.)
  const delRes = await RestaurantTable.deleteMany({
    name: { $nin: newTableNames },
  });
  console.log(`Cleaned up ${delRes.deletedCount} legacy demo tables`);

  // 3. Define new tables
  const tablesToSetup = [
    // ── Row A (6 seater) ──
    { name: 'A1', area: indoorArea._id, capacity: 6, minimumCapacity: 1, maximumCapacity: 6, shape: 'rectangle', positionX: 40, positionY: 30, width: 90, height: 60 },
    { name: 'A2', area: indoorArea._id, capacity: 6, minimumCapacity: 1, maximumCapacity: 6, shape: 'rectangle', positionX: 160, positionY: 30, width: 90, height: 60 },

    // ── Row B (4 seater) ──
    { name: 'B1', area: indoorArea._id, capacity: 4, minimumCapacity: 1, maximumCapacity: 4, shape: 'square', positionX: 40, positionY: 120, width: 70, height: 60 },
    { name: 'B2', area: indoorArea._id, capacity: 4, minimumCapacity: 1, maximumCapacity: 4, shape: 'square', positionX: 130, positionY: 120, width: 70, height: 60 },
    { name: 'B3', area: indoorArea._id, capacity: 4, minimumCapacity: 1, maximumCapacity: 4, shape: 'square', positionX: 220, positionY: 120, width: 70, height: 60 },
    { name: 'B4', area: indoorArea._id, capacity: 4, minimumCapacity: 1, maximumCapacity: 4, shape: 'square', positionX: 310, positionY: 120, width: 70, height: 60 },

    // ── Row C (2 seater) ──
    { name: 'C1', area: indoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, shape: 'square', positionX: 40, positionY: 210, width: 55, height: 50 },
    { name: 'C2', area: indoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, shape: 'square', positionX: 130, positionY: 210, width: 55, height: 50 },
    { name: 'C3', area: indoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, shape: 'square', positionX: 220, positionY: 210, width: 55, height: 50 },

    // ── Outdoor 01 to 10 (2 seater each) ──
    { name: 'Outdoor 01', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, shape: 'round', positionX: 30, positionY: 30, width: 50, height: 50 },
    { name: 'Outdoor 02', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, shape: 'round', positionX: 100, positionY: 30, width: 50, height: 50 },
    { name: 'Outdoor 03', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, shape: 'round', positionX: 170, positionY: 30, width: 50, height: 50 },
    { name: 'Outdoor 04', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, shape: 'round', positionX: 240, positionY: 30, width: 50, height: 50 },
    { name: 'Outdoor 05', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, shape: 'round', positionX: 310, positionY: 30, width: 50, height: 50 },
    { name: 'Outdoor 06', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, shape: 'round', positionX: 30, positionY: 110, width: 50, height: 50 },
    { name: 'Outdoor 07', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, shape: 'round', positionX: 100, positionY: 110, width: 50, height: 50 },
    { name: 'Outdoor 08', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, shape: 'round', positionX: 170, positionY: 110, width: 50, height: 50 },
    { name: 'Outdoor 09', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, shape: 'round', positionX: 240, positionY: 110, width: 50, height: 50 },
    { name: 'Outdoor 10', area: outdoorArea._id, capacity: 2, minimumCapacity: 1, maximumCapacity: 2, shape: 'round', positionX: 310, positionY: 110, width: 50, height: 50 },
  ];

  for (const t of tablesToSetup) {
    await RestaurantTable.findOneAndUpdate(
      { name: t.name },
      {
        ...t,
        bookable: true,
        active: true,
      },
      { upsert: true, new: true }
    );
  }

  const finalTables = await RestaurantTable.find().populate('area');
  console.log(`\n🎉 Successfully configured ${finalTables.length} tables:`);
  finalTables.forEach(t => {
    console.log(`- [${t.area.name}] ${t.name}: Capacity ${t.capacity} (Min: ${t.minimumCapacity}, Max: ${t.maximumCapacity})`);
  });

  process.exit(0);
}

updateTables().catch(err => {
  console.error('❌ Error updating tables:', err);
  process.exit(1);
});
