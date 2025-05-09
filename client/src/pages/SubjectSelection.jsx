import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/SubjectSelection.css";

const SubjectSelection = () => {
  const { id, year } = useParams();
  const navigate = useNavigate(); // <-- Add navigate hook

  const [staffId, setStaffId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [department, setDepartment] = useState("");
  const [section, setSection] = useState("");
  const [preferences, setPreferences] = useState("");

  const [deptName, setDeptName] = useState("");
  const [deptSection, setDeptSection] = useState("");

  const [entries, setEntries] = useState([]);
  const [departmentEntries, setDepartmentEntries] = useState([]);
  const [timetable, setTimetable] = useState(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await axios.get("http://localhost:5000/timetablesdetails");
        const data = response.data;

        let foundYear = null;

        data.forEach((batch) => {
          batch.timetables.forEach((tt) => {
            tt.years.forEach((yearData) => {
              if (yearData.yearNumber === parseInt(year)) {
                foundYear = yearData;
              }
            });
          });
        });

        if (foundYear) {
          setEntries(foundYear.subjects || []);
          setDepartmentEntries(foundYear.departments || []);
        }
      } catch (error) {
        console.error("Error fetching timetable:", error);
      }
    };

    fetchTimetable();
  }, [year]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fromYear = parseInt(id, 10);
    const selectedYear = parseInt(year, 10);

    const newEntry = { staffId, courseId, department, section, preferences };

    try {
      const response = await axios.post("http://localhost:5000/timetablesdetails", {
        fromYear,
        toYear: fromYear + 3,
        year: selectedYear,
        subjects: [newEntry],
      });

      if (response.status === 201) {
        setEntries((prev) => [...prev, newEntry]);
        setStaffId("");
        setCourseId("");
        setDepartment("");
        setSection("");
        setPreferences("");
      }
    } catch (error) {
      console.error("Error saving subject:", error.response?.data || error.message);
      alert("Error saving subject. Please try again.");
    }
  };

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();

    const fromYear = parseInt(id, 10);
    const selectedYear = parseInt(year, 10);

    const newDeptEntry = { deptName, deptSection };

    try {
      const response = await axios.post("http://localhost:5000/timetablesdetails/departments", {
        fromYear,
        toYear: fromYear + 3,
        year: selectedYear,
        departments: [newDeptEntry],
      });

      if (response.status === 201) {
        setDepartmentEntries((prev) => [...prev, newDeptEntry]);
        setDeptName("");
        setDeptSection("");
      }
    } catch (error) {
      console.error("Error saving department:", error.response?.data || error.message);
      alert("Error saving department. Please try again.");
    }
  };

  const generateTimetable = async () => {
    try {

      const response = await axios.post("http://localhost:5000/generateTimetable", {
        fromYear: parseInt(id, 10),
        year: parseInt(year, 10),
      });

      if (response.status === 200) {
        setTimetable(response.data.timetable);

        // Navigate to the timetable page after successful generation
         navigate(`/createtimetable/timetable/${id}/${year}/timetablepage`);
      } else {
        alert("Error generating timetable: " + response.data.error);
      }
    } catch (error) {
      console.error("Error generating timetable:", error);
      alert("Failed to generate timetable.");
    }
  };

  return (
    <div className="details-container">
      <div className="page-container">
        <div className="subject-selection-container">
          <h2>Assign Subjects - Timetable {id}, Year {year}</h2>
          <form onSubmit={handleSubmit} className="subject-form">
            <label>Staff ID:</label>
            <input type="text" value={staffId} onChange={(e) => setStaffId(e.target.value)} required />

            <label>Course ID:</label>
            <input type="text" value={courseId} onChange={(e) => setCourseId(e.target.value)} required />

            <label>Department:</label>
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} required />

            <label>Section:</label>
            <select value={section} onChange={(e) => setSection(e.target.value)}>
              <option value="">Select Section (Optional)</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>

            <label>Subject Preferences (Max Weekly Slots):</label>
            <input type="number" value={preferences} onChange={(e) => setPreferences(e.target.value)} required />

            <button type="submit" className="submit-btn">Submit</button>
          </form>
        </div>

        <div className="user-input-display">
          <h3>Entered Details</h3>
          {entries.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Course ID</th>
                  <th>Department</th>
                  <th>Section</th>
                  <th>Preferences</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.staffId}</td>
                    <td>{entry.courseId}</td>
                    <td>{entry.department}</td>
                    <td>{entry.section || "-"}</td>
                    <td>{entry.preferences}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No entries yet.</p>
          )}
        </div>
      </div>

      <div className="department-selection-container">
      <div className="department-chooses">
        <h2>Select Department for Timetable</h2>
        <form onSubmit={handleDepartmentSubmit}>
          <label>Department:</label>
          <input type="text" value={deptName} onChange={(e) => setDeptName(e.target.value)} required />

          <label>Section:</label>
          <select value={deptSection} onChange={(e) => setDeptSection(e.target.value)}>
            <option value="">Select Section (Optional)</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>

          <button type="submit" className="submit-btn">Submit</button>
        </form>
        </div>
        <div className="department-display">
          <h3>Selected Departments</h3>
          {departmentEntries.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Section</th>
                </tr>
              </thead>
              <tbody>
                {departmentEntries.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.deptName}</td>
                    <td>{entry.deptSection || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No department selected yet.</p>
          )}
        </div>
      </div>

      <div className="bottom-action">
        <button className="action-btn" onClick={generateTimetable}>Create Timetable</button>
      </div>
    </div>
  );
};

export default SubjectSelection;
