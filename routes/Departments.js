import express from "express";
import Department from "../models/Departments.js";
import auth from "../auth/Middleware.js";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

// 🟢 Add Department (Admin Only)
router.post(
  "/addDepartments",
  auth("admin"),
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });

      const department = await Department.create({
        name,
        description,
        image: req.file ? req.file.filename : null,
      });

      res.status(201).json(department);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating department" });
    }
  }
);

// 🟡 Get All Departments
router.get("/allDepartments", async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching departments" });
  }
});

// 🔵 Get Department Count
router.get("/count", async (req, res) => {
  try {
    const count = await Department.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching department count" });
  }
});

// 🔴 Delete Department (Admin Only)
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    await Department.findByIdAndDelete(id);
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting department" });
  }
});

export default router;
