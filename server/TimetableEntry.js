// models/TimetableEntry.js
const mongoose = require("mongoose");

const TimetableEntrySchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  department: {
    deptName: {
      type: String,
      required: true,
    },
    deptSection: {
      type: String,
      required: true,
    },
  },
  timetable: [
    {
      day: {
        type: String,
        required: true,
      },
      "9:00 - 10:00": String,
      "10:00 - 11:00": String,
      "11:15 - 12:15": String,
      "12:15 - 1:15": String,
      "2:00 - 3:00": String,
      "3:00 - 4:00": String,
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model("TimetableEntry", TimetableEntrySchema);
