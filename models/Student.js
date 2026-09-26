const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.Mixed, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    grade: { type: mongoose.Schema.Types.Mixed, required: true },
    email: { type: String, required: true, unique: true },
    pass: { type: String, required: true },
    phone: { type: String, default: '' },
    status: { type: String, default: 'Active' },
    allowedBooks: { type: Array, default: [] },
    subscription: { type: Object, default: () => ({ plan: 'FREE', expiryDate: null, activatedAt: null }) },
    quizHistory: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);