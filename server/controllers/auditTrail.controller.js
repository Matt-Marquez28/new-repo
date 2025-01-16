import AuditTrail from "../models/auditTrail.model.js";

export const getAllAuditTrail = async (req, res) => {
  try {
    // Fetch all audit trail entries, optionally populating the accountId field
    const auditTrails = await AuditTrail.find().populate(
      "accountId",
      "firstName lastName emailAddress"
    ); // Adjust the fields as needed

    // Respond with the fetched data
    res.status(200).json({
      success: true,
      auditTrails,
    });
  } catch (error) {
    console.error("Error fetching audit trails:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
