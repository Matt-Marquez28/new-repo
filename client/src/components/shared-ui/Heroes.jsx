import React from "react";
import { useNavigate } from "react-router-dom";


const Heroes = () => {
  const navigate = useNavigate();
  return (
    <div className="px-4 pt-5 my-5 text-center border-bottom">
      <h1 className="display-4 fw-bold text-body-emphasis">
        PESO City of Taguig
      </h1>
      <div className="col-lg-6 mx-auto">
        <p className="lead mb-4">
          The PESO City of Taguig Job Matching Portal connects job seekers with
          potential employers in the city, streamlining the process of finding
          suitable job opportunities. This platform provides a seamless
          experience for both job seekers and employers, offering an easy-to-use
          interface for posting job openings and browsing available positions.
        </p>
        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
          <button
            type="button"
            className="btn btn-outline-secondary btn-lg px-4"
          >
            <i className="bi bi-book"></i> Learn More
          </button>
          <button
            type="button"
            className="btn btn-primary btn-lg px-4 me-sm-3"
            onClick={() => navigate("/login")}
          >
            <i className="bi bi-align-start"></i> Get Started
          </button>
        </div>
      </div>
      <div className="overflow-hidden" style={{ maxHeight: "40vh" }}>
        <div className="container px-5">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Bonifacio_Global_City_-_skyline_%28view_from_Pioneer%29_%28Taguig_and_Makati%29%282018-04-24%29_cropped.jpg"
            className="img-fluid border rounded-3 shadow-lg mb-4"
            alt="Example image"
            width="700"
            height="500"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default Heroes;
