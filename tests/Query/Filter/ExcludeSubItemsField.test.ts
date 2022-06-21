// 'exclude sub-items'

import { testTaskFilter } from '../../TestingTools/FilterTestHelpers';
import { fromLine } from '../../TestHelpers';
import { ExcludeSubItemsField } from '../../../src/Query/Filter/ExcludeSubItemsField';

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
});
