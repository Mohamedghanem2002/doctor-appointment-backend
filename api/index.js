import serverless from "serverless-http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "../config/db.js";
import User from "../routes/user.js";
import Doctor from "../routes/doctor.js";
import Appointment from "../routes/appointment.js";
import Departments from "../routes/Departments.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/user", User);
app.use("/api/doctors", Doctor);
app.use("/api/appointments", Appointment);
app.use("/api/departments", Departments);

app.get("/", (req, res) => {
  res.send("Doctor Appointment Backend on Vercel ✅");
});

export const handler = serverless(app);
