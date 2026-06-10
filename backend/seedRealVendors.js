const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Vendor = require('./models/Vendor');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wedding_vendors_SSG_loc');

const seedRealVendors = async () => {
    try {
        // Clear existing vendors
        await Vendor.deleteMany({});
        console.log('Cleared existing vendors');

        // Get or create a system admin user for vendors
        let adminUser = await User.findOne({ email: 'admin@gmail.com' });
        if (!adminUser) {
            adminUser = new User({
                fullName: 'System Admin',
                email: 'admin@gmail.com',
                password: 'admin123',
                phone: '9999999999',
                role: 'admin'
            });
            await adminUser.save();
        }

        const vendorDataDir = path.join(__dirname, '..', 'real vendor JSON data');
        const vendorFiles = [
            'wedding_vendors_SSG.venue.json',
            'wedding_vendors_SSG.catering.json',
            'wedding_vendors_SSG.photography.json',
            'wedding_vendors_SSG.music.json',
            'wedding_vendors_SSG.decoration.json',
            'wedding_vendors_SSG.hair_makeup.json'
        ];

        let totalVendors = 0;

        for (const file of vendorFiles) {
            const filePath = path.join(vendorDataDir, file);
            if (!fs.existsSync(filePath)) {
                console.log(`⚠️  File not found: ${file}`);
                continue;
            }

            const rawData = fs.readFileSync(filePath, 'utf-8');
            const vendorsData = JSON.parse(rawData);

            for (const vendorData of vendorsData) {
                // Convert MongoDB Extended JSON format to regular objects
                const vendor = new Vendor({
                    userId: adminUser._id,
                    businessName: vendorData.businessName,
                    businessType: vendorData.businessType,
                    description: vendorData.description,
                    address: {
                        street: vendorData.address?.street || '',
                        city: vendorData.address?.city || '',
                        state: vendorData.address?.state || '',
                        zipCode: vendorData.address?.zipCode || '',
                        country: vendorData.address?.country || 'India'
                    },
                    contact: {
                        phone: vendorData.contact?.phone || '',
                        email: vendorData.contact?.email || '',
                        website: vendorData.contact?.website || ''
                    },
                    pricing: {
                        startingPrice: vendorData.pricing?.startingPrice || 0,
                        pricingType: vendorData.pricing?.pricingType || 'Per Day'
                    },
                    services: vendorData.services || [],
                    images: vendorData.images || [],
                    approval: {
                        status: 'approved',
                        message: 'Approved by system',
                        reviewedAt: new Date()
                    },
                    availability: {
                        available: vendorData.availability?.available !== false,
                        bookedDates: vendorData.availability?.bookedDates || []
                    },
                    rating: {
                        average: vendorData.rating?.average || 0,
                        count: vendorData.rating?.count || 0
                    }
                });

                await vendor.save();
                totalVendors++;
            }

            const vendorCount = vendorsData.length;
            console.log(`✅ Imported ${vendorCount} vendors from ${file}`);
        }

        console.log(`\n🎉 Database seeded successfully with ${totalVendors} real vendors!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

seedRealVendors();
