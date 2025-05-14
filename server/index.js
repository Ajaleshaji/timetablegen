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
    let { fromYear, toYear, year, subjects } = req.body;

    fromYear = parseInt(fromYear, 10);
    toYear = parseInt(toYear, 10);
    year = parseInt(year, 10);

    if (!fromYear || !toYear || !year || !Array.isArray(subjects)) {
      return res.status(400).json({ message: "Invalid data provided." });
    }

    let batch = await Batch.findOne({ fromYear, toYear });
    if (!batch) {
      batch = new Batch({
        fromYear,
        toYear,
        timetables: [{ years: [] }],
      });
    }

    const timetable = batch.timetables[0];
    let yearEntry = timetable.years.find((y) => y.yearNumber === year);

    if (!yearEntry) {
      yearEntry = { yearNumber: year, subjects: [], departments: [] };
      timetable.years.push(yearEntry);
    }

    yearEntry.subjects.push(...subjects);

    await batch.save();
    res.status(201).json({ message: "✅ Subject(s) added successfully", batch });
  } catch (error) {
    console.error("❌ Error in /timetablesdetails:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// POST route only for department entries
app.post("/timetablesdetails/departments", async (req, res) => {
  try {
    let { fromYear, toYear, year, departments } = req.body;

    fromYear = parseInt(fromYear, 10);
    toYear = parseInt(toYear, 10);
    year = parseInt(year, 10);

    if (!fromYear || !toYear || !year || !Array.isArray(departments)) {
      return res.status(400).json({ message: "Invalid data provided." });
    }

    let batch = await Batch.findOne({ fromYear, toYear });
    if (!batch) {
      batch = new Batch({
        fromYear,
        toYear,
        timetables: [{ years: [] }],
      });
    }

    const timetable = batch.timetables[0];
    let yearEntry = timetable.years.find((y) => y.yearNumber === year);

    if (!yearEntry) {
      yearEntry = { yearNumber: year, subjects: [], departments: [] };
      timetable.years.push(yearEntry);
    }

    yearEntry.departments.push(...departments);

    await batch.save();
    res.status(201).json({ message: "✅ Department(s) added successfully", batch });
  } catch (error) {
    console.error("❌ Error in /timetablesdetails/departments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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

app.post('/generateTimetable', async (req, res) => {
  try {
    const { fromYear, year } = req.body;

    if (!fromYear || !year) {
      return res.status(400).json({ error: "fromYear and year are required." });
    }

    const batch = await Batch.findOne({ fromYear });
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    const yearData = batch.timetables[0].years.find(y => y.yearNumber === year);
    if (!yearData || !yearData.subjects.length) {
      return res.status(404).json({ message: "No subjects found for this year" });
    }

    // Base timetable structure (5 days, 6 periods each)
    const defaultTimetable = [
      { day: "Monday", slots: ["", "", "", "", "", ""] },
      { day: "Tuesday", slots: ["", "", "", "", "", ""] },
      { day: "Wednesday", slots: ["", "", "", "", "", ""] },
      { day: "Thursday", slots: ["", "", "", "", "", ""] },
      { day: "Friday", slots: ["", "", "", "", "", ""] },
    ];

    // Prepare subject usage counter with preference
    const subjectUsage = {};
    yearData.subjects.forEach((subject) => {
      const key = `${subject.staffId}-${subject.courseId}`;
      subjectUsage[key] = {
        ...subject,
        remaining: subject.preferences || 0,
      };
    });

    // Flatten subjects based on preference count
    const availableSubjects = [];
    for (const key in subjectUsage) {
      const { staffId, courseId, remaining } = subjectUsage[key];
      for (let i = 0; i < remaining; i++) {
        availableSubjects.push({ staffId, courseId });
      }
    }

    // Total available slots in the timetable (5 days * 6 periods)
    const totalSlots = defaultTimetable.reduce((acc, day) => acc + day.slots.length, 0);

    // If there are more subjects than available slots, it won't fit
    if (availableSubjects.length > totalSlots) {
      return res.status(400).json({ error: "Not enough slots to accommodate all subjects based on preference." });
    }

    // Shuffle the subject list to randomize allocation
    const shuffledSubjects = availableSubjects.sort(() => Math.random() - 0.5);

    // Fill the timetable respecting preferences
    let subjectIndex = 0;
    const generated = defaultTimetable.map((row) => {
      return {
        day: row.day,
        slots: row.slots.map(() => {
          if (subjectIndex < shuffledSubjects.length) {
            const subj = shuffledSubjects[subjectIndex++];
            return `${subj.staffId} (${subj.courseId})`;
          } else {
            return "Free";
          }
        }),
      };
    });

    res.status(200).json({ timetable: generated });

  } catch (error) {
    console.error("❌ Error generating timetable:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




app.get("/subjects/:fromYear/:year", async (req, res) => {
  const { fromYear, year } = req.params;
  try {
    const batch = await Batch.findOne({ fromYear: parseInt(fromYear) });
    if (!batch || !batch.timetables[0]) return res.status(404).json({ message: "Batch not found" });
    const yearData = batch.timetables[0].years.find(y => y.yearNumber === parseInt(year));
    if (!yearData) return res.status(404).json({ message: "Year data not found" });
    res.json({ subjects: yearData.subjects });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

 
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
