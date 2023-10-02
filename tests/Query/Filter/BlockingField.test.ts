import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { FilterInstructionsBasedField } from '../../../src/Query/Filter/FilterInstructionsBasedField';
import type { Task } from '../../../src/Task';

class BlockingField extends FilterInstructionsBasedField {
    // @ts-ignore
    private readonly _allTasks: Task[];
    constructor(allTasks: Task[]) {
        super();
        this._allTasks = allTasks;
        this._filters.add('is blocking', (task) => {
            if (task.id === '') return false;

            for (const cacheTask of this._allTasks) {
                if (cacheTask.dependsOn.includes(task.id)) return true;
            }

            return false;
        });
    }

    fieldName(): string {
        return 'blocking';
    }
}

describe('blocking', () => {
    const notBlocking = new TaskBuilder().build();
    const child = new TaskBuilder().id('12345').build();
    const childWithoutParent = new TaskBuilder().id('23456').build();
    const parent = new TaskBuilder().dependsOn(['12345']).build();

    const allTasks = [notBlocking, child, parent];

    const filter = new BlockingField(allTasks).createFilterOrErrorMessage('is blocking');

    it('is blocking', () => {
        expect(filter).toBeValid();
        expect(filter).not.toMatchTask(notBlocking);
        expect(filter).toMatchTask(child);
        expect(filter).not.toMatchTask(parent);
        expect(filter).not.toMatchTask(childWithoutParent);
    });
});
