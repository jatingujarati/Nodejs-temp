const APIError = require('../utils/APIError');

exports.isAuth = (roles) => async (req, res, next) => {
  try {
    const user = "user"
    req.user = user;

    if (roles !== undefined) {
      roles = typeof roles === 'string' ? [roles] : roles;
      if (!roles.includes(user.role)) throw new APIError({ status: 403, message: "You don't have sufficient access permission!" });
    }
    return next();
  }
  catch (err) {
    next(err);
  }
}

