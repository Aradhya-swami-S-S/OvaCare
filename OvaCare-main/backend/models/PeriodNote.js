const mongoose = require("mongoose");

const periodNoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'register',
        required: true,
        index: true
    },
    periodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Period',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    symptoms: {
        cramps: {
            type: String,
            enum: ['none', 'mild', 'moderate', 'severe'],
            default: 'none'
        },
        flow: {
            type: String,
            enum: ['spotting', 'light', 'medium', 'heavy'],
            default: 'medium'
        },
        mood: {
            type: String,
            enum: ['happy', 'neutral', 'sad', 'irritable', 'anxious'],
            default: 'neutral'
        },
        pain: {
            type: Number,
            min: 0,
            max: 10,
            default: 0
        }
    },
    medications: [{
        name: {
            type: String,
            required: true
        },
        dosage: {
            type: String,
            default: ''
        },
        time: {
            type: String,
            default: ''
        }
    }],
    customNotes: {
        type: String,
        maxlength: 1000,
        default: ''
    }
}, {
    timestamps: true
});

// Compound indexes for efficient querying
periodNoteSchema.index({ userId: 1, periodId: 1, date: -1 });
periodNoteSchema.index({ periodId: 1, date: -1 });

// Method to get formatted symptoms summary
periodNoteSchema.methods.getSymptomsSummary = function() {
    const symptoms = [];
    
    if (this.symptoms.cramps !== 'none') {
        symptoms.push(`${this.symptoms.cramps} cramps`);
    }
    if (this.symptoms.flow) {
        symptoms.push(`${this.symptoms.flow} flow`);
    }
    if (this.symptoms.mood !== 'neutral') {
        symptoms.push(`feeling ${this.symptoms.mood}`);
    }
    if (this.symptoms.pain > 0) {
        symptoms.push(`pain level ${this.symptoms.pain}/10`);
    }
    
    return symptoms.join(', ') || 'No symptoms logged';
};

const PeriodNote = mongoose.model("PeriodNote", periodNoteSchema);

module.exports = PeriodNote;