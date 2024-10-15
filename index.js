const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

async function main() {
  /**--------------- Not allowed to be edited - start - --------------------- */
  const mongoUri = process.env.MONGODB_URI;
  const collection = process.env.MONGODB_COLLECTION;

  const args = process.argv.slice(2);
  const command = args[0];
  /**--------------- Not allowed to be edited - end - --------------------- */

  // Connect to MongoDB
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Define a schema for the collection
  const schema = new mongoose.Schema({}, { strict: false });
  const Model = mongoose.model(collection, schema);

  switch (command) {
    case "check-db-connection":
      await checkConnection();
      break;
    case "reset-db":
      await resetDb(Model);
      break;
    case "bulk-insert":
      await bulkInsert(Model);
      break;
    case "get-all":
      await getAll(Model);
      break;
    default:
      throw Error("command not found");
  }

  await mongoose.disconnect();
  return;
}

async function checkConnection() {
  console.log("check db connection started...");
  try {
    await mongoose.connection.db.admin().ping();
    console.log("MongoDB connection is successful!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
  console.log("check db connection ended...");
}

async function resetDb(Model) {
  try {
    // cek apakah document tersedia dalam koleksi
    const collectionExists = await Model.countDocuments();
    if (!collectionExists) {
      console.log("Collection does not exist.");
      return;
    }

    await Model.collection.drop(); // Menghapus koleksi
    console.log("Collection dropped successfully");
  } catch (error) {
    console.error("Error dropping collection:", error);
  }
}

async function bulkInsert(Model) {
  try {
    // Baca data dari seed.json
    const rawData = fs.readFileSync("seed.json");
    const data = JSON.parse(rawData);
    // Insert data ke dalam koleksi
    await Model.insertMany(data);
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

async function getAll(Model) {
  try {
    const documents = await Model.find();

    if (documents.length === 0) {
      console.log("No documents found.");
    } else {
      console.log("All documents:", documents);
    }
  } catch (error) {
    console.error("Error fetching documents:", error);
  }
}

main();
