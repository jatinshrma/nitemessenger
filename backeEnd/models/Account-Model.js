const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const { Schema } = mongoose;

const AccountSchema = new Schema({
    dp_id: { type: String, default:"No image" },
    bio: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('account', AccountSchema);