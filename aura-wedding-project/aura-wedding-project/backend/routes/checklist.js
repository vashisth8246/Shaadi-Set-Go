const express = require('express');
const mongoose = require('mongoose');
const ChecklistItem = require('../models/ChecklistItem');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const items = await ChecklistItem.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching checklist', error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const item = new ChecklistItem(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error creating checklist item', error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const item = await ChecklistItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error updating checklist item', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await ChecklistItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting checklist item', error: error.message });
    }
});

module.exports = router;
