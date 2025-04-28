require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./User");
const Batch = require("./Batchs");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/myconnection")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

// Root Route - Server Health Check
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error signing up", error: error.message });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
});

// Timetable Creation/Update Route
app.post("/timetables", async (req, res) => {
  try {
    console.log("📥 Received Data:", req.body);

    let { fromYear, toYear, subjects, departments } = req.body;
    // Convert string to numbers safely
    fromYear = parseInt(fromYear, 10);
    toYear = parseInt(toYear, 10);

    if (isNaN(fromYear) || isNaN(toYear) || fromYear <= 1900 || toYear <= 1900) {
      return res.status(400).json({ message: "Invalid fromYear or toYear. Please check input values." });
    }

    // Ensure these are arrays
    subjects = Array.isArray(subjects) ? subjects : [];
    departments = Array.isArray(departments) ? departments : [];

    // Find or create the batch
    let batch = await Batch.findOne({ fromYear, toYear });

    if (!batch) {
      // Create a new batch with empty timetable structure
      batch = new Batch({
        fromYear,
        toYear,
        timetables: [
          {
            years: [], // We'll populate below
          },
        ],
      });
    }

    // Track years to add
    const newYears = [];

    for (let year = fromYear; year <= toYear; year++) {
      const existingYear = batch.timetables[0].years.find((y) => y.yearNumber === year);

      if (existingYear) {
        // Merge data (optional: deduplicate)
        if (subjects.length) existingYear.subjects.push(...subjects);
        if (departments.length) existingYear.departments.push(...departments);
      } else {
        // Add new year entry
        newYears.push({
          yearNumber: year,
          subjects: [...subjects],      // clone to avoid shared ref
          departments: [...departments],
        });
      }
    }

    // Push newly created year objects into batch
    if (newYears.length > 0) {
      batch.timetables[0].years.push(...newYears);
    }

    await batch.save();
    res.status(201).json({ message: "✅ Timetable updated successfully", batch });
  } catch (error) {
    console.error("❌ Error updating timetable:", error);
    res.status(500).json({ message: "Error updating timetable", error: error.message });
  }
});

app.post("/timetablesdetails", async (req, res) => {
  try {
    console.log("📥 Received Data:", req.body);

    // Destructure with defaults
    let { fromYear, toYear, departments, subjects, year } = req.body;

    // Convert string to numbers safely
    fromYear = parseInt(fromYear, 10);
    toYear = parseInt(toYear, 10);
    year = parseInt(year, 10);

    // Validate year inputs
    if (isNaN(fromYear) || isNaN(toYear) || isNaN(year) || fromYear <= 1900 || toYear <= 1900) {
      return res.status(400).json({ message: "❌ Invalid fromYear, toYear, or year. Please check input values." });
    }

    // Ensure arrays
    subjects = Array.isArray(subjects) ? subjects : [];
    departments = Array.isArray(departments) ? departments : [];

    // Find or create the batch
    let batch = await Batch.findOne({ fromYear, toYear });

    if (!batch) {
      // Create a new batch with empty timetable structure
      batch = new Batch({
        fromYear,
        toYear,
        timetables: [
          {
            years: [], // We'll populate below
          },
        ],
      });
    }

    // Reference to the first timetable object
    const timetable = batch.timetables[0];

    // Check if the year already exists
    const existingYear = timetable.years.find((y) => y.yearNumber === year);

    if (existingYear) {
      // Merge data (optional: deduplicate later if needed)
      if (subjects.length) existingYear.subjects.push(...subjects);
      if (departments.length) existingYear.departments.push(...departments);
    } else {
      // Add new year entry
      timetable.years.push({
        yearNumber: year,
        subjects: [...subjects], // spread to avoid shared reference
        departments: [...departments],
      });
    }

    // Save the batch
    await batch.save();

    res.status(201).json({
      message: "✅ Timetable updated successfully",
      batch,
    });

  } catch (error) {
    console.error("❌ Error updating timetable:", error);
    res.status(500).json({
      message: "❌ Error updating timetable",
      error: error.message,
    });
  }
});

// POST route only for department entries
app.post("/timetablesdetails/departments", async (req, res) => {
  try {
    let { fromYear, toYear, year, departments } = req.body;

    fromYear = parseInt(fromYear, 10);
    toYear = parseInt(toYear, 10);
    year = parseInt(year, 10);

    if (isNaN(fromYear) || isNaN(toYear) || isNaN(year)) {
      return res.status(400).json({ message: "Invalid input values" });
    }

    if (!Array.isArray(departments)) {
      departments = [];
    }

    let batch = await Batch.findOne({ fromYear, toYear });

    if (!batch) {
      batch = new Batch({
        fromYear,
        toYear,
        timetables: [
          {
            years: [],
          },
        ],
      });
    }

    const timetable = batch.timetables[0];

    const existingYear = timetable.years.find((y) => y.yearNumber === year);

    if (existingYear) {
      existingYear.departments.push(...departments);
    } else {
      timetable.years.push({
        yearNumber: year,
        departments: [...departments],
        subjects: [],
      });
    }

    await batch.save();
    res.status(201).json({ message: "✅ Departments added successfully", batch });
  } catch (error) {
    console.error("❌ Error saving departments:", error);
    res.status(500).json({ message: "Error saving departments", error: error.message });
  }
});


app.get("/timetablesdetails", async (req, res) => {
  try {
    const batches = await Batch.find({});
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: "Error fetching timetables", error: error.message });
  }
});

// Fetch Timetables Route
app.get("/timetables", async (req, res) => {
  try {
    const batches = await Batch.find({});
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: "Error fetching timetables", error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
