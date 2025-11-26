import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "./Logo.jsx";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container-fluid">
        <Logo />
        <h3 className="ms-3 mb-0 fw-bold text-primary">HealthMate</h3>
        {/* <span className="navbar-brand fw-bold"> HealthMate</span> */}
        <div className="d-flex align-items-center">
          <button className="btn btn-outline-secondary me-2">
            Notifications
          </button>
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              Profil
            </button>
            <ul className="dropdown-menu">
              <li>
                <a className="dropdown-item" href="#">
                  Profil
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  Déconnexion
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
