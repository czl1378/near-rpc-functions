const { Pool } = require('pg');

const matchTelemetry = /(.*):(.*)@(.*)\/(.*)/.exec(process.env.TELEMETRY_PG_URL);

const telemetryPGPool = new Pool({
  host: matchTelemetry[3],
  user: matchTelemetry[1],
  password: matchTelemetry[2],
  database: matchTelemetry[4],
  port: 5432,
  max: 20
});

exports.handler = async () => {

  const { rows } = await telemetryPGPool.query(`
    SELECT ip_address, account_id, node_id,
      last_seen, last_height, status,
      agent_name, agent_version, agent_build,
      latitude, longitude, city
    FROM nodes
    WHERE last_seen > NOW() - INTERVAL '60 seconds'
    ORDER BY is_validator ASC, node_id DESC
  `);
  
  const res = rows.map((onlineNode) => ({
    accountId: onlineNode.account_id,
    ipAddress: onlineNode.ip_address,
    nodeId: onlineNode.node_id,
    lastSeen: onlineNode.last_seen,
    lastHeight: parseInt(onlineNode.last_height),
    status: onlineNode.status,
    agentName: onlineNode.agent_name,
    agentVersion: onlineNode.agent_version,
    agentBuild: onlineNode.agent_build,
    latitude: onlineNode.latitude,
    longitude: onlineNode.longitude,
    city: onlineNode.city,
  }));

  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };

}
