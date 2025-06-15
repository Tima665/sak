import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonActionSheet,
  IonText,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { Upload } from 'antd';
import type { UploadFileStatus } from 'antd/es/upload/interface';
import { camera, image, add } from 'ionicons/icons';
import { useState } from 'react';

// import { WalletBalance } from '../../components';
import { useCreateTokenWithPrivyHybrid } from '../../hooks/useCreateTokenWithPrivyHybrid';
import { usePhotoGallery } from '../../hooks/usePhotoGallery';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import {
  convertImageUrlToBase64,
  isValidBase64DataUrl,
} from '../../utils/fileUtils';

import './CreateToken.css';

export const CreateToken: React.FC = () => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const { photos, takePhoto, deletePhoto } = usePhotoGallery();
  const createTokenMutation = useCreateTokenWithPrivyHybrid();
  const { walletAddress, ready, authenticated } = usePrivyWallet();

  const fileList = photos.map((photo, idx) => ({
    uid: String(idx),
    name: photo.filepath,
    status: 'done' as UploadFileStatus,
    url: photo.webviewPath,
  }));

  const handleCreateToken = async () => {
    console.log('Form values:', {
      tokenName: `"${tokenName}"`,
      tokenSymbol: `"${tokenSymbol}"`,
      tokenDescription: `"${tokenDescription}"`,
      hasPhoto: photos.length > 0,
      walletAddress,
    });

    if (!ready || !authenticated) {
      setToastMessage('Please connect your wallet first');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (!walletAddress) {
      setToastMessage('No wallet address found');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (!tokenName.trim()) {
      setToastMessage('Please enter a token name');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (!tokenSymbol.trim()) {
      setToastMessage('Please enter a token symbol');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (!tokenDescription.trim()) {
      setToastMessage('Please enter a token description');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    try {
      console.log('Creator Wallet Address (Privy):', walletAddress);

      // Convert photo to base64 if available
      let base64File: string | undefined;
      if (photos.length > 0 && photos[0].webviewPath) {
        try {
          console.log('Converting photo to base64...');
          base64File = await convertImageUrlToBase64(photos[0].webviewPath);
          console.log('Photo converted to base64, length:', base64File.length);

          // Validate base64 format
          if (!isValidBase64DataUrl(base64File)) {
            throw new Error('Invalid base64 format');
          }
        } catch (photoError) {
          console.error('Failed to convert photo to base64:', photoError);
          setToastMessage(
            'Failed to process photo. Creating token without image.',
          );
          setToastColor('danger');
          setShowToast(true);
          // Continue without photo
        }
      }

      // Create the token with Privy wallet
      const result = await createTokenMutation.mutateAsync({
        name: tokenName,
        symbol: tokenSymbol,
        description: tokenDescription,
        file: base64File, // Include base64 photo if available
      });

      const explorerUrl = `https://explorer.solana.com/tx/${result.signature}`;
      const photoStatus = base64File ? ' (with photo)' : ' (no photo)';
      setToastMessage(
        `Token created successfully${photoStatus}! View transaction: ${explorerUrl}`,
      );
      setToastColor('success');
      setShowToast(true);

      // Also log for easy copying
      console.log('🎉 Token created successfully!');
      console.log('Transaction signature:', result.signature);
      console.log('Explorer URL:', explorerUrl);
      console.log('Photo included:', !!base64File);

      // Reset form
      setTokenName('');
      setTokenSymbol('');
      setTokenDescription('');

      // Clear photos
      photos.forEach((photo) => {
        deletePhoto(photo.filepath);
      });
    } catch (error) {
      console.error('Token creation failed:', error);
      setToastMessage(
        `Token creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const selectFromGallery = async () => {
    const cameraPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      quality: 90,
    });

    if (cameraPhoto.webPath) {
      takePhoto();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="p-4">Create Token</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {/* Authentication Check */}
        {!ready && (
          <IonText color="medium">
            <p>Loading wallet...</p>
          </IonText>
        )}

        {ready && !authenticated && (
          <IonText color="warning">
            <p>Please connect your wallet to create tokens.</p>
          </IonText>
        )}

        {/* Wallet Balance Section */}
        {/* {walletAddress && (
          <WalletBalance
            publicKey={walletAddress}
            title="Your Wallet Balance"
          />
        )} */}

        <div>
          <div
            onClick={() => setShowActionSheet(true)}
            className="card-wrapper mb-6"
          >
            <Upload
              openFileDialogOnClick={false}
              listType="picture-card"
              multiple={false}
              fileList={fileList}
              onRemove={(file) => {
                deletePhoto(file.name);
              }}
              style={{
                width: '100%',
                height: '300px',
              }}
            >
              {!photos?.[0]?.webviewPath && (
                <div className="flex items-center">
                  <IonIcon icon={add} size="large" color="primary" />
                  <IonText color="primary">Upload</IonText>
                </div>
              )}
            </Upload>
          </div>

          <IonItem className="mb-4">
            <IonLabel position="stacked">Token Name</IonLabel>
            <IonInput
              value={tokenName}
              onIonChange={(e) => {
                const value = e.detail.value || '';
                setTokenName(value);
              }}
              placeholder="Enter token name"
            />
          </IonItem>

          <IonItem className="mb-4">
            <IonLabel position="stacked">Token Symbol</IonLabel>
            <IonInput
              value={tokenSymbol}
              onIonChange={(e) => {
                const value = e.detail.value || '';
                setTokenSymbol(value);
              }}
              placeholder="Enter token symbol (e.g., BTC, ETH)"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Description</IonLabel>
            <IonTextarea
              value={tokenDescription}
              onIonChange={(e) => {
                const value = e.detail.value || '';
                console.log('Description changed:', `"${value}"`);
                setTokenDescription(value);
              }}
              placeholder="Enter token description"
              rows={4}
            />
          </IonItem>

          <IonButton
            expand="block"
            onClick={handleCreateToken}
            className="ion-margin-top"
            disabled={createTokenMutation.isPending || !ready || !authenticated}
          >
            {createTokenMutation.isPending
              ? 'Creating Token...'
              : 'Create Token'}
          </IonButton>
        </div>

        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={[
            {
              text: 'Take Photo',
              icon: camera,
              handler: takePhoto,
            },
            {
              text: 'Choose from Gallery',
              icon: image,
              handler: selectFromGallery,
            },
            {
              text: 'Cancel',
              role: 'cancel',
            },
          ]}
        />

        <IonLoading
          isOpen={createTokenMutation.isPending}
          message="Creating token..."
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={5000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};
