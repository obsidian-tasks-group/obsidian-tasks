/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { DEFAULT_SYMBOLS, DefaultTaskSerializer } from '../../src/TaskSerializer/DefaultTaskSerializer';
import { TaskRegularExpressions } from '../../src/Task/TaskRegularExpressions';

jest.mock('obsidian');
window.moment = moment as unknown as typeof window.moment;

describe('DefaultTaskSerializer wiki-link wrapped dates', () => {
    const serializer = new DefaultTaskSerializer(DEFAULT_SYMBOLS);

    it('parses done date wrapped in [[...]]', () => {
        const line = 'Finish report ✅ [[2026-01-22]]';
        const details = serializer.deserialize(line);
        expect(details.description).toBe('Finish report');
        expect(details.doneDate?.format(TaskRegularExpressions.dateFormat)).toBe('2026-01-22');
    });

    it('parses due date wrapped in [[...]]', () => {
        const line = 'Submit form 📅 [[2026-01-22]]';
        const details = serializer.deserialize(line);
        expect(details.description).toBe('Submit form');
        expect(details.dueDate?.format(TaskRegularExpressions.dateFormat)).toBe('2026-01-22');
    });

    it('still parses plain dates without [[...]]', () => {
        const line = 'Update docs 📅 2026-01-22';
        const details = serializer.deserialize(line);
        expect(details.description).toBe('Update docs');
        expect(details.dueDate?.format(TaskRegularExpressions.dateFormat)).toBe('2026-01-22');
    });
});
