const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres:saka77@localhost:5432/payloop" });

async function query() {
  await client.connect();
  const res = await client.query("SELECT * FROM users ORDER BY joined_date DESC LIMIT 5");
  console.log("Latest users in database:");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

query().catch(console.error);
