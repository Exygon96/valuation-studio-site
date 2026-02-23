// netlify/functions/fmp.js
// Proxy for Financial Modeling Prep API — hides key, handles CORS

const FMP_KEY = 'aeIoSKG3LgI9jPqWcdb1tsRVPND9TSvS';
const FMP_BASE = 'https://financialmodelingprep.com/api';

exports.handler = async (event) => {
  // CORS headers — allow your Netlify domain
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Extract the FMP path from query param: ?path=/v3/search&query=Netflix&limit=5
  const params = event.queryStringParameters || {};
  const path = params.path;

  if (!path) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing path parameter' }),
    };
  }

  // Build upstream URL — forward all params except 'path', append API key
  const forward = Object.entries(params)
    .filter(([k]) => k !== 'path')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const url = `${FMP_BASE}${path}?${forward}&apikey=${FMP_KEY}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    return {
      statusCode: response.status,
      headers,
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: 'Upstream request failed', detail: err.message }),
    };
  }
};
