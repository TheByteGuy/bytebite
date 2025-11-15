import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import createCommentRoutes from "./routes/commentRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Switch to sample_mflix
const sampleMflixDb = mongoose.connection.useDb("sample_mflix");
console.log("Using DB:", sampleMflixDb.name);

// Use comment routes
app.use("/comments", createCommentRoutes(sampleMflixDb));

// Health check
app.get("/", (req, res) => {
  res.send("ByteBite API is running!");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
