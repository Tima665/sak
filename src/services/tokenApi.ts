import { API_BASE_URL, API_ENDPOINTS } from '../constants';

export interface LaunchTokenParams {
  name: string;
  symbol: string;
  description: string;
  dev: string;
  mint: string;
  file?: string; // base64 encoded file with data URL prefix
}

export interface LaunchTokenResponse {
  encodedTransaction: string;
}

// Raw API response format
export interface ApiResponse {
  result: string;
  tx: string;
}

export const launchToken = async (
  params: LaunchTokenParams,
): Promise<LaunchTokenResponse> => {
  const formData = new URLSearchParams();
  formData.append('name', params.name);
  formData.append('symbol', params.symbol);
  formData.append('description', params.description);
  formData.append('dev', params.dev);
  formData.append('mint', params.mint);

  // Add file if provided (should be base64 with data URL prefix)
  if (params.file) {
    formData.append('file', params.file);
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LAUNCH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${errorText}`,
    );
  }

  // Try to parse as JSON first, then fall back to text
  const contentType = response.headers.get('content-type');
  console.log('Response Content-Type:', contentType);

  let responseData: any;
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json();
    console.log('API Response (JSON):', responseData);
  } else {
    responseData = await response.text();
    console.log('API Response (text):', responseData);
  }

  // Extract encoded transaction from response
  let encodedTransaction: string;
  if (typeof responseData === 'string') {
    encodedTransaction = responseData;
  } else if (responseData && typeof responseData === 'object') {
    // Try different possible field names - API returns {result: 'success', tx: 'base58string'}
    encodedTransaction =
      responseData.tx || // This is what the API actually returns
      responseData.encodedTransaction ||
      responseData.transaction ||
      responseData.data ||
      responseData.result ||
      JSON.stringify(responseData);
  } else {
    throw new Error('Unexpected response format');
  }

  // Check if API returned success
  if (typeof responseData === 'object' && responseData.result !== 'success') {
    throw new Error(
      `API returned error: ${responseData.result || 'Unknown error'}`,
    );
  }

  // Validate that we got a transaction
  if (
    !encodedTransaction ||
    encodedTransaction === 'undefined' ||
    encodedTransaction === 'null'
  ) {
    throw new Error('No transaction received from API');
  }

  // Clean the transaction string (remove whitespace, newlines, etc.)
  encodedTransaction = encodedTransaction.trim().replace(/\s/g, '');

  console.log(
    'Extracted encoded transaction:',
    encodedTransaction.substring(0, 100) + '...',
  );
  console.log('Encoded transaction length:', encodedTransaction.length);

  return {
    encodedTransaction,
  };
};
