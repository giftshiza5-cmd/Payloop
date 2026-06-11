const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/payloop";

const pool = new Pool({
  connectionString,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database successfully.");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
