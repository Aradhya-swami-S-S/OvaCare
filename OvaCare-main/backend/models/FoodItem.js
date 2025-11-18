const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    category: {
        type: String,
        enum: ['roti', 'rice', 'dal', 'sabzi', 'paneer', 'breakfast', 'snacks', 'fruits', 'sweets', 'beverages', 'other'],
        default: 'other'
    },
    servingSize: {
        amount: { type: Number, required: true },
        unit: { type: String, required: true } // piece, cup, bowl, gram
    },
    nutrition: {
        calories: { type: Number, required: true },
        protein: { type: Number, required: true }, // grams
        carbs: { type: Number, required: true }, // grams
        fat: { type: Number, required: true }, // grams
        fiber: { type: Number, default: 0 }, // grams
        sugar: { type: Number, default: 0 }, // grams
        sodium: { type: Number, default: 0 } // mg
    },
    isIndian: {
        type: Boolean,
        default: true
    },
    isPCOSFriendly: {
        type: Boolean,
        default: false
    },
    isLowGI: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Text index for search
foodItemSchema.index({ name: 'text' });

const FoodItem = mongoose.model("FoodItem", foodItemSchema);

module.exports = FoodItem;