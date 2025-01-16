import React from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Make sure Bootstrap CSS is included

const SocialLinks = () => {
  return (
    <div className="container">
      {/* Section Title: Company Information */}
      <div className="row align-items-center my-3">
        <div className="col">
          <hr className="border-2 border-primary" />
        </div>
        <div className="col-auto">
          <h5 className="position-relative text-primary">Social Links</h5>
        </div>
        <div className="col">
          <hr className="border-2 border-primary" />
        </div>
      </div>
      <form>
        <div className="mb-3">
          <label htmlFor="facebookUrl">
            <i class="bi bi-facebook fs-2"></i>
          </label>
          <input
            type="url"
            className="form-control"
            id="facebookUrl"
            placeholder="Enter Facebook URL"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="twitterUrl">
            <i className="bi bi-twitter-x fs-2"></i>
          </label>
          <input
            type="url"
            className="form-control"
            id="twitterUrl"
            placeholder="Enter Twitter URL"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="linkedinUrl">
            <i className="bi bi-linkedin fs-2"></i>
          </label>
          <input
            type="url"
            className="form-control"
            id="linkedinUrl"
            placeholder="Enter LinkedIn URL"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="instagramUrl">
            <i className="bi bi-instagram fs-2"></i>
          </label>
          <input
            type="url"
            className="form-control"
            id="instagramUrl"
            placeholder="Enter Instagram URL"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="companyWebsiteUrl">
          <i className="bi bi-browser-chrome fs-2"></i>
          </label>
          <input
            type="url"
            className="form-control"
            id="companyWebsiteUrl"
            placeholder="Enter company webiste URL"
          />
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button type="submit" className="btn btn-primary">
          <i className="bi bi-floppy"></i> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default SocialLinks;
