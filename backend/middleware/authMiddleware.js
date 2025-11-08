import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // Log full headers for debugging

  // Get token from different possible sources
  const tokenHeader = req.headers.authorization;
  const queryToken = req.query.token;

  // Try different token sources
  let token;
  if (tokenHeader?.startsWith('Bearer ')) {
    token = tokenHeader.split(' ')[1];
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    return res.status(401).json({ 
      message: "No token provided",
      tokenSources: {
        headerPresent: !!tokenHeader,
        queryPresent: !!queryToken
      }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ Token verified for user:", decoded.id);
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ 
      message: "Invalid token",
      error: error.message 
    });
  }
};
