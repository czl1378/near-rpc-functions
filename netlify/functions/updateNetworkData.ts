import autobahn from 'autobahn';
import { Handler } from '@netlify/functions';

import dayjs from 'dayjs';

const NETWORK = process.env.NETWORK_ID || 'testnet';
const WAMP_NEAR_EXPLORER_URL = process.env.WAMP_NEAR_EXPLORER_URL;

const handler: Handler = async (event, context) => {

  const promise = () => new Promise((resolve, reject) => {

    let networkStats, chainBlockStats, chainTransactionsStats;

    function checkResult() {
      if (networkStats !== undefined && chainBlockStats !== undefined && chainTransactionsStats !== undefined) {
        resolve({
          networkStats, chainBlockStats, chainTransactionsStats
        });
      }
    }

    const wamp = new autobahn.Connection({
      url: WAMP_NEAR_EXPLORER_URL,
      realm: 'near-explorer',
      retry_if_unreachable: true,
      max_retries: Number.MAX_SAFE_INTEGER,
      max_retry_delay: 10,
    });
  
    wamp.onopen = (session) => {
  
      const subscribes = [
        [`com.nearprotocol.${NETWORK}.explorer.network-stats`, (_positionalArgs, namedArgs) => {
          console.log(namedArgs);
          networkStats = namedArgs;
          checkResult();
        }],
  
        [`com.nearprotocol.${NETWORK}.explorer.chain-blocks-stats:INDEXER_BACKEND`, (_positionalArgs, namedArgs) => {
          console.log(namedArgs);
          chainBlockStats = namedArgs;
          checkResult();
        }],
  
        [`com.nearprotocol.${NETWORK}.explorer.chain-transactions-stats:INDEXER_BACKEND`, (_positionalArgs, namedArgs) => {
          const { transactionsCountHistoryForTwoWeeks } = namedArgs;
          const history = (transactionsCountHistoryForTwoWeeks.map(({ total, date }) => ({
            total,
            date: dayjs(date).format('MMM D')
          })));
          console.log(history);
          chainTransactionsStats = history;
          checkResult();
        }]
      ];
  
      subscribes.forEach(async ([k, f]) => {
        await session.subscribe(k, f)
      });
    }
    
    wamp.onclose = (reason) => {
      reject(reason);
    }
  
    wamp.open();
  
  });

  try {
    const res = await promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: res
      })
    }
  } catch(err) {
    console.log(err);
    return {
      statusCode: 200,
      body: JSON.stringify({
        url: WAMP_NEAR_EXPLORER_URL,
        success: false,
        message: err.toString()
      })
    }
  }
}

export { handler }