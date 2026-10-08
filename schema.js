const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),

        description: Joi.string().required(),

        location: Joi.string().required(),

        country: Joi.string()
            .pattern(/^[A-Za-z\s]+$/)
            .required()
            .messages({
                "string.pattern.base": "Country must contain only letters!"
            }),

        price: Joi.number()
            .min(0)
            .required()
            .messages({
                "number.min": "Price cannot be negative"
            }),

        category: Joi.string()
            .valid("Trending", "Rooms", "Iconic Cities", "Mountain", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Boats")
            .default("Trending"),
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        comment: Joi.string().required(),

        rating: Joi.number()
            .min(1)
            .max(5)
            .required(),
    }).required(),
});
