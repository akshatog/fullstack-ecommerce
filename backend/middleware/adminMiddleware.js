// adminMiddleware.js
// Runs AFTER authMiddleware. Checks that the decoded JWT contains isAdmin: true.
// Apply this to any route that only admins should be able to access.

const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    next();
};

export default adminMiddleware;
