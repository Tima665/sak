import {
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  RefresherEventDetail,
} from '@ionic/react';
import {
  Card,
  Avatar,
  Button,
  Typography,
  Divider,
  message,
  theme,
} from 'antd';
import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';
import {
  logoUsd,
  trophyOutline,
  copyOutline,
  linkOutline,
  openOutline,
  timeOutline,
} from 'ionicons/icons';
import React from 'react';

import { useCreatedTokens } from '../../hooks/useCreatedTokens';
import { CreatedToken } from '../../services/pumpFunCreatedTokensService';

const { Meta } = Card;
const { Text, Title } = Typography;
const { useToken } = theme;

interface CreatedTokensProps {
  walletAddress: string | null;
}

const CreatedTokens: React.FC<CreatedTokensProps> = ({ walletAddress }) => {
  const { token: themeToken } = useToken();
  const {
    data: tokens,
    isLoading,
    error,
    refetch,
  } = useCreatedTokens(walletAddress);

  console.log('tokens', tokens);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await refetch();
    event.detail.complete();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Address copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      message.error('Failed to copy address');
    }
  };

  const openInSolscan = (mintAddress: string) => {
    window.open(`https://solscan.io/token/${mintAddress}`, '_blank');
  };

  const openInPumpFun = (mintAddress: string) => {
    window.open(`https://pump.fun/coin/${mintAddress}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);

      if (!isValid(date)) {
        return 'Invalid date';
      }

      // Use formatDistanceToNow for relative time
      const distance = formatDistanceToNow(date, {
        addSuffix: true,
      });

      // If more than 30 days passed, show full date
      const daysDiff = Math.floor(
        (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysDiff > 30) {
        return format(date, 'MM/dd/yyyy');
      }

      return distance;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`;
    }
    return `$${marketCap}`;
  };

  if (!walletAddress) {
    return (
      <div className="p-4">
        <Card className="text-center">
          <Text type="secondary">Connect wallet to view created tokens</Text>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <Card className="text-center">
          <IonSpinner name="crescent" />
          <div className="mt-4">
            <Text type="secondary">Loading created tokens...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="text-center">
          <Text type="danger">Error loading created tokens</Text>
          <div className="mt-2">
            <Text type="secondary">{error.message}</Text>
          </div>
          <div className="mt-4">
            <Button onClick={() => refetch()}>Try again</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!tokens || tokens.length === 0) {
    return (
      <div className="p-4">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>
        <Card className="text-center">
          <Text type="secondary">No created tokens found</Text>
          <div className="mt-2">
            <Text type="secondary">
              Create your first token on the "Create" tab!
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      <Card className="!mb-6">
        <Title level={4} className="mb-0">
          <IonIcon aria-hidden="true" icon={trophyOutline} className="mr-2" />
          Created Tokens ({tokens.length})
        </Title>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tokens.map((token: CreatedToken, index: number) => (
          <Card
            key={`${token.mintAddress}-${index}`}
            className="w-full"
            cover={
              token.image ? (
                <img
                  alt={token.name}
                  src={token.image}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <div class="text-white text-5xl">💰</div>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="text-5xl text-white">💰</div>
                </div>
              )
            }
            actions={[
              <Button
                key="copy"
                type="text"
                icon={<IonIcon icon={copyOutline} />}
                onClick={() => copyToClipboard(token.mintAddress)}
                title="Copy mint address"
              />,
              <Button
                key="pumpfun"
                type="text"
                icon={<IonIcon icon={linkOutline} />}
                onClick={() => openInPumpFun(token.mintAddress)}
                title="View on Pump.fun"
              />,
              <Button
                key="solscan"
                type="text"
                icon={<IonIcon icon={openOutline} />}
                onClick={() => openInSolscan(token.mintAddress)}
                title="View on Solscan"
              />,
            ]}
          >
            <Meta
              avatar={
                <Avatar
                  src={token.image}
                  icon={!token.image ? <IonIcon icon={logoUsd} /> : undefined}
                  size="large"
                />
              }
              title={
                <div className="flex items-center justify-between">
                  <span className="font-bold">{token.name}</span>
                  {token.marketCap && (
                    <Text type="success" className="font-semibold">
                      {formatMarketCap(token.marketCap)}
                    </Text>
                  )}
                </div>
              }
              description={
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Text strong style={{ color: themeToken.colorPrimary }}>
                      {token.symbol}
                    </Text>
                  </div>

                  <Divider className="my-2" />

                  <div className="flex items-center">
                    <IonIcon icon={timeOutline} className="mr-1" />
                    <Text type="secondary" className="text-xs">
                      Created: {formatDate(token.creationTime)}
                    </Text>
                  </div>

                  <div
                    className="rounded p-2 font-mono text-xs"
                    style={{
                      backgroundColor: themeToken.colorFillQuaternary,
                      color: themeToken.colorTextSecondary,
                    }}
                  >
                    {token.mintAddress.slice(0, 8)}...
                    {token.mintAddress.slice(-8)}
                  </div>
                </div>
              }
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CreatedTokens;
