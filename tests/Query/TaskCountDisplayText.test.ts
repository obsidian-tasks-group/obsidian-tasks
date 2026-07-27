import { totalTasksCountDisplayText } from '../../src/Query/TaskCountDisplayText';

describe('Text representation of tasks count', () => {
    // Simple cases - where no limit was applied

    it('should pluralise "tasks" if 0 matches', () => {
        expect(totalTasksCountDisplayText(0, 0)).toEqual('0 tasks');
    });

    it('should not pluralise "task" if only 1 match', () => {
        expect(totalTasksCountDisplayText(1, 1)).toEqual('1 task');
    });

    it('should pluralise "tasks" if 2 matches', () => {
        expect(totalTasksCountDisplayText(2, 2)).toEqual('2 tasks');
    });

    // Cases where a limit was applied

    it('should show original number of matching tasks if limit 0 was applied', () => {
        expect(totalTasksCountDisplayText(0, 1)).toEqual('0 of 1 task');
    });

    it('should show original number of matching tasks if limit 1 was applied', () => {
        expect(totalTasksCountDisplayText(1, 2)).toEqual('1 of 2 tasks');
    });

    it('should show original number of matching tasks if limit 2 was applied', () => {
        expect(totalTasksCountDisplayText(2, 9)).toEqual('2 of 9 tasks');
    });
});
