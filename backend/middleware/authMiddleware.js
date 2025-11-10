import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers.authorization;
  const queryToken = req.query.token;

  let token;
  if (tokenHeader?.startsWith("Bearer ")) {
    token = tokenHeader.split(" ")[1];
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
      tokenSources: {
        headerPresent: !!tokenHeader,
        queryPresent: !!queryToken,
      },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // Set user object with id
    console.log("✅ Token verified for user:", decoded.id);
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired. Please login again.",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      message: "Invalid token.",
      code: "TOKEN_INVALID",
      error: error.message,
    });
  }
};
