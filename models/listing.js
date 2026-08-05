const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    image: {
        url: {
            type: String,
        },
        filename: {
            type: String,
            default: "listingimage",
        },
    },

    price: {
        type: Number,
        required: true,
    },

    location: {
        type: String,
        required: true,
    },

    country: {
        type: String,
        required: true,
    },
    images: [{ url: String, filename: String }],

    category: {
        type: String,
        enum: ["Trending", "Rooms", "Iconic Cities", "Mountain", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Boats"],
        default: "Trending",
    },
    
    geometry: {
    type: {
        type: String,
        enum: ["Point"],
        default: "Point",
    },
    coordinates: {
        type: [Number],
        default: [77.2090, 28.6139], // Default: New Delhi [longitude, latitude]
    },
},
    
    
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({
            _id: {
                $in: listing.reviews,
            },
        });
    }
});

module.exports = mongoose.model("Listing", listingSchema);
