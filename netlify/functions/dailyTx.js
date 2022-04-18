const { Pool } = require('pg');

const matchAnalytics = /(.*):(.*)@(.*)\/(.*)/.exec(process.env.ANALYTICS_PG_URL);

const pgPool = new Pool({
  host: matchAnalytics[3],
  user: matchAnalytics[1],
  password: matchAnalytics[2],
  database: matchAnalytics[4],
  port: 5432,
  max: 20
});

exports.handler = async (event) => {

  const { rows } = await pgPool.query(`
    SELECT collected_for_day AS date,
      transactions_count AS total
    FROM daily_transactions_count
    WHERE collected_for_day >= DATE_TRUNC('day', NOW() - INTERVAL '2 week')
    ORDER BY date
  `);

  return {
    statusCode: 200,
    body: JSON.stringify(rows),
  };

}
