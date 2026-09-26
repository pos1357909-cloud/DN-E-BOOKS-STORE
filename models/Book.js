const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.Mixed, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, default: 'e-Books' },
    grade: { type: mongoose.Schema.Types.Mixed, required: true },
    subject: { type: String, required: true },
    isFree: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    mode: { type: String, default: 'Read' },
    previewPages: { type: Number, default: 2 },
    readLink: { type: String, default: null },
    downloadLink: { type: String, default: null },
    pdfData: { type: String, default: null }, // Base64 or Cloudinary URL
    published: { type: Boolean, default: true },
    allowRetry: { type: Boolean, default: true },
    textNotes: { type: String, default: '' },
    questions: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);