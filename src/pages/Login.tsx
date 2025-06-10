import {
  IonButton,
  IonContent,
  IonInput,
  IonPage,
  IonText,
} from '@ionic/react';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

export const Login: React.FC = () => {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();
  const history = useHistory();
  const location = useLocation<{ from: { pathname: string } }>();
  const [email, setEmail] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const [isValid, setIsValid] = useState<boolean>();

  useEffect(() => {
    if (ready && authenticated) {
      const from = location.state?.from?.pathname || '/';
      history.replace(from);
    }
  }, [ready, authenticated, history, location]);

  const validateEmail = (email: string) => {
    return email.match(
      /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    );
  };

  const validate = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    setEmail(value);
    setIsValid(undefined);

    if (value === '') return;

    const isValidEmail = validateEmail(value) !== null;
    setIsValid(isValidEmail);
  };

  const markTouched = () => {
    setIsTouched(true);
  };

  const handleEmailLogin = async () => {
    if (!isValid) return;
    await login({
      loginMethods: ['email'],
      prefill: { type: 'email', value: email },
    });
  };

  const handleWalletLogin = async () => {
    await login({ loginMethods: ['wallet'] });
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center">
          <IonText className="ion-text-center mb-8">
            <h1 className="text-2xl font-bold">Welcome</h1>
            <p className="mt-2 text-gray-600">Please sign in to continue</p>
          </IonText>

          <div className="w-full space-y-4">
            <IonInput
              className={`${isValid && 'ion-valid'} ${isValid === false && 'ion-invalid'} ${isTouched && 'ion-touched'}`}
              type="email"
              fill="solid"
              label="Email"
              labelPlacement="floating"
              errorText="Invalid email"
              onIonInput={(event) => validate(event)}
              onIonBlur={() => markTouched()}
            />

            <IonButton expand="block" onClick={handleEmailLogin}>
              Continue with Email
            </IonButton>

            <IonButton
              expand="block"
              fill="outline"
              onClick={handleWalletLogin}
            >
              Connect Wallet
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
