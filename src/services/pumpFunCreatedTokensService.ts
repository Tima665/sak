export interface CreatedToken {
  name: string;
  symbol: string;
  mintAddress: string;
  creationTime: string;
  signature: string;
  marketCap?: number;
  price?: number;
  uri?: string;
  image?: string;
}

export interface BitqueryResponse {
  data: {
    Solana: {
      TokenSupplyUpdates: Array<{
        Block: {
          Time: string;
        };
        Transaction: {
          Signer: string;
          Signature: string;
        };
        TokenSupplyUpdate: {
          Amount: string;
          Currency: {
            Symbol: string;
            Name: string;
            MintAddress: string;
            Uri?: string;
            Decimals: number;
          };
          PostBalance: string;
        };
      }>;
    };
  };
}

class PumpFunCreatedTokensService {
  async getCreatedTokensByWalletHelius(
    walletAddress: string,
  ): Promise<CreatedToken[]> {
    const HELIUS_RPC_URL = import.meta.env.VITE_HELIUS_RPC_URL;

    if (!HELIUS_RPC_URL) {
      throw new Error('VITE_HELIUS_RPC_URL is not configured');
    }

    try {
      // Получаем транзакции создания токенов
      const response = await fetch(HELIUS_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'created-tokens',
          method: 'getSignaturesForAddress',
          params: [
            walletAddress,
            {
              limit: 100,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Helius API error: ${response.status}`);
      }

      const data = await response.json();
      const signatures = data.result || [];

      // Фильтруем только транзакции создания токенов
      const createdTokens: CreatedToken[] = [];

      for (const sig of signatures.slice(0, 20)) {
        // Ограничиваем для производительности
        try {
          const txResponse = await fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 'tx-details',
              method: 'getTransaction',
              params: [
                sig.signature,
                {
                  encoding: 'jsonParsed',
                  maxSupportedTransactionVersion: 0,
                },
              ],
            }),
          });

          const txData = await txResponse.json();
          const transaction = txData.result;

          if (!transaction || transaction.meta?.err) continue;

          // Проверяем, является ли это транзакцией создания токена на pump.fun
          const isPumpFunCreate =
            transaction.transaction?.message?.instructions?.some(
              (ix: any) =>
                ix.programId ===
                  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P' &&
                ix.data &&
                ix.accounts?.length > 0,
            );

          if (isPumpFunCreate) {
            // Извлекаем информацию о созданном токене
            const tokenMint = this.extractTokenMintFromTransaction(transaction);
            if (tokenMint) {
              const tokenInfo = await this.getTokenMetadata(tokenMint);
              createdTokens.push({
                name: tokenInfo.name || 'Unknown',
                symbol: tokenInfo.symbol || 'UNKNOWN',
                mintAddress: tokenMint,
                creationTime: new Date(
                  transaction.blockTime * 1000,
                ).toISOString(),
                signature: sig.signature,
                uri: tokenInfo.uri,
                image: tokenInfo.image,
              });
            }
          }
        } catch (error) {
          console.error(
            `Error processing transaction ${sig.signature}:`,
            error,
          );
          continue;
        }
      }

      return createdTokens;
    } catch (error) {
      console.error('Error fetching created tokens via Helius:', error);
      throw error;
    }
  }

  private extractTokenMintFromTransaction(transaction: any): string | null {
    try {
      // Ищем новые токен аккаунты в postTokenBalances
      const postTokenBalances = transaction.meta?.postTokenBalances || [];
      const preTokenBalances = transaction.meta?.preTokenBalances || [];

      // Находим токены, которые появились после транзакции
      for (const postBalance of postTokenBalances) {
        const existedBefore = preTokenBalances.some(
          (pre: any) =>
            pre.mint === postBalance.mint &&
            pre.accountIndex === postBalance.accountIndex,
        );

        if (!existedBefore && postBalance.mint) {
          return postBalance.mint;
        }
      }

      return null;
    } catch (error) {
      console.error('Error extracting token mint:', error);
      return null;
    }
  }

  private async getTokenMetadata(
    mintAddress: string,
  ): Promise<{ name?: string; symbol?: string; uri?: string; image?: string }> {
    const HELIUS_RPC_URL = import.meta.env.VITE_HELIUS_RPC_URL;

    if (!HELIUS_RPC_URL) {
      console.error('VITE_HELIUS_RPC_URL is not configured');
      return {};
    }

    try {
      const response = await fetch(HELIUS_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'token-metadata',
          method: 'getAsset',
          params: {
            id: mintAddress,
          },
        }),
      });

      const data = await response.json();
      const asset = data.result;

      let imageUrl =
        asset?.content?.links?.image || asset?.content?.files?.[0]?.uri;

      // Если есть JSON URI, попробуем получить изображение оттуда
      if (!imageUrl && asset?.content?.json_uri) {
        try {
          const metadataResponse = await fetch(asset.content.json_uri);
          const metadata = await metadataResponse.json();
          imageUrl = metadata.image;
        } catch (error) {
          console.error('Error fetching metadata from JSON URI:', error);
        }
      }

      return {
        name: asset?.content?.metadata?.name,
        symbol: asset?.content?.metadata?.symbol,
        uri: asset?.content?.json_uri,
        image: imageUrl,
      };
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return {};
    }
  }
}

export const pumpFunCreatedTokensService = new PumpFunCreatedTokensService();
