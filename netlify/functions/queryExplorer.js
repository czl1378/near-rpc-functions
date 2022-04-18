const { Pool } = require('pg');

const matchExplorer = /(.*):(.*)@(.*)\/(.*)/.exec(process.env.EXPLORER_PG_URL);

const pgPool = new Pool({
  host: matchExplorer[3],
  user: matchExplorer[1],
  password: matchExplorer[2],
  database: matchExplorer[4],
  port: 5432,
  max: 20
});

exports.handler = async (event) => {

  const { query } = JSON.stringify(event.body);
  
  const res = await pgPool.query(query);

  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };

}
