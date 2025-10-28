import express from "express";
import Appointment from "../models/AppointmentSchema.js";
import auth from "../auth/Middleware.js";

const router = express.Router();

// Create appointment
router.post("/createAppointment", auth(), async (req, res) => {
  const { doctor, date, reason } = req.body;

  if (!doctor || !date || !reason)
    return res.status(400).json({ message: "Missing fields" });

  const appointment = await Appointment.create({
    user: req.user.id,
    doctor,
    date,
    reason,
  });
  res.status(201).json(appointment);
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
router.delete("/deleteAppointment/:id", async (req, res) => {
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
