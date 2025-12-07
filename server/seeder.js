const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');

// Load models
const User = require('./models/User');
const Inspection = require('./models/Inspection');
const Quotation = require('./models/Quotation');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await Quotation.deleteMany();
    await Inspection.deleteMany();
    await User.deleteMany();

    // --- 1. Create a sample user ---
    const users = await User.create([
      {
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'password123', // Note: Password will be hashed by the model pre-save hook
      },
    ]);
    const demoUser = users[0];
    console.log('User created...');

    // --- 2. Create sample inspections ---
    const inspections = await Inspection.create([
      {
        containerId: 'MSKU1234567',
        status: 'Quotation Sent',
        images: ['uploads/sample1.jpg', 'uploads/sample2.jpg'],
        damages: [
            { location: 'Top Rail', type: 'BF', severity: 'Nặng', size: '20cm' },
            { location: 'Floor Board', type: 'HO', severity: 'Vừa', size: '5cm' },
        ],
        user: demoUser._id,
      },
      {
        containerId: 'CMAU7654321',
        status: 'Completed',
        images: ['uploads/sample3.jpg'],
        damages: [
            { location: 'Side Panel', type: 'DE', severity: 'Nhẹ', size: '10cm' },
        ],
        user: demoUser._id,
      },
       {
        containerId: 'EMCU2222222',
        status: 'Pending',
        images: [],
        damages: [],
        user: demoUser._id,
      }
    ]);
    const inspectionForQuote = inspections[0];
    console.log('Inspections created...');

    // --- 3. Create a sample quotation for one inspection ---
    await Quotation.create({
        inspection: inspectionForQuote._id,
        quotationId: `Q-20240101-DEMO`, // Manual ID for predictability
        status: 'Sent',
        lineItems: [
            { description: 'Repair Bent Top Rail', code: 'BF-TR-01', quantity: 1, cost: 250 },
            { description: 'Patch Hole in Floor', code: 'HO-FL-02', quantity: 1, cost: 120 },
        ],
        totalCost: 370,
        user: demoUser._id,
    });
    console.log('Quotation created...');

    console.log('\nData Imported Successfully!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
    try {
        await Quotation.deleteMany();
        await Inspection.deleteMany();
        await User.deleteMany();
        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`.red.inverse);
        process.exit(1);
    }
}

if(process.argv[2] === '-destroy') {
    destroyData();
} else {
    importData();
}
