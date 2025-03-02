// Simple script to check MongoDB connection status
require("dotenv").config();
const mongoose = require("mongoose");

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare_portal';

console.log("Attempting to connect to MongoDB...");
console.log(`Connection string: ${MONGODB_URI.replace(/\/\/([^:]+):[^@]+@/, "//***:***@")}`); // Hide password in logs

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB');
    console.log('Connection state:', mongoose.connection.readyState);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    // Check database information
    const db = mongoose.connection.db;
    if (db) {
      console.log('Connected to database:', mongoose.connection.name);
      
      // List collections
      db.listCollections().toArray()
        .then((collections: any[]) => {
          console.log('Collections in database:');
          collections.forEach((collection) => {
            console.log(`- ${collection.name}`);
          });
          
          // Close connection and exit
          mongoose.connection.close()
            .then(() => {
              console.log('MongoDB connection closed');
              process.exit(0);
            });
        })
        .catch((err: Error) => {
          console.error('Error listing collections:', err);
          process.exit(1);
        });
    } else {
      console.log('Database information not available');
      process.exit(0);
    }
  })
  .catch((error: Error) => {
    console.error('❌ MongoDB connection error:', error);
    console.log('Connection state:', mongoose.connection.readyState);
    process.exit(1);
  }); 