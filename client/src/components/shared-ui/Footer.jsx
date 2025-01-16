import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-3 my-4">
      <ul className="nav justify-content-center pb-3">
        <li className="nav-item">
          <Link to="https://facebook.com" className="nav-link px-2 text-body-secondary" target="_blank">
            <i className="bi bi-facebook" style={{ fontSize: "1.5rem" }}></i>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="https://instagram.com" className="nav-link px-2 text-body-secondary" target="_blank">
            <i className="bi bi-instagram" style={{ fontSize: "1.5rem" }}></i>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="https://twitter.com" className="nav-link px-2 text-body-secondary" target="_blank">
            <i className="bi bi-twitter" style={{ fontSize: "1.5rem" }}></i>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="https://youtube.com" className="nav-link px-2 text-body-secondary" target="_blank">
            <i className="bi bi-youtube" style={{ fontSize: "1.5rem" }}></i>
          </Link>
        </li>
      </ul>
      <p className="text-center text-body-secondary"> 2025 © | City Government of Taguig</p>
    </footer>
  );
};

export default Footer;
