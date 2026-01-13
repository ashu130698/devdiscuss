import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.error("Mongo error:", err));

app.get("/health", (req, res) => res.send("OK"));

app.listen(process.env.PORT || 4000, () =>
  console.log("Server running on", process.env.PORT || 4000)
);
