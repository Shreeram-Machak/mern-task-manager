const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
require("dotenv").config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Task Manager API running");
});

const PORT = process.env.PORT || 5000;
const MAX_DB_RETRIES = 5;
const DB_NAME = "task-manager";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDatabase = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing. Add it to backend/.env.");
    process.exit(1);
  }

  for (let attempt = 1; attempt <= MAX_DB_RETRIES; attempt += 1) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        dbName: DB_NAME,
        serverSelectionTimeoutMS: 15000,
      });
      console.log("MongoDB connected");
      return;
    } catch (error) {
      console.error(`MongoDB connection failed (${attempt}/${MAX_DB_RETRIES})`);
      console.error(error.message);

      if (attempt === MAX_DB_RETRIES) {
        console.error("Could not connect to MongoDB.");
        console.error("Check that your MongoDB URI is correct, your network is online, and your Atlas IP access list allows this machine.");
        process.exit(1);
      }

      await wait(3000);
    }
  }
};

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
