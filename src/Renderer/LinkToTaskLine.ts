import { App, Keymap } from 'obsidian';
import type { Task } from '../Task/Task';
import { getTaskLineAndFile } from '../Obsidian/File';
import { createAndAppendElement } from './TaskLineRenderer';

export function linkToTaskLine(
    task: Task,
    linkText: string,
    listItem: HTMLElement,
    shortMode: boolean,
    surroundWithParentheses: boolean,
    app: App,
) {
    const link = createLinkToTaskLine(listItem, shortMode, surroundWithParentheses, linkText);
    addEventsToLinkToTaskLine(link, task, app);
}

function createLinkToTaskLine(
    listItem: HTMLElement,
    shortMode: boolean,
    surroundWithParentheses: boolean,
    linkText: string,
) {
    const backLink = listItem.createSpan({ cls: 'tasks-backlink' });

    if (surroundWithParentheses) {
        backLink.append(' (');
    }

    const link = createAndAppendElement('a', backLink);

    link.rel = 'noopener';
    link.target = '_blank';
    link.addClass('internal-link');
    if (shortMode) {
        link.addClass('internal-link-short-mode');
    }

    link.setText(linkText);

    if (surroundWithParentheses) {
        backLink.append(')');
    }
    return link;
}

function addEventsToLinkToTaskLine(link: HTMLAnchorElement, task: Task, app: App) {
    // Go to the line the task is defined at
    link.addEventListener('click', async (ev: MouseEvent) => {
        const result = await getTaskLineAndFile(task, app.vault);
        if (result) {
            const [line, file] = result;
            const leaf = app.workspace.getLeaf(Keymap.isModEvent(ev));
            // When the corresponding task has been found,
            // suppress the default behavior of the mouse click event
            // (which would interfere e.g. if the query is rendered inside a callout).
            ev.preventDefault();
            // Instead of the default behavior, open the file with the required line highlighted.
            await leaf.openFile(file, { eState: { line: line } });
        }
    });

    link.addEventListener('mousedown', async (ev: MouseEvent) => {
        // Open in a new tab on middle-click.
        // This distinction is not available in the 'click' event, so we handle the 'mousedown' event
        // solely for this.
        // (for regular left-click we prefer the 'click' event, and not to just do everything here, because
        // the 'click' event is more generic for touch devices etc.)
        if (ev.button === 1) {
            const result = await getTaskLineAndFile(task, app.vault);
            if (result) {
                const [line, file] = result;
                const leaf = app.workspace.getLeaf('tab');
                ev.preventDefault();
                await leaf.openFile(file, { eState: { line: line } });
            }
        }
    });
}
