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
      departmentEntries.some(
        (dept) =>
          subject.department === dept.deptName &&
          subject.section === dept.deptSection
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

    const timeSlots = ["9:00 - 10:00", "10:00 - 11:00", "11:15 - 12:15", "12:15 - 1:15", "2:00 - 3:00", "3:00 - 4:00"];

    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    const subjectsState = filteredSubjects.map((subj) => ({
      ...subj,
      remaining: subj.preferences,
    }));

    shuffleArray(subjectsState);

    const finalTimetable = defaultTimetable.map((dayRow) => {
      const newRow = { day: dayRow.day };
      const prevAssignedSubject = [];

      timeSlots.forEach((slot, idx) => {
        let assigned = false;

        for (let subj of subjectsState) {
          const subjectKey = `${subj.staffId} (${subj.courseId})`;

          if (subj.remaining > 0 && prevAssignedSubject[idx - 1] !== subjectKey) {
            newRow[slot] = subjectKey;
            subj.remaining--;
            prevAssignedSubject[idx] = subjectKey;
            assigned = true;
            break;
          }
        }

        if (!assigned) {
          newRow[slot] = "Free";
          prevAssignedSubject[idx] = null;
        }
      });

      return newRow;
    });

    setTimetable(finalTimetable);
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
