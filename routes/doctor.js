import express from "express";
import Doctor from "../models/DoctorSchema.js";
import multer from "multer";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import auth from "../auth/Middleware.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/addDoctors", upload.single("image"), async (req, res) => {
  try {
    const { name, specialty, description, experienceYears } = req.body;

    if (!name || !specialty || !description || !experienceYears)
      return res.status(400).json({ message: "All fields are required" });

    let imageUrl = "";
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "doctors" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        Readable.from(req.file.buffer).pipe(stream);
      });
      imageUrl = uploadResult.secure_url;
    }

    const newDoctor = new Doctor({
      name,
      specialty,
      description,
      experienceYears,
      image: imageUrl,
    });

    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
