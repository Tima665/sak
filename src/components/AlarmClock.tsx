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
  IonSelect,
  IonSelectOption,
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

import AlarmManager, { AlarmConfig } from '../plugins/AlarmManagerPlugin';

interface AlarmItem {
  id: number;
  time: string;
  label: string;
  enabled: boolean;
  days: string[];
  sound: string;
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

const ALARM_SOUNDS = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'alarm_classic', label: 'Классический' },
  { value: 'alarm_gentle', label: 'Мягкий' },
  { value: 'alarm_rooster', label: 'Петух' },
  { value: 'alarm_digital', label: 'Цифровой' },
  { value: 'alarm_bells', label: 'Колокольчики' },
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
  const [selectedSound, setSelectedSound] = useState('alarm_classic');
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [alarmToDelete, setAlarmToDelete] = useState<number | null>(null);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [currentRingingAlarm, setCurrentRingingAlarm] =
    useState<AlarmItem | null>(null);
  const [snoozeCount, setSnoozeCount] = useState(0);

  const initializeNotifications = async () => {
    try {
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
      setAlarms(JSON.parse(savedAlarms));
    }
    initializeNotifications();
  }, []);

  const saveAlarms = (newAlarms: AlarmItem[]) => {
    setAlarms(newAlarms);
    localStorage.setItem('alarms', JSON.stringify(newAlarms));
  };

  const scheduleAlarmNotification = async (alarm: AlarmItem) => {
    try {
      const alarmTime = new Date(alarm.time);
      const now = new Date();

      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }

      const soundFile =
        alarm.sound === 'default' ? 'alarm_classic.wav' : `${alarm.sound}.wav`;

      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Будильник',
            body: alarm.label || 'Время просыпаться!',
            id: alarm.id,
            schedule: { at: alarmTime },
            sound: soundFile,
            channelId: 'alarm-channel',
            extra: {
              alarmId: alarm.id,
              sound: alarm.sound,
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
        sound: selectedSound,
        vibrate: vibrateEnabled,
      };

      setCurrentRingingAlarm(testAlarm);

      if (testAlarm.vibrate) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: '🔔 Тестовый будильник',
            body: 'Это тест будильника. Нажмите, чтобы выключить.',
            id: 999999,
            schedule: { at: new Date(Date.now() + 1000) },
            sound:
              testAlarm.sound === 'default'
                ? 'alarm_classic.wav'
                : `${testAlarm.sound}.wav`,
            channelId: 'alarm-channel',
            extra: { isTest: true },
          },
        ],
      });
    } catch (error) {
      console.error('Ошибка тестирования будильника:', error);
    }
  };

  const snoozeAlarm = async () => {
    if (!currentRingingAlarm) return;

    try {
      setSnoozeCount((prev) => prev + 1);
      setIsAlarmRinging(false);

      const snoozeTime = new Date(Date.now() + 5 * 60 * 1000);

      await LocalNotifications.schedule({
        notifications: [
          {
            title: `Будильник (Отложен ${snoozeCount + 1} раз)`,
            body: currentRingingAlarm.label || 'Время просыпаться!',
            id: currentRingingAlarm.id + 10000,
            schedule: { at: snoozeTime },
            sound:
              currentRingingAlarm.sound === 'default'
                ? 'alarm_classic.wav'
                : `${currentRingingAlarm.sound}.wav`,
            channelId: 'alarm-channel',
          },
        ],
      });

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
      setSelectedSound(alarm.sound);
      setVibrateEnabled(alarm.vibrate);
    } else {
      setEditingAlarm(null);
      setSelectedTime(new Date().toISOString());
      setAlarmLabel('');
      setSelectedDays([]);
      setSelectedSound('alarm_classic');
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
      sound: selectedSound,
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

  const formatDays = (days: string[]) => {
    if (days.length === 0) return 'Один раз';
    if (days.length === 7) return 'Каждый день';
    return days
      .map((day) => DAYS_OF_WEEK.find((d) => d.key === day)?.label)
      .join(', ');
  };

  return (
    <>
      {/* Alarm Ringing Modal */}
      <IonModal isOpen={isAlarmRinging} backdropDismiss={false}>
        <IonContent className="ion-padding">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <IonIcon
              icon={alarm}
              className="mb-8 animate-pulse text-8xl text-red-500"
            />
            <IonText>
              <h1 className="mb-4 text-3xl font-bold">БУДИЛЬНИК</h1>
              <h2 className="mb-2 text-xl">
                {currentRingingAlarm?.label || 'Время просыпаться!'}
              </h2>
              <p className="mb-8 text-lg text-gray-600">
                {currentRingingAlarm && formatTime(currentRingingAlarm.time)}
              </p>
              {snoozeCount > 0 && (
                <p className="mb-4 text-sm text-orange-500">
                  Отложен {snoozeCount} раз
                </p>
              )}
            </IonText>

            <div className="flex w-full max-w-md gap-4">
              <IonButton
                expand="block"
                fill="outline"
                color="warning"
                onClick={snoozeAlarm}
                className="flex-1"
              >
                Отложить (5 мин)
              </IonButton>
              <IonButton
                expand="block"
                color="danger"
                onClick={dismissAlarm}
                className="flex-1"
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
              {editingAlarm ? 'Редактировать' : 'Новый будильник'}
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
            <IonLabel position="stacked">Дни недели</IonLabel>
          </IonItem>
          <IonGrid>
            <IonRow>
              {DAYS_OF_WEEK.map((day) => (
                <IonCol size="auto" key={day.key}>
                  <IonButton
                    fill={selectedDays.includes(day.key) ? 'solid' : 'outline'}
                    size="small"
                    onClick={() => toggleDay(day.key)}
                  >
                    {day.label}
                  </IonButton>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>

          <IonItem>
            <IonLabel position="stacked">Звук</IonLabel>
            <IonSelect
              value={selectedSound}
              onIonChange={(e) => setSelectedSound(e.detail.value)}
            >
              {ALARM_SOUNDS.map((sound) => (
                <IonSelectOption key={sound.value} value={sound.value}>
                  {sound.label}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

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
      <div className="p-4">
        {/* Test Section */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Тест будильника</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel>Звук</IonLabel>
              <IonSelect
                value={selectedSound}
                onIonChange={(e) => setSelectedSound(e.detail.value)}
              >
                {ALARM_SOUNDS.map((sound) => (
                  <IonSelectOption key={sound.value} value={sound.value}>
                    {sound.label}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
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
              className="ion-margin-top"
              disabled={isAlarmRinging}
            >
              <IonIcon icon={play} slot="start" />
              Тестировать
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Alarms List */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Мои будильники</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {alarms.length === 0 ? (
              <IonText color="medium" className="block p-8 text-center">
                У вас пока нет будильников.
                <br />
                Нажмите + чтобы создать первый.
              </IonText>
            ) : (
              <IonList>
                {alarms.map((alarm) => (
                  <IonItem key={alarm.id}>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">
                          {formatTime(alarm.time)}
                        </h3>
                        <IonToggle
                          checked={alarm.enabled}
                          onIonChange={() => toggleAlarm(alarm.id)}
                        />
                      </div>
                      <div className="mt-1">
                        <p className="text-sm font-medium">{alarm.label}</p>
                        <p className="text-xs text-gray-500">
                          {formatDays(alarm.days)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {
                            ALARM_SOUNDS.find((s) => s.value === alarm.sound)
                              ?.label
                          }
                          {alarm.vibrate && ' • Вибрация'}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col gap-1">
                      <IonButton
                        fill="clear"
                        size="small"
                        onClick={() => openAlarmModal(alarm)}
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
          <IonFabButton onClick={() => openAlarmModal()}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </div>
    </>
  );
};

export default AlarmClock;
