const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB successfully!");
}

main()
    .then(() => initDB())
    .catch((err) => console.log(err));

const initDB = async () => {
    await Listing.deleteMany({});

    // Add author to every listing
    const sampleListings = initData.data.map((obj) => ({
        ...obj,
        author: "6a6f3b0953f2395398c0d9e3", // Your User ID
    }));

    await Listing.insertMany(sampleListings);

    console.log("Database initialized with sample data");

    mongoose.connection.close();
};