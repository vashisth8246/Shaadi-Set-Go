const mongoose = require('mongoose');

const ChecklistItemSchema = new mongoose.Schema({
    timeline: String,
    task: String,
    completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('ChecklistItem', ChecklistItemSchema);
