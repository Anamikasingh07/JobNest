const express =
  require("express");

const dotenv =
  require("dotenv");

const cors =
  require("cors");

/* LOAD ENV */
dotenv.config();

/* DB CONNECTION */
const connectDB =
  require("./config/db");

/* ROUTES */
const authRoutes =
  require("./routes/authRoutes");

const jobRoutes =
  require("./routes/jobRoutes");

const applicationRoutes =
  require(
    "./routes/applicationRoutes"
  );

/* MIDDLEWARE */
const {

  protect,
  adminOnly

} = require(
  "./middleware/authMiddleware"
);

/* CONNECT DATABASE */
connectDB();

/* INITIALIZE EXPRESS */
const app = express();

/* MIDDLEWARES */
app.use(cors());

app.use(express.json());

/* ROUTES */
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/jobs",
  jobRoutes
);

app.use(
  "/api/applications",
  applicationRoutes
);

/* TEST ROUTE */
app.get("/", (req, res) => {

  res.send(
    "Backend Running Successfully"
  );

});

/* PROTECTED USER ROUTE */
app.get(

  "/api/user",

  protect,

  (req, res) => {

    res.json({

      message:
        "Protected User Route",

      user:
        req.user

    });

  }

);

/* ADMIN ROUTE */
app.get(

  "/api/admin",

  protect,
  adminOnly,

  (req, res) => {

    res.json({

      message:
        "Admin Route Accessed"

    });

  }

);

/* PORT */
const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});