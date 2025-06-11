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
} from '@ionic/react';
import { Upload } from 'antd';
import type { UploadFileStatus } from 'antd/es/upload/interface';
import { camera, image, add } from 'ionicons/icons';
import { useState } from 'react';

import { usePhotoGallery } from '../../hooks/usePhotoGallery';

import './CreateToken.css';

export const CreateToken: React.FC = () => {
  const [tokenName, setTokenName] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);

  const { photos, takePhoto, deletePhoto } = usePhotoGallery();

  const fileList = photos.map((photo, idx) => ({
    uid: String(idx),
    name: photo.filepath,
    status: 'done' as UploadFileStatus,
    url: photo.webviewPath,
  }));

  const handleCreateToken = () => {
    // Here you would implement the token creation logic
    console.log({
      name: tokenName,
      description: tokenDescription,
      image: photos?.[0]?.webviewPath,
    });
  };

  const selectFromGallery = async () => {
    const cameraPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      quality: 90,
    });
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
          >
            Create Token
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
