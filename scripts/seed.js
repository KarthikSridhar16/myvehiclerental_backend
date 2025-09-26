// scripts/seed.js
// run: npm run seed

import 'dotenv/config.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { env } from '../src/config/env.js';
import User from '../src/models/User.js';
import Vehicle from '../src/models/Vehicle.js';
import Booking from '../src/models/Booking.js';
import Payment from '../src/models/Payment.js';
import Review from '../src/models/Review.js';
import Maintenance from '../src/models/Maintenance.js';

function log(msg) { console.log(`[seed] ${msg}`); }

async function main() {
  if (!env.mongo) throw new Error('MONGO_URI is missing in .env');
  await mongoose.connect(env.mongo);
  log('Mongo connected');

  // clear collections
  await Promise.all([
    User.deleteMany({}),
    Vehicle.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    Review.deleteMany({}),
    Maintenance.deleteMany({})
  ]);
  log('Cleared collections');

  // users
  const passwordHash = await bcrypt.hash('Password123', 10);
  const [admin, owner, user] = await User.create([
    { name:'Admin One', email:'admin@vrent.test', passwordHash, role:'admin', phone:'9990001111' },
    { name:'Owner One', email:'owner@vrent.test', passwordHash, role:'owner', phone:'9990002222' },
    { name:'User One',  email:'user@vrent.test',  passwordHash, role:'user',  phone:'9990003333' }
  ]);
  log(`Users created: admin=${admin.email}, owner=${owner.email}, user=${user.email}`);

  // vehicles
  const vehicles = [
    // SUVs
    {
      ownerId: owner._id,
      make: 'Toyota', model: 'Fortuner', year: 2023, type: 'SUV',
      images: [
        'https://images.unsplash.com/photo-1664783856972-ac9922d7b2d3?q=80&w=1935&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1619767886645-0ae16581bf6b?q=80&w=1471&auto=format&fit=crop'
      ],
      pricePerDay: 5200, location: 'Chennai',
      specs: { seats: 7, fuel: 'Diesel', transmission: 'Automatic', mileage: 12 },
      description: 'Full-size SUV, great for family trips.',
      status: 'approved'
    },
    {
      ownerId: owner._id,
      make: 'Hyundai', model: 'Creta', year: 2024, type: 'SUV',
      images: [
        'https://images.unsplash.com/photo-1748214547184-d994bfe53322?q=80&w=1488&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1748214547306-360d11024747?q=80&w=1526&auto=format&fit=crop'
      ],
      pricePerDay: 3500, location: 'Bengaluru',
      specs: { seats: 5, fuel: 'Petrol', transmission: 'Automatic', mileage: 15 },
      description: 'Popular compact SUV with sunroof.',
      status: 'approved'
    },
    {
      ownerId: owner._id,
      make: 'Mahindra', model: 'XUV700', year: 2024, type: 'SUV',
      images: [
        'https://stimg.cardekho.com/images/carexteriorimages/930x620/Mahindra/XUV700/10794/1753879010184/side-view-(left)-90.jpg',
        'https://stimg.cardekho.com/images/carexteriorimages/930x620/Mahindra/XUV700/10794/1753879010184/front-view-118.jpg'
      ],
      pricePerDay: 4200, location: 'Hyderabad',
      specs: { seats: 7, fuel: 'Petrol', transmission: 'Automatic', mileage: 13 },
      description: 'Feature-packed 7-seater SUV with ADAS.',
      status: 'approved'
    },
    {
      ownerId: owner._id,
      make: 'Land Rover', model: 'Defender', year: 2023, type: 'SUV',
      images: [
        'https://imgd-ct.aeplcdn.com/1056x660/n/cw/ec/55215/defender-exterior-front-view-17.jpeg?isig=0&q=80'
      ],
      pricePerDay: 9500, location: 'Mumbai',
      specs: { seats: 5, fuel: 'Diesel', transmission: 'Automatic', mileage: 10 },
      description: 'Iconic off-roader, rugged and luxurious.',
      status: 'approved'
    },

    // Sedans
    {
      ownerId: owner._id,
      make: 'Honda', model: 'City', year: 2022, type: 'Sedan',
      images: [
        'https://img.autocarindia.com/Features/20220504121419_Honda%20City%20Hybrid%20front%20quarter.jpg?c=0',
        'https://www.rushlane.com/wp-content/uploads/2022/05/honda-city-hybrid-test-drive-1-1200x900.jpg'
      ],
      pricePerDay: 2800, location: 'Chennai',
      specs: { seats: 5, fuel: 'Petrol', transmission: 'Manual', mileage: 17 },
      description: 'Comfortable mid-size sedan.',
      status: 'approved'
    },
    {
      ownerId: owner._id,
      make: 'Skoda', model: 'Octavia', year: 2021, type: 'Sedan',
      images: [
        'https://c.ndtvimg.com/2020-07/7tn50v38_2021-skoda-octavia-rs-unveiled-with-a-plugin-hybrid-variant-_625x300_06_July_20.jpg'
      ],
      pricePerDay: 3300, location: 'Hyderabad',
      specs: { seats: 5, fuel: 'Diesel', transmission: 'Automatic', mileage: 18 },
      description: 'European sedan, spacious & premium.',
      status: 'approved'
    },

    // Hatchbacks
    {
      ownerId: owner._id,
      make: 'Maruti', model: 'Swift', year: 2024, type: 'Hatchback',
      images: [
        'https://stimg.cardekho.com/images/carexteriorimages/930x620/Maruti/Swift/9226/1751526426469/exterior-image-164.jpg',
        'https://stimg.cardekho.com/images/carexteriorimages/930x620/Maruti/Swift/9226/1751526426469/front-right-view-120.jpg'
      ],
      pricePerDay: 1600, location: 'Pune',
      specs: { seats: 5, fuel: 'Petrol', transmission: 'Manual', mileage: 20 },
      description: 'Zippy city hatchback.',
      status: 'approved'
    },
    {
      ownerId: owner._id,
      make: 'Tata', model: 'Tiago', year: 2023, type: 'Hatchback',
      images: [
        'https://cdn-s3.autocarindia.com/Tata/tiago/_DSF6526.JPG?w=640&q=75'
      ],
      pricePerDay: 1500, location: 'Bengaluru',
      specs: { seats: 5, fuel: 'Petrol', transmission: 'Manual', mileage: 19 },
      description: 'Safe, value-packed hatchback.',
      status: 'approved'
    },
    {
      ownerId: owner._id,
      make: 'Volkswagen', model: 'Polo (Generic)', year: 2020, type: 'Hatchback',
      images: [
        'https://images.unsplash.com/photo-1591152231320-bc7902cf852e?q=80&w=1476&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1476&auto=format&fit=crop'
      ],
      pricePerDay: 2200, location: 'Delhi',
      specs: { seats: 5, fuel: 'Petrol', transmission: 'Manual', mileage: 18 },
      description: 'Solid German hatch (generic photo set).',
      status: 'approved'
    },

    // EVs
    {
      ownerId: owner._id,
      make: 'Tata', model: 'Nexon EV', year: 2024, type: 'EV',
      images: [
        'https://img.gaadicdn.com/images/carexteriorimages/large/Tata/Nexon-EV/11024/1753945907283/front-view-118.jpg',
        'https://img.gaadicdn.com/images/carexteriorimages/large/Tata/Nexon-EV/11024/1753945907283/side-view-(left)-90.jpg'
      ],
      pricePerDay: 3200, location: 'Chennai',
      specs: { seats: 5, fuel: 'Electric', transmission: 'Automatic', mileage: 300 },
      description: 'Electric SUV with 300km real-world range.',
      status: 'approved'
    },
    {
      ownerId: owner._id,
      make: 'MG', model: 'ZS EV', year: 2023, type: 'EV',
      images: [
        'https://img.autocarindia.com/ExtraImages/20250616053933_MG%20ZS%20EV%20.jpg?w=700&c=1',
        'https://static.toiimg.com/thumb/msid-121859882,width-1280,height-720,resizemode-4/121859882.jpg'
      ],
      pricePerDay: 3600, location: 'Hyderabad',
      specs: { seats: 5, fuel: 'Electric', transmission: 'Automatic', mileage: 320 },
      description: 'Spacious EV with fast charging.',
      status: 'approved'
    },
    {
      ownerId: owner._id,
      make: 'BMW', model: 'i7', year: 2024, type: 'Luxury',
      images: [
        'https://stimg.cardekho.com/images/carexteriorimages/930x620/BMW/i7/11281/1752478507696/front-view-118.jpg?imwidth=890&impolicy=resize'
      ],
      pricePerDay: 15000, location: 'Bengaluru',
      specs: { seats: 5, fuel: 'Electric', transmission: 'Automatic', mileage: 590 },
      description: 'Flagship electric luxury sedan.',
      status: 'approved'
    },

    // Luxury
    {
      ownerId: owner._id,
      make: 'Rolls-Royce', model: 'Ghost', year: 2024, type: 'Luxury',
      images: [
        'https://stimg.cardekho.com/images/carexteriorimages/930x620/Rolls-Royce/Ghost-Series-II/12399/1739005302678/front-left-side-47.jpg?imwidth=890&impolicy=resize',
        'https://stimg.cardekho.com/images/carexteriorimages/930x620/Rolls-Royce/Ghost-Series-II/12399/1739005302678/front-view-118.jpg?imwidth=890&impolicy=resize'
      ],
      pricePerDay: 45000, location: 'Delhi',
      specs: { seats: 5, fuel: 'Petrol', transmission: 'Automatic', mileage: 7 },
      description: 'Ultra-luxury chauffeur sedan.',
      status: 'approved'
    },

    // Bikes
    {
      ownerId: owner._id,
      make: 'Yamaha', model: 'R15', year: 2023, type: 'Bike',
      images: [
        'https://imgd.aeplcdn.com/642x361/n/cw/ec/145115/yamaha-r15-right-front-three-quarter3.jpeg?isig=0&wm=3&q=75',
        'https://imgd.aeplcdn.com/642x361/n/cw/ec/145115/yamaha-r15-head-light1.jpeg?isig=0&wm=3&q=75'
      ],
      pricePerDay: 900, location: 'Chennai',
      specs: { seats: 2, fuel: 'Petrol', transmission: 'Manual', mileage: 40 },
      description: 'Sporty 150cc faired bike.',
      status: 'approved'
    },
    {
      ownerId: owner._id,
      make: 'Royal Enfield', model: 'Hunter 350', year: 2023, type: 'Bike',
      images: [
        'https://news24online.com/wp-content/uploads/2022/08/BB-4.jpg'
      ],
      pricePerDay: 800, location: 'Bengaluru',
      specs: { seats: 2, fuel: 'Petrol', transmission: 'Manual', mileage: 35 },
      description: 'Neo-retro roadster, comfy for city rides.',
      status: 'approved'
    },
    {
      ownerId: owner._id,
      make: 'Jawa', model: '42 Bobber', year: 2023, type: 'Bike',
      images: [
        'https://www.motoroids.com/wp-content/uploads/2023/09/Jawa-42-Bobber-Black-Mirror.jpeg'
      ],
      pricePerDay: 950, location: 'Pune',
      specs: { seats: 1, fuel: 'Petrol', transmission: 'Manual', mileage: 30 },
      description: 'Factory bobber with unique stance.',
      status: 'approved'
    }
  ];

  const created = await Vehicle.create(vehicles);
  log(`Vehicles created: ${created.length}`);

  await mongoose.disconnect();
  log('Seeding done ✅');
}

main().catch(e => {
  console.error('[seed] Error:', e);
  process.exit(1);
});
