import express from "express";
import Doctor from "../models/DoctorSchema.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import auth from "../auth/Middleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
  },
});

const upload = multer({ storage: storage });

// Add Doctor
router.post("/addDoctors", upload.single("image"), async (req, res) => {
  try {
    const { name, specialty, description, experienceYears } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !specialty || !description || !experienceYears || !image)
      return res.status(400).json({ message: "All fields are required" });

    const newDoctor = new Doctor({
      name,
      specialty,
      description,
      experienceYears,
      image,
    });

    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get All Doctors
router.get("/allDoctors", async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

// Get Doctor Count
router.get("/count", async (req, res) => {
  try {
    const count = await Doctor.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor count" });
  }
});

// Get Doctors By Specialty
router.get("/bySpecialty/:specialty", async (req, res) => {
  try {
    const { specialty } = req.params;
    const doctors = await Doctor.find({
      specialty: { $regex: new RegExp(specialty, "i") },
    });
    console.log("found doctors:", doctors.length);
    res.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors by specialty:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get Doctor By ID
router.get("/:id", async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  res.json(doctor);
});

// Delete Doctor (Admin only)
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (doctor.image) {
      const imagePath = path.join(process.cwd(), "uploads", doctor.image);
      fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(imagePath, (err) => {
            if (err) console.error("Error deleting image:", err);
          });
        }
      });
    }

    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
