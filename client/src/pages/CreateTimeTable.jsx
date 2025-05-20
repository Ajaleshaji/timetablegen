import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Createnew.css";

const CreateTimeTable = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");
  const [timetables, setTimetables] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const response = await fetch("https://timetablegen-7h8v.onrender.com/timetables");
        const data = await response.json();
        setTimetables(data);
      } catch (error) {
        console.error("Error fetching timetables:", error);
      }
    };
    fetchTimetables();
  }, []);

  const handleCreate = async () => {
    const fromYearInt = parseInt(fromYear, 10);
    const toYearInt = parseInt(toYear, 10);

    if (isNaN(fromYearInt) || isNaN(toYearInt)) {
      alert("Please enter valid numeric years.");
      return;
    }

    if (toYearInt - fromYearInt !== 3) {
      alert("The difference between From Year and To Year must be exactly 4 years.");
      return;
    }

    try {
      console.log("Sending Data: ", { fromYear: fromYearInt, toYear: toYearInt });

      const response = await fetch("https://timetablegen-7h8v.onrender.com/timetables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromYear: fromYearInt, toYear: toYearInt }),
      });

      if (response.ok) {
        window.location.reload(); 
        const newTimetable = await response.json();
        setTimetables([...timetables, newTimetable.timetable]);
        setFromYear("");
        setToYear("");
        setShowPopup(false);

      } else {
        alert("Error creating timetable");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while creating the timetable.");
    }
  };

  const handleNavigate = (index) => {
    navigate(`/createtimetable/timetable/${index}`);
  };

  return (
    <div className="button-container">
      <button className="new" onClick={() => setShowPopup(true)}>
        Create New TimeTable
      </button>
      <hr className="separator-line" />

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <h2>Create a New Timetable</h2>
            <p>Enter the details for your new timetable:</p>

            <label htmlFor="from-year"><b>From Year:</b></label>
            <input
              type="text"
              id="from-year"
              placeholder="E.g. 2020"
              value={fromYear}
              onChange={(e) => setFromYear(e.target.value)}
            />

            <label htmlFor="to-year"><b>To Year:</b></label>
            <input
              type="text"
              id="to-year"
              placeholder="E.g. 2023"
              value={toYear}
              onChange={(e) => setToYear(e.target.value)}
            />

            <div className="popup-buttons">
              <button className="create-btn" onClick={handleCreate}>
                Create
              </button>
              <button className="close-btn" onClick={() => setShowPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="timetable-container">
        {timetables.map((timetable, index) => (
          
          <div
            key={index}
            className="timetable-box"
            onClick={() => handleNavigate(timetable.fromYear)}
            style={{ cursor: "pointer" }}
          >
            {console.log(timetable)}
            <h3>Timetable {index + 1}</h3>
            <p>From Year: {timetable.fromYear}</p>
            <p>To Year: {timetable.toYear}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateTimeTable;
