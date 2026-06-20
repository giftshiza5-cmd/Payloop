const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:saka77@localhost:5432/postgres" });
console.log("Connecting...");
client.connect()
  .then(() => {
    console.log("Connected successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
