import React, { useState, useEffect } from "react";
import "../styles/TimetablePage.css";

const TimetablePage = () => {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState(null);


  useEffect(() => {
    fetch("http://localhost:5000/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error("Error fetching departments:", err));

    fetch("http://localhost:5000/subjects")
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.error("Error fetching subjects:", err));
  }, []);

  const generateTimetable = async () => {
    try {
      const response = await fetch("http://localhost:5000/generateTimetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yearRange: "2024-2025" }),
      });

      const data = await response.json();
      if (response.ok) {
        setTimetable(data.timetable);
        alert("Timetable generated successfully!");
      } else {
        alert("Error generating timetable: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate timetable.");
    }
  };

  return (
    <div className="timetable-container">
      <h2>Timetable Management</h2>

      <div className="table-section">
        <h3>Departments</h3>
        {departments.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Section</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
                <tr key={index}>
                  <td>{dept.deptName}</td>
                  <td>{dept.deptSection || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No departments available.</p>
        )}
      </div>


      <div className="table-section">
        <h3>Subjects</h3>
        {subjects.length > 0 ? (
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
              {subjects.map((subj, index) => (
                <tr key={index}>
                  <td>{subj.staffId}</td>
                  <td>{subj.courseId}</td>
                  <td>{subj.department}</td>
                  <td>{subj.section || "-"}</td>
                  <td>{subj.preferences}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No subjects available.</p>
        )}
      </div>


      <button className="generate-btn" onClick={generateTimetable}>
        Generate Timetable
      </button>

      {timetable && (
        <div className="timetable-display">
          <h3>Generated Timetable</h3>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>9:00 - 10:00</th>
                <th>10:00 - 11:00</th>
                <th>11:15 - 12:15</th>
                <th>12:15 - 1:15</th>
                <th>2:00 - 3:00</th>
                <th>3:00 - 4:00</th>
              </tr>
            </thead>
            <tbody>
              {timetable.schedule.map((row, index) => (
                <tr key={index}>
                  <td>{row.day}</td>
                  <td>{row["9:00 - 10:00"] || "Free"}</td>
                  <td>{row["10:00 - 11:00"] || "Free"}</td>
                  <td>{row["11:15 - 12:15"] || "Free"}</td>
                  <td>{row["12:15 - 1:15"] || "Free"}</td>
                  <td>{row["2:00 - 3:00"] || "Free"}</td>
                  <td>{row["3:00 - 4:00"] || "Free"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimetablePage;
