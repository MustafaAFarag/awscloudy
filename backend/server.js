const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Log environment variables (for debugging, remove in production)
console.log("Current directory:", __dirname);
console.log("AWS_ACCESS_KEY_ID exists:", !!process.env.AWS_ACCESS_KEY_ID);
console.log(
  "AWS_SECRET_ACCESS_KEY exists:",
  !!process.env.AWS_SECRET_ACCESS_KEY
);

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types
    cb(null, true);
  },
});

// Validate AWS credentials
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error("Error: AWS credentials are not properly configured");
  console.error("Please check your .env file in the backend directory");
  console.error("Expected format:");
  console.error("AWS_ACCESS_KEY_ID=your_access_key_here");
  console.error("AWS_SECRET_ACCESS_KEY=your_secret_key_here");
  process.exit(1);
}

const AWS_REGION = "eu-central-1";
const BUCKET = "mymustafabucket2006";

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        message: "Please select a file to upload",
      });
    }

    const file = req.file;
    const fileStream = fs.createReadStream(file.path);

    // Generate a unique filename to prevent overwrites
    const uniqueFilename = `${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: BUCKET,
      Key: uniqueFilename,
      Body: fileStream,
      ContentType: file.mimetype,
    };

    try {
      await s3.send(new PutObjectCommand(params));
      fs.unlinkSync(file.path); // Clean up the temporary file

      // Generate a clean, readable URL with proper encoding
      const encodedFilename = encodeURIComponent(uniqueFilename);
      const fileUrl = `https://${BUCKET}.s3.${AWS_REGION}.amazonaws.com/${encodedFilename}`;

      res.json({
        success: true,
        message: "File uploaded successfully",
        url: fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        previewUrl: fileUrl, // Add a preview URL for images
      });
    } catch (s3Error) {
      console.error("S3 Upload Error:", s3Error);
      // Clean up the temporary file in case of S3 error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw s3Error;
    }
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      error: "Upload failed",
      message: error.message || "Failed to upload file to S3",
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
