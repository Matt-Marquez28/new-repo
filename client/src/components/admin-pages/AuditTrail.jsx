import React, { useState, useEffect } from "react";
import axios from "axios";
import { AUDIT_TRAIL_API_END_POINT } from "../../utils/constants";

const AuditTrail = () => {
  const [auditTrails, setAuditTrails] = useState([]);

  useEffect(() => {
    getAllAuditTrail();
  }, []);

  const getAllAuditTrail = async () => {
    try {
      const res = await axios.get(
        `${AUDIT_TRAIL_API_END_POINT}/get-all-audit-trail`
      );
      setAuditTrails(res?.data?.auditTrails || []);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <h5 className="text-primary pt-serif-bold">Audit Trail</h5>
      <table className="table table-hover mt-4">
        <thead>
          <tr>
            <th scope="col" className="small text-muted align-middle">
            <i className="bi bi-clock-fill"></i> Date & Time
            </th>
            <th scope="col" className="small text-muted align-middle">
            <i className="bi bi-people-fill"></i> Name
            </th>
            <th scope="col" className="small text-muted align-middle">
            <i className="bi bi-envelope-fill"></i> Email
            </th>
            <th scope="col" className="small text-muted align-middle">
            <i className="bi bi-hand-index-thumb-fill"></i> Action
            </th>
            <th scope="col" className="small text-muted align-middle">
            <i className="bi bi-info-circle-fill"></i> Detail
            </th>
          </tr>
        </thead>
        <tbody>
          {auditTrails.length > 0 ? (
            auditTrails.map((audit, index) => (
              <tr key={audit._id}>
                <td scope="row" className="small text-muted align-middle">
                  {new Date(audit?.createdAt).toLocaleString()}
                </td>
                <td scope="row" className="small text-muted align-middle">
                  {audit.accountId
                    ? `${audit?.accountId?.firstName} ${audit.accountId.lastName}`
                    : "N/A"}
                </td>
                <td scope="row" className="small text-muted align-middle">
                  {audit?.accountId?.emailAddress || "N/A"}
                </td>
                <td scope="row" className="small text-muted align-middle">
                  {audit?.action}
                </td>
                <td scope="row" className="small text-muted align-middle">
                  {audit?.detail}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No audit trails found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTrail;
