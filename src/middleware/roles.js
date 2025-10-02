// server/src/middleware/roles.js
export function requireRole(...allowed) {
  return (req, res, next) => {
    const role =
      req.user?.role ??
      req.auth?.role ??
      req.role ??
      req.userRole ??
      null;

    if (!role) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!allowed.includes(role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}
