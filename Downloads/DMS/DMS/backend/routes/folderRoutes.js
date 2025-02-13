const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Folder = require("../models/Folder");
const File = require("../models/File"); // Import File model

// Multer Configuration (File Upload)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// Create Folder
router.post("/create", async (req, res) => {
    try {
        const newFolder = new Folder({ name: req.body.name, parent: req.body.parent || null });
        const savedFolder = await newFolder.save();
        res.status(201).json({ success: true, folder: savedFolder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Upload File to Folder
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const { folderId } = req.body;
        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ success: false, message: "Folder not found" });
        }

        const newFile = new File({
            name: req.file.originalname,
            path: req.file.path,
            folderId: folder._id
        });

        await newFile.save();
        res.status(201).json({ success: true, file: newFile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get All Folders (Including Files)
router.get("/", async (req, res) => {
    try {
        const folders = await Folder.find({});
        const foldersWithFiles = await Promise.all(
            folders.map(async (folder) => {
                const files = await File.find({ folderId: folder._id }); // Fetch associated files
                return { ...folder.toObject(), files };
            })
        );

        res.status(200).json({ success: true, folders: foldersWithFiles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Rename Folder
router.put("/:id", async (req, res) => {
    try {
        await Folder.findByIdAndUpdate(req.params.id, { name: req.body.name });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Move Folder (Change Parent)
router.put("/:id/move", async (req, res) => {
    try {
        const { id } = req.params;
        const { parent } = req.body; // Target parent folder ID

        const folder = await Folder.findById(id);
        if (!folder) {
            return res.status(404).json({ success: false, message: "Folder not found" });
        }

        // Prevent moving a folder into itself
        if (id === parent) {
            return res.status(400).json({ success: false, message: "Cannot move folder into itself" });
        }

        folder.parent = parent || null; // Set new parent folder (or root)
        await folder.save();

        res.json({ success: true, message: "Folder moved successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete Folder (Including Its Files)
router.delete("/:id", async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.id);
        if (!folder) {
            return res.status(404).json({ success: false, message: "Folder not found" });
        }

        // Delete all files associated with the folder
        await File.deleteMany({ folderId: folder._id });

        // Delete the folder itself
        await Folder.findByIdAndDelete(folder._id);

        res.json({ success: true, message: "Folder and associated files deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
