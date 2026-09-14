/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { MAX_NOTIFICATION_HISTORY_ENTRIES, appendHistoryEntries } from '../../src/Notifications/NotificationHistory';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

describe('appendHistoryEntries', () => {
    it('should add one entry per task, not one per batch', () => {
        const task1 = new TaskBuilder().description('Buy milk').path('groceries.md').build();
        const task2 = new TaskBuilder().description('Call John').path('calls.md').build();
        const firedAt = moment('2024-01-15T10:00:00');

        const result = appendHistoryEntries([], [task1, task2], firedAt);

        expect(result).toEqual([
            { description: 'Buy milk', path: 'groceries.md', firedAt: firedAt.toISOString() },
            { description: 'Call John', path: 'calls.md', firedAt: firedAt.toISOString() },
        ]);
    });

    it('should not mutate the existing array', () => {
        const existing = [{ description: 'Old entry', path: 'old.md', firedAt: '2024-01-01T00:00:00.000Z' }];
        const existingCopy = [...existing];
        const task = new TaskBuilder().description('New task').build();

        appendHistoryEntries(existing, [task], moment('2024-01-15T10:00:00'));

        expect(existing).toEqual(existingCopy);
    });

    it('should append after existing entries, keeping their order', () => {
        const existing = [{ description: 'Old entry', path: 'old.md', firedAt: '2024-01-01T00:00:00.000Z' }];
        const task = new TaskBuilder().description('New task').path('new.md').build();
        const firedAt = moment('2024-01-15T10:00:00');

        const result = appendHistoryEntries(existing, [task], firedAt);

        expect(result).toEqual([
            { description: 'Old entry', path: 'old.md', firedAt: '2024-01-01T00:00:00.000Z' },
            { description: 'New task', path: 'new.md', firedAt: firedAt.toISOString() },
        ]);
    });

    it('should prune to maxEntries, keeping the most recent', () => {
        const existing = Array.from({ length: 5 }, (_, i) => ({
            description: `Entry ${i}`,
            path: 'x.md',
            firedAt: '2024-01-01T00:00:00.000Z',
        }));
        const task = new TaskBuilder().description('Newest').build();

        const result = appendHistoryEntries(existing, [task], moment('2024-01-15T10:00:00'), 3);

        expect(result).toHaveLength(3);
        expect(result.map((e) => e.description)).toEqual(['Entry 3', 'Entry 4', 'Newest']);
    });

    it('should default maxEntries to MAX_NOTIFICATION_HISTORY_ENTRIES', () => {
        const existing = Array.from({ length: MAX_NOTIFICATION_HISTORY_ENTRIES }, (_, i) => ({
            description: `Entry ${i}`,
            path: 'x.md',
            firedAt: '2024-01-01T00:00:00.000Z',
        }));
        const task = new TaskBuilder().description('Newest').build();

        const result = appendHistoryEntries(existing, [task], moment('2024-01-15T10:00:00'));

        expect(result).toHaveLength(MAX_NOTIFICATION_HISTORY_ENTRIES);
        expect(result[result.length - 1].description).toEqual('Newest');
        expect(result[0].description).toEqual('Entry 1');
    });

    it('should return existing unchanged (aside from copying) when nothing new fired', () => {
        const existing = [{ description: 'Old entry', path: 'old.md', firedAt: '2024-01-01T00:00:00.000Z' }];

        const result = appendHistoryEntries(existing, [], moment('2024-01-15T10:00:00'));

        expect(result).toEqual(existing);
    });
});
