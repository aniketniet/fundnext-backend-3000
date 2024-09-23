
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    },
    roomId:{
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
