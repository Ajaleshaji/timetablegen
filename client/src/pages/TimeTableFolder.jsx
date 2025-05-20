import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TimetableFolder = () => {
    const navigate = useNavigate();
    const [timetables, setTimetables] = useState([]);

    useEffect(() => {
        const fetchTimetables = async () => {
            try {
                const response = await fetch("https://timetablegen-7h8v.onrender.com");
                if (response.ok) {
                    const data = await response.json();
                    setTimetables(data);
                } else {
                    console.error("Failed to fetch timetables");
                }
            } catch (error) {
                console.error("Error fetching timetables:", error);
            }
        };
        fetchTimetables();
    }, []);

    return (
        <div className="timetable-folder">
            <h2>Timetable Folder</h2>
            {timetables.length > 0 ? (
                <ul>
                    {timetables.map((timetable, index) => (
                        <li key={`${timetable._id}`}>
                            <button
                                onClick={() => navigate(`/createtimetable/timetable/${timetable.id}/${timetable.year}/timetablepage`, { state: { timetable } })}
                            >
                                View Timetable {timetable.id}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No timetables created yet.</p>
            )}
        </div>
    );
};

export default TimetableFolder;
