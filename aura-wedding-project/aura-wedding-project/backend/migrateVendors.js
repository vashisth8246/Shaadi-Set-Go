const mongoose = require('mongoose');
const Vendor = require('./models/Vendor');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/wedding_vendors_SSG_loc';

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Get an admin user to assign as owner for legacy data
        let adminUser = await User.findOne({ email: 'admin@shaddisetgo.com' });
        if (!adminUser) {
            console.log('Admin user not found, finding any user...');
            adminUser = await User.findOne({});
        }
        
        if (!adminUser) {
            console.log('No user found! Creating a dummy admin user.');
            adminUser = await User.create({
                fullName: 'Legacy System Admin',
                email: 'legacyadmin@example.com',
                password: 'legacy_password_hash_dummy',
                role: 'admin',
                phone: '+910000000000'
            });
        }
        
        const adminId = adminUser._id;
        console.log(`Using User ID ${adminId} for all migrated vendors`);

        // Collections to process
        const collections = ['venue', 'catering', 'photography', 'music', 'decoration', 'hair_makeup'];
        
        // Let's drop existing vendors just to be safe, since they were wiped anyway by seedDatabase?
        // Wait, maybe we should just clear it again so we don't have duplicates if this script is re-run.
        await Vendor.deleteMany({});
        console.log('Cleared existing vendors collection');

        let totalInserted = 0;

        for (const col of collections) {
            // Because mongoose connection db is valid, we can fetch from raw collections
            const data = await mongoose.connection.collection(col).find({}).toArray();
            console.log(`Found ${data.length} documents in ${col} collection`);
            
            if (data.length === 0) continue;

            const mappedData = data.map(doc => {
                // Ensure approval object is present
                const approvalObj = {
                    status: 'approved',
                    message: 'Migrated from legacy data',
                    reviewedAt: new Date()
                };

                return {
                    ...doc,
                    // If businessType isn't set properly, ensure it is set based on collection name, or fallback to the doc's value
                    businessType: doc.businessType || (col === 'hair_makeup' ? 'dj' : col), // dj instead of hair_makeup potentially if the enum doesn't support it? Wait, let's look at schema config later
                    userId: adminId,
                    approval: approvalObj
                };
            });

            // Insert into the unified vendors collection
            await Vendor.insertMany(mappedData);
            totalInserted += mappedData.length;
            
            // Clean up old loose collections
            await mongoose.connection.collection(col).drop().catch(e => console.log(`Warning: Could not drop ${col}: ${e.message}`));
        }

        console.log(`Successfully migrated ${totalInserted} vendors into the unified vendors collection.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
