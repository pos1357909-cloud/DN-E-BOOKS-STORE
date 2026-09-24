const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    studentId: { type: Number, required: true },
    studentName: { type: String, required: true },
    studentPhone: { type: String, required: true },
    bookId: { type: Number, required: true },
    bookTitle: { type: String, required: true },
    price: { type: Number, required: true },
    code: { type: String, required: true },
    timestamp: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);