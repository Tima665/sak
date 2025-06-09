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
  IonFab,
  IonFabButton,
  IonIcon,
  IonImg,
  IonActionSheet,
  IonButtons,
} from "@ionic/react";
import { camera, image, add } from "ionicons/icons";
import { ChangeEvent, useState } from "react";
import "./CreateToken.css";

const CreateToken: React.FC = () => {
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [tokenImage, setTokenImage] = useState<string | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTokenImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateToken = () => {
    // Here you would implement the token creation logic
    console.log({
      name: tokenName,
      description: tokenDescription,
      image: tokenImage,
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
        <div className="token-form">
          <div className="image-upload-container">
            {tokenImage ? (
              <div className="token-image-wrapper">
                <IonImg src={tokenImage} className="token-image" />
                <IonButton
                  fill="clear"
                  className="change-image-button"
                  onClick={() => setShowActionSheet(true)}
                >
                  Change Image
                </IonButton>
              </div>
            ) : (
              <div
                className="upload-placeholder"
                onClick={() => setShowActionSheet(true)}
              >
                <IonIcon icon={add} size="large" />
                <p>Add Token Image</p>
                <IonButton fill="clear" size="small">
                  Upload Image
                </IonButton>
              </div>
            )}
          </div>

          <IonItem>
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
              text: "Take Photo",
              icon: camera,
              handler: () => {
                // Implement camera functionality
                console.log("Take photo clicked");
              },
            },
            {
              text: "Choose from Gallery",
              icon: image,
              handler: () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e) =>
                  handleImageUpload(
                    e as unknown as ChangeEvent<HTMLInputElement>
                  );
                input.click();
              },
            },
            {
              text: "Cancel",
              role: "cancel",
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default CreateToken;
