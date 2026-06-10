const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { normalizeCityName } = require('../utils/normalization');

const dataDir = path.join(__dirname, '../../real vendor JSON data');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wedding_vendors_SSG_loc';

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if a system user exists to own these vendors
        let systemUser = await User.findOne({ email: 'system@shaddisetgo.com' });
        if (!systemUser) {
            systemUser = new User({
                fullName: 'System Admin Vendor',
                email: 'system@shaddisetgo.com',
                password: 'placeholder_password',
                role: 'vendor'
            });
            await systemUser.save();
        }

        const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
        let totalImported = 0;

        for (const file of files) {
            console.log(`Processing ${file}...`);
            const filePath = path.join(dataDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            
            for (const item of data) {
                // Remove mongodb $oid and $date wrappers if any
                const { _id, createdAt, ...rest } = item;
                
                rest.userId = systemUser._id; // assign to system vendor
                rest.approval = {
                    status: 'approved',
                    message: 'Auto-approved during migration.',
                    reviewedAt: new Date()
                };

                if (rest.address?.city) {
                    rest.address.city = normalizeCityName(rest.address.city);
                }

                if (!rest.images || rest.images.length === 0) {
                    rest.images = [`https://source.unsplash.com/800x600/?${rest.businessType},wedding`];
                }

                // Upsert based on businessName to avoid duplicates
                await Vendor.findOneAndUpdate(
                    { businessName: rest.businessName },
                    rest,
                    { upsert: true, new: true }
                );
                totalImported++;
            }
        }

        console.log(`Migration Complete! Total records processed: ${totalImported}`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
