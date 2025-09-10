import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token and extract payload
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = user; // { id: ... }

    next(); // Allow access to the protected route
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export default authMiddleware;