const express = require("express");
const router = express.Router();
const multer = require("multer");
const File = require("../models/File");
const Folder = require("../models/Folder");

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// File Upload API
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const { folderId } = req.body;
        if (!folderId) {
            return res.status(400).json({ success: false, message: "Folder ID is required" });
        }

        const newFile = new File({ name: req.file.originalname, folderId });
        await newFile.save();

        res.status(201).json({ success: true, file: newFile });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ success: false, message: "Failed to upload file" });
    }
});

// Get all files inside a folder
router.get("/:folderId", async (req, res) => {
    try {
        const files = await File.find({ folderId: req.params.folderId });
        res.status(200).json({ success: true, files });
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ success: false, message: "Failed to fetch files" });
    }
});

module.exports = router;
