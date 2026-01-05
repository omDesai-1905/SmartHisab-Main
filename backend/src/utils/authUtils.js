import jwt from "jsonwebtoken";

export const verifyAuth = async (request) => {
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
      user: decoded,
    };
  } catch (error) {
    return {
      authenticated: false,
      message: "Invalid or expired token",
    };
  }
};
