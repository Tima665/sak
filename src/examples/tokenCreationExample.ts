/**
 * Example usage of the Token Creation API
 */

import { SolanaService } from '../services/solanaService';
import { launchToken } from '../services/tokenApi';

// Example: Basic token creation with static dev key
export const createTokenExample = async () => {
  try {
    // Use static creator public key and generate mint keypair
    const staticCreatorPublicKey =
      'BFuhXnVC2UJkK3d9JRunqbqzzJ3f5G14LGSDMJ3RxsRU';
    const mintKeypair = SolanaService.generateKeypair();

    console.log('Creator Public Key (static):', staticCreatorPublicKey);
    console.log('Mint Public Key:', mintKeypair.publicKey.toBase58());

    // Call the launch API
    const launchResult = await launchToken({
      name: 'My Test Token',
      symbol: 'MTT',
      description: 'A test token created via API',
      dev: staticCreatorPublicKey,
      mint: mintKeypair.publicKey.toBase58(),
    });

    console.log('Encoded Transaction:', launchResult.encodedTransaction);

    // Note: To sign and send the transaction, you would need the private key for the creator
    // This example only shows how to get the encoded transaction with a static public key

    return launchResult.encodedTransaction;
  } catch (error) {
    console.error('Token creation failed:', error);
    throw error;
  }
};
