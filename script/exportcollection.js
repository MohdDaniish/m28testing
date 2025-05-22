const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function exportAllCollections() {
  const env = process.env;
  const uri = `mongodb+srv://${env.MONGODB_USER}:${env.MONGODB_PASSWORD}@${env.MONGODB_HOST}/${env.MONGODB_DB}?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.collections();

    const backupDir = path.join(__dirname, 'dbbackup');

    // Create the backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    for (const collection of collections) {
      const name = collection.collectionName;

      if (name !== 'confiigs') {
        console.log(`Exporting collection: ${name}`);

        const documents = await collection.find({}).toArray();
        const exportPath = path.join(backupDir, `${name}.json`);

        fs.writeFileSync(exportPath, JSON.stringify(documents, null, 2));
        console.log(`Exported ${documents.length} documents from ${name} to ${exportPath}`);
      }
    }

    console.log('All selected collections have been exported to dbbackup folder.');
  } catch (error) {
    console.error('Error exporting collections:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
exportAllCollections();
