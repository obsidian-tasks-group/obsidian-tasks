// 'exclude sub-items'

import { testTaskFilterViaQuery } from '../../TestingTools/FilterTestHelpers';
import { fromLine } from '../../TestHelpers';

/*
 * 1. Write tests with testTaskFilterViaQuery()
 * 2. Introduce ExcludeSubItemsField
 * 3. Update Query
 * 4. Convert tests to use testTaskFilter()
 */

describe('sub-items', () => {
    it('exclude sub-items', () => {
        // Arrange
        const filterName = 'exclude sub-items';

        // Assert
        testTaskFilterViaQuery(
            filterName,
            fromLine({ line: '- [ ] I am a task' }),
            true,
        );
        testTaskFilterViaQuery(
            filterName,
            fromLine({ line: '    - [ ] I am a sub-task' }),
            false,
        );
    });
});
