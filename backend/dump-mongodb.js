const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Vendor = require('./models/Vendor');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Quote = require('./models/Quote');
const Location = require('./models/Location');
const ChecklistItem = require('./models/ChecklistItem');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wedding_vendors_SSG_loc';
const outputFile = path.join(__dirname, 'mongodb_dump.json');

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    const collections = {
      vendors: await Vendor.find().lean(),
      users: await User.find().lean(),
      bookings: await Booking.find().lean(),
      quotes: await Quote.find().lean(),
      locations: await Location.find().lean(),
      checklistitems: await ChecklistItem.find().lean()
    };
    fs.writeFileSync(outputFile, JSON.stringify(collections, null, 2), 'utf8');
    console.log('Exported collections to', outputFile);
    console.log('counts:', Object.fromEntries(Object.entries(collections).map(([k,v]) => [k, v.length])));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error exporting MongoDB:', err);
    process.exit(1);
  }
})();
