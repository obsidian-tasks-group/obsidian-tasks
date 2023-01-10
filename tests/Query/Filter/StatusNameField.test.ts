import { StatusNameField } from '../../../src/Query/Filter/StatusNameField';
import * as TestHelpers from '../../TestHelpers';
import { toBeValid, toMatchTaskFromLine } from '../../CustomMatchers/CustomMatchersForFilters';

expect.extend({
    toBeValid,
    toMatchTaskFromLine,
});

describe('status.name', () => {
    it('value', () => {
        // Arrange
        const filter = new StatusNameField();

        // Assert
        expect(filter.value(TestHelpers.fromLine({ line: '- [ ] Xxx' }))).toStrictEqual('Todo');
        expect(filter.value(TestHelpers.fromLine({ line: '- [/] Xxx' }))).toStrictEqual('In Progress');
        expect(filter.value(TestHelpers.fromLine({ line: '- [x] Xxx' }))).toStrictEqual('Done');
        expect(filter.value(TestHelpers.fromLine({ line: '- [-] Xxx' }))).toStrictEqual('Cancelled');
        expect(filter.value(TestHelpers.fromLine({ line: '- [%] Xxx' }))).toStrictEqual('Unknown');
    });

    it('status.name includes', () => {
        // Arrange
        const filter = new StatusNameField().createFilterOrErrorMessage('status.name includes todo');

        // Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTaskFromLine('- [ ] Xxx');
        expect(filter).not.toMatchTaskFromLine('- [x] Xxx');
    });
});
