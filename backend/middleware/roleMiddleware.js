export const checkAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

export const checkBuilder = (req, res, next) => {
  if (!["BUILDER","ADMIN"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Access denied. Builders only." });
  }
  next();
};

export const checkRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) return res.status(403).json({ message: "Access denied." });
  next();
};
