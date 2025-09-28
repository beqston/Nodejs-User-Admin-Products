// Middleware to check token expiry and delete cookie if expired
export default function checkTokenExpiry(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return next(); // no token, just continue
  }

  try {
    // This will throw if token is expired or invalid
    jwt.verify(token, process.env.TOKEN_SECRET);
    // Token is valid, continue
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // Token expired - clear the cookie
      res.clearCookie('token');
    }
    next();
  }
}