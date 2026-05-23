const User =
  require("../models/User");

const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

/* REGISTER USER */
const registerUser =
  async (req, res) => {

    try {

      const {

        name,
        email,
        password,
        role

      } = req.body;

      /* CHECK EXISTING USER */
      const userExists =
        await User.findOne({
          email
        });

      if (userExists) {

        return res.status(400)
          .json({

            message:
              "User already exists"

          });

      }

      /* HASH PASSWORD */
      const salt =
        await bcrypt.genSalt(10);

      const hashedPassword =
        await bcrypt.hash(
          password,
          salt
        );

      /* CREATE USER */
      const user =
        await User.create({

          name,
          email,

          password:
            hashedPassword,

          role

        });

      res.status(201).json({

        message:
          "User registered successfully",

        user

      });

    }

    catch (error) {

      console.log(error);

      res.status(500).json({

        message:
          "Server Error"

      });

    }

};

/* LOGIN USER */
const loginUser =
  async (req, res) => {

    try {

      const {

        email,
        password

      } = req.body;

      /* CHECK USER */
      const user =
        await User.findOne({
          email
        });

      if (!user) {

        return res.status(400)
          .json({

            message:
              "Invalid credentials"

          });

      }

      /* CHECK PASSWORD */
      const isMatch =
        await bcrypt.compare(

          password,
          user.password

        );

      if (!isMatch) {

        return res.status(400)
          .json({

            message:
              "Invalid credentials"

          });

      }

      /* CREATE TOKEN */
console.log(
 process.env.JWT_SECRET
);

      const token =
        jwt.sign(

          {

            id: user._id,
            role: user.role

          },

          process.env.JWT_SECRET,

          {

            expiresIn: "7d"

          }

        );

      res.status(200).json({

        message:
          "Login successful",

        token,

        user: {

          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role

        }

      });

    }

    catch (error) {

      console.log(error);

      res.status(500).json({

        message:
          "Server Error"

      });

    }

};

module.exports = {

  registerUser,
  loginUser

};