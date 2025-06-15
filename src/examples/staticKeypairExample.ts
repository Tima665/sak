/**
 * Example usage with static private key for full token creation
 */

import { SolanaService } from '../services/solanaService';
import { launchToken } from '../services/tokenApi';

// Example: Full token creation with static private key
export const createTokenWithStaticPrivateKey = async () => {
  try {
    // If you have the private key for BFuhXnVC2UJkK3d9JRunqbqzzJ3f5G14LGSDMJ3RxsRU
    // you would use it like this:

    // const creatorPrivateKey = 'YOUR_PRIVATE_KEY_HERE'; // base58 encoded private key
    // const creatorKeypair = SolanaService.createKeypairFromPrivateKey(creatorPrivateKey);

    // For demonstration, we'll generate a new keypair and show its public key
    const creatorKeypair = SolanaService.generateKeypair();
    const mintKeypair = SolanaService.generateKeypair();

    console.log('Creator Public Key:', creatorKeypair.publicKey.toBase58());
    console.log('Mint Public Key:', mintKeypair.publicKey.toBase58());

    // Step 1: Get encoded transaction
    const launchResult = await launchToken({
      name: 'Static Key Token',
      symbol: 'SKT',
      description: 'Token created with static keypair',
      dev: creatorKeypair.publicKey.toBase58(),
      mint: mintKeypair.publicKey.toBase58(),
    });

    console.log('Encoded Transaction:', launchResult.encodedTransaction);

    // Step 2: Sign and send the transaction
    const solanaService = new SolanaService();
    const signature = await solanaService.signAndSendTransaction(
      launchResult.encodedTransaction,
      creatorKeypair,
      mintKeypair,
    );

    console.log('Transaction Signature:', signature);
    return signature;
  } catch (error) {
    console.error('Token creation with static keypair failed:', error);
    throw error;
  }
};

// Example: Only get encoded transaction with static public key
export const getEncodedTransactionOnly = async () => {
  try {
    const staticCreatorPublicKey =
      'BFuhXnVC2UJkK3d9JRunqbqzzJ3f5G14LGSDMJ3RxsRU';
    const mintKeypair = SolanaService.generateKeypair();

    const launchResult = await launchToken({
      name: 'Encoded Only Token',
      symbol: 'EOT',
      description: 'Token for encoded transaction only',
      dev: staticCreatorPublicKey,
      mint: mintKeypair.publicKey.toBase58(),
    });

    console.log('Static Creator Public Key:', staticCreatorPublicKey);
    console.log('Generated Mint Public Key:', mintKeypair.publicKey.toBase58());
    console.log('Encoded Transaction:', launchResult.encodedTransaction);

    return launchResult.encodedTransaction;
  } catch (error) {
    console.error('Getting encoded transaction failed:', error);
    throw error;
  }
};
