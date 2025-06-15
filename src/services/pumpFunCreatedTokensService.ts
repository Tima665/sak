export interface CreatedToken {
  name: string;
  symbol: string;
  mintAddress: string;
  creationTime: string;
  signature: string;
  marketCap?: number;
  price?: number;
  uri?: string;
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
  private readonly BITQUERY_API_URL = 'https://graphql.bitquery.io';
  private readonly BITQUERY_API_KEY = 'BQYhJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ'; // Нужно получить API ключ

  async getCreatedTokensByWallet(
    walletAddress: string,
  ): Promise<CreatedToken[]> {
    const query = `
      query GetCreatedTokens($creator: String!) {
        Solana {
          TokenSupplyUpdates(
            where: {
              Transaction: {
                Result: { Success: true }
                Signer: { is: $creator }
              }
              Instruction: {
                Program: {
                  Address: { is: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P" }
                  Method: { is: "create" }
                }
              }
            }
            orderBy: { descending: Block_Time }
            limit: { count: 50 }
          ) {
            Block {
              Time
            }
            Transaction {
              Signer
              Signature
            }
            TokenSupplyUpdate {
              Amount
              Currency {
                Symbol
                Name
                MintAddress
                Uri
                Decimals
              }
              PostBalance
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(this.BITQUERY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.BITQUERY_API_KEY}`,
        },
        body: JSON.stringify({
          query,
          variables: {
            creator: walletAddress,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Bitquery API error: ${response.status}`);
      }

      const data: BitqueryResponse = await response.json();

      return data.data.Solana.TokenSupplyUpdates.map((update) => ({
        name: update.TokenSupplyUpdate.Currency.Name || 'Unknown',
        symbol: update.TokenSupplyUpdate.Currency.Symbol || 'UNKNOWN',
        mintAddress: update.TokenSupplyUpdate.Currency.MintAddress,
        creationTime: update.Block.Time,
        signature: update.Transaction.Signature,
        uri: update.TokenSupplyUpdate.Currency.Uri,
      }));
    } catch (error) {
      console.error('Error fetching created tokens:', error);
      throw error;
    }
  }

  // Альтернативный метод через Helius API
  async getCreatedTokensByWalletHelius(
    walletAddress: string,
  ): Promise<CreatedToken[]> {
    const HELIUS_API_KEY = 'b5223b85-b513-4fe8-b215-7b8461b51582';
    const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

    try {
      // Получаем транзакции создания токенов
      const response = await fetch(HELIUS_URL, {
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
          const txResponse = await fetch(HELIUS_URL, {
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
  ): Promise<{ name?: string; symbol?: string; uri?: string }> {
    const HELIUS_API_KEY = 'b5223b85-b513-4fe8-b215-7b8461b51582';
    const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

    try {
      const response = await fetch(HELIUS_URL, {
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

      return {
        name: asset?.content?.metadata?.name,
        symbol: asset?.content?.metadata?.symbol,
        uri: asset?.content?.json_uri,
      };
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return {};
    }
  }

  // Простой метод для тестирования с известными данными
  async getMockCreatedTokens(walletAddress: string): Promise<CreatedToken[]> {
    // Возвращаем моковые данные для тестирования
    if (walletAddress === 'BFuhXnVC2UJkK3d9JRunqbqzzJ3f5G14LGSDMJ3RxsRU') {
      return [
        {
          name: 'OILMOON',
          symbol: 'OILMOON',
          mintAddress: 'mock-mint-1',
          creationTime: '2024-01-15T10:30:00Z',
          signature: 'mock-signature-1',
          marketCap: 4200,
        },
        {
          name: 'OILMOON',
          symbol: 'OILMOON',
          creationTime: '2024-01-14T15:45:00Z',
          mintAddress: 'mock-mint-2',
          signature: 'mock-signature-2',
          marketCap: 4200,
        },
        {
          name: 'tn12',
          symbol: 'tn12',
          mintAddress: 'mock-mint-3',
          creationTime: '2024-01-13T08:20:00Z',
          signature: 'mock-signature-3',
          marketCap: 4200,
        },
      ];
    }
    return [];
  }
}

export const pumpFunCreatedTokensService = new PumpFunCreatedTokensService();
