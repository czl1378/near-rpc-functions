const { Pool } = require('pg');

const matchAnalytics = /(.*):(.*)@(.*)\/(.*)/.exec(process.env.ANALYTICS_PG_URL);
const matchExplorer = /(.*):(.*)@(.*)\/(.*)/.exec(process.env.EXPLORER_PG_URL);

const analyticsPGPool = new Pool({
  host: matchAnalytics[3],
  user: matchAnalytics[1],
  password: matchAnalytics[2],
  database: matchAnalytics[4],
  port: 5432,
  max: 20
});

const explorerPGPool = new Pool({
  host: matchExplorer[3],
  user: matchExplorer[1],
  password: matchExplorer[2],
  database: matchExplorer[4],
  port: 5432,
  max: 20
});

exports.handler = async (event) => {

  const [{ rows: dailyTx }, { rows: recentTxCount }] = await Promise.all([
    analyticsPGPool.query(`
      SELECT collected_for_day AS date,
        transactions_count AS total
      FROM daily_transactions_count
      WHERE collected_for_day >= DATE_TRUNC('day', NOW() - INTERVAL '2 week')
      ORDER BY date
    `),
    explorerPGPool.query(`
      SELECT
        COUNT(transaction_hash) AS total
      FROM transactions
      WHERE
        block_timestamp > (CAST(EXTRACT(EPOCH FROM NOW() - INTERVAL '1 day') AS bigint) * 1000 * 1000 * 1000)
    `)
  ]);
 
  return {
    statusCode: 200,
    body: JSON.stringify({
      dailyTx,
      recentTxCount
    }),
  };

}
