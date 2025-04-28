import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom'; 
import HomeIcon from '../assets/Home.png';
import Table from '../assets/Table.png';
import Logout from '../assets/logout.png';

const Navbar = () => {
  const location = useLocation();

  return (
    <header>
      <nav>
        <div className="home-container">
          <div className="title-container">
            <span className="titlee">TableFlow</span>
          </div>
          <div className="homelist">
            <div className="left">
              <div className="top-button">
                <li>
                  <Link to="/home">
                    <button className={location.pathname === "/home" ? "active" : ""}>
                      <img src={HomeIcon} alt="Home Icon" />
                      Home
                    </button>
                  </Link>
                </li>
                <li>
                  <Link to="/createtimetable">
                  <button className={location.pathname.startsWith("/createtimetable") ? "active" : ""}>
                      <img src={Table} alt="Table Icon" />
                      CreateTimeTable
                    </button>
                  </Link>
                </li>
              </div>
              <div className="logout">
                <li>
                  <Link to="/">
                    <button>
                      <img src={Logout} alt="Logout Icon" />
                      Logout
                    </button>
                  </Link>
                </li>
              </div>
            </div>

            <div className="right">
              <Outlet /> 
            </div>

          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
