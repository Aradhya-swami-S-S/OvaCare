const mongoose = require("mongoose");

const periodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'register',
        required: true,
        index: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        default: null
    },
    cycleLength: {
        type: Number,
        default: null, // Calculated when next period starts
        min: 21,
        max: 45
    },
    predictedNextDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true // Current/ongoing cycle
    },
    remindersSent: {
        threeDayBefore: { 
            type: Boolean, 
            default: false 
        },
        onDay: { 
            type: Boolean, 
            default: false 
        }
    }
}, {
    timestamps: true
});

// Compound indexes for efficient querying
periodSchema.index({ userId: 1, startDate: -1 });
periodSchema.index({ userId: 1, isActive: 1 });
periodSchema.index({ userId: 1, predictedNextDate: 1 });

// Method to calculate cycle length
periodSchema.methods.calculateCycleLength = function(nextPeriodStartDate) {
    const start = new Date(this.startDate);
    const next = new Date(nextPeriodStartDate);
    const diffTime = Math.abs(next - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Static method to calculate average cycle length for a user
periodSchema.statics.calculateAverageCycleLength = async function(userId) {
    const periods = await this.find({ 
        userId, 
        cycleLength: { $ne: null } 
    })
    .sort({ startDate: -1 })
    .limit(6) // Use last 6 cycles for average
    .select('cycleLength');

    if (periods.length < 3) {
        return 30; // Default cycle length
    }

    const sum = periods.reduce((acc, period) => acc + period.cycleLength, 0);
    return Math.round(sum / periods.length);
};

// Static method to predict next period date
periodSchema.statics.predictNextPeriod = function(lastPeriodDate, cycleLength = 30) {
    const nextDate = new Date(lastPeriodDate);
    nextDate.setDate(nextDate.getDate() + cycleLength);
    return nextDate;
};

const Period = mongoose.model("Period", periodSchema);

module.exports = Period;