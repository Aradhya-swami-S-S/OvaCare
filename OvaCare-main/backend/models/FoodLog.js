const mongoose = require("mongoose");

const foodLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'register',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
        required: true
    },
    foodItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    // Cached nutrition values (calculated at log time)
    nutrition: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
        fiber: Number
    }
}, {
    timestamps: true
});

// Compound index for efficient querying
foodLogSchema.index({ userId: 1, date: 1 });

const FoodLog = mongoose.model("FoodLog", foodLogSchema);

module.exports = FoodLog;