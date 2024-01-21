import { SearchInfo } from '../../src/Query/SearchInfo';
import type { Task } from '../../src/Task/Task';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { FilterOrErrorMessage } from '../../src/Query/Filter/FilterOrErrorMessage';
import { Filter } from '../../src/Query/Filter/Filter';
import { Explanation } from '../../src/Query/Explain/Explanation';

describe('CustomMatchersForFilters', () => {
    it('should check filter with supplied SearchInfo', () => {
        // Arrange
        const task = new TaskBuilder().build();
        const initialSearchInfo = SearchInfo.fromAllTasks([task]);
        const checkSearchInfoPassedThrough = (_task: Task, searchInfo: SearchInfo) => {
            return Object.is(initialSearchInfo, searchInfo);
        };
        const filter = FilterOrErrorMessage.fromFilter(
            new Filter('stuff', checkSearchInfoPassedThrough, new Explanation('explanation of stuff')),
        );

        // Act, Assert
        expect(filter).toMatchTaskWithSearchInfo(task, initialSearchInfo);
    });
});
