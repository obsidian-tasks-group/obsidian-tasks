import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { ListItem } from '../Task/ListItem';
import type { Task } from '../Task/Task';
import type { QueryResultsVisitor, VisitorRenderContext } from './QueryResultsVisitor';

/**
 * Markdown implementation of the QueryResultsVisitor.
 *
 * This visitor renders query results as Markdown text, creating
 * markdown list items for tasks and markdown headings for groups.
 *
 * This implementation is completely independent of Obsidian's DOM
 * and can be used in any context (testing, CLI tools, etc.)
 *
 * It uses Task.toFileLineString() and ListItem.toFileLineString()
 * to generate the markdown representation of each item.
 */
export class MarkdownQueryResultsVisitor implements QueryResultsVisitor {
    private markdown: string = '';
    private currentIndentLevel: number = 0;

    /**
     * Get the accumulated markdown output.
     */
    public getMarkdown(): string {
        return this.markdown;
    }

    /**
     * Clear the accumulated markdown output.
     */
    public reset(): void {
        this.markdown = '';
        this.currentIndentLevel = 0;
    }

    async addGroupHeading(group: GroupDisplayHeading): Promise<void> {
        // Map nesting levels to markdown heading levels
        // Level 0 -> ####, Level 1 -> #####, Level 2+ -> ######
        let headingLevel = 6;
        if (group.nestingLevel === 0) {
            headingLevel = 4;
        } else if (group.nestingLevel === 1) {
            headingLevel = 5;
        }

        const headingPrefix = '#'.repeat(headingLevel);
        this.markdown += `${headingPrefix} ${group.displayName}\n`;
    }

    async addTask(task: Task, _taskIndex: number, _context: VisitorRenderContext): Promise<void> {
        const indent = '    '.repeat(this.currentIndentLevel);

        // Use the task's own method to generate its markdown representation
        const taskLine = task.toFileLineString();

        this.markdown += `${indent}${taskLine}\n`;
    }

    async addListItem(listItem: ListItem, _listItemIndex: number, _context: VisitorRenderContext): Promise<void> {
        const indent = '    '.repeat(this.currentIndentLevel);

        // Use the list item's own method to generate its markdown representation
        const listItemLine = listItem.toFileLineString();

        this.markdown += `${indent}${listItemLine}\n`;
    }

    /**
     * Increase the indentation level for nested items.
     * Call this before rendering children.
     */
    public increaseIndent(): void {
        this.currentIndentLevel++;
    }

    /**
     * Decrease the indentation level after rendering children.
     * Call this after rendering children.
     */
    public decreaseIndent(): void {
        if (this.currentIndentLevel > 0) {
            this.currentIndentLevel--;
        }
    }
}
