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

// ✅ اتصال الداتا بيز يتم مرة واحدة فقط
let isConnected = false;
async function initDB() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// ✅ تأكيد الاتصال قبل أي Route
app.use(async (req, res, next) => {
  await initDB();
  next();
});

app.use("/user", User);
app.use("/doctors", Doctor);
app.use("/appointments", Appointment);
app.use("/departments", Departments);

app.get("/", (req, res) => {
  res.send("Doctor Appointment Backend on Vercel ✅");
});

export const handler = serverless(app);
export default app;
