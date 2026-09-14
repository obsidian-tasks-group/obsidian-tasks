/**
 * @jest-environment jsdom
 */
import { Notice, Platform } from 'obsidian';
import moment from 'moment';
import {
    buildReminderNotificationContent,
    chooseNotificationChannel,
    notifyRemindersDue,
} from '../../src/Notifications/ReminderNotifier';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

jest.mock('obsidian', () => ({
    Notice: jest.fn(),
    Platform: { isDesktopApp: false },
}));

window.moment = moment;

const MockedNotice = jest.mocked(Notice);

beforeEach(() => {
    MockedNotice.mockClear();
    Platform.isDesktopApp = false;
    delete (global as any).Notification;
});

describe('buildReminderNotificationContent', () => {
    it('should build a singular title and single-line body for one task', () => {
        const task = new TaskBuilder().description('Buy milk #groceries').build();

        expect(buildReminderNotificationContent([task])).toEqual({
            title: 'Reminder',
            body: 'Buy milk',
        });
    });

    it('should build a plural title and multi-line body for several tasks', () => {
        const task1 = new TaskBuilder().description('Buy milk #groceries').build();
        const task2 = new TaskBuilder().description('Call John').build();
        const task3 = new TaskBuilder().description('Water plants').build();

        expect(buildReminderNotificationContent([task1, task2, task3])).toEqual({
            title: '3 reminders due',
            body: 'Buy milk\nCall John\nWater plants',
        });
    });
});

describe('chooseNotificationChannel', () => {
    it('should choose native on desktop when a global Notification constructor is available', () => {
        Platform.isDesktopApp = true;
        (global as any).Notification = jest.fn();

        expect(chooseNotificationChannel()).toEqual('native');
    });

    it('should fall back to notice on desktop when no global Notification constructor is available', () => {
        Platform.isDesktopApp = true;
        delete (global as any).Notification;

        expect(chooseNotificationChannel()).toEqual('notice');
    });

    it('should choose notice on non-desktop platforms, even if a Notification constructor exists', () => {
        Platform.isDesktopApp = false;
        (global as any).Notification = jest.fn();

        expect(chooseNotificationChannel()).toEqual('notice');
    });
});

describe('notifyRemindersDue', () => {
    it('should call the global Notification constructor, not Notice, when the native channel is chosen', () => {
        Platform.isDesktopApp = true;
        const MockedNotification = jest.fn();
        (global as any).Notification = MockedNotification;

        const task = new TaskBuilder().description('Buy milk').build();
        notifyRemindersDue([task]);

        expect(MockedNotification).toHaveBeenCalledWith('Reminder', {
            body: 'Buy milk',
            requireInteraction: true,
        });
        expect(MockedNotice).not.toHaveBeenCalled();
    });

    it('should fire exactly one native notification for several simultaneously-due tasks, not one each', () => {
        Platform.isDesktopApp = true;
        const MockedNotification = jest.fn();
        (global as any).Notification = MockedNotification;

        const task1 = new TaskBuilder().description('Buy milk').build();
        const task2 = new TaskBuilder().description('Call John').build();
        notifyRemindersDue([task1, task2]);

        expect(MockedNotification).toHaveBeenCalledTimes(1);
        expect(MockedNotification).toHaveBeenCalledWith('2 reminders due', {
            body: 'Buy milk\nCall John',
            requireInteraction: true,
        });
    });

    it('should fall back to a persistent Notice (duration 0) when the notice channel is chosen', () => {
        Platform.isDesktopApp = false;

        const task = new TaskBuilder().description('Buy milk').build();
        notifyRemindersDue([task]);

        expect(MockedNotice).toHaveBeenCalledWith('Reminder: Buy milk', 0);
    });

    it('should fire exactly one Notice for several simultaneously-due tasks, not one each', () => {
        Platform.isDesktopApp = false;

        const task1 = new TaskBuilder().description('Buy milk').build();
        const task2 = new TaskBuilder().description('Call John').build();
        notifyRemindersDue([task1, task2]);

        expect(MockedNotice).toHaveBeenCalledTimes(1);
        expect(MockedNotice).toHaveBeenCalledWith('2 reminders due: Buy milk\nCall John', 0);
    });
});
