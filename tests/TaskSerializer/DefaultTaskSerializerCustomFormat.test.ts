/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { DEFAULT_SYMBOLS, DefaultTaskSerializer } from '../../src/TaskSerializer/DefaultTaskSerializer';
import { TaskRegularExpressions } from '../../src/Task/TaskRegularExpressions';
import { resetSettings, updateSettings } from '../../src/Config/Settings';

jest.mock('obsidian');
window.moment = moment as unknown as typeof window.moment;

describe('DefaultTaskSerializer with custom date format from settings', () => {
    const serializer = new DefaultTaskSerializer(DEFAULT_SYMBOLS);

    beforeEach(() => {
        resetSettings();
        updateSettings({ taskDateFormat: 'DD/MM/YYYY' });
    });

    afterEach(() => {
        resetSettings();
    });

    it('parses due date in custom format', () => {
        const line = 'Custom due 📅 22/01/2026';
        const details = serializer.deserialize(line);
        expect(details.description).toBe('Custom due');
        expect(details.dueDate?.format(TaskRegularExpressions.dateFormat)).toBe('2026-01-22');
    });

    it('parses done date wrapped in [[...]] with custom format', () => {
        const line = 'Custom done ✅ [[22/01/2026]]';
        const details = serializer.deserialize(line);
        expect(details.description).toBe('Custom done');
        expect(details.doneDate?.format(TaskRegularExpressions.dateFormat)).toBe('2026-01-22');
    });
});
