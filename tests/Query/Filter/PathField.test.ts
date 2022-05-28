import { PathField } from '../../../src/Query/Filter/PathField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testTaskFilter } from '../../TestingTools/FilterTestHelpers';

function testTaskFilterForTaskWithPath(
    filter: FilterOrErrorMessage,
    path: string,
    expected: boolean,
) {
    const builder = new TaskBuilder();
    testTaskFilter(filter, builder.path(path).build(), expected);
}

describe('path', () => {
    it('by path (includes)', () => {
        // Arrange
        const filter = new PathField().createFilterOrErrorMessage(
            'path includes some/path',
        );

        // Assert
        testTaskFilterForTaskWithPath(filter, '/some/path/file.md', true);
        testTaskFilterForTaskWithPath(filter, '/SoMe/PaTh/file.md', true);
        testTaskFilterForTaskWithPath(filter, '/other/path/file.md', false);
    });

    it('by path (does not include)', () => {
        // Arrange
        const filter = new PathField().createFilterOrErrorMessage(
            'path does not include some/path',
        );

        // Assert
        testTaskFilterForTaskWithPath(filter, '/some/path/file.md', false);
        testTaskFilterForTaskWithPath(filter, '/other/path/file.md', true);
    });
});
