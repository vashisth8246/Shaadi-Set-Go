const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wedding_vendors_SSG_loc';

const imagesDb = {
    venue: [
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1000&q=80'
    ],
    catering: [
        'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1625631980753-48e025f187a5?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80'
    ],
    photography: [
        'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1518135714426-c18f5ffb6f4d?auto=format&fit=crop&w=1000&q=80'
    ],
    music: [
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1470229722913-7c092b0c1020?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1000&q=80'
    ],
    decoration: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80'
    ]
};

const targetTypeArg = process.argv.find((arg) => arg.startsWith('--type='));
const targetType = targetTypeArg ? targetTypeArg.replace('--type=', '').trim().toLowerCase() : '';

const drinksPool = ["Aam Panna", "Blue Lagoon", "Virgin Mojito", "Strawberry Daiquiri", "Masala Chai", "Fresh Lime Soda", "Cold Coffee", "Fruit Punch"];
const startersPool = ["Paneer Tikka", "Hara Bhara Kebab", "Chicken Tikka", "Mutton Seekh Kebab", "Spring Rolls", "Chilli Mushroom", "Fish Fingers", "Dahi Ke Sholey", "Crispy Corn"];
const mainsPool = ["Dal Makhani", "Shahi Paneer", "Butter Chicken", "Mutton Rogan Josh", "Thai Green Curry", "Assorted Breads", "Jeera Rice", "Veg Biryani", "Mushroom Masala"];
const dessertsPool = ["Hot Jalebi with Rabri", "Rasmalai", "Gulab Jamun", "Chocolate Fondue", "Tiramisu", "Ice Cream Sundae", "Moong Dal Halwa", "Cheesecake"];

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function getRandomMenu(hash) {
    const pick = (arr, num) => {
        let h = hash;
        const res = [];
        for(let i=0; i<num; i++) {
            res.push(arr[h % arr.length]);
            h = (h * 31) + 17;
        }
        return [...new Set(res)]; // ensure unique
    };
    return [
        "Welcome Drinks: " + pick(drinksPool, 2).join(", "),
        "Starters: " + pick(startersPool, 3).join(", "),
        "Main Course: " + pick(mainsPool, 3).join(", "),
        "Desserts: " + pick(dessertsPool, 2).join(", ")
    ];
}

async function fix() {
    await mongoose.connect(MONGO_URI);
    const vendors = await Vendor.find();
    let updated = 0;
    
    for (const v of vendors) {
        if (targetType) {
            const normalizedType = v.businessType === 'dj' ? 'music' : v.businessType;
            if (normalizedType !== targetType) {
                continue;
            }
        }

        let changed = false;
        const poolKey = v.businessType === 'dj' ? 'music' : v.businessType;
        let pool = imagesDb[poolKey] || imagesDb.venue;
        const poolIdx = hashCode(v.businessName || v._id.toString()) % pool.length;
        
        // 1. Fix unrelated source.unsplash images
        if (targetType) {
            v.images = [pool[poolIdx]];
            changed = true;
        } else if (v.images && v.images.length > 0) {
            if (v.images[0].includes('source.unsplash.com')) {
                v.images = [pool[poolIdx]];
                changed = true;
            }
        } else {
             v.images = [pool[poolIdx]];
             changed = true;
        }
        
        // 2. Fix catering explicit menu lack
        if (v.businessType === 'catering') {
            // Generate a realistic menu based on the businessname so its consistent but unique per vendor
            const newMenu = getRandomMenu(hashCode(v.businessName || v._id.toString()));
            v.services = newMenu;
            changed = true;
        }
        
        if (changed) {
            await Vendor.updateOne({ _id: v._id }, { $set: { images: v.images, services: v.services } });
            updated++;
        }
    }
    
    console.log(`Fixed images/menus for ${updated} vendors${targetType ? ` (type=${targetType})` : ''}!`);
    process.exit(0);
}

fix().catch(console.error);
