const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function convertToCSV(data) {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const csvRows = data.map(row =>
    headers.map(field => {
      const value = row[field];
      if (value === null || value === undefined) return '';
      return typeof value === 'object' ? JSON.stringify(value) : `${value}`.replace(/"/g, '""');
    }).join(',')
  );

  return `${headers.join(',')}\n${csvRows.join('\n')}`;
}

async function exportAllCollectionscsv() {
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

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    for (const collection of collections) {
      const name = collection.collectionName;

      if (name !== 'confiigs') {
        console.log(`Exporting collection: ${name}`);

        const documents = await collection.find({}).toArray();

        // JSON Export
        const jsonPath = path.join(backupDir, `${name}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(documents, null, 2));

        // CSV Export
        const csvPath = path.join(backupDir, `${name}.csv`);
        const csvContent = convertToCSV(documents);
        fs.writeFileSync(csvPath, csvContent);

        console.log(`Exported ${documents.length} documents from ${name} to JSON and CSV.`);
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
exportAllCollectionscsv();
