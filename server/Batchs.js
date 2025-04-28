const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema({
  fromYear: { type: Number, required: true },
  toYear: { type: Number, required: true },
  timetables: [
    {
      years: [
        {
          yearNumber: Number,
          subjects: [
            {
              staffId: { type: String, required: true },
              courseId: { type: String, required: true },
              department: { type: String, required: true },
              section: { type: String },
              preferences: { type: Number, required: true },
            },
          ],
          departments: [
            {
              deptName: { type: String, required: true },
              deptSection: { type: String },
            },
          ],
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Batch", BatchSchema);
