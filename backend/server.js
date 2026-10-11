
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const { protect, adminOnly } = require(
  "./middleware/authMiddleware"
);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Backend Running Successfully");
});

app.get("/api/user", protect, (req, res) => {
  res.status(200).json({
    message: "Protected User Route",
    user: req.user,
  });
});

app.get("/api/admin", protect, adminOnly, (req, res) => {
  res.status(200).json({
    message: "Admin Route Accessed",
  });
});

// Handle invalid JSON sent in request bodies.
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      message: "Invalid JSON request body",
    });
  }

  console.error("Unexpected server error:", error.message);

  return res.status(500).json({
    message: "Server Error",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
