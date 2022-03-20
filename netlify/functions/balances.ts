import axios from 'axios';
import { Handler } from '@netlify/functions';

const RPC_ENPOINT = `https://rpc.${process.env.NETWORK_ID||'testnet'}.near.org`;

const handler: Handler = async (event, context) => {
  const { token, accounts } = event.queryStringParameters;

  const accountsArr = accounts.split(',');

  const promises = accountsArr.map(account => {
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
    }).then(res => res.data);
  });

  const res = await Promise.all(promises);

  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };
};

export { handler }