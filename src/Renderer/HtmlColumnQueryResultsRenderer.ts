import type { TaskGroups } from '../Query/Group/TaskGroups';
import { HtmlQueryResultsRenderer } from './HtmlQueryResultsRenderer';
import { createAndAppendElement } from './TaskLineRenderer';

export class HtmlColumnQueryResultsRenderer extends HtmlQueryResultsRenderer {
    protected async addAllTaskGroups(tasksSortedLimitedGrouped: TaskGroups) {
        const originalParent = this.content;

        const columnsContainer = createAndAppendElement('div', originalParent);
        columnsContainer.classList.add('tasks-columns');

        for (const group of tasksSortedLimitedGrouped.groups) {
            if (group.tasks.length === 0) {
                continue;
            }

            const columnContainer = createAndAppendElement('div', columnsContainer);
            columnContainer.classList.add('tasks-columns-column');
            this.content = columnContainer;

            // If there were no 'group by' instructions, group.groupHeadings
            // will be empty, and no headings will be added.
            await this.addGroupHeadings(group.groupHeadings);

            this.addedListItems.clear();
            await this.addTaskList(group.tasks);
        }

        this.content = originalParent;
    }
}
