import jwt from "jsonwebtoken";


export const authorization = (roles = []) => {
  return (req, res, next) => {
    try {
      const { authorization } = req.headers;

      if (!authorization) {
        return res.status(401).json({ message: "Authorization header is required" });
      }

      const decoded = jwt.verify(authorization, "shahd");

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Not authorized, insufficient permissions" });
      }

      req.user = decoded; 
      next();

    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
