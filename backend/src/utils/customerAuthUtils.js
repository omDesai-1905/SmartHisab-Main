import jwt from "jsonwebtoken";

export const verifyCustomerAuth = async (request) => {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return {
        authenticated: false,
        message: "Access token required",
      };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return {
      authenticated: true,
      customer: decoded,
    };
  } catch (error) {
    return {
      authenticated: false,
      message: "Invalid or expired token",
    };
  }
};
