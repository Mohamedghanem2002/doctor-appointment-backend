import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import User from "./routes/user.js";
import Doctor from "./routes/doctor.js";
import Appointment from "./routes/appointment.js";
import Departments from "./routes/Departments.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/user", User);
app.use("/doctors", Doctor);
app.use("/appointments", Appointment);
app.use("/departments", Departments);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Doctor Appointment Backend is running ");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
