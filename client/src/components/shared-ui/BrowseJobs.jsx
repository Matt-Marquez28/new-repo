import React from "react";
import Search from "../jobseeker-ui/Search";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

const BrowseJobs = () => {
  const navigate = useNavigate();
  return (

   
    <div className="container">
       <Header/>
      <div className="d-flex gap-2 align-items-center mb-3">
        <button
          type="button"
          className="btn btn-light text-dark"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <h5 className="my-2 text-primary">Browse Jobs</h5>
      </div>

      {/* Centered title section */}
      <div className="bg-white p-3 border rounded shadow-sm mb-4">
      <div className="text-center mb-4">
        <h2 className="text-primary fw-bold">
          <i className="bi bi-search"></i> Browse Jobs
        </h2>
        <p className="text-muted">Find your perfect opportunity</p>
      </div>

      <Search />
      </div>
      
    </div>
  );
};

export default BrowseJobs;
