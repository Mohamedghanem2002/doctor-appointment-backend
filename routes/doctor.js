import express from "express";
import Doctor from "../models/DoctorSchema.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import auth from "../auth/Middleware.js";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/addDoctors", upload.single("image"), async (req, res) => {
  try {
    const { name, specialty, description, experienceYears } = req.body;

    if (!name || !specialty || !description || !experienceYears)
      return res.status(400).json({ message: "All fields are required" });

    let imageUrl = "";
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload_stream(
        { folder: "doctors" },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({ message: "Image upload failed" });
          }

          imageUrl = result.secure_url;

          const newDoctor = new Doctor({
            name,
            specialty,
            description,
            experienceYears,
            image: imageUrl,
          });

          const savedDoctor = await newDoctor.save();
          res.status(201).json(savedDoctor);
        }
      );

      uploadResult.end(req.file.buffer);
    } else {
      return res.status(400).json({ message: "Image file is required" });
    }
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ message: error.message });
  }
});
