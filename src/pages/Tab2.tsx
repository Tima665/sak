import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonText,
  IonItem,
  IonLabel,
  IonDatetime,
  IonList,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import { usePrivy } from '@privy-io/react-auth';
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import { alarm, time, trash } from 'ionicons/icons';
import { useState, useEffect } from 'react';

interface PrivyWallet {
  address: string;
  sendTransaction: (transaction: Transaction) => Promise<string>;
}

interface Alarm {
  id: string;
  time: string;
  isActive: boolean;
}

const Tab2: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [balance, setBalance] = useState<number | null>(null);
  const { user } = usePrivy();

  // Функция для получения баланса
  const getBalance = async (address: string) => {
    try {
      const connection = new Connection(import.meta.env.VITE_HELIUS_RPC_URL);
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error getting balance:', error);
      setBalance(null);
    }
  };

  // Обновляем баланс при изменении адреса кошелька
  useEffect(() => {
    if (user?.wallet?.address) {
      getBalance(user.wallet.address);
    }
  }, [user?.wallet?.address]);

  // Проверяем будильники каждую минуту
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      alarms.forEach((alarm) => {
        if (alarm.isActive && alarm.time === currentTime) {
          handleAlarmTrigger(alarm.id);
        }
      });
    };

    const interval = setInterval(checkAlarms, 60000); // Проверяем каждую минуту
    return () => clearInterval(interval);
  }, [alarms]);

  const handleAlarmTrigger = async (alarmId: string) => {
    if (!user?.wallet) return;

    try {
      const connection = new Connection(import.meta.env.VITE_HELIUS_RPC_URL);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(user.wallet.address),
          toPubkey: new PublicKey('YOUR_WALLET_ADDRESS'), // Замените на ваш адрес
          lamports: 0.0001 * LAMPORTS_PER_SOL,
        }),
      );

      const signature = await (
        user.wallet as unknown as PrivyWallet
      ).sendTransaction(transaction);
      await connection.confirmTransaction(signature);

      // Обновляем баланс после транзакции
      if (user.wallet.address) {
        getBalance(user.wallet.address);
      }

      // Деактивируем будильник после срабатывания
      setAlarms((prev) =>
        prev.map((alarm) =>
          alarm.id === alarmId ? { ...alarm, isActive: false } : alarm,
        ),
      );
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };

  const addAlarm = () => {
    if (!selectedTime) return;

    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: selectedTime,
      isActive: true,
    };

    setAlarms((prev) => [...prev, newAlarm]);
    setSelectedTime('');
  };

  const toggleAlarm = (alarmId: string) => {
    setAlarms((prev) =>
      prev.map((alarm) =>
        alarm.id === alarmId ? { ...alarm, isActive: !alarm.isActive } : alarm,
      ),
    );
  };

  const deleteAlarm = (alarmId: string) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== alarmId));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Будильник</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="flex h-full flex-col gap-4 p-4">
          {user?.wallet?.address && (
            <IonItem>
              <IonLabel>
                <h2>Баланс кошелька</h2>
                <p>{balance !== null ? `${balance} SOL` : 'Загрузка...'}</p>
              </IonLabel>
            </IonItem>
          )}

          <IonCard className="m-0 bg-transparent shadow-none">
            <IonCardContent>
              <IonDatetime
                presentation="time"
                value={selectedTime}
                onIonChange={(e) => setSelectedTime(e.detail.value as string)}
                locale="ru-RU"
                hourCycle="h23"
              />
              <IonButton
                expand="block"
                onClick={addAlarm}
                className="ion-margin-top"
              >
                <IonIcon icon={alarm} slot="start" />
                Добавить будильник
              </IonButton>
            </IonCardContent>
          </IonCard>

          <IonList className="bg-transparent">
            {alarms.map((alarm) => (
              <IonItem key={alarm.id} className="mb-2 rounded-lg bg-gray-100">
                <IonIcon icon={time} slot="start" />
                <IonLabel>
                  <h2>{alarm.time}</h2>
                  <p>{alarm.isActive ? 'Активен' : 'Неактивен'}</p>
                </IonLabel>
                <IonButton
                  fill="clear"
                  onClick={() => toggleAlarm(alarm.id)}
                  color={alarm.isActive ? 'danger' : 'success'}
                >
                  {alarm.isActive ? 'Выключить' : 'Включить'}
                </IonButton>
                <IonButton
                  fill="clear"
                  onClick={() => deleteAlarm(alarm.id)}
                  color="medium"
                >
                  <IonIcon icon={trash} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>

          <IonText
            color="medium"
            className="mt-4 rounded-lg bg-red-100 p-4 text-center text-red-500"
          >
            Внимание! Если не выключить будильник вовремя, с вашего счета будет
            списано 0.0001 SOL
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
