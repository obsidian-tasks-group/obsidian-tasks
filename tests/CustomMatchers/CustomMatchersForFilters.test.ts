import { SearchInfo } from 'Query/SearchInfo';
import type { Task } from 'Task/Task';
import { FilterOrErrorMessage } from 'Query/Filter/FilterOrErrorMessage';
import { Filter } from 'Query/Filter/Filter';
import { Explanation } from 'Query/Explain/Explanation';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

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
