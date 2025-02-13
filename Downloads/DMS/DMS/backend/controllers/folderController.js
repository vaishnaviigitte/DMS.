const Folder = require('../models/Folder');

// Create a new folder
exports.createFolder = async (req, res) => {
    try {
        const { name, parent } = req.body;
        const folder = new Folder({ name, parent });
        await folder.save();
        res.status(201).json({ success: true, folder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get folders (nested)
exports.getFolders = async (req, res) => {
    try {
        const folders = await Folder.find({ parent: req.query.parent || null });
        res.status(200).json({ success: true, folders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Rename folder
exports.renameFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        await Folder.findByIdAndUpdate(id, { name });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete folder
exports.deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;
        await Folder.findByIdAndDelete(id);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
