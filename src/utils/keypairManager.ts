import { Preferences } from '@capacitor/preferences';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export class KeypairManager {
  private static readonly CREATOR_KEY = 'creator_keypair';
  private static readonly MINT_KEY = 'mint_keypair';

  /**
   * Generate a new keypair
   */
  static generateKeypair(): Keypair {
    return Keypair.generate();
  }

  /**
   * Convert keypair to storable string format
   */
  static keypairToString(keypair: Keypair): string {
    return bs58.encode(keypair.secretKey);
  }

  /**
   * Convert string back to keypair
   */
  static stringToKeypair(privateKeyString: string): Keypair {
    const secretKey = bs58.decode(privateKeyString);
    return Keypair.fromSecretKey(secretKey);
  }

  /**
   * Save creator keypair to storage
   */
  static async saveCreatorKeypair(keypair: Keypair): Promise<void> {
    const privateKeyString = this.keypairToString(keypair);
    await Preferences.set({
      key: this.CREATOR_KEY,
      value: privateKeyString,
    });
  }

  /**
   * Save mint keypair to storage
   */
  static async saveMintKeypair(keypair: Keypair): Promise<void> {
    const privateKeyString = this.keypairToString(keypair);
    await Preferences.set({
      key: this.MINT_KEY,
      value: privateKeyString,
    });
  }

  /**
   * Get creator keypair from storage
   */
  static async getCreatorKeypair(): Promise<Keypair | null> {
    const result = await Preferences.get({ key: this.CREATOR_KEY });
    if (result.value) {
      return this.stringToKeypair(result.value);
    }
    return null;
  }

  /**
   * Get mint keypair from storage
   */
  static async getMintKeypair(): Promise<Keypair | null> {
    const result = await Preferences.get({ key: this.MINT_KEY });
    if (result.value) {
      return this.stringToKeypair(result.value);
    }
    return null;
  }

  /**
   * Get or create creator keypair
   */
  static async getOrCreateCreatorKeypair(): Promise<Keypair> {
    let keypair = await this.getCreatorKeypair();
    if (!keypair) {
      keypair = this.generateKeypair();
      await this.saveCreatorKeypair(keypair);
    }
    return keypair;
  }

  /**
   * Get or create mint keypair (usually you want a new one for each token)
   */
  static async getOrCreateMintKeypair(): Promise<Keypair> {
    let keypair = await this.getMintKeypair();
    if (!keypair) {
      keypair = this.generateKeypair();
      await this.saveMintKeypair(keypair);
    }
    return keypair;
  }

  /**
   * Clear all stored keypairs
   */
  static async clearKeypairs(): Promise<void> {
    await Preferences.remove({ key: this.CREATOR_KEY });
    await Preferences.remove({ key: this.MINT_KEY });
  }

  /**
   * Get public key string from keypair
   */
  static getPublicKeyString(keypair: Keypair): string {
    return keypair.publicKey.toBase58();
  }
}
