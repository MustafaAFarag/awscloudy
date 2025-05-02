const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

const s3 = new S3Client({ region: "eu-central-1" }); // Frankfurt
const BUCKET = "mymustafabucket2006"; // your bucket name

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;

  const fileStream = fs.createReadStream(file.path);
  const params = {
    Bucket: BUCKET,
    Key: file.originalname,
    Body: fileStream,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  try {
    await s3.send(new PutObjectCommand(params));
    fs.unlinkSync(file.path);
    res.json({
      message: "File uploaded",
      url: `https://${BUCKET}.s3.${s3.config.region}.amazonaws.com/${file.originalname}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload error");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
