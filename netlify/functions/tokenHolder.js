const { Pool } = require('pg');

const matchExplorer = /(.*):(.*)@(.*)\/(.*)/.exec(process.env.EXPLORER_PG_URL);

const explorerPGPool = new Pool({
  host: matchExplorer[3],
  user: matchExplorer[1],
  password: matchExplorer[2],
  database: matchExplorer[4],
  port: 5432,
  max: 20
});

const handler = async (event) => {

  const { token, timestamp = 0, limit = 100 } = event.queryStringParameters;
  
  const res = await explorerPGPool.query(`
    SELECT * FROM action_receipt_actions 
    WHERE receipt_receiver_account_id='${token}'
    AND receipt_included_in_block_timestamp>${timestamp}
    AND args->>'method_name'='storage_deposit'
    ORDER BY receipt_included_in_block_timestamp ASC
    LIMIT ${limit}
  `);

  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };

}

export { handler }