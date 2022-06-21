// 'exclude sub-items'

import {
    testTaskFilter,
    testTaskFilterViaQuery,
} from '../../TestingTools/FilterTestHelpers';
import { fromLine } from '../../TestHelpers';
import { ExcludeSubItemsField } from '../../../src/Query/Filter/ExcludeSubItemsField';

/*
 * 1. [x] Write tests with testTaskFilterViaQuery()
 * 2. [x] Introduce ExcludeSubItemsField
 * 3. [ ] Update Query
 * 4. [ ] Convert tests to use testTaskFilter()
 */

describe('sub-items', () => {
    it('exclude sub-items', () => {
        // Arrange
        const filter = new ExcludeSubItemsField().createFilterOrErrorMessage(
            'exclude sub-items',
        );

        // Assert
        testTaskFilter(filter, fromLine({ line: '- [ ] I am a task' }), true);
        testTaskFilter(
            filter,
            fromLine({ line: '    - [ ] I am a sub-task' }),
            false,
        );
    });

    it('exclude sub-items - old-style test - delete me soon', () => {
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
