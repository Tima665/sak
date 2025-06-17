import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import {
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonDatetime,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonInput,
  IonToggle,
  IonAlert,
  IonFab,
  IonFabButton,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import {
  alarm,
  add,
  trash,
  checkmark,
  close,
  settings,
  play,
} from 'ionicons/icons';
import React, { useState, useEffect } from 'react';

import { usePrivyWallet } from '../hooks/usePrivyWallet';
import AlarmManager, { AlarmConfig } from '../plugins/AlarmManagerPlugin';

interface AlarmItem {
  id: number;
  time: string;
  label: string;
  enabled: boolean;
  days: string[];
  vibrate: boolean;
}

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Пн' },
  { key: 'tue', label: 'Вт' },
  { key: 'wed', label: 'Ср' },
  { key: 'thu', label: 'Чт' },
  { key: 'fri', label: 'Пт' },
  { key: 'sat', label: 'Сб' },
  { key: 'sun', label: 'Вс' },
];

const AlarmClock: React.FC = () => {
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<AlarmItem | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>(
    new Date().toISOString(),
  );
  const [alarmLabel, setAlarmLabel] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [alarmToDelete, setAlarmToDelete] = useState<number | null>(null);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [currentRingingAlarm, setCurrentRingingAlarm] =
    useState<AlarmItem | null>(null);
  const [snoozeCount, setSnoozeCount] = useState(0);

  // Privy wallet integration
  const { authenticated, sendSol, isSendingSol } = usePrivyWallet();
  const snoozeWalletAddress = import.meta.env.VITE_SNOOZE_WALLET_ADDRESS;

  const initializeNotifications = async () => {
    try {
      // Check if we're running on a supported platform
      if (import.meta.env.VITE_PLATFORM === 'web') {
        console.log('Уведомления недоступны в веб-версии');
        return;
      }

      const permission = await LocalNotifications.checkPermissions();
      if (permission.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }

      await LocalNotifications.createChannel({
        id: 'alarm-channel',
        name: 'Будильники',
        description: 'Уведомления для будильников',
        sound: 'alarm_classic.wav',
        importance: 5,
        visibility: 1,
        lights: true,
        vibration: true,
      });
    } catch (error) {
      console.error('Ошибка инициализации уведомлений:', error);
    }
  };

  useEffect(() => {
    const savedAlarms = localStorage.getItem('alarms');
    if (savedAlarms) {
      try {
        const parsedAlarms = JSON.parse(savedAlarms);
        // Ensure all alarms have required fields with defaults
        const normalizedAlarms = parsedAlarms.map((alarm: any) => ({
          id: alarm.id || Math.floor(Math.random() * 1000000),
          time: alarm.time || new Date().toISOString(),
          label: alarm.label || 'Будильник',
          enabled: alarm.enabled !== undefined ? alarm.enabled : true,
          days: Array.isArray(alarm.days) ? alarm.days : [],
          vibrate: alarm.vibrate !== undefined ? alarm.vibrate : true,
        }));
        setAlarms(normalizedAlarms);
      } catch (error) {
        console.error('Ошибка загрузки будильников:', error);
        setAlarms([]);
      }
    }
    initializeNotifications();
  }, []);

  const saveAlarms = (newAlarms: AlarmItem[]) => {
    setAlarms(newAlarms);
    localStorage.setItem('alarms', JSON.stringify(newAlarms));
  };

  const scheduleAlarmNotification = async (alarm: AlarmItem) => {
    try {
      // Skip notifications on web platform
      if (import.meta.env.VITE_PLATFORM === 'web') {
        console.log('Планирование уведомлений недоступно в веб-версии');
        return;
      }

      const alarmTime = new Date(alarm.time);
      const now = new Date();

      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Будильник',
            body: alarm.label || 'Время просыпаться!',
            id: alarm.id,
            schedule: { at: alarmTime },
            sound: 'alarm_classic.wav',
            channelId: 'alarm-channel',
            extra: {
              alarmId: alarm.id,
              vibrate: alarm.vibrate,
            },
          },
        ],
      });

      // Schedule full-screen alarm
      const alarmConfig: AlarmConfig = {
        alarmId: alarm.id.toString(),
        at: alarmTime.getTime(),
        name: alarm.label || 'Будильник',
        exact: true,
        uiOptions: {
          titleText: 'Будильник',
          alarmNameText: alarm.label || 'Время просыпаться!',
          backgroundColor: '#FF6B6B',
          dismissButtonText: 'Выключить',
          snoozeButtonText: 'Отложить',
        },
      };

      await AlarmManager.set(alarmConfig);
    } catch (error) {
      console.error('Ошибка планирования будильника:', error);
    }
  };

  const cancelAlarmNotification = async (alarmId: number) => {
    try {
      // Skip notifications on web platform
      if (import.meta.env.VITE_PLATFORM === 'web') {
        console.log('Отмена уведомлений недоступна в веб-версии');
        return;
      }

      await LocalNotifications.cancel({
        notifications: [{ id: alarmId }],
      });
      await AlarmManager.cancel({ alarmId: alarmId.toString() });
    } catch (error) {
      console.error('Ошибка отмены будильника:', error);
    }
  };

  const testAlarmRing = async () => {
    try {
      setIsAlarmRinging(true);
      setSnoozeCount(0);

      const testAlarm: AlarmItem = {
        id: 999999,
        time: new Date().toISOString(),
        label: 'Тестовый будильник',
        enabled: true,
        days: [],
        vibrate: vibrateEnabled,
      };

      setCurrentRingingAlarm(testAlarm);

      if (testAlarm.vibrate && import.meta.env.VITE_PLATFORM !== 'web') {
        try {
          await Haptics.impact({ style: ImpactStyle.Heavy });
        } catch {
          console.log('Вибрация недоступна в веб-версии');
        }
      }

      if (import.meta.env.VITE_PLATFORM !== 'web') {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: '🔔 Тестовый будильник',
              body: 'Это тест будильника. Нажмите, чтобы выключить.',
              id: 999999,
              schedule: { at: new Date(Date.now() + 1000) },
              sound: 'alarm_classic.wav',
              channelId: 'alarm-channel',
              extra: { isTest: true },
            },
          ],
        });
      } else {
        // Web fallback - just show the alarm modal
        console.log('Тестовый будильник запущен в веб-версии');
      }
    } catch (error) {
      console.error('Ошибка тестирования будильника:', error);
    }
  };

  const snoozeAlarm = async () => {
    if (!currentRingingAlarm) return;

    try {
      setSnoozeCount((prev) => prev + 1);
      setIsAlarmRinging(false);

      // Send 0.001 SOL to snooze wallet if user is authenticated and wallet address is configured
      if (authenticated && snoozeWalletAddress) {
        try {
          await sendSol({
            toAddress: snoozeWalletAddress,
            amount: 0.001,
          });
          console.log('SOL payment sent successfully for snooze');
        } catch (paymentError) {
          console.error('Failed to send SOL payment:', paymentError);
          // Continue with snooze even if payment fails
        }
      }

      const snoozeTime = new Date(Date.now() + 5 * 60 * 1000);

      if (import.meta.env.VITE_PLATFORM !== 'web') {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: `Будильник (Отложен ${snoozeCount + 1} раз)`,
              body: currentRingingAlarm.label || 'Время просыпаться!',
              id: currentRingingAlarm.id + 10000,
              schedule: { at: snoozeTime },
              sound: 'alarm_classic.wav',
              channelId: 'alarm-channel',
            },
          ],
        });
      } else {
        console.log(`Будильник отложен на 5 минут в веб-версии`);
      }

      setCurrentRingingAlarm(null);
    } catch (error) {
      console.error('Ошибка отложения будильника:', error);
    }
  };

  const dismissAlarm = () => {
    setIsAlarmRinging(false);
    setCurrentRingingAlarm(null);
    setSnoozeCount(0);
  };

  const openAlarmModal = (alarm?: AlarmItem) => {
    if (alarm) {
      setEditingAlarm(alarm);
      setSelectedTime(alarm.time);
      setAlarmLabel(alarm.label);
      setSelectedDays(alarm.days);
      setVibrateEnabled(alarm.vibrate);
    } else {
      setEditingAlarm(null);
      setSelectedTime(new Date().toISOString());
      setAlarmLabel('');
      setSelectedDays([]);
      setVibrateEnabled(true);
    }
    setIsModalOpen(true);
  };

  const saveAlarm = () => {
    if (!selectedTime) return;

    const generateSimpleId = () => Math.floor(Math.random() * 1000000);

    const newAlarm: AlarmItem = {
      id: editingAlarm?.id || generateSimpleId(),
      time: selectedTime,
      label: alarmLabel,
      enabled: true,
      days: selectedDays,
      vibrate: vibrateEnabled,
    };

    let updatedAlarms;
    if (editingAlarm) {
      updatedAlarms = alarms.map((alarm) =>
        alarm.id === editingAlarm.id ? newAlarm : alarm,
      );
    } else {
      updatedAlarms = [...alarms, newAlarm];
    }

    saveAlarms(updatedAlarms);

    if (newAlarm.enabled) {
      scheduleAlarmNotification(newAlarm);
    }

    setIsModalOpen(false);
  };

  const toggleAlarm = async (alarmId: number) => {
    const alarm = alarms.find((a) => a.id === alarmId);
    if (!alarm) return;

    const updatedAlarms = alarms.map((a) =>
      a.id === alarmId ? { ...a, enabled: !a.enabled } : a,
    );

    saveAlarms(updatedAlarms);

    if (alarm.enabled) {
      await cancelAlarmNotification(alarmId);
    } else {
      const updatedAlarm = { ...alarm, enabled: true };
      await scheduleAlarmNotification(updatedAlarm);
    }
  };

  const deleteAlarm = async (alarmId: number) => {
    const updatedAlarms = alarms.filter((alarm) => alarm.id !== alarmId);
    saveAlarms(updatedAlarms);
    await cancelAlarmNotification(alarmId);
    setShowDeleteAlert(false);
    setAlarmToDelete(null);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDays = (days: string[] | undefined) => {
    if (!days || days.length === 0) return 'Один раз';
    if (days.length === 7) return 'Каждый день';
    return days
      .map((day) => DAYS_OF_WEEK.find((d) => d.key === day)?.label)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <>
      {/* Alarm Ringing Modal */}
      <IonModal isOpen={isAlarmRinging} backdropDismiss={false}>
        <IonContent className="ion-padding">
          <div className="ion-text-center">
            <IonIcon icon={alarm} size="large" color="danger" />
            <h1>БУДИЛЬНИК</h1>
            <h2>{currentRingingAlarm?.label || 'Время просыпаться!'}</h2>
            <p>{currentRingingAlarm && formatTime(currentRingingAlarm.time)}</p>
            {snoozeCount > 0 && <p>Отложен {snoozeCount} раз</p>}
            {authenticated && snoozeWalletAddress && (
              <p>При отложении будет отправлено 0.001 SOL</p>
            )}
            <div className="ion-margin-top">
              <IonButton
                expand="block"
                fill="outline"
                color="warning"
                onClick={snoozeAlarm}
                disabled={isSendingSol}
              >
                {isSendingSol ? 'Отправка...' : 'Отложить'}
              </IonButton>
              <IonButton
                expand="block"
                color="danger"
                onClick={dismissAlarm}
                className="ion-margin-top"
              >
                Выключить
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      {/* Add/Edit Alarm Modal */}
      <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              {editingAlarm ? 'Редактировать будильник' : 'Новый будильник'}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsModalOpen(false)}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonLabel position="stacked">Время</IonLabel>
            <IonDatetime
              presentation="time"
              value={selectedTime}
              onIonChange={(e) => setSelectedTime(e.detail.value as string)}
              locale="ru-RU"
              hourCycle="h23"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Название</IonLabel>
            <IonInput
              value={alarmLabel}
              onIonInput={(e) => setAlarmLabel(e.detail.value!)}
              placeholder="Введите название будильника"
            />
          </IonItem>

          <IonItem>
            <IonLabel>Дни недели</IonLabel>
          </IonItem>
          <IonGrid>
            <IonRow>
              {DAYS_OF_WEEK.map((day) => (
                <IonCol size="auto" key={day.key}>
                  <IonButton
                    fill={selectedDays.includes(day.key) ? 'solid' : 'outline'}
                    size="small"
                    onClick={() => toggleDay(day.key)}
                    color={
                      selectedDays.includes(day.key) ? 'primary' : 'medium'
                    }
                  >
                    {day.label}
                  </IonButton>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>

          <IonItem>
            <IonLabel>Вибрация</IonLabel>
            <IonToggle
              checked={vibrateEnabled}
              onIonChange={(e) => setVibrateEnabled(e.detail.checked)}
            />
          </IonItem>

          <IonButton
            expand="block"
            onClick={saveAlarm}
            className="ion-margin-top"
          >
            <IonIcon icon={checkmark} slot="start" />
            {editingAlarm ? 'Сохранить' : 'Создать'}
          </IonButton>
        </IonContent>
      </IonModal>

      {/* Delete Alert */}
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Удалить будильник"
        message="Вы действительно хотите удалить этот будильник?"
        buttons={[
          {
            text: 'Отмена',
            role: 'cancel',
          },
          {
            text: 'Удалить',
            role: 'destructive',
            handler: () => {
              if (alarmToDelete !== null) {
                deleteAlarm(alarmToDelete);
              }
            },
          },
        ]}
      />

      {/* Main Content */}
      <IonHeader>
        <IonToolbar>
          <IonTitle>Будильник</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {/* Test Section */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Тест будильника</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel>Вибрация</IonLabel>
              <IonToggle
                checked={vibrateEnabled}
                onIonChange={(e) => setVibrateEnabled(e.detail.checked)}
              />
            </IonItem>
            <IonButton
              expand="block"
              onClick={testAlarmRing}
              disabled={isAlarmRinging}
              className="ion-margin-top"
            >
              <IonIcon icon={play} slot="start" />
              Тестировать
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* SOL Transfer Test Section */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Тест отправки SOL</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {authenticated && snoozeWalletAddress ? (
              <>
                <IonItem>
                  <IonLabel>
                    <h3>Адрес получателя:</h3>
                    <p>{snoozeWalletAddress}</p>
                  </IonLabel>
                </IonItem>
                <IonButton
                  expand="block"
                  onClick={() =>
                    sendSol({ toAddress: snoozeWalletAddress, amount: 0.001 })
                  }
                  disabled={isSendingSol}
                  className="ion-margin-top"
                >
                  <IonIcon icon={play} slot="start" />
                  {isSendingSol ? 'Отправка...' : 'Отправить 0.001 SOL'}
                </IonButton>
              </>
            ) : (
              <div className="ion-text-center">
                <IonIcon icon={alarm} size="large" />
                <IonText color="medium">
                  <p>
                    {!authenticated
                      ? 'Войдите в аккаунт для тестирования'
                      : 'Адрес кошелька не настроен'}
                  </p>
                </IonText>
              </div>
            )}
          </IonCardContent>
        </IonCard>

        {/* Alarms List */}
        {alarms.length === 0 ? (
          <div className="ion-text-center ion-margin">
            <IonIcon icon={alarm} size="large" />
            <h3>Пока нет будильников</h3>
            <p>Нажмите + чтобы создать первый</p>
          </div>
        ) : (
          <IonList>
            {alarms.map((alarm) => (
              <IonItem key={alarm.id}>
                <IonLabel>
                  <h2>{formatTime(alarm.time)}</h2>
                  <p>{alarm.label || 'Будильник'}</p>
                  <p>{formatDays(alarm.days)}</p>
                  {alarm.vibrate && <p>Вибрация включена</p>}
                </IonLabel>
                <IonToggle
                  checked={alarm.enabled}
                  onIonChange={() => toggleAlarm(alarm.id)}
                  slot="end"
                />
                <IonButton
                  fill="clear"
                  onClick={() => openAlarmModal(alarm)}
                  slot="end"
                >
                  <IonIcon icon={settings} />
                </IonButton>
                <IonButton
                  fill="clear"
                  color="danger"
                  onClick={() => {
                    setAlarmToDelete(alarm.id);
                    setShowDeleteAlert(true);
                  }}
                  slot="end"
                >
                  <IonIcon icon={trash} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        {/* Add FAB */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => openAlarmModal()}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </>
  );
};

export default AlarmClock;
