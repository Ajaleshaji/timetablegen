import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/TimetablePage.css";

const TimetablePage = () => {
  const { id, year } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`http://localhost:5000/subjects/${id}/${year}`);
        const data = await response.json();
        setSubjects(data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
  
    fetchSubjects();
  }, [id, year]);
  

  useEffect(() => {
    if (subjects.length > 0) {
      const defaultTimetable = [
        { day: "Monday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
        { day: "Tuesday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
        { day: "Wednesday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
        { day: "Thursday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
        { day: "Friday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
      ];

      const timetableWithSubjects = defaultTimetable.map((row, dayIndex) => {
        let filledRow = { ...row };
        const slots = Object.keys(row).filter((key) => key !== "day");

        slots.forEach((slot, slotIndex) => {
          const subject = subjects[(dayIndex * slots.length + slotIndex) % subjects.length];
          filledRow[slot] = subject ? subject.courseId : "Free";
        });

        return filledRow;
      });

      setTimetable(timetableWithSubjects);
    }
  }, [subjects]);

  return (
    <div className="timetable-container">
      <h2>Timetable - Batch {id}, Year {year}</h2>
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
        </div>
      ) : (
        <p>Loading timetable...</p>
      )}
    </div>
  );
};

export default TimetablePage;
