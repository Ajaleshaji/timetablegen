import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const SavedTimetable = () => {
  const { id } = useParams();
  const [timetable, setTimetable] = useState(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/timetables/${id}`);
        
        setTimetable(res.data);
      } catch (err) {
        console.error("Error loading timetable:", err);
      }
    };

    fetchTimetable();
  }, [id]);

  if (!timetable) return <p>Loading...</p>;

  const firstDept =
    timetable.departments && timetable.departments.length > 0
      ? timetable.departments[0]
      : { deptName: "N/A", deptSection: "N/A" };

  return (
    <div className="saved-timetable">
     <h2>
  {timetable.departments && timetable.departments.length > 0
    ? timetable.departments
        .map((dept) => `${dept.deptName} - ${dept.deptSection}`)
        .join(", ")
    : "No Departments Found"}
</h2>

      <h4>
        Batch: {timetable.batchId}, Year: {timetable.year}
      </h4>
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
          {timetable.timetable &&
            timetable.timetable.map((row, idx) => (
              <tr key={idx}>
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
  );
};

export default SavedTimetable;
