import { registerPlugin } from '@capacitor/core';

export interface AlarmConfig {
  alarmId: string;
  at: number; // timestamp in milliseconds
  name: string;
  exact?: boolean;
  extra?: unknown;
  uiOptions?: {
    titleText?: string;
    alarmNameText?: string;
    backgroundColor?: string;
    dismissButtonText?: string;
    snoozeButtonText?: string;
  };
}

export interface AlarmEventData {
  alarmId: string;
  name: string;
}

export interface PermissionRequest {
  permission:
    | 'POST_NOTIFICATIONS'
    | 'SCHEDULE_EXACT_ALARM'
    | 'SYSTEM_ALERT_WINDOW';
}

export interface PermissionStatus {
  status: 'granted' | 'denied' | 'restricted';
}

export interface AlarmManagerPlugin {
  /**
   * Checks permissions
   */
  checkPermissions(options: PermissionRequest): Promise<PermissionStatus>;

  /**
   * Requests permissions
   */
  requestPermissions(options: PermissionRequest): Promise<PermissionStatus>;

  /**
   * Schedules an alarm
   */
  set(config: AlarmConfig): Promise<{ alarmId: string }>;

  /**
   * Cancels an alarm
   */
  cancel(options: { alarmId: string }): Promise<void>;

  /**
   * Checks if an alarm is scheduled
   */
  isScheduled(options: { alarmId: string }): Promise<{ isScheduled: boolean }>;

  /**
   * Adds an event listener
   */
  addListener(
    eventName: 'alarmDismissed' | 'alarmFired' | 'alarmSnoozed',
    listenerFunc: (event: AlarmEventData) => void,
  ): Promise<{ remove: () => Promise<void> }>;
}

const AlarmManager = registerPlugin<AlarmManagerPlugin>('AlarmManager');

export default AlarmManager;
