import {
  Connection,
  Keypair,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import bs58 from 'bs58';

// Use Helius RPC URL from environment variables
const SOLANA_RPC_URL =
  import.meta.env.VITE_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com';

export class SolanaService {
  private connection: Connection;

  constructor(rpcUrl: string = SOLANA_RPC_URL) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Get wallet balance in SOL
   */
  async getBalance(publicKey: string | PublicKey): Promise<number> {
    try {
      const pubKey =
        typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
      const balance = await this.connection.getBalance(pubKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance in lamports
   */
  async getBalanceLamports(publicKey: string | PublicKey): Promise<number> {
    try {
      const pubKey =
        typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
      return await this.connection.getBalance(pubKey);
    } catch (error) {
      console.error('Error getting balance in lamports:', error);
      throw error;
    }
  }

  /**
   * Validate if a string is valid base58
   */
  static isValidBase58(str: string): boolean {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    return base58Regex.test(str);
  }

  /**
   * Decode a base58 encoded transaction
   */
  decodeTransaction(encodedTransaction: string): Transaction {
    console.log(
      'Attempting to decode transaction:',
      encodedTransaction.substring(0, 100) + '...',
    );
    console.log('Transaction length:', encodedTransaction.length);

    // Validate base58 format
    if (!SolanaService.isValidBase58(encodedTransaction)) {
      console.error('Invalid base58 string detected');
      console.error('String contains invalid characters');
      throw new Error('Invalid base58 string: contains non-base58 characters');
    }

    try {
      const transactionBuffer = bs58.decode(encodedTransaction);
      console.log(
        'Successfully decoded transaction buffer, length:',
        transactionBuffer.length,
      );
      return Transaction.from(transactionBuffer);
    } catch (error) {
      console.error('Error decoding transaction:', error);
      console.error('Transaction string:', encodedTransaction);
      throw error;
    }
  }

  /**
   * Sign and send a transaction
   */
  async signAndSendTransaction(
    encodedTransaction: string,
    creatorKeypair: Keypair,
    mintKeypair: Keypair,
  ): Promise<string> {
    try {
      console.log('signAndSendTransaction');

      // Decode the transaction
      const transaction = this.decodeTransaction(encodedTransaction);

      // Sign the transaction with both keypairs
      const signers = [creatorKeypair, mintKeypair];

      // Send the transaction
      const signature = await this.connection.sendTransaction(
        transaction,
        signers,
        {
          skipPreflight: true,
        },
      );

      console.log('Transaction sent with signature:', signature);
      return signature;
    } catch (error) {
      console.error('Error signing and sending transaction:', error);
      throw error;
    }
  }

  /**
   * Create a keypair from a private key (if you have the private key as a string)
   */
  static createKeypairFromPrivateKey(privateKeyString: string): Keypair {
    const privateKeyBuffer = bs58.decode(privateKeyString);
    return Keypair.fromSecretKey(privateKeyBuffer);
  }

  /**
   * Generate a new random keypair
   */
  static generateKeypair(): Keypair {
    return Keypair.generate();
  }

  /**
   * Get the public key as a string
   */
  static getPublicKeyString(keypair: Keypair): string {
    return keypair.publicKey.toBase58();
  }
}
