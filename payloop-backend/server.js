const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mpesaRouter = require("./routes/mpesa");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for dashboard and mobile queries
app.use(cors());

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

// Start server listening
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 PayLoop backend server running on port ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`====================================================`);
});
