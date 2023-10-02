import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { FilterInstructionsBasedField } from '../../../src/Query/Filter/FilterInstructionsBasedField';

class BlockingField extends FilterInstructionsBasedField {
    constructor() {
        super();
        this._filters.add('is blocking', (task) => task.id !== '');
    }

    fieldName(): string {
        return 'blocking';
    }
}

describe('blocking', () => {
    const not_blocking = new TaskBuilder().build();
    const child = new TaskBuilder().id('12345').build();
    const parent = new TaskBuilder().dependsOn(['12345']).build();

    const filter = new BlockingField().createFilterOrErrorMessage('is blocking');

    it('is blocking', () => {
        expect(filter).toBeValid();
        expect(filter).not.toMatchTask(not_blocking);
        expect(filter).toMatchTask(child);
        expect(filter).not.toMatchTask(parent);
    });
});
