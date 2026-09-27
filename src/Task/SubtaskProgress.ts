import { GlobalFilter } from '../Config/GlobalFilter';
import { StatusType } from '../Statuses/StatusConfiguration';
import { StatusRegistry } from '../Statuses/StatusRegistry';
import type { ListItem } from './ListItem';
import type { Task } from './Task';
import { TaskRegularExpressions } from './TaskRegularExpressions';

/**
 * How many of a task's subtasks, at any depth, are done.
 */
export interface SubtaskProgress {
    done: number;
    inProgress: number;
    total: number;
}

/**
 * Count the status types. Cancelled and non-task statuses are left out, so they do not prevent 100%.
 * @returns null if there is nothing to count.
 */
export function tallyStatusTypes(types: StatusType[]): SubtaskProgress | null {
    const progress: SubtaskProgress = { done: 0, inProgress: 0, total: 0 };
    for (const type of types) {
        switch (type) {
            case StatusType.DONE:
                progress.done++;
                progress.total++;
                break;
            case StatusType.IN_PROGRESS:
                progress.inProgress++;
                progress.total++;
                break;
            case StatusType.TODO:
            case StatusType.ON_HOLD:
                progress.total++;
                break;
            default:
                break;
        }
    }
    return progress.total > 0 ? progress : null;
}

/**
 * The progress of all the tasks nested under a list item, including those under plain list items.
 */
export function subtaskProgressOfListItem(item: ListItem): SubtaskProgress | null {
    const types: StatusType[] = [];
    const collect = (listItem: ListItem) => {
        for (const child of listItem.children) {
            if (child.isTask) {
                types.push((child as Task).status.type);
            }
            collect(child);
        }
    };
    collect(item);
    return tallyStatusTypes(types);
}

const tabWidth = 4;

/**
 * The block quote depth (number of '>') and the width of the indentation after it.
 */
function indentationOf(line: string): { quoteDepth: number; width: number } {
    const indentation = line.match(TaskRegularExpressions.indentationRegex)?.[1] ?? '';
    const quoteDepth = (indentation.match(/>/g) ?? []).length;
    const afterQuotes = indentation.substring(indentation.lastIndexOf('>') + 1);
    let width = 0;
    for (const character of afterQuotes) {
        width += character === '\t' ? tabWidth : 1;
    }
    return { quoteDepth, width };
}

/**
 * The progress of the tasks indented under the task on line `parentIndex`.
 * @returns null if the line is not a task, or it has no subtasks to count.
 */
export function subtaskProgressFromLines(lines: readonly string[], parentIndex: number): SubtaskProgress | null {
    const parentLine = lines[parentIndex] ?? '';
    const globalFilter = GlobalFilter.getInstance();
    if (!TaskRegularExpressions.taskRegex.test(parentLine)) {
        return null;
    }
    if (!globalFilter.isEmpty() && !globalFilter.includedIn(parentLine)) {
        return null;
    }
    const parent = indentationOf(parentLine);

    const statusRegistry = StatusRegistry.getInstance();
    const types: StatusType[] = [];
    for (let i = parentIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') {
            continue;
        }

        // Subtasks are more deeply indented, within the same block quote or callout, if any.
        const { quoteDepth, width } = indentationOf(line);
        if (quoteDepth !== parent.quoteDepth || width <= parent.width) {
            break;
        }

        const taskMatch = line.match(TaskRegularExpressions.taskRegex);
        if (!taskMatch) {
            continue;
        }
        if (!globalFilter.isEmpty() && !globalFilter.includedIn(line)) {
            continue;
        }
        types.push(statusRegistry.bySymbolOrCreate(taskMatch[3]).type);
    }
    return tallyStatusTypes(types);
}

/**
 * Add a slim progress bar and a 'done/total' count, such as '2/5', to the element.
 */
export function renderSubtaskProgress(parent: HTMLElement, progress: SubtaskProgress): HTMLSpanElement {
    const { done, total } = progress;
    const percentage = Math.round((done / total) * 100);

    const container = parent.createSpan({ cls: 'tasks-progress' });
    container.setAttribute('role', 'progressbar');
    container.setAttribute('aria-valuemin', '0');
    container.setAttribute('aria-valuemax', total.toString());
    container.setAttribute('aria-valuenow', done.toString());
    container.setAttribute('aria-label', `Subtasks done: ${done} of ${total}`);
    container.setAttribute('title', `Subtasks done: ${done} of ${total}`);
    if (done === total) {
        container.setAttribute('data-complete', '');
    }

    const track = container.createSpan({ cls: 'tasks-progress-track' });
    const fill = track.createSpan({ cls: 'tasks-progress-fill' });
    fill.style.width = `${percentage}%`;

    container.createSpan({ cls: 'tasks-progress-count', text: `${done}/${total}` });
    return container;
}
