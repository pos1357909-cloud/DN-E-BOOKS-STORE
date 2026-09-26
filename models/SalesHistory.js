const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    bookId: { type: Number, required: true },
    price: { type: Number, required: true },
    timestamp: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SalesHistory', salesSchema);