import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/TimetableDetails.css";

const TimetableDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState(null);
  const [yearLabels, setYearLabels] = useState([]);


  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        if (!id || isNaN(parseInt(id, 10))) {
          console.error("Invalid ID from URL:", id);
          return;
        }
  
        const fromYear = parseInt(id, 10);

        const response = await fetch("https://timetablegen-7h8v.onrender.com/timetablesdetails");
        const data = await response.json();
  
        const batch = data.find((batch) => batch.fromYear === fromYear);
        if (batch) {
          setTimetable(batch);
          generateYearLabels(batch.fromYear, batch.toYear);
        } else {
          console.error("Timetable not found for fromYear:", fromYear);
        }
      } catch (error) {
        console.error("Error fetching timetable:", error);
      }
    };
  
    fetchTimetable();
  }, [id]);
  

  const generateYearLabels = (fromYear, toYear) => {
    const labels = [];
    for (let year = fromYear; year <= toYear; year++) {
      labels.push(year);
    }
    setYearLabels(labels);
  };

  const handleYearClick = (year) => {
    navigate(`/createtimetable/timetable/${id}/${year}`);
  };

  if (!timetable) {
    return <div>Loading timetable details...</div>;
  }

  return (
    <div className="timetable-details-container">
      <h2>Timetable {parseInt(id) + 0} Details</h2>
      <div className="year-container">
        {yearLabels.map((year, index) => (
          <div
            key={index}
            className="year-box"
            onClick={() => handleYearClick(year)}
            style={{ cursor: "pointer" }}
          >
            <h3>{year}</h3> 
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableDetails;
