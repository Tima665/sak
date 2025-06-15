import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonRefresher,
  IonRefresherContent,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonAvatar,
  RefresherEventDetail,
} from '@ionic/react';
import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';
import {
  copyOutline,
  openOutline,
  timeOutline,
  trophyOutline,
  linkOutline,
  logoUsd,
} from 'ionicons/icons';
import React from 'react';

import { useCreatedTokens } from '../../hooks/useCreatedTokens';
import { CreatedToken } from '../../services/pumpFunCreatedTokensService';
import './CreatedTokens.css';

interface CreatedTokensProps {
  walletAddress: string | null;
}

const CreatedTokens: React.FC<CreatedTokensProps> = ({ walletAddress }) => {
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
      // Можно добавить toast уведомление
    } catch (err) {
      console.error('Failed to copy:', err);
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
      <IonCard>
        <IonCardContent>
          <IonText color="medium">
            <p>Connect wallet to view created tokens</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  if (isLoading) {
    return (
      <IonCard>
        <IonCardContent className="ion-text-center">
          <IonSpinner name="crescent" />
          <IonText color="medium">
            <p>Loading created tokens...</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  if (error) {
    return (
      <IonCard>
        <IonCardContent>
          <IonText color="danger">
            <p>Error loading created tokens</p>
            <p>{error.message}</p>
          </IonText>
          <IonButton fill="clear" onClick={() => refetch()}>
            Try again
          </IonButton>
        </IonCardContent>
      </IonCard>
    );
  }

  if (!tokens || tokens.length === 0) {
    return (
      <>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>
        <IonCard>
          <IonCardContent>
            <IonText color="medium">
              <p>No created tokens found</p>
              <p>Create your first token on the "Create" tab!</p>
            </IonText>
          </IonCardContent>
        </IonCard>
      </>
    );
  }

  return (
    <>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            <IonIcon icon={trophyOutline} style={{ marginRight: '8px' }} />
            Created Tokens ({tokens.length})
          </IonCardTitle>
        </IonCardHeader>
      </IonCard>

      {tokens.map((token: CreatedToken, index: number) => (
        <IonCard
          key={`${token.mintAddress}-${index}`}
          className="created-token-card"
        >
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <div className="token-header">
                    <div className="token-info-with-image">
                      <IonAvatar className="token-avatar">
                        {token.image ? (
                          <IonImg
                            src={token.image}
                            alt={token.name}
                            onIonError={(e) => {
                              // Show fallback icon if image fails to load
                              const target = e.target as HTMLIonImgElement;
                              const avatar = target.closest('.token-avatar');
                              if (avatar) {
                                avatar.innerHTML =
                                  '<ion-icon name="logo-usd"></ion-icon>';
                              }
                            }}
                          />
                        ) : (
                          <IonIcon icon={logoUsd} className="fallback-icon" />
                        )}
                      </IonAvatar>
                      <div className="token-info">
                        <h3 className="token-name">{token.name}</h3>
                        <IonChip color="primary" outline>
                          {token.symbol}
                        </IonChip>
                      </div>
                    </div>
                    {token.marketCap && (
                      <div className="market-cap">
                        <IonText color="success">
                          <strong>{formatMarketCap(token.marketCap)}</strong>
                        </IonText>
                      </div>
                    )}
                  </div>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12">
                  <IonItem lines="none" className="token-details">
                    <IonIcon icon={timeOutline} slot="start" color="medium" />
                    <IonLabel>
                      <p>Created: {formatDate(token.creationTime)}</p>
                    </IonLabel>
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12">
                  <IonItem lines="none" className="mint-address">
                    <IonLabel>
                      <p>
                        Mint: {token.mintAddress.slice(0, 8)}...
                        {token.mintAddress.slice(-8)}
                      </p>
                    </IonLabel>
                    <IonButton
                      fill="clear"
                      size="small"
                      slot="end"
                      onClick={() => copyToClipboard(token.mintAddress)}
                    >
                      <IonIcon icon={copyOutline} />
                    </IonButton>
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12">
                  <div className="token-actions">
                    <IonButton
                      fill="outline"
                      size="small"
                      onClick={() => openInPumpFun(token.mintAddress)}
                    >
                      <IonIcon icon={linkOutline} slot="start" />
                      Pump.fun
                    </IonButton>

                    <IonButton
                      fill="outline"
                      size="small"
                      onClick={() => openInSolscan(token.mintAddress)}
                    >
                      <IonIcon icon={openOutline} slot="start" />
                      Solscan
                    </IonButton>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
      ))}
    </>
  );
};

export default CreatedTokens;
