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
        testTaskFilter(filter, fromLine({ line: '- [ ] Task' }), true);
        testTaskFilter(filter, fromLine({ line: '  - [ ] Subtask1' }), false);
        testTaskFilter(filter, fromLine({ line: '    - [ ] Subtask2' }), false);
    });
    it('subitem has more than one space after last > of blockquotes or callouts', () => {
        // Arrange
        const filter = new ExcludeSubItemsField().createFilterOrErrorMessage(
            'exclude sub-items',
        );

        // Assert
        testTaskFilter(filter, fromLine({ line: '> - [ ] Task' }), true);
        testTaskFilter(filter, fromLine({ line: '> > - [ ] Task' }), true);
        testTaskFilter(filter, fromLine({ line: '>>  - [ ] Subtask1' }), false);
        testTaskFilter(
            filter,
            fromLine({ line: '> >  - [ ] Subtask2' }),
            false,
        );
    });
});
