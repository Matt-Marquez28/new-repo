import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-2 mb-4 border-bottom">
      <div className="col-md-3 mb-md-0">
        <Link className="d-inline-flex align-items-center link-body-emphasis text-decoration-none">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJOeEApKV3HZv0HZLbBXvhOB0icqfJk5qfdw&s"
            alt="Logo"
            width="60"
            height="60"
            className="me-2"
          />
          <h5 className=" pt-serif-bold" style={{ color: "#555555" }}>
            PESO City of Taguig
          </h5>
        </Link>
      </div>

      <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
        <li>
          <Link to="/" className="nav-link px-2 link-secondary">
            Home
          </Link>
        </li>
        <li>
          <Link to="#" className="nav-link px-2" style={{ color: "#1a4798" }}>
            Features
          </Link>
        </li>
        <li>
          <Link to="#" className="nav-link px-2" style={{ color: "#1a4798" }}>
            About
          </Link>
        </li>
      </ul>

      <div className="col-md-3 text-end">
        <Link to="/login">
          <button type="button" className="btn btn-outline-primary me-2">
            <i className="bi bi-box-arrow-in-right d-none d-md-inline-block"></i>{" "}
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button
            type="button"
            className="btn text-white"
            style={{ backgroundColor: "#1a4798" }}
          >
            <i className="bi bi-pen d-none d-md-inline-block"></i> Sign-up
          </button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
