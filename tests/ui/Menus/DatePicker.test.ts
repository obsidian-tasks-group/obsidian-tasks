import { waitFor } from '@testing-library/svelte';
import { Logger } from 'lib/logging';
import moment from 'moment/moment';
import { promptForDate } from 'ui/Menus/DatePicker';
import type { TaskSaver } from 'ui/Menus/TaskEditingMenu';
import { withTimezone } from '../../TestingTools/DateTestHelpers';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { TestableTaskSaver } from './MenuTestingHelpers';

window.moment = moment;

const initialDate = '2026-11-16';
const originalShowPicker = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'showPicker');

function openDatePicker(taskSaver: TaskSaver = TestableTaskSaver.testableTaskSaver) {
    const task = new TaskBuilder().dueDate(initialDate).build();
    promptForDate(document.body.createSpan(), task, 'dueDate', taskSaver);
    return document.querySelector<HTMLInputElement>('input[type="date"]')!;
}

beforeEach(() => {
    TestableTaskSaver.reset();
    Object.defineProperty(HTMLInputElement.prototype, 'showPicker', { configurable: true, value: vi.fn() });
});

afterEach(() => {
    vi.restoreAllMocks();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    document.body.replaceChildren();
    if (originalShowPicker) {
        Object.defineProperty(HTMLInputElement.prototype, 'showPicker', originalShowPicker);
    } else {
        Reflect.deleteProperty(HTMLInputElement.prototype, 'showPicker');
    }
});

describe('native date picker', () => {
    it('should anchor the calendar to the clicked date line', () => {
        const rect = DOMRect.fromRect({ x: 50, y: 100, height: 20 });
        const gap = 4;
        vi.spyOn(HTMLSpanElement.prototype, 'getBoundingClientRect').mockReturnValue(rect);

        const input = openDatePicker();

        expect(input.style.top).toBe(`${rect.top - gap}px`);
        expect(input.style.height).toBe(`${rect.height + 2 * gap}px`);
    });

    it.each(['America/Los_Angeles', 'Pacific/Auckland'])(
        'should save the selected calendar date in %s',
        async (timezone) => {
            const selectedDate = '2026-11-17';
            let input: HTMLInputElement;
            withTimezone(timezone, () => {
                input = openDatePicker();
                expect(input.value).toBe(initialDate);
                expect(input.showPicker).toHaveBeenCalledOnce();
                expect(document.activeElement).not.toBe(input);

                input.value = selectedDate;
                input.dispatchEvent(new Event('change'));
            });

            await waitFor(() => {
                withTimezone(timezone, () => {
                    expect(TestableTaskSaver.tasksBeingSaved?.[0].dueDate).toEqualMoment(moment(selectedDate));
                    expect(input.isConnected).toBe(false);
                });
            });
        },
    );

    it('should remove a cleared date', async () => {
        const input = openDatePicker();

        input.value = '';
        input.dispatchEvent(new Event('change'));

        await waitFor(() => {
            expect(TestableTaskSaver.tasksBeingSaved?.[0].dueDate).toBeNull();
            expect(input.isConnected).toBe(false);
        });
    });

    it.each(['missing', 'restricted'])('should allow date editing when showPicker is %s', async (support) => {
        const warn = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
        const error = new DOMException('Not allowed', 'NotAllowedError');
        Object.defineProperty(HTMLInputElement.prototype, 'showPicker', {
            value:
                support === 'missing'
                    ? undefined
                    : vi.fn(() => {
                          throw error;
                      }),
        });
        const input = openDatePicker();

        expect(input.classList.contains('tasks-date-picker-fallback')).toBe(true);
        expect(input.style.height).toBe('');
        expect(document.activeElement).toBe(input);
        expect(input.tabIndex).toBe(0);
        if (support === 'missing') {
            expect(warn).not.toHaveBeenCalled();
        } else {
            expect(warn).toHaveBeenCalledExactlyOnceWith('Could not open the native date picker.', error);
        }
        input.value = '';
        input.dispatchEvent(new Event('change'));
        await waitFor(() => expect(TestableTaskSaver.tasksBeingSaved?.[0].dueDate).toBeNull());
        expect(input.isConnected).toBe(false);
    });

    it('should close before saving asynchronously', async () => {
        const input = openDatePicker(async (task, newTasks) => {
            await Promise.resolve();
            await TestableTaskSaver.testableTaskSaver(task, newTasks);
        });
        input.value = '';
        input.dispatchEvent(new Event('change'));

        expect(input.isConnected).toBe(false);
        await waitFor(() => expect(TestableTaskSaver.tasksBeingSaved?.[0].dueDate).toBeNull());
    });

    it.each([
        { name: 'Escape', event: new KeyboardEvent('keydown', { key: 'Escape' }) },
        { name: 'outside click', event: new Event('pointerdown') },
    ])('should dismiss on $name without saving', ({ event }) => {
        const input = openDatePicker();
        document.body.dispatchEvent(event);

        expect(input.isConnected).toBe(false);
        expect(TestableTaskSaver.tasksBeingSaved).toBeUndefined();
    });

    it('should replace a reopened picker without saving', () => {
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
