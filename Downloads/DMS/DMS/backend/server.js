const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const app = express(); // Initialize Express before using it

// Middleware
app.use(express.json()); // Parse JSON request body
app.use(cors());

// Import routes
const fileRoutes = require("./routes/filesRoutes");
const folderRoutes = require('./routes/folderRoutes');

// Use routes after initializing 'app'
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected Successfully"))
.catch(err => console.log(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 