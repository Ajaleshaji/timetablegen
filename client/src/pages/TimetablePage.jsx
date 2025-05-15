import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/TimetablePage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TimetablePage = () => {
  const { id, year } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [departmentEntries, setDepartmentEntries] = useState([])

  const [isSaving, setIsSaving] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`http://localhost:5000/subjects/${id}/${year}`);
        const data = await response.json();
        console.log(data)
        setSubjects(data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
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
          console.log(foundYear.departments)
          setDepartmentEntries(foundYear.departments || []);
        }
      } catch (error) {
        console.error("Error fetching timetable:", error);
      }
    };
    fetchTimetable()
    fetchSubjects();
  }, [id, year]);
  

useEffect(() => {
  if (subjects.length > 0 && departmentEntries.length > 0) {
    const filteredSubjects = subjects.filter((subject) =>
      departmentEntries.some((dept) =>
        subject.department === dept.deptName && subject.section === dept.deptSection
      )
    );

    if (filteredSubjects.length === 0) {
      console.warn("No matching subjects found for the current department and section.");
      return;
    }

    const defaultTimetable = [
      { day: "Monday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
      { day: "Tuesday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
      { day: "Wednesday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
      { day: "Thursday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
      { day: "Friday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
    ];

    const shuffledDays = [...defaultTimetable].sort(() => Math.random() - 0.5);
    const shuffledSubjects = [...filteredSubjects].sort(() => Math.random() - 0.5);

    const timetableWithSubjects = defaultTimetable.map((row) => {

      let filledRow = { ...row };
      const slots = Object.keys(row).filter((key) => key !== "day");

      let subjectIndex = 0;
      let previousSubject = null;
      let consecutiveCount = 0;

      slots.forEach((slot) => {
        let subject = shuffledSubjects[subjectIndex];

        while (subject === previousSubject && consecutiveCount >= 2) {
          subjectIndex = (subjectIndex + 1) % shuffledSubjects.length;
          subject = shuffledSubjects[subjectIndex];
          consecutiveCount = 0;
        }

        if (subject && subject.preferences > 0) {
          filledRow[slot] = `${subject.staffId} (${subject.courseId})`;
          subject.preferences -= 1;
          previousSubject = subject;
          consecutiveCount += 1;
        } else {
          filledRow[slot] = "Free";
        }

        if (subject.preferences === 0) {
          subjectIndex = (subjectIndex + 1) % shuffledSubjects.length;
          consecutiveCount = 0;
        }
      });

      return filledRow;
    });

    let remainingSubjects = shuffledSubjects.filter(s => s.preferences > 0);
    let refillIndex = 0;

    timetableWithSubjects.forEach((dayRow) => {
      Object.keys(dayRow).forEach((slot) => {
        if (slot !== "day" && dayRow[slot] === "Free" && remainingSubjects.length > 0) {
          const subject = remainingSubjects[refillIndex];
          dayRow[slot] = `${subject.staffId} (${subject.courseId})`;
          subject.preferences -= 1;
          if (subject.preferences === 0) {
            remainingSubjects = remainingSubjects.filter(s => s.preferences > 0);
          }
          refillIndex = (refillIndex + 1) % remainingSubjects.length;
        }
      });
    });

    setTimetable(timetableWithSubjects);
  }
}, [subjects, departmentEntries]);



const handleSaveTimetable = async () => {
  if (isSaving) return;

  setIsSaving(true);
  try {
    const response = await axios.post("http://localhost:5000/timetablesave", {
      batchId: id,
      year: parseInt(year),
      departmentEntries: departmentEntries.map(dept => ({
        deptName: dept.deptName,
        deptSection: dept.deptSection
      })),
      timetable
    });

    console.log("Timetable saved successfully:", response.data);

    // ✅ Redirect to Home after saving
    navigate("/home");

  } catch (error) {
    console.error("Failed to save timetable:", error);
  } finally {
    setIsSaving(false);
  }
};


  return (
    <div className="timetable-container">
      <h1>Timetable - Batch {id}, Year {year}</h1>
      {timetable ? (
        <div className="timetable-display">
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
              {timetable.map((row, index) => (
                <tr key={index}>
                  <td>{row.day}</td>
                  <td>{row["9:00 - 10:00"]}</td>
                  <td>{row["10:00 - 11:00"]}</td>
                  <td>{row["11:15 - 12:15"]}</td>
                  <td>{row["12:15 - 1:15"]}</td>
                  <td>{row["2:00 - 3:00"]}</td>
                  <td>{row["3:00 - 4:00"]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {timetable && (
  <>
    <button className="save-button" onClick={handleSaveTimetable}>
      Save Timetable
    </button>
  </>
)}

        </div>
      ) : (
        <p>Loading timetable...</p>
      )}
    </div>
  );
};

export default TimetablePage;
