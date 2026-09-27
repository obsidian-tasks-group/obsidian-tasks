import { addIcon, setIcon } from 'obsidian';
import { getSettings } from '../Config/Settings';
import { TaskLayoutComponent } from '../Layout/TaskLayoutOptions';
import { Priority } from '../Task/Priority';
import { StatusType } from '../Statuses/StatusConfiguration';
import { fontAwesomeIcons, fontAwesomeSvgContent } from './FontAwesomeIcons';

/**
 * The icons that Tasks shows in its user interface. They are for display only: notes still use the task format's symbols.
 * Names are Obsidian's Lucide icons, except 'tasks-fa-*', registered by {@link registerTasksIcons}.
 */
export const TasksIcon = {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    createdDate: 'plus-circle',
    startDate: 'plane-takeoff',
    scheduledDate: 'hourglass',
    dueDate: 'calendar',
    doneDate: 'check-circle',
    cancelledDate: 'x-circle',
    recurrence: 'repeat',
    onCompletion: 'flag',
    dependsOn: 'lock',
    id: 'fingerprint',
    link: 'link',

    edit: 'pencil',
    postpone: 'fast-forward',
    debug: 'bug',
    newLine: 'corner-down-left',
    valid: 'check',
    remove: 'x',
    generate: 'sparkles',

    priorityHighest: 'tasks-fa-angles-up',
    priorityHigh: 'tasks-fa-angle-up',
    priorityMedium: 'tasks-fa-caret-up',
    priorityLow: 'tasks-fa-angle-down',
    priorityLowest: 'tasks-fa-angles-down',
} as const;

/**
 * Register the non-Lucide icons with Obsidian. Call once, when the plugin loads.
 */
export function registerTasksIcons() {
    for (const [name, icon] of Object.entries(fontAwesomeIcons)) {
        addIcon(`tasks-fa-${name}`, fontAwesomeSvgContent(icon));
    }
}

/**
 * Whether the user has chosen to show task properties with icons, rather than emojis.
 */
export function useIconsForDisplay(): boolean {
    return getSettings().signifierDisplay !== 'emoji';
}

export function iconForPriority(priority: Priority): string | null {
    switch (priority) {
        case Priority.Highest:
            return TasksIcon.priorityHighest;
        case Priority.High:
            return TasksIcon.priorityHigh;
        case Priority.Medium:
            return TasksIcon.priorityMedium;
        case Priority.Low:
            return TasksIcon.priorityLow;
        case Priority.Lowest:
            return TasksIcon.priorityLowest;
        default:
            return null;
    }
}

export function iconForStatusType(type: StatusType): string {
    switch (type) {
        case StatusType.DONE:
            return 'check-circle';
        case StatusType.CANCELLED:
            return 'circle-slash';
        case StatusType.IN_PROGRESS:
            return 'circle-dot';
        case StatusType.NON_TASK:
            return 'circle-dashed';
        default:
            return 'circle';
    }
}

/**
 * The icon for a rendered task field, or null if the field has no icon (such as the description).
 */
export function iconForComponent(component: TaskLayoutComponent, priority: Priority = Priority.None): string | null {
    switch (component) {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        case TaskLayoutComponent.Priority:
            return iconForPriority(priority);
        case TaskLayoutComponent.CreatedDate:
            return TasksIcon.createdDate;
        case TaskLayoutComponent.StartDate:
            return TasksIcon.startDate;
        case TaskLayoutComponent.ScheduledDate:
            return TasksIcon.scheduledDate;
        case TaskLayoutComponent.DueDate:
            return TasksIcon.dueDate;
        case TaskLayoutComponent.DoneDate:
            return TasksIcon.doneDate;
        case TaskLayoutComponent.CancelledDate:
            return TasksIcon.cancelledDate;
        case TaskLayoutComponent.RecurrenceRule:
            return TasksIcon.recurrence;
        case TaskLayoutComponent.OnCompletion:
            return TasksIcon.onCompletion;
        case TaskLayoutComponent.DependsOn:
            return TasksIcon.dependsOn;
        case TaskLayoutComponent.Id:
            return TasksIcon.id;
        default:
            return null;
    }
}

/**
 * A short, human-readable name for a task field, for tooltips and screen readers.
 */
export function labelForComponent(component: TaskLayoutComponent, priority: Priority = Priority.None): string {
    switch (component) {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        case TaskLayoutComponent.Priority:
            return labelForPriority(priority);
        case TaskLayoutComponent.CreatedDate:
            return 'Created';
        case TaskLayoutComponent.StartDate:
            return 'Start';
        case TaskLayoutComponent.ScheduledDate:
            return 'Scheduled';
        case TaskLayoutComponent.DueDate:
            return 'Due';
        case TaskLayoutComponent.DoneDate:
            return 'Done';
        case TaskLayoutComponent.CancelledDate:
            return 'Cancelled';
        case TaskLayoutComponent.RecurrenceRule:
            return 'Recurs';
        case TaskLayoutComponent.OnCompletion:
            return 'On completion';
        case TaskLayoutComponent.DependsOn:
            return 'Blocked by';
        case TaskLayoutComponent.Id:
            return 'ID';
        case TaskLayoutComponent.BlockLink:
            return 'Block link';
        default:
            return 'Description';
    }
}

export function labelForPriority(priority: Priority): string {
    switch (priority) {
        case Priority.Highest:
            return 'Highest priority';
        case Priority.High:
            return 'High priority';
        case Priority.Medium:
            return 'Medium priority';
        case Priority.Low:
            return 'Low priority';
        case Priority.Lowest:
            return 'Lowest priority';
        default:
            return 'Normal priority';
    }
}

/**
 * Append an icon to the element, as a span that screen readers announce with the given label.
 */
const priorityNamesByIconId: Record<string, string> = {
    [TasksIcon.priorityHighest]: 'highest',
    [TasksIcon.priorityHigh]: 'high',
    [TasksIcon.priorityMedium]: 'medium',
    [TasksIcon.priorityLow]: 'low',
    [TasksIcon.priorityLowest]: 'lowest',
};

const coloredFieldsByIconId: Record<string, string> = {
    [TasksIcon.dueDate]: 'due',
    [TasksIcon.doneDate]: 'done',
    [TasksIcon.cancelledDate]: 'cancelled',
};

/**
 * Show the icon in the element. Priority and some date icons are marked, so that CSS colours them the same everywhere.
 */
export function setTasksIcon(element: HTMLElement, iconId: string) {
    setIcon(element, iconId);
    const priority = priorityNamesByIconId[iconId];
    element.classList.toggle('tasks-priority-icon', priority !== undefined);
    setOrRemoveAttribute(element, 'data-priority', priority);
    setOrRemoveAttribute(element, 'data-field', coloredFieldsByIconId[iconId]);
}

function setOrRemoveAttribute(element: HTMLElement, name: string, value: string | undefined) {
    if (value) {
        element.setAttribute(name, value);
    } else {
        element.removeAttribute(name);
    }
}

export function appendIcon(parent: HTMLElement, iconId: string, label: string): HTMLSpanElement {
    const iconSpan = parent.createSpan({ cls: 'tasks-icon' });
    setTasksIcon(iconSpan, iconId);
    iconSpan.setAttribute('aria-label', label);
    iconSpan.setAttribute('role', 'img');
    return iconSpan;
}

/**
 * Svelte action: `<span use:icon={{ id: 'calendar', label: 'Due' }} />`. An empty label marks the icon as decorative.
 */
export function icon(node: HTMLElement, params: { id: string | null; label: string }) {
    const apply = ({ id, label }: { id: string | null; label: string }) => {
        node.replaceChildren();
        node.classList.add('tasks-icon');
        if (id) {
            setTasksIcon(node, id);
        }
        if (label) {
            node.setAttribute('aria-label', label);
            node.setAttribute('role', 'img');
            node.removeAttribute('aria-hidden');
        } else {
            node.setAttribute('aria-hidden', 'true');
            node.removeAttribute('aria-label');
            node.removeAttribute('role');
        }
    };
    apply(params);
    return { update: apply };
}
