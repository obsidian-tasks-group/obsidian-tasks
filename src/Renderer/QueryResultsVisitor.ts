import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { ListItem } from '../Task/ListItem';
import type { Task } from '../Task/Task';

/**
 * Context information needed for rendering tasks and list items.
 * This provides the minimal data needed without requiring Obsidian-specific types.
 */
export interface VisitorRenderContext {
    /** The path of the file containing the query */
    queryFilePath?: string;
    /** Whether to show urgency scores */
    hideUrgency: boolean;
    /** Whether to show backlinks */
    hideBacklinks: boolean;
    /** Whether to show edit buttons */
    hideEditButton: boolean;
    /** Whether to show postpone buttons */
    hidePostponeButton: boolean;
    /** Whether to use short mode */
    shortMode: boolean;
}

/**
 * Interface for visiting and rendering different elements of query results.
 *
 * This visitor pattern allows different output formats to be implemented
 * by creating new visitor implementations without modifying the core
 * QueryResultsRenderer class.
 *
 * The interface is designed to be independent of Obsidian-specific types,
 * making it easy to use in different contexts (testing, non-Obsidian environments, etc.)
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
     * Render a task.
     *
     * @param task - The task to render
     * @param taskIndex - The index of the task in the list
     * @param context - Rendering context with layout options
     * @returns A promise that resolves when rendering is complete
     */
    addTask(task: Task, taskIndex: number, context: VisitorRenderContext): Promise<void>;

    /**
     * Render a non-task list item.
     *
     * @param listItem - The list item to render
     * @param listItemIndex - The index of the list item
     * @param context - Rendering context with layout options
     * @returns A promise that resolves when rendering is complete
     */
    addListItem(listItem: ListItem, listItemIndex: number, context: VisitorRenderContext): Promise<void>;

    /**
     * Begin rendering children of the last rendered item.
     * For HTML visitors, this creates a nested list structure.
     * For text-based visitors, this increases indentation.
     */
    beginChildren(): void;

    /**
     * End rendering children of the last rendered item.
     * For HTML visitors, this returns to the parent list context.
     * For text-based visitors, this decreases indentation.
     */
    endChildren(): void;
}
