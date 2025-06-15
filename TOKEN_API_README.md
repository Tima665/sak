# Token Creation API Integration

This document describes the token creation API integration using `@tanstack/react-query`, Solana Web3.js, and the provided API endpoint.

## Overview

The token creation process involves:

1. Making a POST request to the launch API with token parameters
2. Receiving an encoded (unsigned) transaction
3. Decoding, signing, and sending the transaction to the Solana network

## API Endpoint

- **URL**: `https://1.pix.my:5555/api/launch`
- **Method**: POST
- **Content-Type**: `application/x-www-form-urlencoded`
- **Parameters**:
  - `name`: Token name
  - `symbol`: Token symbol
  - `description`: Token description
  - `dev`: Creator public key (base58)
  - `mint`: Mint public key (base58)

## Implementation

### 1. Dependencies Installed

```bash
npm install @tanstack/react-query @solana/web3.js bs58
```

### 2. Key Components

#### API Service (`src/services/tokenApi.ts`)

- `launchToken()`: Makes the API call to get encoded transaction

#### Solana Service (`src/services/solanaService.ts`)

- `SolanaService`: Handles transaction decoding, signing, and sending
- Methods for keypair generation and management

#### React Query Hook (`src/hooks/useCreateToken.ts`)

- `useCreateToken()`: Combines API call and transaction signing
- Handles the complete token creation flow

#### Keypair Manager (`src/utils/keypairManager.ts`)

- `KeypairManager`: Utility for storing and retrieving keypairs
- Uses Capacitor Preferences for persistence

### 3. Usage in Components

The `CreateToken` component (`src/pages/CreateToken/CreateToken.tsx`) has been updated to:

- Include a token symbol field
- Use the `useCreateToken` hook
- Generate keypairs automatically
- Handle loading states and error messages
- Display success/error toasts

### 4. Example Usage

```typescript
import { useCreateToken } from '../hooks/useCreateToken';
import { SolanaService } from '../services/solanaService';

const MyComponent = () => {
  const createTokenMutation = useCreateToken();

  const handleCreate = async () => {
    const creatorKeypair = SolanaService.generateKeypair();
    const mintKeypair = SolanaService.generateKeypair();

    try {
      const result = await createTokenMutation.mutateAsync({
        name: 'My Token',
        symbol: 'MTK',
        description: 'My awesome token',
        creatorKeypair,
        mintKeypair,
      });

      console.log('Transaction signature:', result.signature);
    } catch (error) {
      console.error('Failed to create token:', error);
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={createTokenMutation.isPending}
    >
      {createTokenMutation.isPending ? 'Creating...' : 'Create Token'}
    </button>
  );
};
```

## Configuration

### Solana RPC Endpoint

The application uses Helius RPC endpoint configured in `.env.local`. The RPC URL is automatically loaded from the `VITE_HELIUS_RPC_URL` environment variable:

```typescript
const SOLANA_RPC_URL =
  import.meta.env.VITE_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com';
```

Your `.env.local` should contain:

```
VITE_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your-api-key
```

If the environment variable is not set, it falls back to the standard Solana mainnet RPC endpoint.

### API Base URL

The API base URL is configured in `src/constants/api.ts`:

```typescript
export const API_BASE_URL = 'https://1.pix.my:5555/api';
```

## Security Notes

1. **Keypair Management**: The current implementation generates new keypairs for each token creation. In production, you may want to:

   - Use a persistent creator keypair
   - Implement proper key storage/management
   - Consider hardware wallet integration

2. **Private Keys**: Never expose private keys in client-side code or logs in production

3. **RPC Endpoint**: Use a reliable RPC endpoint for production deployments

## Error Handling

The implementation includes comprehensive error handling:

- API request failures
- Transaction signing errors
- Network connectivity issues
- Validation errors for required fields

## Testing

You can test the implementation by:

1. Running `npm run dev`
2. Navigating to the Create Token page
3. Filling in the token details
4. Clicking "Create Token"

The console will show the generated keypairs and transaction signature upon success.

## Files Modified/Created

- `src/main.tsx` - Added QueryClient setup
- `src/constants/api.ts` - API configuration
- `src/services/tokenApi.ts` - API service
- `src/services/solanaService.ts` - Solana transaction handling
- `src/hooks/useTokenApi.ts` - React Query hook for API
- `src/hooks/useCreateToken.ts` - Complete token creation hook
- `src/utils/keypairManager.ts` - Keypair management utilities
- `src/pages/CreateToken/CreateToken.tsx` - Updated UI component
- `src/examples/tokenCreationExample.ts` - Usage examples
