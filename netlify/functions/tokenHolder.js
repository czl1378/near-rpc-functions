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

exports.handler = async (event) => {

  const { token, timestamp = 0, limit = 100 } = event.queryStringParameters;
  
  const { rows } = await explorerPGPool.query(`
    SELECT * FROM action_receipt_actions 
    WHERE receipt_receiver_account_id='${token}'
    AND receipt_included_in_block_timestamp>${timestamp}
    AND args->>'method_name'='storage_deposit'
    ORDER BY receipt_included_in_block_timestamp ASC
    LIMIT ${limit}
  `);

  const res = rows.map(({ 
    receipt_predecessor_account_id, 
    args, 
    receipt_included_in_block_timestamp 
  }) => ({
    effectedAccountIds: [receipt_predecessor_account_id, args.args_json.account_id],
    timestamp: receipt_included_in_block_timestamp
  }));

  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };

}
