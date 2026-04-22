const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// Check File Type
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Only Images (jpeg, jpg, png) and PDFs are allowed!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// @route   POST /api/upload
// @desc    Upload an image
router.post('/', (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            console.error("Multer Upload Error:", err);
            return res.status(400).json({ error: err instanceof Error ? err.message : err });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = `/${req.file.path.replace(/\\/g, "/")}`; // Normalize path
        res.send(filePath);
    });
});

module.exports = router;
