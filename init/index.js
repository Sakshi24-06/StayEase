require("dotenv").config();

const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

const MONGO_URL = process.env.ATLASDB_URL;

async function initDB() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB Atlas successfully!");

        await Listing.deleteMany({});

        const sampleListings = initData.data.map((obj) => ({
            ...obj,
            author: new mongoose.Types.ObjectId("6ac7fe5379addd928f81b03e")
        }));

        await Listing.insertMany(sampleListings);

        console.log(
            `Database initialized with ${sampleListings.length} sample listings!`
        );
    } catch (err) {
        console.error("Database initialization failed:", err);
    } finally {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
    }
}

initDB();