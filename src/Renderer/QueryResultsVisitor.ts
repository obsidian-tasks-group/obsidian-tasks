import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { ListItem } from '../Task/ListItem';
import type { Task } from '../Task/Task';
import type { TaskLineRenderer } from './TaskLineRenderer';
import type { QueryRendererParameters } from './QueryResultsRenderer';

/**
 * Interface for visiting and rendering different elements of query results.
 *
 * This visitor pattern allows different output formats to be implemented
 * by creating new visitor implementations without modifying the core
 * QueryResultsRenderer class.
 */
export interface QueryResultsVisitor {
    /**
     * Render a group heading at the specified nesting level.
     *
     * @param group - The heading information including display name and nesting level
     * @returns A promise that resolves when rendering is complete
     */
    addGroupHeading(group: GroupDisplayHeading): Promise<void>;

    /**
     * Render a task as a list item.
     *
     * @param taskList - The container for the task list items
     * @param taskLineRenderer - Renderer for individual task lines
     * @param task - The task to render
     * @param taskIndex - The index of the task in the list
     * @param queryRendererParameters - Parameters needed for rendering (handlers, etc.)
     * @returns A promise that resolves to the rendered HTML element
     */
    addTask(
        taskList: HTMLUListElement,
        taskLineRenderer: TaskLineRenderer,
        task: Task,
        taskIndex: number,
        queryRendererParameters: QueryRendererParameters,
    ): Promise<HTMLLIElement>;

    /**
     * Render a non-task list item.
     *
     * @param taskList - The container for the list items
     * @param taskLineRenderer - Renderer for individual lines
     * @param listItem - The list item to render
     * @param listItemIndex - The index of the list item
     * @returns A promise that resolves to the rendered HTML element
     */
    addListItem(
        taskList: HTMLUListElement,
        taskLineRenderer: TaskLineRenderer,
        listItem: ListItem,
        listItemIndex: number,
    ): Promise<HTMLLIElement>;
}
