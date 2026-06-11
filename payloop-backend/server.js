const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mpesaRouter = require("./routes/mpesa");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const savingsRouter = require("./routes/savings");
const loansRouter = require("./routes/loans");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for dashboard and mobile queries
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Parse incoming request payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Backend diagnostics endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Healthy",
    timestamp: new Date(),
    service: "PayLoop Backend API Gateway"
  });
});

// Hook routes
app.use("/api/mpesa", mpesaRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/savings", savingsRouter);
app.use("/api/loans", loansRouter);

const runMigration = require("./scripts/migrate");

// Run database migrations on startup
runMigration().then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 PayLoop backend server running on port ${PORT}`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error("Failed to run database migrations:", err);
  process.exit(1);
});

