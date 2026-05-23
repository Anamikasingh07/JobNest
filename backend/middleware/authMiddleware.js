const jwt =
  require("jsonwebtoken");

/* PROTECT ROUTE */
const protect = (

  req,
  res,
  next

) => {

  try {

    let token;

    /* CHECK TOKEN */
    if (

      req.headers.authorization &&

      req.headers.authorization.startsWith(
        "Bearer"
      )

    ) {

      token =
        req.headers.authorization
          .split(" ")[1];

      /* VERIFY TOKEN */
      const decoded =
        jwt.verify(

          token,

          process.env.JWT_SECRET

        );

      req.user = decoded;

      next();

    }

    else {

      return res.status(401)
        .json({

          message:
            "Not authorized"

        });

    }

  }

  catch (error) {

    return res.status(401)
      .json({

        message:
          "Token failed"

      });

  }

};

/* ADMIN ONLY */
const adminOnly = (

  req,
  res,
  next

) => {

  if (

    req.user &&
    req.user.role === "admin"

  ) {

    next();

  }

  else {

    return res.status(403)
      .json({

        message:
          "Admin access only"

      });

  }

};

module.exports = {

  protect,
  adminOnly

};