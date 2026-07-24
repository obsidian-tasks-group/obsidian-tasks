import { TaskGroup } from '../../../src/Query/Group/TaskGroup';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import type { Task } from '../../../src/Task/Task';

function createTaskGroupAndApplyLimit(numTasks: number, limit: number) {
    const groups = ['Level 1'];
    const tasks: Task[] = Array(numTasks).fill(new TaskBuilder().build());

    const group = new TaskGroup(groups, tasks);
    // This test does not need group.setGroupHeadings() to be called

    group.applyTaskLimit(limit);

    return group.describeTaskCount();
}

describe('TaskGroup', () => {
    describe('Text representation of tasks count', () => {
        // Simple cases - where no limit was applied

        it('should pluralise "tasks" if 0 matches', () => {
            expect(createTaskGroupAndApplyLimit(0, 0)).toEqual('0 tasks');
        });

        it('should not pluralise "task" if only 1 match', () => {
            expect(createTaskGroupAndApplyLimit(1, 1)).toEqual('1 task');
        });

        it('should pluralise "tasks" if 2 matches', () => {
            expect(createTaskGroupAndApplyLimit(2, 2)).toEqual('2 tasks');
        });

        // Cases where a limit was applied

        it.failing('should show original number of matching tasks if limit 0 was applied', () => {
            expect(createTaskGroupAndApplyLimit(1, 0)).toEqual('0 of 1 task');
        });

        it.failing('should show original number of matching tasks if limit 1 was applied', () => {
            expect(createTaskGroupAndApplyLimit(2, 1)).toEqual('1 of 2 tasks');
        });

        it.failing('should show original number of matching tasks if limit 2 was applied', () => {
            expect(createTaskGroupAndApplyLimit(9, 2)).toEqual('2 of 9 tasks');
        });
    });
});
