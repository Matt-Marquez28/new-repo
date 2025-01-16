import Company from "../models/company.model.js";

export const isAccredited = async (req, res, next) => {
  const companyId = req.companyId;
  try {
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found!",
      });
    }

    if (company.status !== "accredited") {
      return res.status(403).json({
        success: false,
        message: "Company is not accredited!",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
