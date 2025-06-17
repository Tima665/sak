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
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-red-50 to-red-100 text-center">
            <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
              <IonIcon
                icon={alarm}
                className="mb-6 animate-bounce text-6xl text-red-500"
              />
              <IonText>
                <h1 className="mb-4 text-2xl font-bold text-gray-800">
                  🔔 БУДИЛЬНИК
                </h1>
                <h2 className="mb-3 text-lg font-semibold text-gray-700">
                  {currentRingingAlarm?.label || 'Время просыпаться!'}
                </h2>
                <p className="mb-6 text-3xl font-bold text-red-600">
                  {currentRingingAlarm && formatTime(currentRingingAlarm.time)}
                </p>
                {snoozeCount > 0 && (
                  <p className="mb-4 rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-600">
                    Отложен {snoozeCount} раз
                  </p>
                )}
                {authenticated && snoozeWalletAddress && (
                  <p className="mb-4 rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600">
                    💸 При отложении будет отправлено 0.001 SOL
                  </p>
                )}
              </IonText>

              <div className="mt-6 flex w-full gap-3">
                <IonButton
                  expand="block"
                  fill="outline"
                  color="warning"
                  onClick={snoozeAlarm}
                  className="flex-1 rounded-xl"
                  disabled={isSendingSol}
                >
                  {isSendingSol ? '⏳ Отправка...' : '😴 Отложить'}
                </IonButton>
                <IonButton
                  expand="block"
                  color="danger"
                  onClick={dismissAlarm}
                  className="flex-1 rounded-xl"
                >
                  ❌ Выключить
                </IonButton>
              </div>
            </div>
          </div>
        </IonContent>
      </IonModal>

      {/* Add/Edit Alarm Modal */}
      <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
        <IonHeader className="bg-gradient-to-r from-blue-500 to-purple-600">
          <IonToolbar color="clear">
            <IonTitle className="font-bold text-white">
              {editingAlarm ? '✏️ Редактировать' : '➕ Новый будильник'}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsModalOpen(false)} color="light">
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding bg-gray-50">
          <div className="space-y-4">
            <IonCard className="rounded-2xl border-0 shadow-lg">
              <IonCardContent className="p-6">
                <IonItem lines="none" className="mb-4">
                  <IonLabel
                    position="stacked"
                    className="text-lg font-semibold text-gray-700"
                  >
                    🕐 Время
                  </IonLabel>
                  <IonDatetime
                    presentation="time"
                    value={selectedTime}
                    onIonChange={(e) =>
                      setSelectedTime(e.detail.value as string)
                    }
                    locale="ru-RU"
                    hourCycle="h23"
                    className="mt-2"
                  />
                </IonItem>

                <IonItem lines="none" className="mb-4">
                  <IonLabel
                    position="stacked"
                    className="text-lg font-semibold text-gray-700"
                  >
                    📝 Название
                  </IonLabel>
                  <IonInput
                    value={alarmLabel}
                    onIonInput={(e) => setAlarmLabel(e.detail.value!)}
                    placeholder="Введите название будильника"
                    className="mt-2 rounded-lg bg-gray-100"
                  />
                </IonItem>

                <div className="mb-4">
                  <IonLabel className="mb-3 block text-lg font-semibold text-gray-700">
                    📅 Дни недели
                  </IonLabel>
                  <IonGrid>
                    <IonRow>
                      {DAYS_OF_WEEK.map((day) => (
                        <IonCol size="auto" key={day.key}>
                          <IonButton
                            fill={
                              selectedDays.includes(day.key)
                                ? 'solid'
                                : 'outline'
                            }
                            size="small"
                            onClick={() => toggleDay(day.key)}
                            className="rounded-full"
                            color={
                              selectedDays.includes(day.key)
                                ? 'primary'
                                : 'medium'
                            }
                          >
                            {day.label}
                          </IonButton>
                        </IonCol>
                      ))}
                    </IonRow>
                  </IonGrid>
                </div>

                <IonItem lines="none">
                  <IonLabel className="text-lg font-semibold text-gray-700">
                    📳 Вибрация
                  </IonLabel>
                  <IonToggle
                    checked={vibrateEnabled}
                    onIonChange={(e) => setVibrateEnabled(e.detail.checked)}
                    color="success"
                  />
                </IonItem>
              </IonCardContent>
            </IonCard>

            <IonButton
              expand="block"
              onClick={saveAlarm}
              className="rounded-2xl text-lg font-bold"
              size="large"
            >
              <IonIcon icon={checkmark} slot="start" />
              {editingAlarm ? '💾 Сохранить' : '✨ Создать'}
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      {/* Delete Alert */}
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="🗑️ Удалить будильник"
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
            ⏰ Умный будильник
          </h1>
          <p className="mt-2 text-gray-600">С интеграцией Solana</p>
        </div>

        {/* Test Section */}
        <IonCard className="mb-4 rounded-2xl border-0 bg-gradient-to-r from-green-400 to-blue-500 shadow-lg">
          <IonCardHeader>
            <IonCardTitle className="text-xl font-bold text-white">
              🧪 Тест будильника
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="rounded-b-2xl bg-white">
            <IonItem lines="none" className="mb-3">
              <IonLabel className="text-lg font-semibold text-gray-700">
                📳 Вибрация
              </IonLabel>
              <IonToggle
                checked={vibrateEnabled}
                onIonChange={(e) => setVibrateEnabled(e.detail.checked)}
                color="success"
              />
            </IonItem>
            <IonButton
              expand="block"
              onClick={testAlarmRing}
              className="rounded-xl text-lg font-bold"
              disabled={isAlarmRinging}
              size="large"
            >
              <IonIcon icon={play} slot="start" />
              🚀 Тестировать
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* SOL Transfer Test Section */}
        <IonCard className="mb-4 rounded-2xl border-0 bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg">
          <IonCardHeader>
            <IonCardTitle className="text-xl font-bold text-white">
              💰 Тест отправки SOL
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="rounded-b-2xl bg-white">
            {authenticated && snoozeWalletAddress ? (
              <>
                <IonItem lines="none" className="mb-3">
                  <IonLabel>
                    <h3 className="mb-1 text-sm font-semibold text-gray-700">
                      📍 Адрес получателя:
                    </h3>
                    <p className="rounded-lg bg-gray-100 p-2 font-mono text-xs break-all text-gray-500">
                      {snoozeWalletAddress}
                    </p>
                  </IonLabel>
                </IonItem>
                <IonButton
                  expand="block"
                  onClick={() =>
                    sendSol({ toAddress: snoozeWalletAddress, amount: 0.001 })
                  }
                  className="rounded-xl text-lg font-bold"
                  disabled={isSendingSol}
                  color="secondary"
                  size="large"
                >
                  <IonIcon icon={play} slot="start" />
                  {isSendingSol ? '⏳ Отправка...' : '💸 Отправить 0.001 SOL'}
                </IonButton>
              </>
            ) : (
              <div className="py-6 text-center">
                <IonIcon icon={alarm} className="mb-3 text-4xl text-gray-400" />
                <IonText color="medium">
                  <p className="text-gray-500">
                    {!authenticated
                      ? '🔐 Войдите в аккаунт для тестирования'
                      : '⚠️ Адрес кошелька не настроен'}
                  </p>
                </IonText>
              </div>
            )}
          </IonCardContent>
        </IonCard>

        {/* Alarms List */}
        <IonCard className="mb-20 rounded-2xl border-0 shadow-lg">
          <IonCardHeader className="rounded-t-2xl bg-gradient-to-r from-indigo-500 to-blue-600">
            <IonCardTitle className="text-xl font-bold text-white">
              📋 Мои будильники
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="p-0">
            {alarms.length === 0 ? (
              <div className="py-12 text-center">
                <IonIcon icon={alarm} className="mb-4 text-6xl text-gray-300" />
                <IonText color="medium">
                  <h3 className="mb-2 text-lg font-semibold text-gray-500">
                    Пока нет будильников
                  </h3>
                  <p className="text-gray-400">
                    Нажмите ➕ чтобы создать первый
                  </p>
                </IonText>
              </div>
            ) : (
              <IonList className="bg-transparent">
                {alarms.map((alarm, index) => (
                  <IonItem
                    key={alarm.id}
                    className={`${index === 0 ? '' : 'border-t border-gray-100'} bg-white hover:bg-gray-50`}
                    lines="none"
                  >
                    <div className="flex-1 py-2">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-3xl font-bold text-gray-800">
                          {formatTime(alarm.time)}
                        </h3>
                        <IonToggle
                          checked={alarm.enabled}
                          onIonChange={() => toggleAlarm(alarm.id)}
                          color="success"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-medium text-gray-700">
                          {alarm.label || '🔔 Будильник'}
                        </p>
                        <p className="flex items-center text-sm text-gray-500">
                          📅 {formatDays(alarm.days)}
                        </p>
                        {alarm.vibrate && (
                          <p className="flex items-center text-sm text-purple-600">
                            📳 Вибрация включена
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <IonButton
                        fill="clear"
                        size="small"
                        onClick={() => openAlarmModal(alarm)}
                        className="rounded-full"
                        color="primary"
                      >
                        <IonIcon icon={settings} />
                      </IonButton>
                      <IonButton
                        fill="clear"
                        size="small"
                        color="danger"
                        onClick={() => {
                          setAlarmToDelete(alarm.id);
                          setShowDeleteAlert(true);
                        }}
                        className="rounded-full"
                      >
                        <IonIcon icon={trash} />
                      </IonButton>
                    </div>
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>

        {/* Add FAB */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton
            onClick={() => openAlarmModal()}
            className="shadow-2xl"
            color="primary"
          >
            <IonIcon icon={add} className="text-2xl" />
          </IonFabButton>
        </IonFab>
      </div>
    </>
  );
};

export default AlarmClock;
