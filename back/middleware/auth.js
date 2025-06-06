const passport = require("passport");

const protect = passport.authenticate("jwt", { session: false });

const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userRole = req.user.role;
    if (Array.isArray(roles)) {
      if (!roles.includes(userRole)) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else {
      if (userRole !== roles) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    next();
  };
};

module.exports = { protect, roleMiddleware };
