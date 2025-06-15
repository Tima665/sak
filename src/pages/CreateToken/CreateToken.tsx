import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AnchorProvider } from '@coral-xyz/anchor';
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
} from '@ionic/react';
import { usePrivy } from '@privy-io/react-auth';
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Upload } from 'antd';
import type { UploadFileStatus } from 'antd/es/upload/interface';
import { camera, image, add } from 'ionicons/icons';
import { PumpFunSDK } from 'pumpdotfun-sdk';
import { useState } from 'react';

import { usePhotoGallery } from '../../hooks/usePhotoGallery';

import './CreateToken.css';

export const CreateToken: React.FC = () => {
  const [tokenName, setTokenName] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = usePrivy();

  const { photos, takePhoto, deletePhoto } = usePhotoGallery();

  const fileList = photos.map((photo, idx) => ({
    uid: String(idx),
    name: photo.filepath,
    status: 'done' as UploadFileStatus,
    url: photo.webviewPath,
  }));

  const handleCreateToken = async () => {
    try {
      setIsLoading(true);

      if (!user?.wallet) {
        throw new Error('Wallet not connected');
      }

      const connection = new Connection(import.meta.env.VITE_HELIUS_RPC_URL);
      const provider = new AnchorProvider(connection, user.wallet as any, {});
      const sdk = new PumpFunSDK(provider);

      console.log(new Blob([photos?.[0]?.webviewPath || '']));

      // Генерируем новый Keypair для создателя токена
      const creator = Keypair.generate();
      const mint = Keypair.generate();

      console.log('Creator pubkey:', creator.publicKey.toBase58());

      const tokenMetadata = {
        name: tokenName,
        symbol: tokenName.substring(0, 4).toUpperCase(),
        description: tokenDescription,
        file: new Blob([photos?.[0]?.webviewPath || ''], { type: 'image/png' }),
      };

      const createResults = await sdk.createAndBuy(
        creator,
        mint,
        tokenMetadata,
        BigInt(0.0001 * LAMPORTS_PER_SOL),
        100n, // slippage basis points
        {
          unitLimit: 250000,
          unitPrice: 250000,
        },
      );

      console.log({ createResults });

      if (createResults.success) {
        console.log(
          'Token created successfully:',
          `https://pump.fun/${mint.publicKey.toBase58()}`,
        );
      } else {
        throw new Error('Failed to create token');
      }
    } catch (error) {
      console.error('Error creating token:', error);
    } finally {
      setIsLoading(false);
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
          <IonTitle>Create Token</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
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
              onIonChange={(e) => setTokenName(e.detail.value!)}
              placeholder="Enter token name"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Description</IonLabel>
            <IonTextarea
              value={tokenDescription}
              onIonChange={(e) => setTokenDescription(e.detail.value!)}
              placeholder="Enter token description"
              rows={4}
            />
          </IonItem>

          <IonButton
            expand="block"
            onClick={handleCreateToken}
            className="ion-margin-top"
            disabled={isLoading || !user?.wallet}
          >
            {isLoading ? 'Creating...' : 'Create Token'}
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
      </IonContent>
    </IonPage>
  );
};
