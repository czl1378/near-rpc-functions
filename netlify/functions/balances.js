const axios = require('axios');

const RPC_ENPOINT = `https://rpc.${process.env.NETWORK_ID||'testnet'}.near.org`;

function parse(value) {
  return value && value.length > 0 ? 
  JSON.parse(Buffer.from(value).toString()) : value;
}

exports.handler = async (event) => {
  const { token, accounts } = JSON.parse(event.body);

  if (!token || !accounts || !accounts.length) {
    return {
      statusCode: 200,
      body: JSON.stringify([]),
    }
  }

  const promises = accounts.map(account => {
    const b = Buffer.from(`{"account_id": "${account}"}`);
    return axios.post(RPC_ENPOINT, {
      'jsonrpc': '2.0',
      'id': 'dontcare',
      'method': 'query',
      'params': {
        'finality': 'final',
        'request_type': 'call_function',
        'account_id': token,
        'method_name': 'ft_balance_of',
        'args_base64': b.toString('base64')
      }
    }).then(res => res.data).then(json => {
      if (json.error) {
        throw new Error(json.error);
      }
  
      return json.result?.result ? parse(json.result.result) : null;
    });
  });

  const res = await Promise.all(promises);

  return {
    statusCode: 200,
    body: JSON.stringify(res),
  }

}
