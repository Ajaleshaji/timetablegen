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
    // Define the default timetable structure
    const defaultTimetable = [
      { day: "Monday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
      { day: "Tuesday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
      { day: "Wednesday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
      { day: "Thursday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
      { day: "Friday", "9:00 - 10:00": "", "10:00 - 11:00": "", "11:15 - 12:15": "", "12:15 - 1:15": "", "2:00 - 3:00": "", "3:00 - 4:00": "" },
    ];

    // Shuffle the timetable days
    const shuffledDays = [...defaultTimetable].sort(() => Math.random() - 0.5);

    // Shuffle subjects randomly
    const shuffledSubjects = [...subjects].sort(() => Math.random() - 0.5);

    // Fill the timetable with subjects based on preferences
    const timetableWithSubjects = shuffledDays.map((row) => {
      let filledRow = { ...row };
      const slots = Object.keys(row).filter((key) => key !== "day");

      let subjectIndex = 0;
      let previousSubject = null;
      let consecutiveCount = 0;

      slots.forEach((slot) => {
        let subject = shuffledSubjects[subjectIndex];

        // Skip same subject consecutively more than twice
        while (subject === previousSubject && consecutiveCount >= 2) {
          subjectIndex = (subjectIndex + 1) % shuffledSubjects.length;
          subject = shuffledSubjects[subjectIndex];
          consecutiveCount = 0;
        }

        // If subject has preferences remaining, assign it
        if (subject && subject.preferences > 0) {
          filledRow[slot] = `${subject.staffId} (${subject.courseId})`;
          subject.preferences -= 1;
          previousSubject = subject;
          consecutiveCount += 1;
        } else {
          filledRow[slot] = "Free";
        }

        // Move to next subject if preferences exhausted
        if (subject.preferences === 0) {
          subjectIndex = (subjectIndex + 1) % shuffledSubjects.length;
          consecutiveCount = 0;
        }
      });

      return filledRow;
    });

    // Refill any "Free" slots with remaining preferences
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

    // Update the state with the shuffled day timetable
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
