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

    if (req.file && !req.file.mimetype.startsWith("image/"))
      return res.status(400).json({ message: "Only image files are allowed" });

    let imageUrl = "";
    let imageId = "";

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
      imageId = uploadResult.public_id;
    }

    const newDoctor = new Doctor({
      name,
      specialty,
      description,
      experienceYears,
      image: imageUrl,
      imageId,
    });

    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/allDoctors", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/count", async (req, res) => {
  try {
    const count = await Doctor.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor count" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (doctor.imageId) {
      await cloudinary.uploader.destroy(doctor.imageId);
    }

    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
