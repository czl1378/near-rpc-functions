const { Pool } = require('pg');

const match = /(.*):(.*)@(.*)\/(.*)/.exec(process.env.NEARSCAN_PG_URL);
const secret = process.env.NEARSCAN_SECRET || '';

const pgPool = new Pool({
  host: match[3],
  user: match[1],
  password: match[2],
  database: match[4],
  port: 5432,
  max: 20
});

exports.handler = async (event) => {

  const { query, secret: requestSecret } = JSON.parse(event.body);

  if (requestSecret !== secret) {
    return {
      statuCode: 403,
      body: 'Forbidden'
    }
  }

  const { rows } = await pgPool.query(query);

  return {
    statusCode: 200,
    body: JSON.stringify(rows),
  };

}
