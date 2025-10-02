import "dotenv/config.js";
import mongoose from "mongoose";
import Vehicle from "../src/models/Vehicle.js";
import User from "../src/models/User.js";
import { env } from "../src/config/env.js";

// Admin/user seeds are optional; adjust as needed
async function run() {
  await mongoose.connect(env.mongoUri);
  console.log("Mongo connected (seed)");

  await Vehicle.deleteMany({});

  const vehicles = [
    // Toyota Fortuner (SUV)
    {
      make: "Toyota",
      model: "Fortuner",
      year: 2022,
      type: "SUV",
      location: "Chennai",
      pricePerDay: 3200,
      status: "approved",
      images: [
        "https://images.unsplash.com/photo-1664783856972-ac9922d7b2d3?q=80&w=1935&auto=format",
        "https://images.unsplash.com/photo-1619767886645-0ae16581bf6b?q=80&w=1471&auto=format",
      ],
      description: "Rugged full-size SUV with 7 seats.",
    },
    // Hyundai Creta
    {
      make: "Hyundai",
      model: "Creta",
      year: 2024,
      type: "SUV",
      location: "Chennai",
      pricePerDay: 2200,
      status: "approved",
      images: [
        "https://images.unsplash.com/photo-1748214547184-d994bfe53322?q=80&w=1488&auto=format",
        "https://images.unsplash.com/photo-1748214547306-360d11024747?q=80&w=1526&auto=format",
      ],
      description: "Popular compact SUV with great comfort.",
    },
    // Mahindra XUV700
    {
      make: "Mahindra",
      model: "XUV700",
      year: 2024,
      type: "SUV",
      location: "Delhi",
      pricePerDay: 2600,
      status: "approved",
      images: [
        "https://stimg.cardekho.com/images/carexteriorimages/930x620/Mahindra/XUV700/10794/1753879010184/side-view-(left)-90.jpg",
        "https://stimg.cardekho.com/images/carexteriorimages/930x620/Mahindra/XUV700/10794/1753879010184/front-view-118.jpg",
      ],
      description: "Feature-rich SUV with ADAS.",
    },
    // Honda City
    {
      make: "Honda",
      model: "City",
      year: 2023,
      type: "Sedan",
      location: "Bengaluru",
      pricePerDay: 2000,
      status: "approved",
      images: [
        "https://img.autocarindia.com/Features/20220504121419_Honda%20City%20Hybrid%20front%20quarter.jpg?c=0",
        "https://www.rushlane.com/wp-content/uploads/2022/05/honda-city-hybrid-test-drive-1-1200x900.jpg",
      ],
      description: "Premium sedan, smooth and efficient.",
    },
    // Skoda Octavia
    {
      make: "Skoda",
      model: "Octavia",
      year: 2021,
      type: "Sedan",
      location: "Hyderabad",
      pricePerDay: 2400,
      status: "approved",
      images: [
        "https://c.ndtvimg.com/2020-07/7tn50v38_2021-skoda-octavia-rs-unveiled-with-a-plugin-hybrid-variant-_625x300_06_July_20.jpg",
      ],
      description: "European sedan with solid dynamics.",
    },
    // Maruti Swift
    {
      make: "Maruti",
      model: "Swift",
      year: 2024,
      type: "Hatchback",
      location: "Chennai",
      pricePerDay: 1400,
      status: "approved",
      images: [
        "https://stimg.cardekho.com/images/carexteriorimages/930x620/Maruti/Swift/9226/1751526426469/exterior-image-164.jpg",
        "https://stimg.cardekho.com/images/carexteriorimages/930x620/Maruti/Swift/9226/1751526426469/front-right-view-120.jpg",
      ],
      description: "Peppy hatchback for city runs.",
    },
    // Tata Tiago
    {
      make: "Tata",
      model: "Tiago",
      year: 2023,
      type: "Hatchback",
      location: "Pune",
      pricePerDay: 1200,
      status: "approved",
      images: [
        "https://cdn-s3.autocarindia.com/Tata/tiago/_DSF6526.JPG?w=640&q=75",
      ],
      description: "Compact hatchback with great value.",
    },
    // Tata Nexon EV
    {
      make: "Tata",
      model: "Nexon EV",
      year: 2025,
      type: "EV",
      location: "Hyderabad",
      pricePerDay: 2800,
      status: "approved",
      images: [
        "https://img.gaadicdn.com/images/carexteriorimages/large/Tata/Nexon-EV/11024/1753945907283/front-view-118.jpg",
        "https://img.gaadicdn.com/images/carexteriorimages/large/Tata/Nexon-EV/11024/1753945907283/side-view-(left)-90.jpg",
      ],
      description: "Electric compact SUV with range for city.",
    },
    // MG ZS EV
    {
      make: "MG",
      model: "ZS EV",
      year: 2023,
      type: "EV",
      location: "Hyderabad",
      pricePerDay: 3600,
      status: "approved",
      images: [
        "https://img.autocarindia.com/ExtraImages/20250616053933_MG%20ZS%20EV%20.jpg?w=700&c=1",
        "https://static.toiimg.com/thumb/msid-121859882,width-1280,height-720,resizemode-4/121859882.jpg",
      ],
      description: "Spacious EV with fast charging.",
    },
    // Volkswagen (generic)
    {
      make: "Volkswagen",
      model: "Taigun",
      year: 2022,
      type: "SUV",
      location: "Delhi",
      pricePerDay: 2300,
      status: "approved",
      images: [
        "https://images.unsplash.com/photo-1591152231320-bc7902cf852e?q=80&w=1476&auto=format",
        "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1476&auto=format",
      ],
      description: "German build quality compact SUV.",
    },
    // BMW i7 (Luxury)
    {
      make: "BMW",
      model: "i7",
      year: 2024,
      type: "Luxury",
      location: "Delhi",
      pricePerDay: 8500,
      status: "approved",
      images: [
        "https://stimg.cardekho.com/images/carexteriorimages/930x620/BMW/i7/11281/1752478507696/front-view-118.jpg?imwidth=890&impolicy=resize",
      ],
      description: "Luxury electric limousine.",
    },
    // Rolls Royce Ghost (Luxury)
    {
      make: "Rolls-Royce",
      model: "Ghost",
      year: 2024,
      type: "Luxury",
      location: "Delhi",
      pricePerDay: 45000,
      status: "approved",
      images: [
        "https://stimg.cardekho.com/images/carexteriorimages/930x620/Rolls-Royce/Ghost-Series-II/12399/1739005302678/front-left-side-47.jpg?imwidth=890&impolicy=resize",
        "https://stimg.cardekho.com/images/carexteriorimages/930x620/Rolls-Royce/Ghost-Series-II/12399/1739005302678/front-view-118.jpg?imwidth=890&impolicy=resize",
      ],
      description: "Ultra luxury chauffeur sedan.",
    },
    // Land Rover Defender
    {
      make: "Land Rover",
      model: "Defender",
      year: 2023,
      type: "SUV",
      location: "Mumbai",
      pricePerDay: 9000,
      status: "approved",
      images: [
        "https://imgd-ct.aeplcdn.com/1056x660/n/cw/ec/55215/defender-exterior-front-view-17.jpeg?isig=0&q=80",
      ],
      description: "Iconic off-roader.",
    },
    // Bikes (Yamaha R15, RE Hunter, Jawa Bobber)
    {
      make: "Yamaha",
      model: "R15",
      year: 2024,
      type: "Bike",
      location: "Chennai",
      pricePerDay: 900,
      status: "approved",
      images: [
        "https://imgd.aeplcdn.com/642x361/n/cw/ec/145115/yamaha-r15-right-front-three-quarter3.jpeg?isig=0&wm=3&q=75",
        "https://imgd.aeplcdn.com/642x361/n/cw/ec/145115/yamaha-r15-head-light1.jpeg?isig=0&wm=3&q=75",
      ],
      description: "Sporty 155cc bike.",
    },
    {
      make: "Royal Enfield",
      model: "Hunter",
      year: 2023,
      type: "Bike",
      location: "Bengaluru",
      pricePerDay: 800,
      status: "approved",
      images: ["https://news24online.com/wp-content/uploads/2022/08/BB-4.jpg"],
      description: "Neo-classic 350.",
    },
    {
      make: "Jawa",
      model: "42 Bobber",
      year: 2023,
      type: "Bike",
      location: "Hyderabad",
      pricePerDay: 950,
      status: "approved",
      images: [
        "https://www.motoroids.com/wp-content/uploads/2023/09/Jawa-42-Bobber-Black-Mirror.jpeg",
      ],
      description: "Custom bobber style.",
    },
  ];

  await Vehicle.insertMany(vehicles);
  console.log(`Seeded vehicles: ${vehicles.length}`);

  await mongoose.disconnect();
  console.log("Seed done");
}

run().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
