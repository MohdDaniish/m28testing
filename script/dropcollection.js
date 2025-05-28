const mongoose = require('mongoose');
require('dotenv').config({})
async function dropCollectionsExceptConfig() {
  // Replace with your MongoDB connection string and database name
  const env = process.env;
  const uri = `mongodb+srv://m28_db_user:xrEK6OzY4PadMoXS@cluster0.fuub38u.mongodb.net/mirai28?retryWrites=true&w=majority`;
  try {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Retrieve all collections from the connected database
    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      // Skip dropping the "config" collection
      if (collection.collectionName !== 'confiigs') {
        console.log(`Dropping collection: ${collection.collectionName}`);
        await collection.drop();
      }
    }

    console.log('Selected collections have been dropped.');
  } catch (error) {
    console.error('Error dropping collections:', error);
  } finally {
    // Disconnect from the database when done
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
dropCollectionsExceptConfig();
