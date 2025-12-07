const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Mount routers (placeholders for now)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/inspections', require('./routes/inspectionRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/catalog', require('./routes/catalogRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));


app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
