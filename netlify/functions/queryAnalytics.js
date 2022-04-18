const { Pool } = require('pg');

const match = /(.*):(.*)@(.*)\/(.*)/.exec(process.env.ANALYTICS_PG_URL);

const pgPool = new Pool({
  host: match[3],
  user: match[1],
  password: match[2],
  database: match[4],
  port: 5432,
  max: 20
});

exports.handler = async (event) => {

  const { query } = JSON.parse(event.body);

  const { rows } = await pgPool.query(query);

  return {
    statusCode: 200,
    body: JSON.stringify(rows),
  };

}
