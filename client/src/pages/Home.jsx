import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import axios from "axios";

const Home = () => {
  const [recentTimetables, setRecentTimetables] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await axios.get("http://localhost:5000/recenttimetables");
        setRecentTimetables(res.data);
      } catch (err) {
        console.error("Error loading recent timetables:", err);
      }
    };

    fetchRecent();
  }, []);

  const goToTimetable = (id) => {
    navigate(`/timetables/${id}`);  // We'll create this route next
  };

  return (
    <div className="home-container">
      <h2>🏠 Home Page</h2>
      <h3>📅 Recently Saved Timetables</h3>
      <div className="timetable-list">
  {recentTimetables.map((item) => (
    <div
      key={item._id}
      className="timetable-box"
      onClick={() => goToTimetable(item._id)}
    >
     <h4>
  {item.departments && item.departments.length > 0
    ? item.departments.map((dept) => `${dept.deptName} - ${dept.deptSection}`).join(", ")
    : "No Departments Found"}
</h4>

      <p>Batch: {item.batchId}</p>
      <p>Year: {item.year}</p>
    </div>
  ))}
</div>

    </div>
  );
};

export default Home;
