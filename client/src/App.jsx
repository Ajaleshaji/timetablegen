import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import CreateTimeTable from './pages/CreateTimeTable';
import Layout from './components/Layout';
import TimetableDetails from './pages/TimetableDetails';
import SubjectSelection from './pages/SubjectSelection';
import TimetablePage from './pages/TimetablePage';
import TimetableFolder from './pages/TimeTableFolder';
import SavedTimetable from './pages/SavedTimetable';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Main App Layout */}
        <Route path="/" element={<Layout />}>
          <Route path="home" element={<Home />} />
          <Route path="createtimetable" element={<CreateTimeTable />} />
          <Route path="createtimetable/timetable/:id" element={<TimetableDetails />} />
          <Route path="createtimetable/timetable/:id/:year" element={<SubjectSelection />} />
          <Route path="createtimetable/timetable/:id/:year/timetablepage" element={<TimetablePage />} />
          <Route path="createtimetable/timetable/:id/:year/timetablefolder" element={<TimetableFolder />} />
          <Route path="/timetables/:id" element={<SavedTimetable/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
