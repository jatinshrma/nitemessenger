const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChatSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    sender: { type: String, required: true },
    reciever: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('chat', ChatSchema);