import moment from 'moment/moment';
import { promptForDate } from 'ui/Menus/DatePicker';
import { withTimezone } from '../../TestingTools/DateTestHelpers';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { TestableTaskSaver } from './MenuTestingHelpers';

window.moment = moment;

const initialDate = '2026-11-16';

function openDatePicker() {
    const task = new TaskBuilder().dueDate(initialDate).build();
    promptForDate(document.body.createSpan(), task, 'dueDate', TestableTaskSaver.testableTaskSaver);
    return document.querySelector<HTMLInputElement>('input[type="date"]')!;
}

beforeEach(() => TestableTaskSaver.reset());

afterEach(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    document.body.replaceChildren();
});

describe('native date picker', () => {
    it.each(['America/Los_Angeles', 'Pacific/Auckland'])('should save the selected calendar date in %s', (timezone) => {
        withTimezone(timezone, () => {
            const selectedDate = '2026-11-17';
            const input = openDatePicker();
            expect(input.value).toBe(initialDate);

            input.value = selectedDate;
            input.dispatchEvent(new Event('change'));

            expect(TestableTaskSaver.tasksBeingSaved?.[0].dueDate).toEqualMoment(moment(selectedDate));
            expect(input.isConnected).toBe(false);
        });
    });

    it('should remove a cleared date', () => {
        const input = openDatePicker();

        input.value = '';
        input.dispatchEvent(new Event('change'));

        expect(TestableTaskSaver.tasksBeingSaved?.[0].dueDate).toBeNull();
        expect(input.isConnected).toBe(false);
    });

    it.each([
        { name: 'Escape', event: new KeyboardEvent('keydown', { key: 'Escape' }) },
        { name: 'outside click', event: new Event('pointerdown') },
    ])('should dismiss on $name and replace a reopened picker without saving', ({ event }) => {
        const input = openDatePicker();
        document.body.dispatchEvent(event);

        expect(input.isConnected).toBe(false);

        const reopenedInput = openDatePicker();
        reopenedInput.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(reopenedInput.isConnected).toBe(true);

        const replacementInput = openDatePicker();
        expect(reopenedInput.isConnected).toBe(false);
        expect(replacementInput.value).toBe(initialDate);
        expect(document.querySelectorAll('input[type="date"]')).toHaveLength(1);
        expect(TestableTaskSaver.tasksBeingSaved).toBeUndefined();
    });
});
