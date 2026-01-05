import express from "express";
import Appointment from "../models/AppointmentSchema.js";
import auth from "../auth/Middleware.js";

const router = express.Router();

// Get Appointment Count
router.get("/count", async (req, res) => {
  try {
    const count = await Appointment.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointment count" });
  }
});

// Create appointment
router.post("/createAppointment", auth(), async (req, res) => {
  const { doctor, date, time, reason } = req.body;

  if (!doctor || !date || !time || !reason)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const appointment = await Appointment.create({
      user: req.user.id,
      doctor,
      date,
      time,
      reason,
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Fixed version
router.get("/myAppointments", auth(), async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id }).populate(
      "doctor"
    );
    res.json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Optional: Delete appointment by ID
router.delete("/deleteAppointment/:id", auth(), async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
