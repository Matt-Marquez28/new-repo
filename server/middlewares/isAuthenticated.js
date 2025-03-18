import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  try {
    // check token in cookies
    const token = req.cookies?.token;
    console.log(`TOKEN =>${token}`);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated!",
      });
    }

    let decode;
    try {
      decode = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token!",
      });
    }

    // attach account id to req
    req.accountId = decode.accountId;

    // if role is a jobseeker attach jobSeekerId to req
    if (decode.role === "jobseeker") {
      req.jobSeekerId = decode.jobSeekerId;
    }

    // if role is an employer attach the companyId to req
    if (decode.role === "employer") {
      req.companyId = decode.companyId;
    }

    // if role is admin or staff attach accountId to req
    if (decode.role === "admin" || decode.role === "staff") {
      req.accountId = decode.accountId;
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
