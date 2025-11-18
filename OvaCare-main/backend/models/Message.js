const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    content: { 
        type: String, 
        required: true,
        maxlength: 500 // Limit message length
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'register',
        required: true 
    },
    username: { 
        type: String, 
        required: true 
    },
    isAnonymous: { 
        type: Boolean, 
        default: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    // For moderation purposes
    isDeleted: { 
        type: Boolean, 
        default: false 
    }
}, {
    timestamps: true
});

// Index for efficient querying
messageSchema.index({ timestamp: -1 });
messageSchema.index({ isDeleted: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;